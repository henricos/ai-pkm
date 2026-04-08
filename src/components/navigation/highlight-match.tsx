"use client";

/**
 * HighlightMatch — renderiza o rótulo de um item com trechos de match destacados.
 *
 * Recebe os offsets calculados pelo pipeline `filterNavigationTree` e pinta
 * apenas o trecho correspondente, de forma sutil e coerente com DESIGN.md.
 *
 * Uso:
 *   <HighlightMatch label={item.label} offsets={item.matchOffsets} />
 *
 * Design:
 * - Highlight usa `tertiary` como laser-pointer sutil (§2, §6 DESIGN.md)
 * - Sem background; apenas peso tipográfico ligeiramente maior no trecho
 * - Coerente com body-md (0.875rem, weight 400)
 */

import type { HighlightSegment } from "@/lib/navigation/filter-tree";
import { highlightMatches } from "@/lib/navigation/filter-tree";

interface HighlightMatchProps {
  /** Rótulo completo do item */
  label: string;
  /** Pares [start, end] (end exclusivo) dos trechos com match. Opcional. */
  offsets?: [number, number][];
  /** Classe adicional para o elemento raiz */
  className?: string;
}

/**
 * Renderiza rótulo com highlight sutil nos trechos de match.
 * Sem offsets, renderiza o texto puro sem marcação.
 */
export function HighlightMatch({ label, offsets, className }: HighlightMatchProps) {
  const segments: HighlightSegment[] = highlightMatches(label, offsets ?? []);

  // Se há apenas um segmento sem highlight, renderiza simples
  if (segments.length === 1 && !segments[0]!.highlight) {
    return <span className={className}>{label}</span>;
  }

  return (
    <span className={className} aria-label={label}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark
            key={i}
            className="bg-transparent text-tertiary font-medium not-italic"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </span>
  );
}
