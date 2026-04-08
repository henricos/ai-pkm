/**
 * Helpers de rota canônica para biblioteca e inbox — Phase 2 (D-22, D-23, D-26)
 *
 * Regras:
 * - Biblioteca: `/library/<path-real-url-encoded>` refletindo segmentos reais do item
 * - Inbox: `/inbox/<filename-url-encoded>` usando convenção própria do namespace
 * - Nenhum path absoluto é exposto; IDs lógicos são URL-encoded
 * - Toda conversão passa por estes helpers; componentes nunca concatenam paths livres
 */

import type { NavigationItemRef } from "./navigation-types";

/**
 * Gera o href canônico para um item navegável.
 *
 * Para itens de biblioteca: `/library/<segmentos-url-encoded>` (D-26)
 * Para itens de inbox: `/inbox/<filename-url-encoded>` (D-23, D-26)
 */
export function itemToHref(item: Pick<NavigationItemRef, "id" | "scope">): string {
  if (item.scope === "inbox") {
    // inbox: arquivo plano em __inbox/, usa filename como slug (sem pasta)
    const filename = item.id.split("/").pop() ?? item.id;
    return `/inbox/${encodeURIComponent(filename)}`;
  }

  // library: reflete os segmentos do path real do item
  const segments = item.id.split("/").map(encodeURIComponent);
  return `/library/${segments.join("/")}`;
}

/**
 * Decode dos parâmetros de uma rota de biblioteca.
 *
 * Recebe `params.path` como array de segmentos já decodificados pelo Next.js
 * e reconstrói o ID lógico do item (path relativo à raiz do pkm).
 */
export function decodeLibraryParams(params: { path: string[] }): string {
  return params.path.map(decodeURIComponent).join("/");
}

/**
 * Decode do parâmetro de uma rota de inbox.
 *
 * Recebe o slug de um item da inbox (filename) e retorna
 * o ID lógico esperado pelo NavigationService.
 */
export function decodeInboxParam(param: string): string {
  return `__inbox/${decodeURIComponent(param)}`;
}
