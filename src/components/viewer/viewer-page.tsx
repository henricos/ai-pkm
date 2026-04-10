/**
 * ViewerPage — Server Component orquestrador do viewer (Phase 3 + Phase 4)
 *
 * Phase 3: MarkdownViewer para itens .md
 * Phase 4: Branch por itemKind antes de qualquer leitura de conteúdo (T-04-06):
 *   - image   → ImageViewer (VIEW-04)
 *   - pdf     → PdfViewer com URLs de preview/download separadas (VIEW-05)
 *   - binary  → UnsupportedViewer + sidecar no InfoPanel (VIEW-07, CTX-05)
 *   - excalidraw → UnsupportedViewer (D-13: fora do critical path)
 *   - markdown → MarkdownViewer (regressão Phase 3 protegida)
 *
 * Segurança (T-04-06): itemKind determina o branch ANTES de chamar getItemContent(),
 * prevenindo leitura UTF-8 acidental de arquivos binários.
 */

import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import { MarkdownViewer } from "@/components/viewer/markdown-viewer";
import { ImageViewer } from "@/components/viewer/image-viewer";
import { PdfViewer } from "@/components/viewer/pdf-viewer";
import { UnsupportedViewer } from "@/components/viewer/unsupported-viewer";
import { ViewerClientShell } from "@/components/viewer/viewer-client-shell";
import type { RawFrontmatter } from "@/lib/pkm/types";
import type { NavigationItemKind } from "@/lib/navigation/navigation-types";

interface ViewerPageProps {
  item: {
    id: string;
    label: string;
    scope: string;
    estado: "rascunho" | "finalizado";
    itemKind: NavigationItemKind;
  };
}

export async function ViewerPage({ item }: ViewerPageProps) {
  const repo = new FsItemRepository();

  // Derivar topic e group do item.id
  const decoded = decodeURIComponent(item.id);
  const segments = decoded.split("/");
  const topic = segments[0] ?? (item.scope === "inbox" ? "__inbox" : "");
  const groupSegment = segments.length > 2
    ? segments.find((s, i) => i > 0 && i < segments.length - 1 && s.startsWith("_"))
    : undefined;
  const group = groupSegment?.replace(/^_/, "") ?? undefined;

  // ── Branch por itemKind (T-04-06: ANTES de qualquer getItemContent) ─────────

  // Markdown — único branch que usa getItemContent() e frontmatter próprio
  if (item.itemKind === "markdown") {
    const content = repo.getItemContent(item.id) ?? "";
    const rawFrontmatter = repo.getItemFrontmatter(item.id);
    const frontmatter: RawFrontmatter = rawFrontmatter ?? { estado: item.estado };
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

  // Buscar contexto binário (sidecar) para todos os itens não-markdown (CTX-05)
  // Binários não têm frontmatter próprio — usar o sidecar como fonte de metadados
  const binaryContext = repo.getBinaryContext(item.id);
  const sidecarContent = binaryContext?.sidecarContent ?? null;
  // Sidecar tem estado/data_captura reais; fallback para dado da navegação
  const frontmatter: RawFrontmatter = binaryContext?.sidecarFrontmatter ?? { estado: item.estado };

  // Derivar URLs de preview inline e download attachment (VIEW-05, D-04, D-06b)
  const encodedId = item.id;
  const previewHref = `/api/pkm/preview/${encodedId}`;
  const downloadHref = `/api/pkm/raw/${encodedId}`;

  // Imagem — ImageViewer com controles mínimos de zoom (VIEW-04)
  if (item.itemKind === "image") {
    return (
      <ViewerClientShell
        topic={topic}
        group={group}
        estado={item.estado}
        itemId={item.id}
        frontmatter={frontmatter}
        sidecarContent={sidecarContent}
      >
        <ImageViewer src={previewHref} alt={item.label} />
      </ViewerClientShell>
    );
  }

  // PDF — PdfViewer com preview inline separado do download (VIEW-05)
  if (item.itemKind === "pdf") {
    return (
      <ViewerClientShell
        topic={topic}
        group={group}
        estado={item.estado}
        itemId={item.id}
        frontmatter={frontmatter}
        sidecarContent={sidecarContent}
      >
        <PdfViewer previewUrl={previewHref} downloadUrl={downloadHref} />
      </ViewerClientShell>
    );
  }

  // Binary e excalidraw — UnsupportedViewer + sidecar no InfoPanel se houver (VIEW-07, D-13)
  return (
    <ViewerClientShell
      topic={topic}
      group={group}
      estado={item.estado}
      itemId={item.id}
      frontmatter={frontmatter}
      sidecarContent={sidecarContent}
    >
      <UnsupportedViewer itemKind={item.itemKind} />
    </ViewerClientShell>
  );
}
