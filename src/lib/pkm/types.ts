/**
 * Tipos canônicos do domínio PKM — Phase 1
 *
 * Estes tipos definem o modelo semântico compartilhado entre navegação,
 * viewer e busca (ARC-03). A implementação de filesystem usa estes tipos;
 * a implementação de banco da v3 usará os mesmos contratos.
 */

/** Tipo de item inferido do nome do arquivo (nunca do frontmatter) */
export type ItemType = "nota" | "url" | "binario";

/** Estado do item — campo obrigatório no frontmatter */
export type ItemEstado = "rascunho" | "finalizado";

/**
 * Item lógico read-only — unidade semântica do PKM.
 *
 * id: path relativo à raiz do pkm, separado por /
 *     Exemplo: "tecnologia/superapp/nota-conceito.md"
 *     URL-encoded para uso em rotas Next.js.
 *     Estável enquanto o arquivo não for renomeado (aceitável para read-only).
 */
export interface Item {
  /** Path relativo à raiz do pkm — identificador estável (ARC-02) */
  id: string;
  /** Path absoluto no filesystem — para leitura de conteúdo */
  path: string;
  /** Nome do arquivo sem extensão */
  name: string;
  /** Tipo inferido do nome do arquivo (ARC-03) */
  type: ItemType;
  /** Estado do item — do frontmatter */
  estado: ItemEstado;
  /** Tópico — inferido da pasta onde o arquivo está */
  topic: string;
  /** Nome do grupo (pasta _grupo), se aplicável */
  group?: string;
  /** Data de captura — do frontmatter (YYYY-MM-DD) */
  dataCaptura: string;
  /** URL canônica — apenas para type === "url" */
  url?: string;
  /** Path absoluto do sidecar — apenas para binários com sidecar associado */
  sidecarPath?: string;
}

/** Subtópico — nó filho de um tópico */
export interface Subtopic {
  id: string;
  descricao: string;
}

/** Tópico — nó raiz da árvore de navegação */
export interface Topic {
  id: string;
  descricao: string;
  subtopicos?: Subtopic[];
}

/** Grupo — pasta _grupo dentro de um tópico */
export interface Group {
  /** Caminho relativo à raiz do repositório ai-pkm (ex: "pkm/tecnologia/_superapp/") */
  caminho: string;
  descricao: string;
  topico: string;
}
