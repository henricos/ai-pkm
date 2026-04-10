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
 * - D-05: Callouts sem tratamento especial (blockquote padrão),
 *         mas preservando quebras de linha explícitas em sequências de ">"
 * - D-06: prose-sm base de estilo
 * - D-07: coluna editorial centralizada, largura fluida e limite amplo
 */

import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";

interface MarkdownViewerProps {
  content: string;
}

export function preserveBlockquoteLineBreaks(content: string) {
  return content.replace(/(^>.*(?:\n>.*)+)/gm, (block) =>
    block
      .split("\n")
      .map((line, index, lines) => {
        if (index === lines.length - 1) return line;
        if (line.trim() === ">") return line;
        if (/[ \t]{2,}$/.test(line) || /<br\s*\/?>\s*$/i.test(line)) return line;
        return `${line}  `;
      })
      .join("\n")
  );
}

export async function MarkdownViewer({ content }: MarkdownViewerProps) {
  const normalizedContent = preserveBlockquoteLineBreaks(content);

  return (
    <div className="mx-auto w-full max-w-[80rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <article
        className="prose prose-sm max-w-none bg-surface-container-lowest"
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
          {normalizedContent}
        </MarkdownAsync>
      </article>
    </div>
  );
}
