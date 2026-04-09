/**
 * ViewerPage — Server Component orquestrador do viewer (Phase 3)
 *
 * Responsabilidades:
 * - Buscar conteúdo Markdown via getItemContent()
 * - Buscar frontmatter via getItemFrontmatter()
 * - Renderizar layout: ViewerHeader + MarkdownViewer + InfoPanel (push)
 *
 * Segurança (T-3-03): NavigationItemRef não contém item.path absoluto.
 * O item.id (path relativo) é passado para getItemContent — validado server-side
 * via resolveAndValidatePath() no FsItemRepository.
 *
 * O id="viewer-scroll" é colocado no div de scroll do conteúdo (ViewerClientShell).
 * ViewerHeader escuta esse id para detectar scroll e ativar glassmorphism.
 */

import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import { MarkdownViewer } from "@/components/viewer/markdown-viewer";
import { ViewerClientShell } from "@/components/viewer/viewer-client-shell";
import type { RawFrontmatter } from "@/lib/pkm/types";

interface ViewerPageProps {
  item: {
    id: string;
    label: string;
    scope: string;
    estado: "rascunho" | "finalizado";
  };
}

export async function ViewerPage({ item }: ViewerPageProps) {
  const repo = new FsItemRepository();
  const content = repo.getItemContent(item.id) ?? "";
  const rawFrontmatter = repo.getItemFrontmatter(item.id);

  // Fallback para frontmatter mínimo quando não disponível
  const frontmatter: RawFrontmatter = rawFrontmatter ?? { estado: item.estado };

  // Derivar topic e group do item.id (path relativo: "topico/grupo/arquivo.md")
  // Para inbox: path começa com "__inbox/..."
  const decoded = decodeURIComponent(item.id);
  const segments = decoded.split("/");
  const topic = segments[0] ?? (item.scope === "inbox" ? "__inbox" : "");

  // Group é o segundo segmento que começa com "_" (convenção PKM de subgrupo)
  const groupSegment = segments.length > 2
    ? segments.find((s, i) => i > 0 && i < segments.length - 1 && s.startsWith("_"))
    : undefined;
  const group = groupSegment?.replace(/^_/, "") ?? undefined;

  return (
    <ViewerClientShell
      topic={topic}
      group={group}
      estado={item.estado}
      itemId={item.id}
      frontmatter={frontmatter}
    >
      <MarkdownViewer content={content} />
    </ViewerClientShell>
  );
}
