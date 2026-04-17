---
phase: 10-environment-contract-and-build-foundation
plan: 02
subsystem: infra
tags: [env, zod, nextauth, base-path, vitest]
requires:
  - phase: 10-01
    provides: módulo canônico de normalização do base path
provides:
  - contrato fail-fast para APP_BASE_PATH no schema central de ambiente
  - validação de sincronia entre APP_BASE_PATH e NEXTAUTH_URL no startup
  - cobertura de teste para ausência, divergência e caso válido do contrato app/auth
affects: [phase-10, phase-11, auth, runtime-config]
tech-stack:
  added: []
  patterns: [validação centralizada de ambiente, reuso de normalizeBasePath no contrato runtime]
key-files:
  created: []
  modified:
    - src/lib/env.ts
    - src/__tests__/env.test.ts
key-decisions:
  - "A validação de APP_BASE_PATH e NEXTAUTH_URL permaneceu concentrada em src/lib/env.ts, sem espalhar checks por auth ou componentes."
  - "O pathname de NEXTAUTH_URL é comparado contra APP_BASE_PATH normalizado, travando explicitamente o contrato do milestone em /pkm e não em /api/auth."
patterns-established:
  - "normalizeBasePath() do módulo central também governa a semântica do contrato de ambiente."
  - "Mensagens de fail-fast exibem exemplo explícito do par correto sem imprimir segredos."
requirements-completed: [ENV-01, ENV-02, ENV-03]
duration: 26min
completed: 2026-04-17
---

# Phase 10 Plan 02: Environment Contract Summary

**Contrato central de ambiente agora exige APP_BASE_PATH e recusa startup com NEXTAUTH_URL fora de sincronia com o prefixo configurado**

## Performance

- **Duration:** 26 min
- **Started:** 2026-04-17T19:06:00Z
- **Completed:** 2026-04-17T19:32:16Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Estendi `src/lib/env.ts` para exigir `APP_BASE_PATH` no schema central e validar seu formato reutilizando `normalizeBasePath()`.
- Fechei a validação fail-fast de sincronia entre `APP_BASE_PATH` e o pathname de `NEXTAUTH_URL`, com mensagem clara e exemplo explícito de configuração correta.
- Atualizei `src/__tests__/env.test.ts` para cobrir ausência de `APP_BASE_PATH`, ausência de `NEXTAUTH_URL`, divergência de pathname e caso válido com `APP_BASE_PATH=/pkm` e `NEXTAUTH_URL=https://host/pkm`.

## Task Commits

Nenhum commit foi criado. O repositório exige aprovação humana explícita antes de qualquer commit e determina o uso da skill `/commit-push`; como essa aprovação não foi solicitada nesta execução, mantive o trabalho apenas no workspace.

## Files Created/Modified

- `src/lib/env.ts` - amplia o schema Zod, reaproveita a semântica do base path e aplica a validação consolidada de sincronia app/auth no startup.
- `src/__tests__/env.test.ts` - cobre os cenários do contrato fail-fast e preserva a estratégia atual baseada em `process.exit(1)`.

## Decisions Made

- Mantive o boundary do plano: nenhum consumer de rota, `pages.signIn`, callback fallback ou viewer foi reescrito nesta execução.
- Reusei `normalizeBasePath()` também para interpretar o pathname de `NEXTAUTH_URL`, evitando duas regras diferentes para o mesmo prefixo operacional.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `src/lib/env.ts` já dependia da mensagem consolidada em `safeParse` + `process.exit(1)`, então a validação nova precisou ser encaixada no `superRefine` sem quebrar o contrato existente. O ajuste foi mantido no mesmo ponto central.
- `.planning/STATE.md` e `.planning/ROADMAP.md` já estavam modificados no workspace por trabalho paralelo. Para não misturar estados concorrentes, não alterei esses arquivos nesta execução.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- A fundação de ambiente agora está pronta para ser consumida pela propagação build-time e pelos rewires de rota das phases seguintes.
- A cadeia workflow → Dockerfile → Next.js build continua pertencendo ao plano 10-03; os consumers de aplicação continuam reservados para a Phase 11.

## Self-Check: PASSED

- `src/lib/env.ts`, `src/__tests__/env.test.ts` e `.planning/phases/10-environment-contract-and-build-foundation/10-02-SUMMARY.md` existem no workspace.
- `npm run typecheck` passou após a implementação final.
- `npm test -- env` passou com 7 testes cobrindo ausência, divergência e caso válido do contrato.

---
*Phase: 10-environment-contract-and-build-foundation*
*Completed: 2026-04-17*
