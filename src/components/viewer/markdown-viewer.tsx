/**
 * MarkdownViewer — Server Component assíncrono (Phase 3, VIEW-01, VIEW-02, VIEW-03, VIEW-08)
 *
 * Usa MarkdownAsync (não Markdown síncrono) porque @shikijs/rehype é plugin async.
 * O highlighting é produzido no servidor — zero JS de highlighting no bundle do cliente.
 *
 * Segurança (T-3-02): react-markdown sanitiza por padrão — defaultUrlTransform
 * rejeita URIs javascript:. NÃO substituir por rehype-raw.
 *
 * Decisões (03-CONTEXT.md):
 * - D-01: react-markdown + remark-gfm
 * - D-02: Shiki (github-light theme)
 * - D-03: KaTeX (remark-math + rehype-katex)
 * - D-04: Links externos → nova aba; internos → shell
 * - D-05: Callouts sem tratamento especial (blockquote padrão)
 * - D-06: prose-sm base de estilo
 * - D-07: max-w-prose alinhado à esquerda
 */

import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";

interface MarkdownViewerProps {
  content: string;
}

export async function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <article
      className="prose prose-sm max-w-prose px-8 py-10 bg-surface-container-lowest"
      data-testid="markdown-content"
    >
      <MarkdownAsync
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeShiki, { theme: "github-light" }],
        ]}
        components={{
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
            return (
              <a
                href={href}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </MarkdownAsync>
    </article>
  );
}
