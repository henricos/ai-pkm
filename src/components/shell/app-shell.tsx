"use client";

import React, { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { NavigationSnapshot } from "@/lib/navigation/navigation-types";
import { appBrand } from "@/lib/app-brand";
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
 * - Rail esquerdo recolhível e redimensionável com filtro, inbox e árvore
 * - Área principal (workspace) única que não remonta ao navegar entre rotas
 *
 * Design alinhado ao DESIGN.md:
 * - No-Line Rule: separação por tonalidade de fundo, sem bordas 1px
 * - Glassmorphism no rail conforme §4
 * - Surface hierarchy: rail em surface-container-low, workspace em surface-container-lowest
 * - 8px grid
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
  const [workspacePending, setWorkspacePending] = useState(false);

  const toggleRail = useCallback(() => {
    setRailOpen((prev) => !prev);
  }, []);

  const handleNavigationStart = useCallback(() => {
    setWorkspacePending(true);
  }, []);

  useEffect(() => {
    setWorkspacePending(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* ── Rail esquerdo recolhível ── */}
      <aside
        aria-label="Painel de navegação"
        data-testid="navigation-rail"
        className={[
          "flex flex-col h-full transition-all duration-200 ease-in-out overflow-hidden",
          "bg-surface-container-low",
          railOpen ? "w-72" : "w-12",
        ].join(" ")}
      >
        {/* Topo do rail: título */}
        <div className="flex items-center h-12 px-3 shrink-0">
          {railOpen && (
            <span
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 truncate"
              aria-hidden="true"
            >
              {appBrand.appName}
            </span>
          )}
        </div>

        {/* Conteúdo do rail — sempre participa do layout flex para o toggle ficar no rodapé */}
        <div
          id="rail-content"
          className="flex-1 overflow-hidden min-h-0"
          aria-hidden={!railOpen}
        >
          {railOpen && (
            <LeftRail
              snapshot={snapshot}
              activeHref={activeHref}
              onNavigationStart={handleNavigationStart}
            />
          )}
        </div>

        {/* Toggle << / >> posicionado na borda inferior */}
        <div className="shrink-0 flex items-center justify-end px-2 py-2">
          <button
            onClick={toggleRail}
            aria-label={railOpen ? "Recolher painel" : "Expandir painel"}
            aria-expanded={railOpen}
            aria-controls="rail-content"
            className="flex items-center justify-center w-7 h-7 rounded-sm text-on-surface/35 hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {railOpen ? (
                /* Recolher: << */
                <>
                  <path d="M9 4L5 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 4L9 8L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                /* Expandir: >> */
                <>
                  <path d="M4 4L8 8L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </button>
        </div>

      </aside>

      {/* ── Área principal (workspace) ── */}
      <main
        className="relative flex-1 min-w-0 h-full overflow-y-auto bg-surface-container-lowest"
        aria-label="Área de conteúdo"
      >
        {workspacePending && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-50">
            <div className="h-0.5 overflow-hidden bg-surface-container">
              <div className="workspace-loading-bar h-full w-1/3" />
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
