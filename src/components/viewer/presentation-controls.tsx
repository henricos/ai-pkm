/**
 * PresentationControls — Cluster de controles do modo apresentação (Phase 5)
 *
 * Cluster visual discreto e semi-transparente visível no palco de apresentação.
 * Renderizado apenas quando controlsVisible=true (gerenciado pelo PresentationOverlay).
 *
 * Controles desta fase (D-10):
 * - Sair do modo apresentação (onExit)
 * - Ligar/desligar ponteiro laser (onToggleLaser / laserEnabled) — Phase 5
 *
 * Decisões:
 * - D-07: discreto, semi-transparente, auto-ocultável (ocultação gerenciada pelo overlay)
 * - D-09: interação normal e previsível quando visível
 * - D-10: controles mínimos: sair + laser; anotação futura reservada
 */

"use client";

interface PresentationControlsProps {
  onExit: () => void;
  laserEnabled?: boolean;
  onToggleLaser?: () => void;
}

export function PresentationControls({
  onExit,
  laserEnabled = false,
  onToggleLaser,
}: PresentationControlsProps) {
  return (
    <div
      data-testid="presentation-controls"
      className="flex items-center gap-1 px-2 py-1.5 rounded-sm glass shadow-ambient"
      role="toolbar"
      aria-label="Controles de apresentação"
    >
      {/* Ligar/desligar ponteiro laser (Phase 5 - PRS-05) */}
      <button
        type="button"
        onClick={onToggleLaser}
        aria-pressed={laserEnabled}
        aria-label={laserEnabled ? "Desligar ponteiro laser" : "Ligar ponteiro laser"}
        title={laserEnabled ? "Desligar laser" : "Ligar laser"}
        data-testid="toggle-laser-button"
        className={[
          "flex items-center justify-center w-7 h-7 rounded-sm transition-colors",
          laserEnabled
            ? "bg-tertiary/20 text-tertiary"
            : "text-on-surface/50 hover:text-on-surface hover:bg-surface-container/50",
        ].join(" ")}
      >
        {/* Ícone de caneta — ponteiro laser */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 3.5L10.5 6.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Divisor visual sutil */}
      <div className="w-px h-4 bg-on-surface/10" aria-hidden="true" />

      {/* Sair do modo apresentação */}
      <button
        type="button"
        onClick={onExit}
        aria-label="Sair do modo apresentação"
        title="Sair do modo apresentação (Esc)"
        data-testid="exit-presentation-button"
        className="flex items-center justify-center w-7 h-7 rounded-sm text-on-surface/50 hover:text-on-surface hover:bg-surface-container/50 transition-colors"
      >
        {/* Ícone de fechar/sair */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
