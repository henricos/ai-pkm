/**
 * Interface ItemRepository — seam de abstração do acesso ao PKM (ARC-04)
 *
 * A v2 implementa FsItemRepository (filesystem + índices JSON).
 * A v3 pode substituir por DbItemRepository (banco de dados) sem alterar
 * navegação, viewer nem busca — o contrato desta interface permanece estável.
 *
 * REGRA: Todos os consumers (Server Components, Route Handlers) dependem
 * desta interface, nunca diretamente de FsItemRepository.
 */
import type { Item, Topic, Group } from "./types";

export interface ItemRepository {
  /**
   * Retorna todos os tópicos do índice estrutural.
   * Fast path: lê index/topicos.json (ARC-01)
   */
  listTopics(): Topic[];

  /**
   * Retorna grupos de um tópico específico.
   * Fast path: lê index/grupos.json filtrado por topico (ARC-01)
   */
  listGroups(topic: string): Group[];

  /**
   * Busca um item pelo ID (path relativo URL-decoded).
   * Retorna null se não encontrado. (ARC-02)
   */
  getItem(id: string): Item | null;

  /**
   * Busca itens por nome (substring case-insensitive).
   * Fase 1: implementação mínima por nome de arquivo.
   * Fase futura: busca textual no conteúdo (ARC-04 — seam preparada).
   */
  searchByName(q: string): Item[];
}
