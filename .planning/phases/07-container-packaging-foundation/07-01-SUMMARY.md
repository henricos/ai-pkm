---
phase: 07-container-packaging-foundation
plan: 01
subsystem: infra
tags: [docker, runtime-paths, env, nextjs, pkm]
requires:
  - phase: 06-theme-preset-hardening
    provides: base web app read-only já estabilizada para seguir para packaging
provides:
  - contrato central de runtime paths para artefatos dinâmicos e versionados
  - validação fail-fast de INDEX_PATH em produção
  - consumidores server-side migrados para resolução centralizada de paths
affects: [phase-07-plan-02, docker, compose, runtime-config]
tech-stack:
  added: []
  patterns: [runtime-paths-centralizados, env-fail-fast-por-ambiente]
key-files:
  created: [src/lib/runtime-paths.ts, src/__tests__/runtime-paths.test.ts]
  modified: [src/lib/env.ts, src/lib/pkm/fs-item-repository.ts, src/lib/navigation/navigation-service.ts, docs/dev-setup.md, .env.example, src/__tests__/env.test.ts]
key-decisions:
  - "INDEX_PATH passa a ser obrigatório em produção e opcional apenas em dev local."
  - "A raiz versionada da app fica centralizada em getRuntimePaths(), com APP_ROOT_PATH opcional."
patterns-established:
  - "Consumidores server-side devem importar getRuntimePaths() em vez de resolver paths ad hoc."
  - "Defaults locais de index são permitidos apenas como fallback explícito de desenvolvimento."
requirements-completed: [PKG-01, PKG-02]
duration: 3min
completed: 2026-04-14
---

# Phase 07 Plan 01: Runtime contract explícito para `pkm`, `index` e artefatos versionados

**Contrato central de runtime paths com `INDEX_PATH` validado em produção e fallback local previsível em dev**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-14T11:17:43Z
- **Completed:** 2026-04-14T11:20:11Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Criei `src/lib/runtime-paths.ts` como fonte única para `pkm`, `index` e refs versionadas (`models`, `reference`, `.agents/skills`, `AGENTS.md`).
- Ajustei `src/lib/env.ts` para validar paths absolutos e falhar cedo quando `INDEX_PATH` estiver ausente em produção.
- Migrei `FsItemRepository` e `NavigationService` para o contrato central, removendo a dependência implícita de `index/` via `process.cwd()` espalhada no código.
- Atualizei `docs/dev-setup.md` e `.env.example` para explicar o contrato real de dev vs produção.

## Task Commits

Os commits atômicos não foram executados.

1. **Task 1: Criar o contrato central de runtime paths** - bloqueado pelo gate de commit do `AGENTS.md`
2. **Task 2: Migrar consumidores server-side para o contrato novo** - bloqueado pelo gate de commit do `AGENTS.md`

**Plan metadata:** não criado pelo mesmo motivo; o repositório exige aprovação explícita e uso da skill `/commit-push`.

## Files Created/Modified
- `src/lib/runtime-paths.ts` - centraliza a resolução de paths dinâmicos e versionados.
- `src/lib/env.ts` - valida `INDEX_PATH`/`APP_ROOT_PATH` e reforça paths absolutos.
- `src/lib/pkm/fs-item-repository.ts` - passa a consumir `indexRoot` e `pkmRoot` do contrato central.
- `src/lib/navigation/navigation-service.ts` - passa a ler índices pelo contrato central.
- `src/__tests__/runtime-paths.test.ts` - cobre contrato de `INDEX_PATH`, fallback de dev e fail-fast de produção.
- `src/__tests__/env.test.ts` - cobre o novo contrato de env em produção.
- `docs/dev-setup.md` - documenta `PKM_PATH` + `INDEX_PATH` e o fallback local explícito.
- `.env.example` - expõe as novas variáveis de runtime e seus usos.

## Verification

- `npx vitest run src/__tests__/env.test.ts src/__tests__/runtime-paths.test.ts`
  Resultado: RED inicial confirmou ausência de `runtime-paths.ts` e do contrato de `INDEX_PATH`; GREEN posterior passou.
- `npx vitest run src/__tests__/env.test.ts src/__tests__/runtime-paths.test.ts src/__tests__/item-repository.test.ts src/__tests__/navigation-service.test.ts`
  Resultado: 45 testes passaram.
- `npm run test`
  Resultado: 17 arquivos de teste passaram, 191 testes green.
- `npm run typecheck`
  Resultado: passou após ajustar os testes para `vi.stubEnv("NODE_ENV", ...)`.
- `rg -n 'process\.cwd\(\).*index|path\.join\(process\.cwd\(\), "index"\)' src/lib`
  Resultado: sem ocorrências.
- `test -f src/lib/runtime-paths.ts`
  Resultado: exit code 0.

## Decisions Made

- `getRuntimePaths()` usa `APP_ROOT_PATH` opcional e fallback para `process.cwd()` apenas dentro do módulo central, não mais nos consumidores.
- `INDEX_PATH` não recebe default silencioso em produção; o runtime falha cedo para não mascarar o contrato do container.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Atualização do template `.env.example` para refletir o novo contrato de runtime**
- **Found during:** Task 2
- **Issue:** o repositório continuaria sugerindo um template de env incompatível com `INDEX_PATH` e `APP_ROOT_PATH`.
- **Fix:** documentei o contrato novo diretamente em `.env.example`.
- **Files modified:** `.env.example`
- **Verification:** revisão manual + alinhamento com `docs/dev-setup.md`
- **Committed in:** não commitado; bloqueado pelo gate de commit

---

**Total deviations:** 1 auto-fix (Rule 2)
**Impact on plan:** necessário para manter o contrato de runtime coerente entre código e setup local.

## Issues Encountered

- `npm run typecheck` falhou inicialmente porque `NODE_ENV` é readonly nos typings de `process.env`; corrigi os testes com `vi.stubEnv(...)`.
- Os commits por tarefa ficaram bloqueados pela política do projeto: `AGENTS.md` exige aprovação explícita e uso da skill `/commit-push`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- A app agora distingue `pkm`/`index` dinâmicos de artefatos versionados, preparando o terreno para Docker/Compose na `07-02`.
- O próximo plano já pode assumir `INDEX_PATH` externo no container sem depender do layout acidental do workspace.
- Pendente apenas o gate humano de commit se você quiser registrar estas mudanças em Git.

## Self-Check: PASSED

- `src/lib/runtime-paths.ts` existe.
- `.planning/phases/07-container-packaging-foundation/07-01-SUMMARY.md` foi criado.
- A verificação de commits não se aplica aqui porque nenhum commit foi autorizado.

---
*Phase: 07-container-packaging-foundation*
*Completed: 2026-04-14*
