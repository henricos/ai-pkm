/**
 * Contratos do read model de navegação — Phase 2 (NAV-01 a NAV-08)
 *
 * Estes tipos definem o snapshot consumido pela shell persistente.
 * Nenhum path absoluto ou estrutura interna do filesystem é exposta aqui.
 */

/**
 * Tipo visual do item — representa o conteúdo, não o estado (D-11).
 * O estado (`rascunho` | `finalizado`) é um campo separado.
 */
export type NavigationItemKind =
  | "markdown"
  | "image"
  | "excalidraw"
  | "pdf"
  | "binary";

/**
 * Escopo de namespace do item na URL (D-22, D-23, D-26).
 */
export type NavigationScope = "library" | "inbox";

/**
 * Referência canônica a um item navegável.
 * Usado como folha da árvore e como entrada da inbox.
 * Nunca expõe path absoluto ao cliente.
 */
export interface NavigationItemRef {
  /** ID lógico estável — path relativo à raiz do pkm (URL-encoded) */
  id: string;
  /** Rótulo para exibição (nome sem extensão) */
  label: string;
  /** Namespace de pertencimento (D-22, D-26) */
  scope: NavigationScope;
  /** Tipo visual inferido do nome/extensão do arquivo (D-11) */
  itemKind: NavigationItemKind;
  /** Estado do item — separado do tipo visual (D-10) */
  estado: "rascunho" | "finalizado";
  /** href canônico para navegação no browser */
  href: string;
}

/**
 * Nó da árvore estrutural (tópico, subtópico ou grupo).
 * Agrupadores nunca são itens terminais — só folhas são NavigationItemRef.
 */
export interface NavigationTreeNode {
  /** ID único do agrupador (ex: "tecnologia", "tecnologia/superapp") */
  id: string;
  /** Rótulo para exibição */
  label: string;
  /** Tipo do agrupador */
  kind: "topic" | "subtopic" | "group";
  /** Número total de itens diretos e recursivos neste agrupador (D-09) */
  count: number;
  /** Subnós: agrupadores filhos */
  children: NavigationTreeNode[];
  /** Folhas: itens terminais deste agrupador */
  items: NavigationItemRef[];
}

/**
 * Entrada da inbox — item que ainda não foi classificado (D-01 a D-06).
 * Não tem ancestry estrutural e usa namespace próprio.
 */
export interface InboxEntry extends NavigationItemRef {
  scope: "inbox";
}

/**
 * Snapshot único do read model de navegação.
 *
 * Gerado server-side pelo NavigationService e consumido pela shell.
 * Substitui qualquer acesso direto ao ItemRepository ou filesystem a partir da UI.
 *
 * - `inbox`: itens da __inbox/, separados da biblioteca (D-01, D-02)
 * - `tree`: árvore estruturada por tópico/subtópico/grupo
 * - `ancestorsByItemId`: mapa de item.id → IDs de agrupadores ancestrais para reveal (D-08)
 */
export interface NavigationSnapshot {
  inbox: InboxEntry[];
  tree: NavigationTreeNode[];
  ancestorsByItemId: Record<string, string[]>;
}
