"use client";

/**
 * LeftRail — conteúdo do painel esquerdo recolhível.
 *
 * Estrutura (D-01, D-07, FIL-01, FIL-03):
 * 1. Filtro estrutural (TreeFilterInput) — no topo
 * 2. InboxLane — separada da árvore, nunca filtrada
 * 3. Divisor tonal (sem linha — No-Line Rule)
 * 4. NavigationTree — árvore filtrada em tempo real
 *
 * Filtro aplica filterNavigationTree somente à árvore (tree).
 * A inbox permanece intacta (T-02-12, D-13, D-19).
 *
 * Segurança (T-02-09):
 * - O valor bruto do filtro vai diretamente para filterNavigationTree
 * - A normalização e o escape de `*` acontecem dentro do pipeline
 */

import React, { useState, useMemo } from "react";
import type { NavigationSnapshot } from "@/lib/navigation/navigation-types";
import { filterNavigationTree } from "@/lib/navigation/filter-tree";
import { TreeFilterInput } from "@/components/shell/tree-filter-input";
import { InboxLane } from "@/components/shell/inbox-lane";
import { NavigationTree } from "@/components/navigation/navigation-tree";

interface LeftRailProps {
  snapshot: NavigationSnapshot;
  /** href do item ativo derivado da URL atual (T-02-10) */
  activeHref?: string;
  onNavigationStart?: () => void;
}

export function LeftRail({ snapshot, activeHref, onNavigationStart }: LeftRailProps) {
  const [filterQuery, setFilterQuery] = useState("");

  // Árvore filtrada — calculada apenas quando o query muda (useMemo)
  // A inbox NUNCA entra neste pipeline (D-13, D-19, T-02-12)
  const filteredTree = useMemo(
    () => filterNavigationTree(snapshot.tree, filterQuery),
    [snapshot.tree, filterQuery],
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 1. Filtro estrutural (FIL-01, FIL-03) */}
      <div className="px-3 pt-2 pb-1 shrink-0">
        <TreeFilterInput
          value={filterQuery}
          onChange={setFilterQuery}
        />
      </div>

      {/* Área com scroll — scrollbar fina e discreta */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-4 pr-1 rail-scroll">
        {/* 2. Inbox — separada e nunca filtrada; cabeçalho sempre visível */}
        <InboxLane
          entries={snapshot.inbox}
          activeHref={activeHref}
          onNavigationStart={onNavigationStart}
        />

        {/* 3. Divisor tonal (sem borda explícita — No-Line Rule) */}
        <div
          className="mx-3 my-1.5 h-px bg-surface-container"
          aria-hidden="true"
        />

        {/* 4. Cabeçalho da biblioteca */}
        <div className="px-3 pt-2 pb-1">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 block">
            Biblioteca
          </span>
        </div>

        {/* 5. Árvore filtrada (filteredTree) */}
        <NavigationTree
          tree={filteredTree}
          activeHref={activeHref}
          ancestorsByItemId={snapshot.ancestorsByItemId}
          filterQuery={filterQuery}
          onNavigationStart={onNavigationStart}
        />
      </div>
    </div>
  );
}
