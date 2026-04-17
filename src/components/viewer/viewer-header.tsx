/**
 * ViewerHeader — Client Component (Phase 3 + Phase 5)
 *
 * Header sticky do viewer:
 * - Esquerda: tópico › grupo (label-sm uppercase) + chip de estado
 * - Direita: [seletor de tema Phase 5] + [laser Phase 5] + [apresentação Phase 5] + [download] + [ℹ️ painel]
 *
 * Glassmorphism ao rolar (D-10): ouve scroll no elemento #viewer-scroll
 * (id fixo do container de scroll definido em ViewerClientShell)
 *
 * Decisões (03-CONTEXT.md + 05-CONTEXT.md):
 * - D-10: sticky + glassmorphism ao rolar
 * - D-11: tópico › grupo, não filename
 * - D-12: download raw, apresentação (real Phase 5), toggle ℹ️
 * - D-13: slot de tema vira controle real de preset (Phase 5)
 * - D-19: troca de tema acontece fora do modo apresentação
 * - D-02: InfoPanel bloqueado no modo apresentação (toggle desabilitado)
 * - PRS-01: botão de apresentação habilita onEnterPresentation callback
 */

"use client";

import { useState, useEffect } from "react";
import {
  VIEWER_THEMES,
  VIEWER_THEME_LABELS,
  type ViewerTheme,
} from "@/components/viewer/viewer-theme";

/** @deprecated Use ViewerTheme from viewer-theme */
export type ViewerThemePreset = ViewerTheme;

interface ViewerHeaderProps {
  topic: string;
  group?: string;
  estado: "rascunho" | "finalizado";
  itemId: string;
  /** URL de download calculada com withBasePath() em viewer-page.tsx (D-06, D-07) */
  downloadHref: string;
  panelOpen: boolean;
  onTogglePanel: () => void;
  /** PRS-01: callback para entrar no modo apresentação */
  onEnterPresentation?: () => void;
  /** PRS-06: preset de tema ativo (Phase 5) */
  activeTheme?: ViewerTheme;
  /** PRS-06: callback para trocar preset de tema (Phase 5) */
  onChangeTheme?: (theme: ViewerTheme) => void;
  /** PRS-07: modo apresentação ativo — bloqueia InfoPanel e oculta seletor de tema */
  presentationActive?: boolean;
  /** PRS-05: laser ativo fora do modo apresentação */
  laserEnabled?: boolean;
  /** PRS-05: callback para ligar/desligar o laser */
  onToggleLaser?: () => void;
}

export function ViewerHeader({
  topic,
  group,
  estado,
  itemId,
  downloadHref,
  panelOpen,
  onTogglePanel,
  onEnterPresentation,
  activeTheme = "default",
  onChangeTheme,
  presentationActive = false,
  laserEnabled = false,
  onToggleLaser,
}: ViewerHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

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
        {/* D-13 / PRS-06: Seletor de tema — visível somente fora do modo apresentação */}
        {!presentationActive && (
          <div className="relative" data-testid="theme-selector">
            <button
              type="button"
              onClick={() => setThemeMenuOpen((v) => !v)}
              aria-label={`Tema: ${VIEWER_THEME_LABELS[activeTheme]}`}
              title="Trocar tema de leitura"
              className="flex items-center justify-center w-8 h-8 rounded-sm text-on-surface/50 hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              {/* Ícone de paleta */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="5.5" cy="8" r="1" fill="currentColor" />
                <circle cx="8" cy="5.5" r="1" fill="currentColor" />
                <circle cx="10.5" cy="8" r="1" fill="currentColor" />
              </svg>
            </button>
            {themeMenuOpen && onChangeTheme && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-surface-container-lowest shadow-ambient rounded-sm border border-outline-variant/15 py-1 min-w-[120px]">
                {VIEWER_THEMES.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => {
                      onChangeTheme(theme);
                      setThemeMenuOpen(false);
                    }}
                    className={[
                      "w-full text-left px-3 py-1.5 text-[0.75rem] transition-colors",
                      theme === activeTheme
                        ? "text-on-surface font-semibold"
                        : "text-on-surface/60 hover:text-on-surface hover:bg-surface-container",
                    ].join(" ")}
                  >
                    {VIEWER_THEME_LABELS[theme]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRS-05: Toggle do laser — acessível fora do modo apresentação */}
        {!presentationActive && onToggleLaser && (
          <button
            type="button"
            onClick={onToggleLaser}
            aria-pressed={laserEnabled}
            aria-label={laserEnabled ? "Desligar ponteiro laser" : "Ligar ponteiro laser"}
            title={laserEnabled ? "Desligar laser" : "Ligar laser"}
            data-testid="toggle-laser-button"
            className={[
              "flex items-center justify-center w-8 h-8 rounded-sm transition-colors",
              laserEnabled
                ? "bg-tertiary/20 text-tertiary"
                : "text-on-surface/50 hover:text-on-surface hover:bg-surface-container",
            ].join(" ")}
          >
            {/* Ícone de caneta — distinto do ícone de anotação futuro */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M11 2L14 5L5 14H2V11L11 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 4L12 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {/* PRS-01: Botão de apresentação — real (Phase 5) */}
        <button
          type="button"
          onClick={onEnterPresentation}
          aria-label="Entrar em modo apresentação"
          title="Modo apresentação"
          data-testid="presentation-button"
          className="flex items-center justify-center w-8 h-8 rounded-sm text-on-surface/50 hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 14H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 12V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* D-12: Download do arquivo raw — autenticado via /api/pkm/raw/ */}
        <a
          href={downloadHref}
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

        {/* D-12 / PRS-07: Toggle do painel de informações — desabilitado no modo apresentação */}
        <button
          type="button"
          onClick={presentationActive ? undefined : onTogglePanel}
          disabled={presentationActive}
          aria-pressed={panelOpen}
          aria-disabled={presentationActive}
          aria-label={panelOpen ? "Fechar painel de informações" : "Abrir painel de informações"}
          title="Painel de informações"
          className={[
            "flex items-center justify-center w-8 h-8 rounded-sm transition-colors",
            presentationActive
              ? "text-on-surface/20 cursor-not-allowed"
              : panelOpen
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
