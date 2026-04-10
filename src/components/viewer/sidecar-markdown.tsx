/**
 * SidecarMarkdown — Client Component (Phase 4, CTX-05, D-08, D-09)
 *
 * Renderiza o corpo do sidecar como texto editorial complementar no InfoPanel.
 * Usa react-markdown (sync) com remark-gfm.
 * Sem rehype-raw (T-04-07: segurança — sem HTML cru).
 * Escala tipográfica menor que o viewer principal (D-09: hierarquia editorial).
 */

"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SidecarMarkdownProps {
  content: string;
}

export function SidecarMarkdown({ content }: SidecarMarkdownProps) {
  return (
    <div
      className="prose prose-xs max-w-none text-on-surface/70 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_p]:text-xs [&_li]:text-xs"
      data-testid="sidecar-markdown-content"
    >
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
}
