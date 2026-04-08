import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ItemRepository } from "./item-repository";
import type { Item, Topic, Group, ItemType, ItemEstado } from "./types";
import { env } from "@/lib/env";

/**
 * Implementação filesystem do ItemRepository — v2 (ARC-01, ARC-04)
 *
 * Fast path: lê index/topicos.json e index/grupos.json da raiz do ai-pkm
 * para estrutura de navegação sem varrer o pkm/ inteiro.
 *
 * getItem(): lê frontmatter do arquivo individual quando necessário.
 *
 * IMPORTANTE: Esta classe só pode ser instanciada em contextos Node.js
 * (Server Components, Route Handlers). NUNCA usar em middleware.ts
 * (Edge Runtime não tem acesso a fs).
 */
export class FsItemRepository implements ItemRepository {
  private readonly pkmRoot: string;
  private readonly indexDir: string;

  constructor() {
    // PKM_PATH deve ser sempre absoluto (RESEARCH.md Pitfall 4)
    this.pkmRoot = path.resolve(env.PKM_PATH);
    // Índices ficam na raiz do repositório ai-pkm (RESEARCH.md A2)
    this.indexDir = path.join(process.cwd(), "index");
  }

  listTopics(): Topic[] {
    const indexPath = path.join(this.indexDir, "topicos.json");
    const raw = fs.readFileSync(indexPath, "utf-8");
    return JSON.parse(raw) as Topic[];
  }

  listGroups(topic: string): Group[] {
    const indexPath = path.join(this.indexDir, "grupos.json");
    const raw = fs.readFileSync(indexPath, "utf-8");
    const all = JSON.parse(raw) as Group[];
    return all.filter((g) => g.topico === topic);
  }

  getItem(id: string): Item | null {
    // ID é path relativo URL-decoded (D-08)
    const decoded = decodeURIComponent(id);

    // Segurança: validar que o path resolvido começa com pkmRoot
    // (impede path traversal via ../ — T-1-10)
    const absPath = path.resolve(this.pkmRoot, decoded);
    if (!absPath.startsWith(this.pkmRoot + path.sep) && absPath !== this.pkmRoot) {
      throw new Error(`Path traversal detectado: ${id}`);
    }

    if (!fs.existsSync(absPath)) return null;

    const raw = fs.readFileSync(absPath, "utf-8");
    const { data: frontmatter } = matter(raw);

    // Inferir tipo do nome do arquivo (não do frontmatter — reference/schemas/frontmatter-item.md)
    const filename = path.basename(decoded);
    const type = this.inferType(filename, decoded);

    // Inferir tópico da pasta (primeiro segmento do path relativo)
    const segments = decoded.split("/");
    const topic = segments[0] ?? "";
    const group = this.inferGroup(segments);

    const item: Item = {
      id,
      path: absPath,
      name: path.basename(decoded, path.extname(decoded)),
      type,
      estado: (frontmatter.estado as ItemEstado) ?? "rascunho",
      topic,
      group,
      dataCaptura: (frontmatter.data_captura as string) ?? "",
      url: type === "url" ? (frontmatter.url as string | undefined) : undefined,
    };

    // Verificar sidecar para binários
    if (type === "binario") {
      const sidecarPath = absPath + ".md";
      if (fs.existsSync(sidecarPath)) {
        item.sidecarPath = sidecarPath;
      }
    }

    return item;
  }

  searchByName(_q: string): Item[] {
    // Fase 1: implementação stub — retorna vazio.
    // Fase futura: busca por nome nos índices (ARC-04 — seam preparada).
    return [];
  }

  private inferType(filename: string, relPath: string): ItemType {
    // Prefixo url_ → tipo url
    if (filename.startsWith("url_")) return "url";
    // Sidecar: nome.extensao.md (ex: foto.png.md)
    const isSidecar = /\.[^.]+\.[^.]+$/.test(relPath);
    if (isSidecar) return "binario";
    // Extensão não-.md → binário
    if (!relPath.endsWith(".md")) return "binario";
    // Demais → nota
    return "nota";
  }

  private inferGroup(segments: string[]): string | undefined {
    // Grupo é pasta que começa com _ (convenção PKM)
    const groupSegment = segments.find((s, i) => i > 0 && s.startsWith("_"));
    return groupSegment?.replace(/^_/, "") ?? undefined;
  }
}
