/**
 * Testes do ItemRepository — Phase 1
 * Stubs para ARC-01, ARC-02, ARC-03, ARC-04, RUN-02
 * Implementação completa após PLAN-3 (read model)
 */
import { describe, test } from "vitest";

describe("FsItemRepository", () => {
  test.todo("ARC-01: listTopics() retorna array de Topic[] a partir do index/topicos.json");
  test.todo("ARC-02: getItem(id) resolve ID estável (path relativo URL-encoded)");
  test.todo("ARC-03: getItem retorna Item com type discriminado correto (nota | url | binario)");
  test.todo("ARC-04: FsItemRepository satisfaz a interface ItemRepository (typecheck)");
  test.todo("RUN-02: constructor usa process.env.PKM_PATH, não path relativo hardcoded");
});
