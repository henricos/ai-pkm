"use client";

/**
 * ItemKindIcon — ícone visual para o tipo de item de navegação (D-11).
 *
 * Cada tipo visual tem um ícone distinto e reconhecível:
 * - markdown: documento com linhas
 * - image: moldura com montanha e sol
 * - excalidraw: traço livre (sketch)
 * - pdf: documento com dobra de canto
 * - binary: arquivo genérico
 *
 * Tamanho padrão: 12×12px (body-md, para uso inline em listas compactas).
 */

import type { NavigationItemKind } from "@/lib/navigation/navigation-types";

interface ItemKindIconProps {
  kind: NavigationItemKind;
  /** Tamanho em px (padrão: 12) */
  size?: number;
}

export function ItemKindIcon({ kind, size = 12 }: ItemKindIconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 12 12",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  switch (kind) {
    case "markdown":
      return (
        <svg {...props}>
          <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 4h6M3 6h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "image":
      return (
        <svg {...props}>
          <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="4" cy="4.5" r="1" fill="currentColor" />
          <path d="M1 8.5L4 6L6.5 8L8.5 6.5L11 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "excalidraw":
      return (
        <svg {...props}>
          <path d="M2 9L5 4L8 7L10 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "pdf":
      return (
        <svg {...props}>
          <path d="M2 1h5.5L10 3.5V11H2V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M7 1v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M2 1h5.5L10 3.5V11H2V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
  }
}
