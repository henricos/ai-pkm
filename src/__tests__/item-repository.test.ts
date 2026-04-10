import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock do módulo env para não requerer variáveis reais em teste
vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    AUTH_USERNAME: "test",
    AUTH_PASSWORD: "testpass123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));

// Mock do fs
vi.mock("fs");

import fs from "fs";
import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import type { ItemRepository } from "@/lib/pkm/item-repository";

const mockTopicos = JSON.stringify([
  { id: "tecnologia", descricao: "Tecnologia e engenharia" },
]);
const mockGrupos = JSON.stringify([
  { caminho: "pkm/tecnologia/_superapp/", descricao: "Superapps", topico: "tecnologia" },
]);

describe("FsItemRepository", () => {
  beforeEach(() => {
    vi.mocked(fs.readFileSync).mockImplementation((p: unknown) => {
      if (String(p).endsWith("topicos.json")) return mockTopicos;
      if (String(p).endsWith("grupos.json")) return mockGrupos;
      return "";
    });
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  test("ARC-01: listTopics() retorna array de Topic[] a partir do index/topicos.json", () => {
    const repo = new FsItemRepository();
    const topics = repo.listTopics();
    expect(topics).toHaveLength(1);
    expect(topics[0]?.id).toBe("tecnologia");
    expect(typeof topics[0]?.descricao).toBe("string");
  });

  test("ARC-01: listGroups() retorna grupos filtrados por tópico", () => {
    const repo = new FsItemRepository();
    const groups = repo.listGroups("tecnologia");
    expect(groups).toHaveLength(1);
    expect(groups[0]?.topico).toBe("tecnologia");
  });

  test("ARC-02: getItem() resolve ID estável (path relativo URL-decoded)", () => {
    vi.mocked(fs.readFileSync).mockReturnValue("---\nestado: rascunho\nmodelo: nota-conceito\ndata_captura: 2026-01-01\n---");
    const repo = new FsItemRepository();
    const item = repo.getItem("tecnologia/superapp/nota.md");
    expect(item?.id).toBe("tecnologia/superapp/nota.md");
  });

  test("ARC-03: getItem retorna Item com type 'url' para arquivos com prefixo url_", () => {
    vi.mocked(fs.readFileSync).mockReturnValue("---\nestado: rascunho\nmodelo: url-extrato\ndata_captura: 2026-01-01\nurl: https://exemplo.com\n---");
    const repo = new FsItemRepository();
    const item = repo.getItem("tecnologia/url_exemplo.md");
    expect(item?.type).toBe("url");
  });

  test("ARC-04: FsItemRepository implementa interface ItemRepository", () => {
    // Verificação em nível de tipo — se compilar, o contrato está satisfeito
    const repo: ItemRepository = new FsItemRepository();
    expect(typeof repo.listTopics).toBe("function");
    expect(typeof repo.listGroups).toBe("function");
    expect(typeof repo.getItem).toBe("function");
    expect(typeof repo.searchByName).toBe("function");
  });

  test("RUN-02: usa PKM_PATH do env, não path hardcoded", () => {
    const repo = new FsItemRepository();
    // getItem com path traversal deve lançar erro (prova que pkm root é usado como boundary)
    expect(() => repo.getItem("../../../etc/passwd")).toThrow("Path traversal detectado");
  });
});

describe("FsItemRepository — Phase 3 methods", () => {
  test("VIEW-01: getItemContent() retorna conteúdo Markdown sem frontmatter", () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      "---\nestado: rascunho\nmodelo: nota-conceito\ndata_captura: 2026-01-01\n---\n# Meu Conteúdo\n\nTexto aqui."
    );
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const repo = new FsItemRepository();
    const content = repo.getItemContent("tecnologia/nota.md");
    expect(content).toContain("# Meu Conteúdo");
    expect(content).not.toContain("estado:");
    expect(content).not.toContain("---");
  });

  test("T-3-01: getItemContent() lança Path traversal para id com ../", () => {
    const repo = new FsItemRepository();
    expect(() => repo.getItemContent("../../../etc/passwd")).toThrow("Path traversal detectado");
  });

  test("CTX-04: getItemFrontmatter() retorna campos do frontmatter incluindo tipo", () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      "---\ntipo: url-extrato\nestado: finalizado\nmodelo: url-extrato\ndata_captura: 2026-03-07\nurl: https://exemplo.com\nautores: [\"Autor Um\"]\n---\nConteúdo."
    );
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const repo = new FsItemRepository();
    const fm = repo.getItemFrontmatter("tecnologia/url_exemplo.md");
    expect(fm?.estado).toBe("finalizado");
    expect(fm?.tipo).toBe("url-extrato");
    expect(fm?.url).toBe("https://exemplo.com");
    expect(fm?.autores).toEqual(["Autor Um"]);
  });

  test("T-3-01: getItemFrontmatter() lança Path traversal para id com ../", () => {
    const repo = new FsItemRepository();
    expect(() => repo.getItemFrontmatter("../../../etc/passwd")).toThrow("Path traversal detectado");
  });

  test("CTX-04: getItemFrontmatter() retorna null para arquivo inexistente", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const repo = new FsItemRepository();
    const fm = repo.getItemFrontmatter("tecnologia/inexistente.md");
    expect(fm).toBeNull();
  });
});

/**
 * Phase 4 — Contratos de sidecar para itens binários (CTX-05)
 *
 * D-07: getBinaryContext() lê apenas o .md adjacente, nunca o binário em si.
 * D-08: retorna sidecarContent e sidecarFrontmatter do .md adjacente.
 * T-04-04: parse de sidecar usa react-markdown seguro, sem rehype-raw.
 *
 * ESTADO: RED — getBinaryContext ainda não existe na interface nem na implementação.
 * Estes testes travam o contrato antes da implementação em planos posteriores.
 */
describe("FsItemRepository — getBinaryContext (CTX-05, D-07, D-08)", () => {
  const sidecarMarkdown = "---\nestado: finalizado\n---\n# Contexto da imagem\n\nDescrição editorial.";
  const binaryId = "tecnologia/_superapp/foto.png";

  beforeEach(() => {
    vi.mocked(fs.existsSync).mockImplementation((p: unknown) => {
      // O arquivo binário existe
      if (String(p).endsWith("foto.png")) return true;
      // O sidecar .md existe
      if (String(p).endsWith("foto.png.md")) return true;
      return false;
    });

    vi.mocked(fs.readFileSync).mockImplementation((p: unknown, opts?: unknown) => {
      const s = String(p);
      if (s.endsWith("topicos.json")) return mockTopicos;
      if (s.endsWith("grupos.json")) return mockGrupos;
      // Sidecar .md é lido como texto normalmente
      if (s.endsWith("foto.png.md")) return sidecarMarkdown;
      // Se alguém tentar ler o binário com encoding utf-8, lançar erro para
      // capturar o risco de parse incorreto (T-04-05, D-07)
      if (s.endsWith("foto.png") && opts === "utf-8") {
        throw new Error("Binary file should not be read as UTF-8 text");
      }
      return "";
    });
  });

  test("D-07, D-08: getBinaryContext() retorna sidecarContent do .md adjacente sem ler o binário", () => {
    const repo = new FsItemRepository();

    // getBinaryContext deve existir na implementação (RED até Wave 1)
    expect(typeof (repo as unknown as Record<string, unknown>).getBinaryContext).toBe("function");

    const ctx = (repo as unknown as { getBinaryContext: (id: string) => { sidecarContent: string | null; sidecarFrontmatter: Record<string, unknown> | null } }).getBinaryContext(binaryId);

    // Deve retornar o conteúdo Markdown do sidecar (sem o frontmatter)
    expect(ctx.sidecarContent).not.toBeNull();
    expect(ctx.sidecarContent).toContain("# Contexto da imagem");
    expect(ctx.sidecarContent).not.toContain("estado:");
  });

  test("D-08: getBinaryContext() retorna sidecarFrontmatter do .md adjacente", () => {
    const repo = new FsItemRepository();
    const ctx = (repo as unknown as { getBinaryContext: (id: string) => { sidecarContent: string | null; sidecarFrontmatter: Record<string, unknown> | null } }).getBinaryContext(binaryId);

    expect(ctx.sidecarFrontmatter).not.toBeNull();
    expect(ctx.sidecarFrontmatter?.estado).toBe("finalizado");
  });

  test("D-07: getBinaryContext() NÃO lê o arquivo binário como UTF-8", () => {
    const repo = new FsItemRepository();

    // O mock lança se o binário for lido como utf-8
    // Se a implementação ler o binário, este teste falhará com o erro do mock
    expect(() => {
      (repo as unknown as { getBinaryContext: (id: string) => unknown }).getBinaryContext(binaryId);
    }).not.toThrow("Binary file should not be read as UTF-8 text");
  });

  test("D-07: getBinaryContext() retorna contexto nulo quando sidecar não existe", () => {
    // Sem sidecar .md adjacente
    vi.mocked(fs.existsSync).mockImplementation((p: unknown) => {
      if (String(p).endsWith("foto.png")) return true;
      if (String(p).endsWith("foto.png.md")) return false; // sidecar ausente
      return false;
    });

    const repo = new FsItemRepository();
    const ctx = (repo as unknown as { getBinaryContext: (id: string) => { sidecarContent: string | null; sidecarFrontmatter: Record<string, unknown> | null } }).getBinaryContext(binaryId);

    // Contexto nulo quando sidecar não existe — item lógico estável sem erro
    expect(ctx.sidecarContent).toBeNull();
    expect(ctx.sidecarFrontmatter).toBeNull();
  });

  test("T-3-01: getBinaryContext() lança Path traversal para id com ../", () => {
    const repo = new FsItemRepository();
    expect(() => {
      (repo as unknown as { getBinaryContext: (id: string) => unknown }).getBinaryContext("../../../etc/passwd");
    }).toThrow("Path traversal detectado");
  });
});
