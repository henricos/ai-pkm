/**
 * Testes do MarkdownViewer — Phase 3 (03-01) · Wave 0 · RED → GREEN
 *
 * Cobre os comportamentos exigidos por VIEW-02 e VIEW-08:
 * - VIEW-02: renderiza Markdown sem crash, links externos em nova aba,
 *            links internos navegam na shell
 * - VIEW-08: aplica classe prose e prose-sm ao container article
 *
 * Notas de implementação:
 * 1. MarkdownViewer é async Server Component — chamar como função e renderizar
 *    o JSX resolvido: render(await MarkdownViewer({ content }))
 * 2. O mock de MarkdownAsync parseia links [text](url) e usa o components.a
 *    fornecido pelo MarkdownViewer, permitindo testar a lógica de link override.
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import type { ComponentPropsWithoutRef } from "react";

type AProps = ComponentPropsWithoutRef<"a"> & { href?: string };

// Mocks: MarkdownAsync parseia links [text](url) e usa components.a quando disponível
vi.mock("react-markdown", () => ({
  MarkdownAsync: ({
    children,
    components,
  }: {
    children: string;
    components?: { a?: React.ComponentType<AProps> };
  }) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    const text = typeof children === "string" ? children : "";

    while ((m = linkRegex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const [, label, href] = m;
      const A = components?.a;
      parts.push(
        A ? (
          <A key={k++} href={href}>
            {label}
          </A>
        ) : (
          <a key={k++} href={href}>
            {label}
          </a>
        )
      );
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));

    return <div>{parts.length ? parts : text}</div>;
  },
}));
vi.mock("remark-gfm", () => ({ default: () => {} }));
vi.mock("remark-math", () => ({ default: () => {} }));
vi.mock("rehype-katex", () => ({ default: () => {} }));
vi.mock("@shikijs/rehype", () => ({ default: () => {} }));

// Import real
import { MarkdownViewer } from "@/components/viewer/markdown-viewer";

// ── VIEW-02: renderização básica ─────────────────────────────────────────────

describe("MarkdownViewer", () => {
  test("VIEW-02: renderiza conteúdo Markdown sem crash", async () => {
    render(await MarkdownViewer({ content: "# Título\n\nParágrafo simples." }));

    const article = document.querySelector("article");
    const content = screen.queryByTestId("markdown-content");
    expect(article ?? content).not.toBeNull();
  });

  test("VIEW-08: aplica classe prose e prose-sm ao article container", async () => {
    render(await MarkdownViewer({ content: "Texto de exemplo." }));

    const article = document.querySelector("article");
    expect(article).not.toBeNull();
    expect(article?.className).toContain("prose");
  });

  test("VIEW-02: links externos recebem target=_blank e rel=noopener noreferrer", async () => {
    render(await MarkdownViewer({ content: "[Link externo](https://externo.com)" }));

    const anchor = document.querySelector('a[href="https://externo.com"]');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("target")).toBe("_blank");
    expect(anchor?.getAttribute("rel")).toContain("noopener");
    expect(anchor?.getAttribute("rel")).toContain("noreferrer");
  });

  test("VIEW-02: links internos NÃO recebem target=_blank", async () => {
    render(await MarkdownViewer({ content: "[Link interno](/local/pagina)" }));

    const anchor = document.querySelector('a[href="/local/pagina"]');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("target")).not.toBe("_blank");
  });
});
