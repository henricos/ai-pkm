/**
 * Testes de autenticação — Phase 1
 * Stubs para ACC-01, ACC-02, ACC-03
 * Implementação completa após PLAN-2 (autenticação)
 */
import { describe, test } from "vitest";

describe("auth middleware", () => {
  test.todo("ACC-01: redireciona para /login quando sessão ausente");
  test.todo("ACC-02: credenciais validadas contra AUTH_USERNAME e AUTH_PASSWORD env vars");
  test.todo("ACC-03: login bem-sucedido cria sessão com cookie httpOnly");
});
