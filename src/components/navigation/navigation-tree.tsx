"use client";

/**
 * NavigationTree — renderer recursivo da árvore estrutural de navegação.
 *
 * Comportamento:
 * - Inicia mostrando apenas tópicos raiz (D-07) — expandidos por autoexpansão
 * - Autoexpande ancestrais quando item ativo é detectado por URL (D-08)
 * - Aceita árvore filtrada (FilteredTreeNode) ou original (NavigationTreeNode)
 * - Quando filterQuery está ativo, expande todos os nós do resultado
 * - Ao limpar o filtro, restaura o estado de expansão anterior
 * - Não afeta a inbox — recebe apenas `tree` do snapshot (T-02-12)
 *
 * Segurança (T-02-10):
 * - O item ativo é derivado exclusivamente da URL atual (activeHref passado pelo pai)
 * - Nenhum estado solto de "seleção" é mantido aqui
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { NavigationTreeNode } from "@/lib/navigation/navigation-types";
import type { FilteredTreeNode } from "@/lib/navigation/filter-tree";
import { TreeNode } from "@/components/navigation/tree-node";

type AnyTreeNode = NavigationTreeNode | FilteredTreeNode;

interface NavigationTreeProps {
  tree: AnyTreeNode[];
  activeHref?: string;
  ancestorsByItemId: Record<string, string[]>;
  /** Query de filtro ativo — quando não-vazio, todos os nós são expandidos */
  filterQuery?: string;
  onNavigationStart?: () => void;
}

function computeInitialExpanded(
  activeHref: string | undefined,
  tree: AnyTreeNode[],
  ancestorsByItemId: Record<string, string[]>,
): Set<string> {
  if (!activeHref) return new Set();

  function findItemId(nodes: AnyTreeNode[]): string | null {
    for (const node of nodes) {
      for (const item of node.items) {
        if (item.href === activeHref) return item.id;
      }
      const found = findItemId(node.children);
      if (found) return found;
    }
    return null;
  }

  const activeItemId = findItemId(tree);
  if (!activeItemId) return new Set();

  const ancestors = ancestorsByItemId[activeItemId] ?? [];
  return new Set(ancestors);
}

/** Coleta todos os IDs de nós agrupadores da árvore (para expandir tudo) */
function collectAllNodeIds(nodes: AnyTreeNode[]): Set<string> {
  const ids = new Set<string>();
  function walk(ns: AnyTreeNode[]) {
    for (const n of ns) {
      ids.add(n.id);
      walk(n.children);
    }
  }
  walk(nodes);
  return ids;
}

export function NavigationTree({
  tree,
  activeHref,
  ancestorsByItemId,
  filterQuery = "",
  onNavigationStart,
}: NavigationTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    computeInitialExpanded(activeHref, tree, ancestorsByItemId),
  );

  // Guarda o estado de expansão anterior ao filtro para restaurar ao limpar
  const savedExpandedIds = useRef<Set<string> | null>(null);
  const prevFilterQuery = useRef(filterQuery);

  // Reage à mudança do filterQuery
  useEffect(() => {
    const wasFiltering = prevFilterQuery.current !== "";
    const isFiltering = filterQuery !== "";
    prevFilterQuery.current = filterQuery;

    if (isFiltering && !wasFiltering) {
      // Filtro acabou de ser ativado: salva estado atual e expande tudo
      savedExpandedIds.current = expandedIds;
      setExpandedIds(collectAllNodeIds(tree));
    } else if (isFiltering && wasFiltering) {
      // Filtro mudou (refinamento): expande todos os nós do novo resultado
      setExpandedIds(collectAllNodeIds(tree));
    } else if (!isFiltering && wasFiltering) {
      // Filtro foi limpo: restaura estado salvo
      setExpandedIds(savedExpandedIds.current ?? computeInitialExpanded(activeHref, tree, ancestorsByItemId));
      savedExpandedIds.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterQuery, tree]);

  // Autoexpande ancestrais ao navegar por URL (sem filtro ativo)
  useEffect(() => {
    if (filterQuery) return;
    const newExpanded = computeInitialExpanded(activeHref, tree, ancestorsByItemId);
    if (newExpanded.size > 0) {
      setExpandedIds((prev) => {
        const merged = new Set(prev);
        for (const id of newExpanded) merged.add(id);
        return merged;
      });
    }
  }, [activeHref, tree, ancestorsByItemId, filterQuery]);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (tree.length === 0) {
    return (
      <p className="px-4 py-2 text-[0.875rem] text-on-surface/40">
        Nenhum resultado.
      </p>
    );
  }

  return (
    <nav aria-label="Árvore de navegação" data-testid="navigation-tree">
      <ul className="space-y-0" role="tree">
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            activeHref={activeHref}
            expandedIds={expandedIds}
            onToggle={handleToggle}
            depth={0}
            onNavigationStart={onNavigationStart}
          />
        ))}
      </ul>
    </nav>
  );
}
