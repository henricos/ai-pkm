"use client";

/**
 * TreeNode — renderer de um nó da árvore estrutural de navegação.
 *
 * Comportamento (D-07, D-08, D-09, D-10, D-11, D-12):
 * - Agrupadores (topic/subtopic/group) apenas expandem/recolhem — não navegam (D-12)
 * - Itens terminais navegam pela href canônica (D-12)
 * - Ativo derivado da URL atual — não de estado solto (T-02-10, D-08)
 * - Contagens exibidas em agrupadores de forma discreta (D-09)
 * - Estado visual discreto: rascunho vs finalizado (D-10)
 * - Ícone de tipo por item (D-11)
 *
 * Acessibilidade:
 * - Agrupadores usam role="button" com aria-expanded
 * - Itens terminais são links (<a>) com aria-current="page" quando ativos
 * - Estrutura de lista aninhada (ul/li)
 */

import React from "react";
import type { NavigationTreeNode } from "@/lib/navigation/navigation-types";
import type { FilteredTreeNode, ItemWithOffsets } from "@/lib/navigation/filter-tree";
import { ItemKindIcon } from "@/components/navigation/item-kind-icon";
import { HighlightMatch } from "@/components/navigation/highlight-match";

// ── Tipos ──────────────────────────────────────────────────────────────────────

type AnyTreeNode = NavigationTreeNode | FilteredTreeNode;

interface TreeNodeProps {
  node: AnyTreeNode;
  /** href do item ativo derivado da URL atual (T-02-10) */
  activeHref?: string;
  /** IDs dos agrupadores expandidos */
  expandedIds: Set<string>;
  /** Callback para alternar expansão de um agrupador */
  onToggle: (id: string) => void;
  /** Nível de indentação (0 = raiz) */
  depth?: number;
}

// ── Componente ──────────────────────────────────────────────────────────────────

export function TreeNode({
  node,
  activeHref,
  expandedIds,
  onToggle,
  depth = 0,
}: TreeNodeProps) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const hasItems = node.items.length > 0;
  const hasContent = hasChildren || hasItems;

  // Indentação por nível (8px grid)
  const indentPx = depth * 12;

  return (
    <li>
      {/* Cabeçalho do agrupador */}
      <button
        type="button"
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`tree-node-${node.id}`}
        onClick={() => onToggle(node.id)}
        style={{ paddingLeft: `${8 + indentPx}px` }}
        className={[
          "w-full flex items-center gap-1.5 pr-2 py-1 rounded-sm",
          "text-[0.875rem] text-on-surface/70 hover:text-on-surface",
          "hover:bg-surface-container/60 transition-colors",
          "text-left group",
        ].join(" ")}
        title={node.label}
      >
        {/* Indicador de expansão */}
        <span
          className={[
            "shrink-0 text-on-surface/30 transition-transform duration-150",
            isExpanded ? "rotate-90" : "",
          ].join(" ")}
          aria-hidden="true"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M3 2L7 5L3 8"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {/* Label do agrupador */}
        <span className="truncate flex-1">{node.label}</span>

        {/* Contagem discreta (D-09) */}
        {node.count > 0 && (
          <span
            className="shrink-0 text-[0.6875rem] tabular-nums text-on-surface/25 group-hover:text-on-surface/40"
            aria-label={`${node.count} itens`}
          >
            {node.count}
          </span>
        )}
      </button>

      {/* Conteúdo expansível */}
      {hasContent && isExpanded && (
        <div id={`tree-node-${node.id}`} role="group">
          {/* Subnós (agrupadores filhos) */}
          {hasChildren && (
            <ul className="space-y-0" role="list">
              {node.children.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  activeHref={activeHref}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  depth={depth + 1}
                />
              ))}
            </ul>
          )}

          {/* Itens terminais */}
          {hasItems && (
            <ul className="space-y-0" role="list">
              {(node.items as ItemWithOffsets[]).map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      title={item.label}
                      style={{ paddingLeft: `${8 + indentPx + 16}px` }}
                      className={[
                        "flex items-center gap-2 pr-2 py-1 rounded-sm",
                        "text-[0.875rem] truncate transition-colors",
                        isActive
                          ? "bg-surface-container text-on-surface font-medium"
                          : "text-on-surface/65 hover:text-on-surface hover:bg-surface-container/50",
                      ].join(" ")}
                    >
                      {/* Ícone de tipo (D-11) */}
                      <span
                        className={[
                          "shrink-0",
                          item.estado === "rascunho"
                            ? "text-on-surface/35"
                            : "text-on-surface/55",
                        ].join(" ")}
                      >
                        <ItemKindIcon kind={item.itemKind} />
                      </span>

                      {/* Label com highlight opcional */}
                      <HighlightMatch
                        label={item.label}
                        offsets={item.matchOffsets}
                        className="truncate flex-1"
                      />

                      {/* Indicador de rascunho (D-10) */}
                      {item.estado === "rascunho" && !isActive && (
                        <span
                          className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-on-surface/15"
                          aria-label="rascunho"
                          title="rascunho"
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
