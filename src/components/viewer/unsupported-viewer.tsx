/**
 * UnsupportedViewer — Component (Phase 4, VIEW-07, D-10, D-11, D-13)
 *
 * Fallback editorial para formatos sem preview nativo.
 * Centraliza a cópia revisada — mais legível que o placeholder genérico da Phase 3.
 * Extrai o fallback inline do ViewerPage para um componente reutilizável.
 *
 * D-10: cópia mais legível que "formato não suportado"
 * D-11: shell não quebra — viewer continua renderizando corretamente
 * D-13: excalidraw permanece no fallback — sem preview read-only nesta fase
 */

interface UnsupportedViewerProps {
  /** itemKind que não tem viewer dedicado: "binary" | "excalidraw" */
  itemKind: string;
}

export function UnsupportedViewer({ itemKind }: UnsupportedViewerProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-64 gap-3 text-on-surface/50 px-6 viewer-unsupported-container"
      data-testid="unsupported-format"
      data-item-kind={itemKind}
    >
      <span className="text-3xl" aria-hidden="true">📄</span>
      <p className="text-sm text-on-surface/60">
        Visualização não disponível para este formato
      </p>
      <p className="text-xs text-on-surface/40 text-center max-w-xs">
        Use o botão de download para acessar o arquivo
      </p>
    </div>
  );
}
