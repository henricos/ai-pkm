/**
 * ViewerHeader — Client Component (Phase 3, CTX-01 revisado, CTX-02; Phase 5, 05-04)
 *
 * Header sticky do viewer:
 * - Esquerda: tópico › grupo (label-sm uppercase) + chip de estado
 * - Direita: [seletor de tema] + [apresentação desabilitado] + [download] + [ℹ️ painel]
 *
 * Glassmorphism ao rolar (D-10): ouve scroll no elemento #viewer-scroll
 * (id fixo do container de scroll definido em ViewerPage — 03-05-PLAN.md)
 *
 * Decisões (03-CONTEXT.md):
 * - D-10: sticky + glassmorphism ao rolar
 * - D-11: tópico › grupo, não filename
 * - D-12: download raw, apresentação (disabled), toggle ℹ️
 * - D-13: slot de tema — implementado na Phase 5 (05-04)
 *
 * Phase 5 (05-04):
 * - Seletor de preset de tema via dropdown simples (ciclo entre presets)
 * - Props activeTheme e onThemeChange opcionais para compatibilidade retroativa
 */

"use client";

import { useState, useEffect } from "react";
import {
  VIEWER_THEMES,
  VIEWER_THEME_LABELS,
  type ViewerTheme,
} from "@/components/viewer/viewer-theme";

interface ViewerHeaderProps {
  topic: string;
  group?: string;
  estado: "rascunho" | "finalizado";
  itemId: string;
  panelOpen: boolean;
  onTogglePanel: () => void;
  /** Preset de tema ativo — Phase 5 */
  activeTheme?: ViewerTheme;
  /** Callback para troca de tema — Phase 5 */
  onThemeChange?: (theme: ViewerTheme) => void;
}

export function ViewerHeader({
  topic,
  group,
  estado,
  itemId,
  panelOpen,
  onTogglePanel,
  activeTheme = "default",
  onThemeChange,
}: ViewerHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById("viewer-scroll");
    if (!el) return;
    const handler = () => setIsScrolled(el.scrollTop > 8);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // D-11: __inbox exibe "INBOX"; demais tópicos são formatados com inicial maiúscula
  const topicLabel = topic === "__inbox"
    ? "INBOX"
    : topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const groupLabel = group
    ? group.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : undefined;

  // Cicla para o próximo preset na ordem da lista
  function cycleTheme() {
    if (!onThemeChange) return;
    const idx = VIEWER_THEMES.indexOf(activeTheme);
    const next = VIEWER_THEMES[(idx + 1) % VIEWER_THEMES.length];
    onThemeChange(next);
  }

  return (
    <header
      className={[
        "sticky top-0 z-10 flex items-center justify-between h-11 px-8 transition-all duration-150",
        isScrolled ? "glass shadow-ambient" : "bg-surface-container-lowest",
      ].join(" ")}
      data-testid="viewer-header"
    >
      {/* Esquerda: contexto estrutural */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 truncate">
          {topicLabel}
        </span>
        {groupLabel && (
          <>
            <span className="text-on-surface/25 text-[0.6875rem]" aria-hidden="true">›</span>
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 truncate">
              {groupLabel}
            </span>
          </>
        )}
        {/* Chip de estado — consistente com Phase 2 (workspace-item-state.tsx) */}
        <span
          className={[
            "ml-2 inline-flex items-center px-2 py-0.5 rounded-sm text-[0.6875rem] font-semibold uppercase tracking-[0.05em]",
            estado === "finalizado"
              ? "bg-primary-container text-on-primary-container"
              : "bg-surface-container text-on-surface/50",
          ].join(" ")}
          aria-label={`Estado: ${estado}`}
        >
          {estado}
        </span>
      </div>

      {/* Direita: ações */}
      <div className="flex items-center gap-1 shrink-0">
        {/* D-13: Seletor de tema — Phase 5 (05-04) */}
        <button
          type="button"
          onClick={cycleTheme}
          aria-label={`Tema: ${VIEWER_THEME_LABELS[activeTheme]}`}
          title={`Tema atual: ${VIEWER_THEME_LABELS[activeTheme]} — clique para alternar`}
          data-theme={activeTheme}
          data-testid="theme-toggle-button"
          className="flex items-center justify-center w-8 h-8 rounded-sm text-on-surface/50 hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M11.54 4.46l-1.41 1.41M4.95 11.54l-1.41 1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* D-12: Botão de apresentação — desabilitado (Phase 5 implementa) */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label="Modo apresentação (disponível na Phase 5)"
          title="Modo apresentação — disponível em breve"
          className="flex items-center justify-center w-8 h-8 rounded-sm text-on-surface/25 cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 14H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 12V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* D-12: Download do arquivo raw — autenticado via /api/pkm/raw/ */}
        <a
          href={`/api/pkm/raw/${encodeURIComponent(itemId)}`}
          download
          aria-label="Baixar arquivo raw"
          title="Baixar arquivo raw"
          className="flex items-center justify-center w-8 h-8 rounded-sm text-on-surface/50 hover:text-on-surface hover:bg-surface-container transition-colors"
          data-testid="download-link"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>

        {/* D-12: Toggle do painel de informações */}
        <button
          type="button"
          onClick={onTogglePanel}
          aria-pressed={panelOpen}
          aria-label={panelOpen ? "Fechar painel de informações" : "Abrir painel de informações"}
          title="Painel de informações"
          className={[
            "flex items-center justify-center w-8 h-8 rounded-sm transition-colors",
            panelOpen
              ? "bg-primary-container text-on-primary-container"
              : "text-on-surface/50 hover:text-on-surface hover:bg-surface-container",
          ].join(" ")}
          data-testid="toggle-panel-button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="5" r="0.75" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>
  );
}
