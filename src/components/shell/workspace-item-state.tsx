"use client";

import type { NavigationItemRef } from "@/lib/navigation/navigation-types";

interface WorkspaceItemStateProps {
  item: Pick<NavigationItemRef, "id" | "label" | "itemKind" | "estado" | "scope">;
}

/**
 * WorkspaceItemState — estado mínimo e honesto do item aberto (Phase 2).
 *
 * Mostra apenas: título, tipo visual e estado (rascunho/finalizado).
 * Nenhum conteúdo bruto, path absoluto ou sidecar é exposto (T-02-07).
 * A phase 3 assumirá o viewer rico sem reestruturar as rotas.
 *
 * Design alinhado ao DESIGN.md:
 * - Assimetria intencional: título alinhado à esquerda, metadata em coluna menor
 * - Espaço generoso sem bordas explícitas (No-Line Rule)
 * - Estado: cor discreta conforme D-10
 */
export function WorkspaceItemState({ item }: WorkspaceItemStateProps) {
  const kindLabel = kindLabelMap[item.itemKind] ?? item.itemKind;
  const scopeLabel = item.scope === "inbox" ? "Inbox" : "Biblioteca";

  return (
    <div className="flex flex-col items-start justify-start h-full px-16 py-24">
      {/* Namespace + tipo — label-sm uppercase */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40"
        >
          {scopeLabel}
        </span>
        <span className="text-on-surface/20" aria-hidden="true">·</span>
        <span
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40"
        >
          {kindLabel}
        </span>
      </div>

      {/* Título do item — headline-sm */}
      <h1
        className="text-[1.5rem] font-medium tracking-[-0.01em] text-on-surface leading-tight mb-6"
        style={{ maxWidth: "40ch" }}
      >
        {item.label}
      </h1>

      {/* Estado — chip discreto, cor diferencia rascunho de finalizado (D-10) */}
      <div className="flex items-center gap-2">
        <span
          className={[
            "inline-flex items-center px-2 py-0.5 rounded-sm text-[0.6875rem] font-semibold uppercase tracking-[0.05em]",
            item.estado === "finalizado"
              ? "bg-primary-container text-on-primary-container"
              : "bg-surface-container text-on-surface/50",
          ].join(" ")}
          aria-label={`Estado: ${item.estado}`}
        >
          {item.estado}
        </span>
      </div>

      {/* Mensagem sobre phase 3 — editorial, honesta */}
      <p className="mt-12 text-[0.875rem] text-on-surface/30 max-w-prose leading-relaxed">
        Visualização rica disponível na próxima fase.
      </p>
    </div>
  );
}

// Mapa de rótulos legíveis por tipo visual
const kindLabelMap: Record<string, string> = {
  markdown: "Markdown",
  image: "Imagem",
  excalidraw: "Diagrama",
  pdf: "PDF",
  binary: "Arquivo",
};
