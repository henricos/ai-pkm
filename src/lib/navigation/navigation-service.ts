/**
 * NavigationService — projeção server-side do read model de navegação (Phase 2)
 *
 * Consome o read model da phase 1 e os índices estruturais para gerar o
 * NavigationSnapshot consumido pela shell persistente.
 *
 * Responsabilidades:
 * - Separar inbox da biblioteca estruturada (D-01, D-02)
 * - Calcular contagens em todos os agrupadores (D-09)
 * - Classificar itemKind visual por extensão/nome (D-11)
 * - Preservar estado separado do tipo visual (D-10)
 * - Expor ancestorsByItemId para reveal por URL direta (D-08)
 * - Excluir sidecars da árvore como itens independentes
 * - Nunca expor paths absolutos no snapshot
 *
 * Segurança (T-02-01, T-02-02, T-02-03):
 * - Toda lógica roda exclusivamente no servidor
 * - Ancestors e contagens calculadas dos índices já validados na phase 1
 * - Nenhum path absoluto ou sidecar exposto no snapshot
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { env } from "@/lib/env";
import { itemToHref } from "./route-helpers";
import type {
  NavigationSnapshot,
  NavigationTreeNode,
  InboxEntry,
  NavigationItemRef,
  NavigationItemKind,
} from "./navigation-types";

// ─────────────────────────────────────────────
// Tipos internos (não expostos ao cliente)
// ─────────────────────────────────────────────

interface TopicIndex {
  id: string;
  descricao: string;
  subtopicos?: Array<{ id: string; descricao: string }>;
}

interface GroupIndex {
  caminho: string;
  descricao: string;
  topico: string;
}

// ─────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────

/**
 * Infere o itemKind visual a partir do nome/extensão do arquivo (D-11).
 * Separação entre tipo (o que é) e estado (em que estado está).
 */
function inferItemKind(filename: string): NavigationItemKind {
  const lower = filename.toLowerCase();

  // Excalidraw: extensão .excalidraw (pode ser .excalidraw ou .excalidraw.md como sidecar — mas sidecar é filtrado antes)
  if (lower.endsWith(".excalidraw")) return "excalidraw";

  // Imagem: extensões comuns de imagem
  if (/\.(png|jpg|jpeg|gif|webp|svg|avif|bmp|ico)$/.test(lower)) return "image";

  // PDF
  if (lower.endsWith(".pdf")) return "pdf";

  // Markdown: .md mas sem dupla extensão (sidecars são filtrados antes)
  if (lower.endsWith(".md")) return "markdown";

  // Binário genérico: tudo o mais
  return "binary";
}

/**
 * Verifica se um arquivo é sidecar (dupla extensão: nome.ext.md ou nome.ext.excalidraw).
 * Sidecars não aparecem como itens independentes na árvore.
 */
function isSidecar(filename: string): boolean {
  // Padrão: extensão-base.extensão-sidecar (ex: foto.png.md, diagrama.png.excalidraw)
  return /\.[^.]+\.(md|excalidraw)$/.test(filename) && filename.split(".").length > 2;
}

/**
 * Lê o estado do frontmatter de um arquivo .md.
 * Para binários sem sidecar, retorna "rascunho" como padrão.
 */
function readEstado(absPath: string): "rascunho" | "finalizado" {
  try {
    if (!fs.existsSync(absPath)) return "rascunho";
    const raw = fs.readFileSync(absPath, "utf-8");
    const { data } = matter(raw);
    const estado = data.estado as string | undefined;
    if (estado === "finalizado") return "finalizado";
    return "rascunho";
  } catch {
    return "rascunho";
  }
}

/**
 * Tenta ler o estado de um item binário via seu sidecar .md, se existir.
 */
function readEstadoForBinary(absPath: string): "rascunho" | "finalizado" {
  const sidecarPath = absPath + ".md";
  if (fs.existsSync(sidecarPath)) {
    return readEstado(sidecarPath);
  }
  return "rascunho";
}

/**
 * Lista arquivos de um diretório, excluindo sidecars.
 * Retorna apenas nomes de arquivo (não subdiretórios).
 */
function listFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => {
        if (typeof e === "string") return true;
        return e.isFile();
      })
      .map((e) => (typeof e === "string" ? e : e.name))
      .filter((name) => !isSidecar(name));
  } catch {
    return [];
  }
}

/**
 * Projeta um arquivo de item em NavigationItemRef.
 */
function projectItem(
  relPath: string,
  filename: string,
  scope: "library" | "inbox",
  pkmRoot: string,
): NavigationItemRef {
  const itemKind = inferItemKind(filename);
  const absPath = path.join(pkmRoot, relPath);

  let estado: "rascunho" | "finalizado";
  if (itemKind === "markdown") {
    estado = readEstado(absPath);
  } else {
    estado = readEstadoForBinary(absPath);
  }

  const label = filename.replace(/\.[^.]+$/, ""); // remove extensão para label

  const ref: NavigationItemRef = {
    id: relPath,
    label,
    scope,
    itemKind,
    estado,
    href: itemToHref({ id: relPath, scope }),
  };

  return ref;
}

/**
 * Projeta os itens da __inbox em InboxEntry[].
 */
function projectInbox(pkmRoot: string): InboxEntry[] {
  const inboxDir = path.join(pkmRoot, "__inbox");
  const files = listFiles(inboxDir);

  return files.map((filename) => {
    const relPath = `__inbox/${filename}`;
    const ref = projectItem(relPath, filename, "inbox", pkmRoot);
    return ref as InboxEntry;
  });
}

/**
 * Projeta um grupo (pasta _xxx) como NavigationTreeNode.
 * Inclui apenas os itens diretos do grupo.
 */
function projectGroup(
  topicId: string,
  groupDirName: string,
  groupDescricao: string,
  pkmRoot: string,
  ancestorIds: string[],
  ancestorsByItemId: Record<string, string[]>,
): NavigationTreeNode {
  const groupPath = `${topicId}/${groupDirName}`;
  const absGroupPath = path.join(pkmRoot, topicId, groupDirName);
  const files = listFiles(absGroupPath);

  const items: NavigationItemRef[] = files.map((filename) => {
    const relPath = `${groupPath}/${filename}`;
    const ref = projectItem(relPath, filename, "library", pkmRoot);

    // Registrar ancestry: [topicId, groupId] para reveal por URL
    ancestorsByItemId[relPath] = [...ancestorIds, groupPath];

    return ref;
  });

  const node: NavigationTreeNode = {
    id: groupPath,
    label: groupDescricao,
    kind: "group",
    count: items.length,
    children: [],
    items,
  };

  return node;
}

/**
 * Projeta um subtópico como NavigationTreeNode.
 * Inclui itens diretos do subtópico e grupos dentro dele.
 */
function projectSubtopic(
  topicId: string,
  subtopicId: string,
  subtopicDescricao: string,
  groups: GroupIndex[],
  pkmRoot: string,
  ancestorIds: string[],
  ancestorsByItemId: Record<string, string[]>,
): NavigationTreeNode {
  const subtopicPath = `${topicId}/${subtopicId}`;
  const absSubtopicPath = path.join(pkmRoot, topicId, subtopicId);
  const files = listFiles(absSubtopicPath);

  // Itens diretos do subtópico (não em grupos)
  const groupDirNames = new Set(
    groups
      .filter((g) => g.topico === topicId)
      .map((g) => {
        // Extrair nome da pasta do grupo a partir do caminho
        const parts = g.caminho.replace(/\/$/, "").split("/");
        return parts[parts.length - 1] ?? "";
      })
      .filter(Boolean),
  );

  const directItems: NavigationItemRef[] = files
    .filter((filename) => !groupDirNames.has(filename))
    .map((filename) => {
      const relPath = `${subtopicPath}/${filename}`;
      const ref = projectItem(relPath, filename, "library", pkmRoot);
      ancestorsByItemId[relPath] = [...ancestorIds, subtopicPath];
      return ref;
    });

  // Grupos dentro do subtópico (se existirem)
  const subtopicGroups = groups.filter((g) => {
    const parts = g.caminho.replace(/\/$/, "").split("/");
    // Caminho formato: pkm/topico/subtopico/_grupo/ ou pkm/topico/_grupo/
    // Para subtópico: pkm/{topicId}/{subtopicId}/_xxx/
    return (
      parts.length >= 4 &&
      parts[parts.length - 3] === subtopicId &&
      parts[parts.length - 2]?.startsWith("_")
    );
  });

  const groupNodes: NavigationTreeNode[] = subtopicGroups.map((g) => {
    const parts = g.caminho.replace(/\/$/, "").split("/");
    const groupDirName = parts[parts.length - 1] ?? "";
    return projectGroup(
      `${topicId}/${subtopicId}`,
      groupDirName,
      g.descricao,
      pkmRoot,
      [...ancestorIds, subtopicPath],
      ancestorsByItemId,
    );
  });

  const totalCount =
    directItems.length +
    groupNodes.reduce((sum, g) => sum + g.count, 0);

  const node: NavigationTreeNode = {
    id: subtopicPath,
    label: subtopicDescricao,
    kind: "subtopic",
    count: totalCount,
    children: groupNodes,
    items: directItems,
  };

  return node;
}

/**
 * Projeta um tópico raiz como NavigationTreeNode.
 * Inclui itens diretos, subtópicos e grupos do tópico.
 */
function projectTopic(
  topic: TopicIndex,
  groups: GroupIndex[],
  pkmRoot: string,
  ancestorsByItemId: Record<string, string[]>,
): NavigationTreeNode {
  const topicPath = topic.id;
  const absTopicPath = path.join(pkmRoot, topic.id);
  const files = listFiles(absTopicPath);

  // Nomes de pastas de grupos e subtópicos (para não incluir como itens diretos)
  const topicGroups = groups.filter((g) => {
    const parts = g.caminho.replace(/\/$/, "").split("/");
    // Grupo direto do tópico: pkm/{topicId}/_xxx/
    return (
      parts.length === 3 &&
      parts[1] === topic.id &&
      parts[2]?.startsWith("_")
    );
  });

  const subtopicIds = new Set((topic.subtopicos ?? []).map((s) => s.id));
  const groupDirNames = new Set(
    topicGroups.map((g) => {
      const parts = g.caminho.replace(/\/$/, "").split("/");
      return parts[parts.length - 1] ?? "";
    }),
  );

  // Itens diretos do tópico (não em subtópicos nem grupos)
  const directItems: NavigationItemRef[] = files
    .filter((filename) => !subtopicIds.has(filename) && !groupDirNames.has(filename))
    .map((filename) => {
      const relPath = `${topicPath}/${filename}`;
      const ref = projectItem(relPath, filename, "library", pkmRoot);
      ancestorsByItemId[relPath] = [topicPath];
      return ref;
    });

  // Subtópicos
  const subtopicNodes: NavigationTreeNode[] = (topic.subtopicos ?? []).map((sub) =>
    projectSubtopic(
      topic.id,
      sub.id,
      sub.descricao,
      groups,
      pkmRoot,
      [topicPath],
      ancestorsByItemId,
    ),
  );

  // Grupos diretos do tópico
  const groupNodes: NavigationTreeNode[] = topicGroups.map((g) => {
    const parts = g.caminho.replace(/\/$/, "").split("/");
    const groupDirName = parts[parts.length - 1] ?? "";
    return projectGroup(
      topic.id,
      groupDirName,
      g.descricao,
      pkmRoot,
      [topicPath],
      ancestorsByItemId,
    );
  });

  const allChildren = [...subtopicNodes, ...groupNodes];
  const totalCount =
    directItems.length +
    allChildren.reduce((sum, child) => sum + child.count, 0);

  const node: NavigationTreeNode = {
    id: topicPath,
    label: topic.descricao,
    kind: "topic",
    count: totalCount,
    children: allChildren,
    items: directItems,
  };

  return node;
}

// ─────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────

/**
 * Gera o NavigationSnapshot completo para a shell.
 *
 * Esta função é server-side only. Nunca deve ser importada em Client Components.
 * Calcula: inbox separada, árvore estruturada, contagens e ancestry.
 *
 * Segurança: opera exclusivamente sobre IDs validados via índices e PKM_PATH
 * — nenhum path absoluto aparece no resultado.
 */
export async function getNavigationSnapshot(): Promise<NavigationSnapshot> {
  const pkmRoot = path.resolve(env.PKM_PATH);
  const indexDir = path.join(process.cwd(), "index");

  // Ler índices estruturais
  const topicsRaw = fs.readFileSync(path.join(indexDir, "topicos.json"), "utf-8");
  const groupsRaw = fs.readFileSync(path.join(indexDir, "grupos.json"), "utf-8");
  const topics = JSON.parse(topicsRaw) as TopicIndex[];
  const groups = JSON.parse(groupsRaw) as GroupIndex[];

  // Mapa de ancestry (preenchido incrementalmente durante projeção)
  const ancestorsByItemId: Record<string, string[]> = {};

  // Projetar inbox
  const inbox = projectInbox(pkmRoot);

  // Projetar árvore
  const tree: NavigationTreeNode[] = topics.map((topic) =>
    projectTopic(topic, groups, pkmRoot, ancestorsByItemId),
  );

  return {
    inbox,
    tree,
    ancestorsByItemId,
  };
}
