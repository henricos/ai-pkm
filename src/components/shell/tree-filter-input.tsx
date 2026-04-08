"use client";

/**
 * TreeFilterInput — entrada de filtro estrutural para a árvore de navegação.
 *
 * Deixa explicitamente claro por rótulo, placeholder e iconografia que este
 * é um filtro estrutural da árvore, não uma busca textual avançada (FIL-03).
 *
 * Design (DESIGN.md §5 Input Fields):
 * - Ghost box com fundo surface-container-low
 * - Focus: transição para surface-container-lowest + barra inferior `tertiary` 2px
 * - Label screen-reader para acessibilidade
 * - Ícone de funil (filter) para distinguir de busca (lupa)
 *
 * Segurança (T-02-09):
 * - O valor é passado diretamente ao pipeline filterNavigationTree que
 *   trata a normalização e o escape de `*` — não há construção de regex aqui.
 */

import React, { useId } from "react";

interface TreeFilterInputProps {
  /** Valor atual do filtro */
  value: string;
  /** Callback chamado a cada tecla */
  onChange: (value: string) => void;
  /** Classe adicional para o container */
  className?: string;
}

/**
 * Campo de filtro estrutural da árvore.
 * Reage a cada tecla e não afeta a inbox (responsabilidade do chamador).
 */
export function TreeFilterInput({ value, onChange, className }: TreeFilterInputProps) {
  const inputId = useId();

  return (
    <div className={["relative w-full", className].filter(Boolean).join(" ")}>
      {/* Label acessível — visível apenas para leitores de tela */}
      <label htmlFor={inputId} className="sr-only">
        Filtrar árvore de navegação
      </label>

      {/* Ícone de funil — distingue de busca textual (FIL-03) */}
      <span
        aria-hidden="true"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          {/* Ícone de funil (filter) */}
          <path
            d="M1 2h10L7 6v4l-2-1V6L1 2z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <input
        id={inputId}
        type="text"
        role="searchbox"
        aria-label="Filtrar árvore de navegação"
        placeholder="Filtrar árvore…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full pl-7 pr-2 py-1.5",
          "text-[0.875rem] text-on-surface placeholder:text-on-surface/30",
          "bg-surface-container-low rounded-sm",
          "border-0 outline-none",
          "focus:bg-surface-container-lowest",
          "focus:[box-shadow:0_2px_0_0_var(--color-tertiary)]",
          "transition-all duration-150",
        ].join(" ")}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Limpar filtro quando há texto */}
      {value && (
        <button
          type="button"
          aria-label="Limpar filtro"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-sm text-on-surface/40 hover:text-on-surface transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M2 2L8 8M8 2L2 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
