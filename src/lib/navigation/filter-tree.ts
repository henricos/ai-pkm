/**
 * Pipeline client-side de filtro estrutural para a árvore de navegação.
 *
 * Estratégia em duas etapas (D-15, D-16, D-17, D-20, FIL-02):
 * 1. Normalização + substring/wildcard (regex seguro) — etapa primária
 * 2. Fuzzy leve via fuse.js com threshold conservador — fallback se etapa 1 não retorna nada
 *
 * Invariantes de segurança (T-02-09):
 * - `*` é escapado e convertido em `.*` para construção de regex — nunca concatenado diretamente
 * - Toda a entrada é normalizada antes de entrar no regex
 * - A inbox nunca passa por este pipeline (T-02-12, D-13, D-19)
 *
 * O resultado preserva sempre a forma de árvore: nunca uma lista achatada.
 * Items que batem carregam `matchOffsets` para highlight sutil (D-18).
 */

import Fuse from "fuse.js";
import type { NavigationTreeNode, NavigationItemRef } from "./navigation-types";

// ── Tipos auxiliares ──────────────────────────────────────────────────────────

/** Item com metadados de highlight opcionais (adicionados só quando há match). */
export type ItemWithOffsets = NavigationItemRef & {
  matchOffsets?: [number, number][];
};

/** Segmento de texto para highlight visual. */
export interface HighlightSegment {
  text: string;
  highlight: boolean;
}

/** Nó da árvore filtrada — items podem carregar offsets. */
export type FilteredTreeNode = Omit<NavigationTreeNode, "children" | "items"> & {
  children: FilteredTreeNode[];
  items: ItemWithOffsets[];
};

// ── Normalização ──────────────────────────────────────────────────────────────

/**
 * Normaliza string para comparação tolerante:
 * - lowercase
 * - remove diacríticos (acentos)
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ── Construção de regex (T-02-09 — escapar `*` antes de construir regex) ───────

/**
 * Converte um padrão de filtro (potencialmente com `*`) em RegExp.
 *
 * `*` é tratado como curinga (glob-style), não como regex bruto.
 * Todos os outros caracteres especiais de regex são escapados.
 */
function patternToRegex(pattern: string): RegExp {
  // Separar o padrão em segmentos por `*`
  const segments = pattern.split("*");
  const escaped = segments
    .map((seg) => seg.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(escaped, "i");
}

// ── Match de um item ──────────────────────────────────────────────────────────

/**
 * Verifica se um label bate com o padrão e retorna os offsets do match, ou null.
 */
function matchLabel(
  label: string,
  normalizedPattern: string,
  regex: RegExp,
): [number, number][] | null {
  const normalizedLabel = normalize(label);

  // Regex match
  const m = normalizedLabel.match(regex);
  if (!m || m[0] === undefined) return null;

  // Calcular offsets no label original (correspondência posicional)
  const matchStart = normalizedLabel.indexOf(m[0]);
  if (matchStart === -1) return null;

  return [[matchStart, matchStart + m[0].length]];
}

// ── Filtro primário: substring/wildcard ───────────────────────────────────────

/**
 * Aplica o filtro substring/wildcard em toda a árvore, preservando ancestrais.
 * Retorna [resultado filtrado, se houve qualquer match].
 */
function filterWithRegex(
  nodes: NavigationTreeNode[],
  regex: RegExp,
  normalizedPattern: string,
): [FilteredTreeNode[], boolean] {
  const result: FilteredTreeNode[] = [];
  let anyMatch = false;

  for (const node of nodes) {
    // Filtrar recursivamente os filhos
    const [filteredChildren, childrenMatch] = filterWithRegex(
      node.children,
      regex,
      normalizedPattern,
    );

    // Filtrar itens terminais do nó
    const filteredItems: ItemWithOffsets[] = [];
    for (const item of node.items) {
      const offsets = matchLabel(item.label, normalizedPattern, regex);
      if (offsets) {
        filteredItems.push({ ...item, matchOffsets: offsets });
        anyMatch = true;
      }
    }

    // Incluir o nó se há match nos filhos ou nos itens
    if (filteredChildren.length > 0 || filteredItems.length > 0) {
      anyMatch = true;
      result.push({
        ...node,
        children: filteredChildren,
        items: filteredItems,
      });
    } else if (childrenMatch) {
      anyMatch = true;
    }
  }

  return [result, anyMatch];
}

// ── Coleta de todos os items (para fuzzy) ─────────────────────────────────────

interface FlatItem {
  item: NavigationItemRef;
  path: string[]; // IDs dos agrupadores ancestrais
}

function collectItems(
  nodes: NavigationTreeNode[],
  ancestorPath: string[] = [],
): FlatItem[] {
  const flat: FlatItem[] = [];
  for (const node of nodes) {
    const path = [...ancestorPath, node.id];
    for (const item of node.items) {
      flat.push({ item, path: [...ancestorPath, node.id] });
    }
    flat.push(...collectItems(node.children, path));
  }
  return flat;
}

// ── Reconstrução da árvore a partir de matches fuzzy ─────────────────────────

function insertItemIntoTree(
  tree: Map<string, FilteredTreeNode>,
  originalNodes: NavigationTreeNode[],
  item: ItemWithOffsets,
  ancestorIds: string[],
): void {
  // Encontra ou cria os nós ancestrais até onde o item pertence
  // ancestorIds = [topicId, ...possíveis subtópicos/grupos]

  function findNode(id: string, nodes: NavigationTreeNode[]): NavigationTreeNode | undefined {
    for (const n of nodes) {
      if (n.id === id) return n;
      const found = findNode(id, n.children);
      if (found) return found;
    }
    return undefined;
  }

  // Para simplicidade, reconstruímos a hierarquia a partir do ID do item
  // O formato do ID é: topico/subtopico?/grupo?/arquivo
  // Os ancestorIds já contêm os IDs dos agrupadores na ordem correta
  if (ancestorIds.length === 0) return;

  const rootId = ancestorIds[0]!;
  let rootNode = tree.get(rootId);
  if (!rootNode) {
    const original = findNode(rootId, originalNodes);
    if (!original) return;
    rootNode = { ...original, children: [], items: [] };
    tree.set(rootId, rootNode);
  }

  // Navegar/criar a hierarquia
  let current: FilteredTreeNode = rootNode;
  for (let i = 1; i < ancestorIds.length; i++) {
    const childId = ancestorIds[i]!;
    let child = current.children.find((c) => c.id === childId);
    if (!child) {
      const original = findNode(childId, originalNodes);
      if (!original) break;
      child = { ...original, children: [], items: [] };
      current.children.push(child);
    }
    current = child;
  }

  // Inserir o item no nó folha (evitar duplicatas)
  if (!current.items.find((i) => i.id === item.id)) {
    current.items.push(item);
  }
}

// ── Filtro fuzzy via fuse.js ──────────────────────────────────────────────────

function filterWithFuzzy(
  nodes: NavigationTreeNode[],
  query: string,
): FilteredTreeNode[] {
  const flatItems = collectItems(nodes);

  const fuse = new Fuse(flatItems, {
    keys: ["item.label"],
    threshold: 0.35, // conservador: evita falsos positivos (T-02-11)
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
  });

  const fuseResults = fuse.search(query);
  if (fuseResults.length === 0) return [];

  const treeMap = new Map<string, FilteredTreeNode>();

  for (const fuseResult of fuseResults) {
    const { item: flatItem, matches } = fuseResult;
    const offsets: [number, number][] = [];

    // Extrair offsets do fuse (podem ser undefined para matches exatos)
    if (matches && matches.length > 0) {
      for (const match of matches) {
        if (match.indices) {
          for (const [start, end] of match.indices) {
            offsets.push([start, end + 1]); // fuse usa [start, end] inclusive
          }
        }
      }
    }

    const itemWithOffsets: ItemWithOffsets = {
      ...flatItem.item,
      matchOffsets: offsets.length > 0 ? offsets : undefined,
    };

    insertItemIntoTree(treeMap, nodes, itemWithOffsets, flatItem.path);
  }

  return Array.from(treeMap.values());
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Filtra a árvore de navegação pelo padrão informado.
 *
 * - Filtro vazio → retorna a árvore original sem modificações (D-13)
 * - `*` isolado → retorna a árvore intacta (D-16)
 * - Substring/wildcard → etapa primária (regex escapado)
 * - Fuzzy leve → fallback quando substring não encontra nada (FIL-02, D-20)
 * - A inbox NUNCA passa por este pipeline (T-02-12, D-19)
 *
 * @param tree  Árvore estrutural do snapshot (somente `tree`, não `inbox`)
 * @param query Texto digitado pelo usuário
 * @returns     Subconjunto filtrado mantendo forma de árvore
 */
export function filterNavigationTree(
  tree: NavigationTreeNode[],
  query: string | null | undefined,
): FilteredTreeNode[] | NavigationTreeNode[] {
  // Filtro vazio → sem-op
  if (!query || query.trim() === "") return tree;

  const trimmed = query.trim();

  // `*` isolado ou `*` que cobre tudo → retorna árvore intacta
  if (trimmed === "*") return tree;

  // Construir regex escapando `*` (T-02-09)
  const normalizedQuery = normalize(trimmed);
  const regex = patternToRegex(normalizedQuery);

  // Etapa 1: substring/wildcard
  const [regexResult, anyMatch] = filterWithRegex(tree, regex, normalizedQuery);
  if (anyMatch) return regexResult;

  // Etapa 2: fuzzy (fallback)
  return filterWithFuzzy(tree, trimmed);
}

/**
 * Quebra um rótulo em segmentos para highlight visual sutil (D-18).
 *
 * @param label   Rótulo original do item
 * @param offsets Pares [start, end] (end exclusivo) de posições com match
 * @returns       Array de segmentos { text, highlight }
 */
export function highlightMatches(
  label: string,
  offsets: [number, number][],
): HighlightSegment[] {
  if (!offsets || offsets.length === 0) {
    return [{ text: label, highlight: false }];
  }

  // Ordenar por start para garantir processamento sequencial
  const sorted = [...offsets].sort((a, b) => a[0] - b[0]);

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const [start, end] of sorted) {
    if (start > cursor) {
      segments.push({ text: label.slice(cursor, start), highlight: false });
    }
    if (end > start) {
      segments.push({ text: label.slice(start, end), highlight: true });
    }
    cursor = end;
  }

  if (cursor < label.length) {
    segments.push({ text: label.slice(cursor), highlight: false });
  }

  return segments;
}
