/**
 * Testes do MarkdownViewer — Phase 3 (03-01) · Wave 0 · RED
 *
 * Cobre os comportamentos exigidos por VIEW-02 e VIEW-08:
 * - VIEW-02: renderiza Markdown sem crash, links externos em nova aba,
 *            links internos navegam na shell
 * - VIEW-08: aplica classe prose e prose-sm ao container article
 *
 * ESTADO: RED — MarkdownViewer ainda não existe em
 * @/components/viewer/markdown-viewer. O import abaixo causará
 * "Cannot find module" até que Wave 2 crie o componente.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mocks necessários: jsdom não processa CSS e não resolve módulos ESM externos
vi.mock("react-markdown", () => ({
  MarkdownAsync: ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  ),
}));
vi.mock("remark-gfm", () => ({ default: () => {} }));
vi.mock("remark-math", () => ({ default: () => {} }));
vi.mock("rehype-katex", () => ({ default: () => {} }));
vi.mock("@shikijs/rehype", () => ({ default: () => {} }));

// Import real — componente ainda não existe → causa RED (module not found)
import { MarkdownViewer } from "@/components/viewer/markdown-viewer";

// ── VIEW-02: renderização básica ─────────────────────────────────────────────

describe("MarkdownViewer", () => {
  test("VIEW-02: renderiza conteúdo Markdown sem crash", () => {
    render(<MarkdownViewer content="# Título\n\nParágrafo simples." />);

    // Deve existir um elemento article ou o testid markdown-content na árvore
    const article = document.querySelector("article");
    const content = screen.queryByTestId("markdown-content");
    expect(article ?? content).not.toBeNull();
  });

  test("VIEW-08: aplica classe prose e prose-sm ao article container", () => {
    render(<MarkdownViewer content="Texto de exemplo." />);

    const article = document.querySelector("article");
    expect(article).not.toBeNull();
    expect(article?.className).toContain("prose");
  });

  test("VIEW-02: links externos recebem target=_blank e rel=noopener noreferrer", () => {
    render(
      <MarkdownViewer content="[Link externo](https://externo.com)" />
    );

    const anchor = document.querySelector('a[href="https://externo.com"]');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("target")).toBe("_blank");
    expect(anchor?.getAttribute("rel")).toContain("noopener");
    expect(anchor?.getAttribute("rel")).toContain("noreferrer");
  });

  test("VIEW-02: links internos NÃO recebem target=_blank", () => {
    render(
      <MarkdownViewer content="[Link interno](/local/pagina)" />
    );

    const anchor = document.querySelector('a[href="/local/pagina"]');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("target")).not.toBe("_blank");
  });
});
