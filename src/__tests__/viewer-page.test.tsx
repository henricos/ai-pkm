/**
 * Testes do ViewerPage — Phase 3 (03-06) · gap UAT #2
 *
 * Cobre o branch de itemKind: ViewerPage não deve chamar MarkdownViewer
 * para itens não-markdown. Em vez disso, exibe mensagem de formato não suportado.
 *
 * VIEW-02: apenas itens markdown são renderizados como Markdown.
 * VIEW-03: binários (pdf, image, excalidraw, binary) exibem unsupported-format.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock do env (obrigatório para qualquer import que use @/lib/env)
vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    AUTH_USERNAME: "test",
    AUTH_PASSWORD: "testpass123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "http://localhost:3000",
  },
}));

// Mock do FsItemRepository — retorna conteúdo e frontmatter mínimos
vi.mock("@/lib/pkm/fs-item-repository", () => ({
  FsItemRepository: vi.fn().mockImplementation(() => ({
    getItemContent: vi.fn().mockReturnValue("# Conteúdo markdown"),
    getItemFrontmatter: vi.fn().mockReturnValue({ estado: "finalizado" }),
  })),
}));

// Mock do ViewerClientShell — renderiza apenas os children para simplificar o teste
vi.mock("@/components/viewer/viewer-client-shell", () => ({
  ViewerClientShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="viewer-client-shell">{children}</div>
  ),
}));

// Mock do MarkdownViewer — renderiza marcador para verificar se foi chamado
vi.mock("@/components/viewer/markdown-viewer", () => ({
  MarkdownViewer: ({ content }: { content: string }) => (
    <div data-testid="markdown-viewer">{content}</div>
  ),
}));

// Import real após os mocks
import { ViewerPage } from "@/components/viewer/viewer-page";

// ── Item base para reutilização nos testes ───────────────────────────────────

const baseItem = {
  id: "tecnologia/_superapp/arquivo.pdf",
  label: "arquivo.pdf",
  scope: "library" as const,
  estado: "finalizado" as const,
};

// ── Testes do branch itemKind ────────────────────────────────────────────────

describe("ViewerPage — branch itemKind", () => {
  it("exibe unsupported-format para itemKind=pdf", async () => {
    const page = await ViewerPage({ item: { ...baseItem, itemKind: "pdf" } });
    render(page);
    expect(screen.getByTestId("unsupported-format")).toBeTruthy();
  });

  it("exibe unsupported-format para itemKind=binary", async () => {
    const page = await ViewerPage({
      item: { ...baseItem, id: "tecnologia/_superapp/arquivo.zip", itemKind: "binary" },
    });
    render(page);
    expect(screen.getByTestId("unsupported-format")).toBeTruthy();
  });

  it("exibe unsupported-format para itemKind=image", async () => {
    const page = await ViewerPage({
      item: { ...baseItem, id: "tecnologia/_superapp/foto.png", itemKind: "image" },
    });
    render(page);
    expect(screen.getByTestId("unsupported-format")).toBeTruthy();
  });

  it("exibe unsupported-format para itemKind=excalidraw", async () => {
    const page = await ViewerPage({
      item: { ...baseItem, id: "tecnologia/_superapp/diagrama.excalidraw", itemKind: "excalidraw" },
    });
    render(page);
    expect(screen.getByTestId("unsupported-format")).toBeTruthy();
  });

  it("NAO exibe unsupported-format para itemKind=markdown", async () => {
    const page = await ViewerPage({
      item: { ...baseItem, id: "tecnologia/_superapp/nota.md", itemKind: "markdown" },
    });
    render(page);
    expect(screen.queryByTestId("unsupported-format")).toBeNull();
    // MarkdownViewer deve ser chamado para itens markdown
    expect(screen.getByTestId("markdown-viewer")).toBeTruthy();
  });
});
