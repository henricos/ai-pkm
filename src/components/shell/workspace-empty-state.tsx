"use client";

/**
 * WorkspaceEmptyState — estado editorial da rota / quando nenhum item está selecionado.
 *
 * Composição alinhada ao DESIGN.md:
 * - Display em "Technical Journal" com assimetria intencional
 * - Nenhuma listagem técnica de tópicos
 * - Espaço generoso, sem bordas explícitas (No-Line Rule)
 */
export function WorkspaceEmptyState() {
  return (
    <div className="flex flex-col items-start justify-center h-full px-16 py-24">
      <p
        className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 mb-6"
        style={{ letterSpacing: "0.05em" }}
      >
        Biblioteca
      </p>
      <h1
        className="text-[3.5rem] font-semibold tracking-[-0.02em] text-on-surface leading-none mb-8"
        style={{ maxWidth: "20ch" }}
      >
        Selecione um item para começar.
      </h1>
      <p className="text-[0.875rem] text-on-surface/50 max-w-prose leading-relaxed">
        Escolha um item na árvore à esquerda para visualizá-lo aqui.
        A inbox fica no topo do painel — itens não classificados esperam por você lá.
      </p>
    </div>
  );
}
