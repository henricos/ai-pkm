"use client";

import React, { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { NavigationSnapshot } from "@/lib/navigation/navigation-types";
import { LeftRail } from "@/components/shell/left-rail";

interface AppShellProps {
  snapshot: NavigationSnapshot;
  children: React.ReactNode;
  /** href do item ativo — quando omitido, derivado automaticamente via usePathname() (T-02-10) */
  activeHref?: string;
}

/**
 * AppShell — chrome estrutural da shell persistente (Phase 2).
 *
 * Estrutura:
 * - Rail esquerdo recolhível com filtro estrutural, inbox e árvore (LeftRail)
 * - Área principal (workspace) única que não remonta ao navegar entre rotas
 *
 * Design alinhado ao DESIGN.md:
 * - No-Line Rule: separação por tonalidade de fundo, sem bordas 1px
 * - Glassmorphism no rail conforme §4
 * - Surface hierarchy: rail em surface-container-low, workspace em surface-container-lowest
 * - 8px grid (padding múltiplos de 8)
 *
 * Segurança:
 * - Componente client puro — nenhum dado sensível chega aqui
 * - Snapshot sanitizado server-side pelo NavigationService
 * - Item ativo derivado exclusivamente da URL (T-02-10)
 */
export function AppShell({ snapshot, children, activeHref: activeHrefProp }: AppShellProps) {
  const pathname = usePathname();
  const activeHref = activeHrefProp ?? pathname ?? undefined;
  const [railOpen, setRailOpen] = useState(true);

  const toggleRail = useCallback(() => {
    setRailOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* ── Rail esquerdo recolhível ── */}
      <aside
        aria-label="Painel de navegação"
        data-testid="navigation-rail"
        className={[
          "flex flex-col h-full transition-all duration-200 ease-in-out overflow-hidden",
          "bg-surface-container-low",
          railOpen ? "w-64" : "w-12",
        ].join(" ")}
      >
        {/* Topo do rail: toggle */}
        <div className="flex items-center h-12 px-3 shrink-0">
          <button
            onClick={toggleRail}
            aria-label={railOpen ? "Recolher painel" : "Expandir painel"}
            aria-expanded={railOpen}
            aria-controls="rail-content"
            className="flex items-center justify-center w-6 h-6 rounded-sm text-on-surface/50 hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              {railOpen ? (
                /* Ícone "recolher" — seta para esquerda */
                <path
                  d="M10 4L6 8L10 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                /* Ícone "expandir" — três linhas */
                <>
                  <line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>

          {railOpen && (
            <div className="flex-1 min-w-0 ml-3 flex items-center justify-between">
              <span
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 truncate"
                aria-hidden="true"
              >
                PKM
              </span>
              {/* Reserva para settings/status (D-25) */}
              <div className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Conteúdo do rail (oculto quando recolhido) */}
        <div
          id="rail-content"
          className={["flex-1 overflow-hidden min-h-0", railOpen ? "" : "hidden"].join(" ")}
          aria-hidden={!railOpen}
        >
          <LeftRail snapshot={snapshot} activeHref={activeHref} />
        </div>
      </aside>

      {/* ── Área principal (workspace) ── */}
      <main
        className="flex-1 min-w-0 h-full overflow-y-auto bg-surface-container-lowest"
        aria-label="Área de conteúdo"
      >
        {children}
      </main>
    </div>
  );
}
