---
phase: 10-environment-contract-and-build-foundation
plan: 01
subsystem: infra
tags: [nextjs, base-path, routing, vitest]
requires:
  - phase: 9-portainer-deployment-flow
    provides: runtime e build foundation já empacotados para a aplicação
provides:
  - módulo canônico de normalização e composição do base path
  - testes unitários para a API `withBasePath()`
  - comentários de fronteira para uso correto na Phase 11
affects: [phase-10, phase-11, auth, navigation, viewer]
tech-stack:
  added: []
  patterns: [helper central de prefixo, normalização fail-fast de path]
key-files:
  created:
    - src/lib/base-path.ts
    - src/__tests__/with-base-path.test.ts
  modified: []
key-decisions:
  - "A fundação do base path nasceu como módulo puro e central, sem reescrever consumers antes da Phase 11."
  - "withBasePath() aceita override opcional de basePath para teste e reuso server-side, mas mantém uso simples com leitura de APP_BASE_PATH."
patterns-established:
  - "normalizeBasePath() concentra a semântica do prefixo e rejeita formatos ambíguos cedo."
  - "Comentários no módulo delimitam uso em redirect/callback server-side e evitam uso redundante com next/link."
requirements-completed: [CFG-03]
duration: 18min
completed: 2026-04-17
---

# Phase 10 Plan 01: Base Path Foundation Summary

**Módulo central de base path com normalização determinística, composição de URLs prefixadas e testes unitários prontos para a adoção da Phase 11**

## Performance

- **Duration:** 18 min
- **Started:** 2026-04-17T19:10:00Z
- **Completed:** 2026-04-17T19:28:43Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Criei `src/lib/base-path.ts` como fonte única de verdade para normalização de `APP_BASE_PATH` e composição de paths internos prefixados.
- Explicitei no próprio módulo onde `withBasePath()` deve ser usado (`redirect()`, callback URLs e composição server-side) e onde não deve ser usado por padrão (`next/link` e consumers já auto-prefixados pelo framework).
- Adicionei `src/__tests__/with-base-path.test.ts` cobrindo normalização de `/pkm`, remoção determinística de barra final, composição de `/` e paths internos, além de rejeição de entradas inválidas com mensagens em `pt-BR`.

## Task Commits

Nenhum commit foi criado. O repositório exige aprovação humana explícita antes de qualquer commit e determina o uso da skill `/commit-push`; como essa aprovação não foi solicitada nesta execução, mantive o trabalho apenas no workspace.

## Files Created/Modified

- `src/lib/base-path.ts` - define `normalizeBasePath()`, `getConfiguredBasePath()` e `withBasePath()` com validação fail-fast e comentários de fronteira para a próxima fase.
- `src/__tests__/with-base-path.test.ts` - valida a API central do módulo com casos canônicos e inválidos.

## Decisions Made

- Mantive o boundary do plano estritamente na fundação: nenhum redirect, href, callback ou consumer da aplicação foi reescrito.
- Permiti override opcional de `basePath` em `withBasePath()` para simplificar testes unitários e reuso futuro sem duplicar semântica.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- O workspace não tinha dependências instaladas localmente, então `npm run typecheck` e `npm test -- with-base-path` falharam inicialmente por ausência de `tsc` e `vitest`. Resolvi com `npm ci` e repeti as verificações.
- `.planning/STATE.md` já estava modificado antes desta execução. Para não misturar trabalho paralelo com o scope do plano, não alterei esse arquivo.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- A Phase 11 já pode consumir `withBasePath()` em redirects, callback URLs e composição server-side sem reinventar concatenação de prefixo.
- A validação de ambiente (`APP_BASE_PATH` obrigatório e sincronizado com `NEXTAUTH_URL`) e a propagação build-time ainda pertencem aos próximos planos da Phase 10.

## Self-Check: PASSED

- `src/lib/base-path.ts` existe e exporta `normalizeBasePath()` e `withBasePath()`.
- `src/__tests__/with-base-path.test.ts` existe e cobre os casos exigidos pelo plano.
- Nenhum consumer fora do boundary foi alterado nesta execução.
