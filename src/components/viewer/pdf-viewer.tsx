/**
 * PdfViewer — Component (Phase 4, VIEW-05, D-04, D-05, D-06, D-06b)
 *
 * Preview inline de PDF usando <object type="application/pdf">.
 * Aponta para /api/pkm/preview (inline) — separado de /api/pkm/raw (attachment).
 * Fallback interno com link de download quando o browser não suporta PDF embutido.
 *
 * D-04: preview inline via rota dedicada /api/pkm/preview
 * D-06: URL de download permanece em /api/pkm/raw
 * D-06b: separação semântica explicit inline vs attachment
 *
 * Não usa pdf.js nem abre nova aba — solução nativa do browser.
 */

interface PdfViewerProps {
  /** URL de preview inline — /api/pkm/preview/[...path] */
  previewUrl: string;
  /** URL de download (attachment) — /api/pkm/raw/[...path] */
  downloadUrl: string;
}

export function PdfViewer({ previewUrl, downloadUrl }: PdfViewerProps) {
  return (
    <div className="flex flex-col h-full min-h-[70vh] w-full">
      <object
        data={previewUrl}
        type="application/pdf"
        className="w-full flex-1 min-h-[70vh]"
        aria-label="Visualização de PDF"
      >
        {/* Fallback quando o browser não suporta PDF embutido (D-05, D-06b) */}
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-on-surface/60 p-8">
          <span className="text-4xl" aria-hidden="true">📄</span>
          <p className="text-sm text-center text-on-surface/70">
            Preview de PDF não disponível neste navegador.
          </p>
          <a
            href={downloadUrl}
            className="text-sm text-primary hover:underline"
            aria-label="Baixar PDF"
          >
            Baixar PDF
          </a>
        </div>
      </object>
    </div>
  );
}
