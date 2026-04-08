"use client";

import React, { useState, useCallback } from "react";
import type { NavigationSnapshot } from "@/lib/navigation/navigation-types";

interface AppShellProps {
  snapshot: NavigationSnapshot;
  children: React.ReactNode;
}

/**
 * AppShell — chrome estrutural da shell persistente (Phase 2).
 *
 * Estrutura:
 * - Rail esquerdo recolhível com topo reservado para filtro estrutural / busca futura / settings
 * - Área principal (workspace) única que não remonta ao navegar entre rotas
 *
 * Design alinhado ao DESIGN.md:
 * - No-Line Rule: separação por tonalidade de fundo, sem bordas 1px
 * - Glassmorphism no rail conforme §4
 * - Surface hierarchy: rail em surface-container-low, workspace em surface-container-lowest
 * - 8px grid (padding múltiplos de 8)
 *
 * Segurança: componente client puro — nenhum dado sensível chega aqui.
 * Snapshot já foi sanitizado server-side pelo NavigationService.
 */
export function AppShell({ snapshot, children }: AppShellProps) {
  const [railOpen, setRailOpen] = useState(true);

  const toggleRail = useCallback(() => {
    setRailOpen((prev) => !prev);
  }, []);

  const inboxCount = snapshot.inbox.length;

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
        {/* Topo do rail: toggle + espaço reservado para filtro/busca/settings (D-25, FIL-01, FIL-03) */}
        <div className="flex items-center h-12 px-3 shrink-0">
          <button
            onClick={toggleRail}
            aria-label={railOpen ? "Recolher painel" : "Expandir painel"}
            aria-expanded={railOpen}
            aria-controls="rail-content"
            className="flex items-center justify-center w-6 h-6 rounded-sm text-on-surface/50 hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            {/* Ícone hamburger/fechar minimalista */}
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
              {/* Reserva visual para filtro estrutural (FIL-01) — implementado no próximo plano */}
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
          className={["flex-1 overflow-y-auto overflow-x-hidden min-h-0", railOpen ? "" : "hidden"].join(" ")}
          aria-hidden={!railOpen}
        >
          {/* Inbox — bloco próprio acima da árvore (D-01) */}
          {inboxCount > 0 && (
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40">
                  Inbox
                </span>
                <span className="text-[0.6875rem] font-semibold text-on-surface/40">
                  {inboxCount}
                </span>
              </div>
              {/* Lista compacta de itens da inbox (D-02, D-03) */}
              <ul className="space-y-0.5">
                {snapshot.inbox.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={entry.href}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-[0.875rem] text-on-surface/70 hover:text-on-surface hover:bg-surface-container transition-colors truncate"
                      title={entry.label}
                    >
                      <ItemKindIcon kind={entry.itemKind} />
                      <span className="truncate">{entry.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divisor tonal (sem linha explícita — No-Line Rule) */}
          {inboxCount > 0 && <div className="mx-3 my-2 h-px bg-surface-container" aria-hidden="true" />}

          {/* Árvore de navegação — placeholder da fase 2 (expandida no próximo plano) */}
          <div className="px-3 py-2">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 block mb-1">
              Biblioteca
            </span>
            {snapshot.tree.length === 0 ? (
              <p className="text-[0.875rem] text-on-surface/40 px-2 py-2">
                Nenhum tópico encontrado.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {snapshot.tree.map((topic) => (
                  <li key={topic.id}>
                    <span className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-[0.875rem] text-on-surface/70 truncate">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="truncate">{topic.label}</span>
                      <span className="ml-auto shrink-0 text-[0.6875rem] text-on-surface/30">{topic.count}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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

// ── Helper interno: ícone por tipo de item ──

interface ItemKindIconProps {
  kind: import("@/lib/navigation/navigation-types").NavigationItemKind;
}

function ItemKindIcon({ kind }: ItemKindIconProps) {
  switch (kind) {
    case "markdown":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 4h6M3 6h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "image":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="4" cy="4.5" r="1" fill="currentColor" />
          <path d="M1 8.5L4 6L6.5 8L8.5 6.5L11 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "excalidraw":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 9L5 4L8 7L10 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "pdf":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 1h5.5L10 3.5V11H2V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M7 1v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 1h5.5L10 3.5V11H2V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
  }
}
