"use client";

/**
 * NavigationTree — renderer recursivo da árvore estrutural de navegação.
 *
 * Comportamento:
 * - Inicia mostrando apenas tópicos raiz (D-07) — expandidos por autoexpansão
 * - Autoexpande ancestrais quando item ativo é detectado por URL (D-08)
 * - Aceita árvore filtrada (FilteredTreeNode) ou original (NavigationTreeNode)
 * - Não afeta a inbox — recebe apenas `tree` do snapshot (T-02-12)
 *
 * Segurança (T-02-10):
 * - O item ativo é derivado exclusivamente da URL atual (activeHref passado pelo pai)
 * - Nenhum estado solto de "seleção" é mantido aqui
 *
 * Props:
 * - tree: array de nós raiz (pode ser filtrado)
 * - activeHref: href canônico do item ativo na URL
 * - ancestorsByItemId: mapa do snapshot para autoexpansão de ancestrais (D-08)
 */

import React, { useState, useEffect, useCallback } from "react";
import type { NavigationTreeNode } from "@/lib/navigation/navigation-types";
import type { FilteredTreeNode } from "@/lib/navigation/filter-tree";
import { TreeNode } from "@/components/navigation/tree-node";

type AnyTreeNode = NavigationTreeNode | FilteredTreeNode;

interface NavigationTreeProps {
  /** Árvore a renderizar (original ou filtrada) */
  tree: AnyTreeNode[];
  /** href canônico do item ativo derivado da URL atual */
  activeHref?: string;
  /** Mapa de item.id → IDs de agrupadores ancestrais para autoexpansão (D-08) */
  ancestorsByItemId: Record<string, string[]>;
}

/**
 * Calcula o conjunto inicial de IDs expandidos com base na URL atual.
 * Percorre ancestorsByItemId para encontrar os ancestrais do item ativo.
 */
function computeInitialExpanded(
  activeHref: string | undefined,
  tree: AnyTreeNode[],
  ancestorsByItemId: Record<string, string[]>,
): Set<string> {
  if (!activeHref) return new Set();

  // Encontrar o item ativo na árvore pelo href
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

export function NavigationTree({
  tree,
  activeHref,
  ancestorsByItemId,
}: NavigationTreeProps) {
  // Estado de expansão — inicia com ancestrais do item ativo expandidos (D-08)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    computeInitialExpanded(activeHref, tree, ancestorsByItemId),
  );

  // Recomputar expandidos quando a URL muda (navegação direta por URL)
  useEffect(() => {
    const newExpanded = computeInitialExpanded(activeHref, tree, ancestorsByItemId);
    if (newExpanded.size > 0) {
      setExpandedIds((prev) => {
        // Adicionar novos ancestrais sem colapsar o que o usuário já expandiu
        const merged = new Set(prev);
        for (const id of newExpanded) {
          merged.add(id);
        }
        return merged;
      });
    }
  }, [activeHref, tree, ancestorsByItemId]);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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
          />
        ))}
      </ul>
    </nav>
  );
}
