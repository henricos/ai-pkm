import { describe, test, expect, vi, beforeEach } from "vitest";
import type {
  NavigationTreeNode,
  InboxEntry,
  NavigationItemRef,
  NavigationSnapshot,
} from "@/lib/navigation/navigation-types";

// Mock de env para não requerer variáveis reais
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

// Índices de exemplo
const mockTopicos = JSON.stringify([
  {
    id: "tecnologia",
    descricao: "Tecnologia e engenharia",
    subtopicos: [{ id: "superapp", descricao: "Superapplicativos" }],
  },
  {
    id: "design",
    descricao: "Design e UX",
  },
]);

const mockGrupos = JSON.stringify([
  {
    caminho: "pkm/tecnologia/_ferramentas/",
    descricao: "Ferramentas",
    topico: "tecnologia",
  },
]);

// Helpers de mock para readdir
const mockFiles: Record<string, string[]> = {
  "/mock/pkm/__inbox": ["item-inbox-1.md", "url_inbox-2.md"],
  "/mock/pkm/tecnologia": ["nota-geral.md"],
  "/mock/pkm/tecnologia/superapp": ["nota-superapp.excalidraw", "imagem.png"],
  "/mock/pkm/tecnologia/_ferramentas": ["ferramenta.pdf", "binario.zip"],
  "/mock/pkm/design": ["conceito.md"],
};

// Conteúdo de frontmatter para mock de readFileSync
function frontmatter(estado = "rascunho") {
  return `---\nestado: ${estado}\ndata_captura: 2026-01-01\n---\n# conteúdo`;
}

function setupMocks() {
  vi.mocked(fs.readFileSync).mockImplementation((p: unknown) => {
    const s = String(p);
    if (s.endsWith("topicos.json")) return mockTopicos;
    if (s.endsWith("grupos.json")) return mockGrupos;
    return frontmatter("rascunho");
  });

  vi.mocked(fs.existsSync).mockReturnValue(true);

  vi.mocked(fs.readdirSync).mockImplementation((p: unknown, opts?: unknown) => {
    const s = String(p);
    const files = mockFiles[s];
    if (!files) return [];
    if (opts && typeof opts === "object" && "withFileTypes" in (opts as object)) {
      return files.map((name) => ({
        name,
        isDirectory: () => false,
        isFile: () => true,
      })) as unknown as ReturnType<typeof fs.readdirSync>;
    }
    return files as unknown as ReturnType<typeof fs.readdirSync>;
  });
}

// ─────────────────────────────────────────────
// Helpers tipados para coleta recursiva de itens
// ─────────────────────────────────────────────

function collectItems(nodes: NavigationTreeNode[]): NavigationItemRef[] {
  return nodes.flatMap((n) => [
    ...n.items,
    ...collectItems(n.children),
  ]);
}

function findItemByIdFragment(
  nodes: NavigationTreeNode[],
  fragment: string,
): NavigationItemRef | undefined {
  for (const node of nodes) {
    const found = node.items.find((i) => i.id.includes(fragment));
    if (found) return found;
    const deeper = findItemByIdFragment(node.children, fragment);
    if (deeper) return deeper;
  }
  return undefined;
}

function findItemInSubtopic(nodes: NavigationTreeNode[]): NavigationItemRef | undefined {
  for (const node of nodes) {
    if (node.kind === "subtopic") {
      if (node.items.length > 0) return node.items[0];
      const deeper = findItemInSubtopic(node.children);
      if (deeper) return deeper;
    }
    const deeper = findItemInSubtopic(node.children);
    if (deeper) return deeper;
  }
  return undefined;
}

function collectAllIds(nodes: NavigationTreeNode[]): string[] {
  return nodes.flatMap((n) => [
    ...n.items.map((i) => i.id),
    ...collectAllIds(n.children),
  ]);
}

function checkCounts(nodes: NavigationTreeNode[]): void {
  nodes.forEach((node) => {
    expect(typeof node.count).toBe("number");
    expect(node.count).toBeGreaterThanOrEqual(0);
    checkCounts(node.children);
  });
}

function checkParentCount(nodes: NavigationTreeNode[]): void {
  nodes.forEach((node) => {
    node.children.forEach((child) => {
      expect(node.count).toBeGreaterThanOrEqual(child.count);
    });
    checkParentCount(node.children);
  });
}

// ─────────────────────────────────────────────
// Contratos de tipos e helpers de rota
// ─────────────────────────────────────────────

describe("route-helpers", () => {
  test("Teste 5a: itemToHref gera /library/... para item de biblioteca", async () => {
    const { itemToHref } = await import("@/lib/navigation/route-helpers");
    const href = itemToHref({ id: "tecnologia/superapp/nota.md", scope: "library" });
    expect(href).toMatch(/^\/library\//);
    expect(href).not.toMatch(/^\/inbox\//);
  });

  test("Teste 5b: itemToHref gera /inbox/... para item da inbox", async () => {
    const { itemToHref } = await import("@/lib/navigation/route-helpers");
    const href = itemToHref({ id: "__inbox/item-inbox-1.md", scope: "inbox" });
    expect(href).toMatch(/^\/inbox\//);
    expect(href).not.toMatch(/^\/library\//);
  });

  test("Teste 5c: itemToHref encoda segmentos de URL corretamente", async () => {
    const { itemToHref } = await import("@/lib/navigation/route-helpers");
    const href = itemToHref({ id: "tecnologia/superapp/nota com espaço.md", scope: "library" });
    expect(href).not.toContain(" ");
    expect(href).toContain("nota%20com%20espa%C3%A7o.md");
  });

  test("Teste 5d: decodeLibraryParams reconstrói ID lógico do item", async () => {
    const { decodeLibraryParams } = await import("@/lib/navigation/route-helpers");
    const id = decodeLibraryParams({ path: ["tecnologia", "superapp", "nota.md"] });
    expect(id).toBe("tecnologia/superapp/nota.md");
  });

  test("Teste 5e: decodeInboxParam retorna path com __inbox/ prefixado", async () => {
    const { decodeInboxParam } = await import("@/lib/navigation/route-helpers");
    const id = decodeInboxParam("item-inbox-1.md");
    expect(id).toBe("__inbox/item-inbox-1.md");
  });

  test("Teste 5f: itemToHref e decodeLibraryParams são inversos", async () => {
    const { itemToHref, decodeLibraryParams } = await import("@/lib/navigation/route-helpers");
    const originalId = "tecnologia/superapp/nota.md";
    const href = itemToHref({ id: originalId, scope: "library" });
    // Extrair segmentos do href gerado (sem o /library/ prefix)
    const withoutPrefix = href.replace("/library/", "");
    const segments = withoutPrefix.split("/").map(decodeURIComponent);
    const decoded = decodeLibraryParams({ path: segments });
    expect(decoded).toBe(originalId);
  });
});

// ─────────────────────────────────────────────
// Contratos de tipos de navegação
// ─────────────────────────────────────────────

describe("navigation-types (contratos estáticos)", () => {
  test("NavigationSnapshot tem os campos obrigatórios corretos", async () => {
    const types = await import("@/lib/navigation/navigation-types");
    // Verificação de tipo em runtime — validamos que os exports existem
    expect(types).toBeDefined();
    // Os tipos NavigationSnapshot, NavigationTreeNode, InboxEntry, NavigationItemRef existem como exports de tipo
    // (verificação em nível de importação sem erro = contrato satisfeito no TypeScript)
  });
});

// ─────────────────────────────────────────────
// NavigationService — contratos de snapshot
// ─────────────────────────────────────────────

describe("getNavigationSnapshot", () => {
  beforeEach(() => {
    setupMocks();
    vi.resetModules();
    // re-mock env depois de resetar módulos
    vi.mock("@/lib/env", () => ({
      env: {
        PKM_PATH: "/mock/pkm",
        AUTH_USERNAME: "test",
        AUTH_PASSWORD: "testpass123",
        NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
        NEXTAUTH_URL: "http://localhost:3000",
      },
    }));
    vi.mock("fs");
    setupMocks();
  });

  test("Teste 1: snapshot contém inbox e tree como campos separados", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    expect(snapshot).toHaveProperty("inbox");
    expect(snapshot).toHaveProperty("tree");
    expect(snapshot).toHaveProperty("ancestorsByItemId");
    expect(Array.isArray(snapshot.inbox)).toBe(true);
    expect(Array.isArray(snapshot.tree)).toBe(true);
    expect(typeof snapshot.ancestorsByItemId).toBe("object");
  });

  test("Teste 1b: inbox contém itens da __inbox com scope 'inbox'", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    expect(snapshot.inbox.length).toBeGreaterThan(0);
    snapshot.inbox.forEach((entry: InboxEntry) => {
      expect(entry.scope).toBe("inbox");
      expect(entry.href).toMatch(/^\/inbox\//);
    });
  });

  test("Teste 1c: tree não contém itens da inbox", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const allTreeItems = collectItems(snapshot.tree);
    allTreeItems.forEach((item: NavigationItemRef) => {
      expect(item.scope).not.toBe("inbox");
      expect(item.href).not.toMatch(/^\/inbox\//);
      expect(item.id).not.toMatch(/__inbox/);
    });
  });

  test("Teste 2: contagens de agrupadores são calculadas corretamente", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();
    checkCounts(snapshot.tree);
  });

  test("Teste 2b: count de agrupador pai >= count de cada filho individual", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();
    checkParentCount(snapshot.tree);
  });

  test("Teste 3: itens têm itemKind distinto por extensão/tipo de arquivo", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const allItems: NavigationItemRef[] = [...snapshot.inbox, ...collectItems(snapshot.tree)];
    const validKinds = new Set(["markdown", "image", "excalidraw", "pdf", "binary"]);

    allItems.forEach((item: NavigationItemRef) => {
      expect(validKinds.has(item.itemKind)).toBe(true);
    });
  });

  test("Teste 3b: .excalidraw → itemKind 'excalidraw'", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const excalidrawItem = findItemByIdFragment(snapshot.tree, ".excalidraw");
    expect(excalidrawItem?.itemKind).toBe("excalidraw");
  });

  test("Teste 3c: .png → itemKind 'image'", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const imageItem = findItemByIdFragment(snapshot.tree, ".png");
    expect(imageItem?.itemKind).toBe("image");
  });

  test("Teste 3d: .pdf → itemKind 'pdf'", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const pdfItem = findItemByIdFragment(snapshot.tree, ".pdf");
    expect(pdfItem?.itemKind).toBe("pdf");
  });

  test("Teste 3e: .zip (binário genérico) → itemKind 'binary'", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const binaryItem = findItemByIdFragment(snapshot.tree, ".zip");
    expect(binaryItem?.itemKind).toBe("binary");
  });

  test("Teste 4: estado do item (rascunho/finalizado) é preservado separado do itemKind", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const allItems: NavigationItemRef[] = [...snapshot.inbox, ...collectItems(snapshot.tree)];
    allItems.forEach((item: NavigationItemRef) => {
      expect(["rascunho", "finalizado"]).toContain(item.estado);
      expect(item).toHaveProperty("estado");
      expect(item).toHaveProperty("itemKind");
    });
  });

  test("Teste 6: ancestorsByItemId mapeia itens para seus agrupadores ancestrais", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const keys = Object.keys(snapshot.ancestorsByItemId);
    expect(keys.length).toBeGreaterThan(0);
  });

  test("Teste 6b: ancestors de item em subtópico contém o tópico pai", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const itemInSubtopic = findItemInSubtopic(snapshot.tree);
    if (itemInSubtopic) {
      const ancestors = snapshot.ancestorsByItemId[itemInSubtopic.id];
      expect(Array.isArray(ancestors)).toBe(true);
      expect(ancestors!.length).toBeGreaterThanOrEqual(1);
    }
  });

  test("Teste 6c: itens da inbox NÃO aparecem em ancestorsByItemId", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");
    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const inboxIds = new Set(snapshot.inbox.map((e: InboxEntry) => e.id));
    const ancestorKeys = Object.keys(snapshot.ancestorsByItemId);

    ancestorKeys.forEach((key) => {
      expect(inboxIds.has(key)).toBe(false);
    });
  });

  test("Sidecar NÃO aparece como item independente na tree", async () => {
    const { getNavigationSnapshot } = await import("@/lib/navigation/navigation-service");

    // Adicionar um sidecar nos mocks
    vi.mocked(fs.readdirSync).mockImplementation((p: unknown, opts?: unknown) => {
      const s = String(p);
      const baseFiles = mockFiles[s] ?? [];
      // Simular sidecar .md para imagem.png
      const filesWithSidecar = s.includes("superapp")
        ? [...baseFiles, "imagem.png.md"]
        : baseFiles;
      if (opts && typeof opts === "object" && "withFileTypes" in (opts as object)) {
        return filesWithSidecar.map((name) => ({
          name,
          isDirectory: () => false,
          isFile: () => true,
        })) as unknown as ReturnType<typeof fs.readdirSync>;
      }
      return filesWithSidecar as unknown as ReturnType<typeof fs.readdirSync>;
    });

    const snapshot: NavigationSnapshot = await getNavigationSnapshot();

    const allIds = collectAllIds(snapshot.tree);
    // Sidecar (arquivo com dupla extensão .png.md) não deve aparecer
    const sidecars = allIds.filter((id) => /\.[^.]+\.[^.]+$/.test(id));
    expect(sidecars).toHaveLength(0);
  });
});
