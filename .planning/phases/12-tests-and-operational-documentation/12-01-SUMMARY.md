---
phase: 12-tests-and-operational-documentation
plan: "01"
subsystem: tests
tags:
  - testes
  - TST-01
  - TST-02
  - env-validation
  - route-prefix
  - vitest

dependency_graph:
  requires:
    - "Phase 10: withBasePath + env validation"
    - "Phase 11: consumers do prefixo /pkm"
  provides:
    - "TST-01: cobertura de contrato de ambiente documentada com rastreabilidade"
    - "TST-02: cobertura de contrato de rotas com prefixo /pkm"
  affects:
    - src/__tests__/env.test.ts
    - src/__tests__/runtime-paths.test.ts
    - src/__tests__/route-prefix.test.ts

tech_stack:
  added: []
  patterns:
    - "vi.mock de next/navigation com redirect não-lançante para testar Server Components"
    - "process.env.APP_BASE_PATH setado no beforeEach para isolar base-path.ts de process.env"
    - "Comentários de rastreabilidade // TST-01 inline nos testes"

key_files:
  created:
    - src/__tests__/route-prefix.test.ts
  modified:
    - src/__tests__/env.test.ts
    - src/__tests__/runtime-paths.test.ts

decisions:
  - "TST-02-c implementado como contract test via withBasePath explícito (não renderização) — Server Components não são testáveis via React.use() em JSDOM"
  - "process.env.APP_BASE_PATH precisa ser setado diretamente no beforeEach — base-path.ts lê process.env, não o mock de @/lib/env"

metrics:
  duration: "~8 min"
  completed_date: "2026-04-18"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 3
---

# Phase 12 Plan 01: Testes de contrato de ambiente e rotas — TST-01 e TST-02

**Uma linha:** Rastreabilidade TST-01 adicionada ao env.test.ts, dois testes falhos de runtime-paths corrigidos com APP_BASE_PATH, e novo route-prefix.test.ts com 5 contract tests TST-02 — suite completa verde com 218 testes.

## O que foi feito

### Tarefa 1 — Rastreabilidade TST-01 em env.test.ts

Adicionado comentário `// TST-01` nos 4 testes requeridos pelo requisito TST-01 em `src/__tests__/env.test.ts`:
- `ENV-01: falha cedo quando APP_BASE_PATH está ausente`
- `ENV-02: falha cedo quando NEXTAUTH_URL está ausente`
- `ENV-03: falha cedo quando NEXTAUTH_URL diverge do APP_BASE_PATH`
- `RUN-01: parse bem-sucedido quando todas as vars obrigatórias estão presentes e sincronizadas`

Cabeçalho do arquivo atualizado com referência à Phase 12 / TST-01.

### Tarefa 2 — Correção de runtime-paths.test.ts

Dois testes que falhavam (`PKG-02: usa INDEX_PATH explícito` e `PKG-01: em dev usa fallback`) foram corrigidos adicionando `APP_BASE_PATH=/pkm` e corrigindo `NEXTAUTH_URL` para `https://host/pkm`. A causa raiz era a validação de sincronia introduzida na Phase 10 que rejeita `NEXTAUTH_URL` sem o sufixo `/pkm`.

### Tarefa 3 — Criação de route-prefix.test.ts (TST-02)

Novo arquivo `src/__tests__/route-prefix.test.ts` com 5 contract tests:

| Teste | Comportamento verificado |
|-------|--------------------------|
| TST-02-a | `ShellLayout` chama `redirect("/pkm/login")` quando `auth()` retorna `null` |
| TST-02-b | `LoginPage` chama `redirect("/pkm")` quando sessão existe |
| TST-02-c | `withBasePath("/", "/pkm")` retorna `"/pkm"` — contract test do `fallbackUrl` |
| TST-02-d | `withBasePath("/login", "/pkm")` retorna `"/pkm/login"` — contract de `pages.signIn` |
| TST-02-e | `withBasePath` produz prefixo correto para subpaths arbitrários (`/pkm/library`, etc.) |

## Desvios do plano

### Auto-fixed Issues

**1. [Rule 1 - Bug] `process.env.APP_BASE_PATH` não setado para testes de Server Components**
- **Encontrado durante:** Tarefa 3, primeira execução de testes
- **Problema:** TST-02-a e TST-02-b falhavam porque `withBasePath` em `base-path.ts` lê `process.env.APP_BASE_PATH` diretamente (não via mock de `@/lib/env`). Sem o valor setado no processo, o helper retornava paths sem prefixo (`/login` em vez de `/pkm/login`)
- **Correção:** Adicionado `process.env.APP_BASE_PATH = "/pkm"` no `beforeEach` com `afterEach` restaurando o env original
- **Arquivos modificados:** `src/__tests__/route-prefix.test.ts`
- **Commit:** 0b30bab

**2. [Rule 2 - Missing] TST-02-c simplificado para contract test**
- **Encontrado durante:** Tarefa 3, avaliação de abordagem
- **Problema:** A versão com `React.use()` e renderização era desnecessariamente complexa para Server Components em JSDOM
- **Correção:** Aplicada a alternativa prevista no próprio plano — contract test direto via `withBasePath("/", "/pkm")`
- **Arquivos modificados:** `src/__tests__/route-prefix.test.ts`

## Verificação final

```
npm test — 23 test files, 218 tests, 0 failed
```

Critérios atendidos:
- `grep -c "TST-01" src/__tests__/env.test.ts` → 5 (4 inline + 1 cabeçalho)
- `grep -c "TST-02" src/__tests__/route-prefix.test.ts` → 8 (5 inline + 3 comentários)
- `npm test -- runtime-paths.test.ts` → 3 tests passando
- `npm test -- route-prefix.test.ts` → 5 tests passando
- Nenhum arquivo de produção modificado

## Commits

| Tarefa | Hash | Mensagem |
|--------|------|---------|
| 1 | 2482cfe | test(12-01): adiciona rastreabilidade TST-01 ao env.test.ts |
| 2 | 7c9031c | fix(12-01): corrige runtime-paths.test.ts — adiciona APP_BASE_PATH ao setup de env |
| 3 | 0b30bab | test(12-01): cria route-prefix.test.ts com 5 testes de contrato TST-02 |

## Known Stubs

Nenhum — todos os testes verificam comportamento real dos módulos de produção.

## Threat Flags

Nenhuma superficie nova introduzida — arquivos de teste apenas.

## Self-Check: PASSED
