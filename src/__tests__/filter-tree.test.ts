/**
 * Testes do pipeline de filtro estrutural — filterNavigationTree
 *
 * Cobre:
 * - T1: filtro vazio retorna árvore original intacta (D-13, D-19)
 * - T2: substring em qualquer posição do label (D-15)
 * - T3: curinga `*` como glob sem achatar a árvore (D-16, D-17)
 * - T4: tolerância a diferença de caixa, acento e desvios simples (D-20, FIL-02)
 * - T5: preserva forma de árvore com ancestrais e expõe offsets para highlight (D-18)
 */

import { describe, it, expect } from "vitest";
import {
  filterNavigationTree,
  highlightMatches,
} from "@/lib/navigation/filter-tree";
import type { NavigationTreeNode } from "@/lib/navigation/navigation-types";

// ── Fixture mínima ────────────────────────────────────────────────────────────

function makeItem(label: string, id?: string) {
  return {
    id: id ?? label.toLowerCase().replace(/\s+/g, "-"),
    label,
    scope: "library" as const,
    itemKind: "markdown" as const,
    estado: "finalizado" as const,
    href: `/library/${id ?? label.toLowerCase()}`,
  };
}

function makeNode(
  label: string,
  children: NavigationTreeNode[] = [],
  items: ReturnType<typeof makeItem>[] = [],
): NavigationTreeNode {
  return {
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    kind: "topic",
    count: items.length + children.reduce((s, c) => s + c.count, 0),
    children,
    items,
  };
}

const TREE: NavigationTreeNode[] = [
  makeNode(
    "Tecnologia",
    [
      makeNode("Superapp", [], [
        makeItem("Roadmap produto"),
        makeItem("Arquitetura base"),
      ]),
      makeNode("Backend", [], [
        makeItem("API design"),
        makeItem("Schema banco"),
      ]),
    ],
  ),
  makeNode(
    "Filosofia",
    [],
    [makeItem("Estoicismo prático"), makeItem("Carta seneca")],
  ),
];

// ── Testes ────────────────────────────────────────────────────────────────────

describe("filterNavigationTree", () => {
  it("T1: filtro vazio retorna a árvore original sem modificações", () => {
    const result = filterNavigationTree(TREE, "");
    expect(result).toEqual(TREE);
  });

  it("T1: filtro nulo/undefined retorna a árvore original", () => {
    const result = filterNavigationTree(TREE, null);
    expect(result).toEqual(TREE);
  });

  it("T2: substring no meio do label encontra o nó", () => {
    const result = filterNavigationTree(TREE, "design");
    const techNode = result.find((n) => n.label === "Tecnologia");
    expect(techNode).toBeDefined();
    const backendNode = techNode?.children.find((c) => c.label === "Backend");
    expect(backendNode).toBeDefined();
    const item = backendNode?.items.find((i) => i.label === "API design");
    expect(item).toBeDefined();
  });

  it("T2: substring no prefixo do label também encontra", () => {
    const result = filterNavigationTree(TREE, "Arqui");
    const techNode = result.find((n) => n.label === "Tecnologia");
    expect(techNode).toBeDefined();
    const item = techNode?.children
      .flatMap((c) => c.items)
      .find((i) => i.label === "Arquitetura base");
    expect(item).toBeDefined();
  });

  it("T3: curinga `*` não achata a árvore — retorna estrutura preservada", () => {
    const result = filterNavigationTree(TREE, "*");
    // Com `*`, tudo bate — deve retornar a árvore intacta
    expect(result.length).toBe(TREE.length);
    // Ainda tem filhos com hierarquia
    const techNode = result.find((n) => n.label === "Tecnologia");
    expect(techNode?.children.length).toBeGreaterThan(0);
  });

  it("T3: curinga `*prod*` encontra apenas items com 'prod' no label", () => {
    const result = filterNavigationTree(TREE, "*prod*");
    const techNode = result.find((n) => n.label === "Tecnologia");
    expect(techNode).toBeDefined();
    const superapp = techNode?.children.find((c) => c.label === "Superapp");
    expect(superapp).toBeDefined();
    const item = superapp?.items.find((i) => i.label === "Roadmap produto");
    expect(item).toBeDefined();
    // Não encontra API design (não tem 'prod')
    const apiItem = techNode?.children
      .flatMap((c) => c.items)
      .find((i) => i.label === "API design");
    expect(apiItem).toBeUndefined();
  });

  it("T4: diferença de caixa é ignorada", () => {
    const result = filterNavigationTree(TREE, "ROADMAP");
    const techNode = result.find((n) => n.label === "Tecnologia");
    const item = techNode?.children
      .flatMap((c) => c.items)
      .find((i) => i.label === "Roadmap produto");
    expect(item).toBeDefined();
  });

  it("T4: variação de acento encontra item (ex: 'Estoicismo' encontra 'Estoicismo prático')", () => {
    const result = filterNavigationTree(TREE, "estoicismo");
    const philoNode = result.find((n) => n.label === "Filosofia");
    expect(philoNode).toBeDefined();
    const item = philoNode?.items.find((i) => i.label === "Estoicismo prático");
    expect(item).toBeDefined();
  });

  it("T4: pequeno desvio de digitação encontra via fuzzy (seneca -> seneca)", () => {
    // 'séneca' com acento deve encontrar 'Carta seneca'
    const result = filterNavigationTree(TREE, "séneca");
    const philoNode = result.find((n) => n.label === "Filosofia");
    expect(philoNode).toBeDefined();
    const item = philoNode?.items.find((i) => i.label === "Carta seneca");
    expect(item).toBeDefined();
  });

  it("T5: resultado preserva a forma de árvore com apenas ancestrais necessários", () => {
    const result = filterNavigationTree(TREE, "Schema");
    // Deve ter Tecnologia > Backend > Schema banco
    expect(result.length).toBe(1); // só Tecnologia
    const techNode = result[0]!;
    expect(techNode.label).toBe("Tecnologia");
    expect(techNode.children.length).toBe(1); // só Backend
    expect(techNode.children[0]!.label).toBe("Backend");
    expect(techNode.children[0]!.items.length).toBe(1); // só Schema banco
    expect(techNode.children[0]!.items[0]!.label).toBe("Schema banco");
    // Não inclui Superapp nem Filosofia
    expect(result.find((n) => n.label === "Filosofia")).toBeUndefined();
  });

  it("T5: items do resultado carregam offsets para highlight", () => {
    const result = filterNavigationTree(TREE, "design");
    const item = result
      .flatMap((n) => n.children.flatMap((c) => c.items))
      .find((i) => i.label === "API design");
    expect(item).toBeDefined();
    // O item deve ter matchOffsets com pelo menos um par [start, end]
    const withOffsets = item as typeof item & { matchOffsets?: [number, number][] };
    expect(withOffsets?.matchOffsets).toBeDefined();
    expect(withOffsets?.matchOffsets?.length).toBeGreaterThan(0);
  });
});

describe("highlightMatches", () => {
  it("retorna segmentos de texto com marcação de match", () => {
    const segments = highlightMatches("API design", [[4, 9]]);
    expect(segments).toEqual([
      { text: "API ", highlight: false },
      { text: "desig", highlight: true },
      { text: "n", highlight: false },
    ]);
  });

  it("sem offsets retorna o texto inteiro sem highlight", () => {
    const segments = highlightMatches("API design", []);
    expect(segments).toEqual([{ text: "API design", highlight: false }]);
  });

  it("offset cobrindo o texto inteiro retorna tudo como highlight", () => {
    const segments = highlightMatches("ABC", [[0, 3]]);
    expect(segments).toEqual([{ text: "ABC", highlight: true }]);
  });
});
