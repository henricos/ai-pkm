"use client";

/**
 * InboxLane — lista compacta da inbox acima da árvore estrutural.
 *
 * Regras (D-01 a D-06):
 * - Aparece acima da árvore e usa componente separado
 * - Nunca passa pelo pipeline filterNavigationTree (T-02-12, D-13, D-19)
 * - Exibe ícone de tipo (D-11), label truncado e sinais mínimos de fila operacional
 * - Estado visual discreto: rascunho vs finalizado (D-10)
 *
 * Design (DESIGN.md):
 * - surface-container-low como fundo do rail
 * - label-sm (0.6875rem) para cabeçalho de seção
 * - body-md (0.875rem) para itens
 * - Sem bordas explícitas (No-Line Rule)
 */

import React from "react";
import Link from "next/link";
import type { InboxEntry } from "@/lib/navigation/navigation-types";
import { ItemKindIcon } from "@/components/navigation/item-kind-icon";

interface InboxLaneProps {
  /** Itens da inbox (já separados da biblioteca server-side) */
  entries: InboxEntry[];
  /** href do item ativo na URL atual */
  activeHref?: string;
  onNavigationStart?: () => void;
}

/**
 * Lista compacta da inbox.
 * Componente separado para garantir que a inbox nunca passe pelo filtro estrutural.
 */
export function InboxLane({ entries, activeHref, onNavigationStart }: InboxLaneProps) {
  return (
    <section aria-label="Inbox" className="px-3 py-2">
      {/* Cabeçalho sempre visível */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40"
          aria-hidden="true"
        >
          Inbox
        </span>
        {entries.length > 0 && (
          <span
            className="text-[0.6875rem] font-semibold tabular-nums text-on-surface/30"
            aria-label={`${entries.length} itens na inbox`}
          >
            {entries.length}
          </span>
        )}
      </div>

      {/* Lista compacta — só renderiza quando há itens */}
      {entries.length > 0 && (
      <ul className="space-y-0.5" role="list">
        {entries.map((entry) => {
          const isActive = activeHref === entry.href;
          return (
            <li key={entry.id}>
              <Link
                href={entry.href}
                prefetch
                onClick={() => {
                  if (!isActive) onNavigationStart?.();
                }}
                aria-current={isActive ? "page" : undefined}
                title={entry.label}
                className={[
                  "flex items-center gap-2 px-2 py-1 rounded-sm",
                  "text-[0.875rem] truncate transition-colors",
                  isActive
                    ? "bg-surface-container text-on-surface font-medium"
                    : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container/60",
                ].join(" ")}
              >
                {/* Ícone de tipo (D-11) */}
                <span
                  className={[
                    "shrink-0",
                    entry.estado === "rascunho"
                      ? "text-on-surface/40"
                      : "text-on-surface/60",
                  ].join(" ")}
                >
                  <ItemKindIcon kind={entry.itemKind} />
                </span>

                {/* Label do item */}
                <span className="truncate">{entry.label}</span>

                {/* Indicador de rascunho discreto (D-10) */}
                {entry.estado === "rascunho" && (
                  <span
                    className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-on-surface/20"
                    aria-label="rascunho"
                    title="rascunho"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      )}
    </section>
  );
}
