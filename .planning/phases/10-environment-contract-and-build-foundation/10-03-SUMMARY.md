---
phase: 10-environment-contract-and-build-foundation
plan: 03
subsystem: infra
tags: [nextjs, docker, github-actions, base-path, build]
requires:
  - phase: 10-01
    provides: módulo central de normalização e composição do base path
  - phase: 10-02
    provides: contrato fail-fast de ambiente com APP_BASE_PATH e NEXTAUTH_URL
provides:
  - next.config ligado explicitamente a APP_BASE_PATH
  - cadeia Docker builder com APP_BASE_PATH disponível ao next build
  - workflow de release com APP_BASE_PATH=/pkm baked no build oficial
affects: [phase-10, phase-11, phase-12, routing, release]
tech-stack:
  added: []
  patterns: [basePath do Next.js derivado de env build-time, build arg explícito workflow->Dockerfile->framework]
key-files:
  created:
    - src/__tests__/next-config.test.ts
  modified:
    - next.config.ts
    - Dockerfile
    - .github/workflows/release-ghcr.yml
    - src/__tests__/release-workflow.test.ts
key-decisions:
  - "next.config.ts normaliza APP_BASE_PATH via módulo central e só aplica basePath quando o valor não é '/'."
  - "O Dockerfile passou a compor NEXTAUTH_URL de build com APP_BASE_PATH para manter a cadeia coerente durante o next build."
patterns-established:
  - "O prefixo baked precisa aparecer explicitamente no workflow e atravessar ARG/ENV até o estágio builder."
  - "Configuração de framework e testes contratuais verificam a origem de APP_BASE_PATH sem reescrever consumers da aplicação."
requirements-completed: [CFG-01, CFG-02]
duration: 8min
completed: 2026-04-17
---

# Phase 10 Plan 03: Build-Time Base Path Summary

**Cadeia explícita workflow → Dockerfile → Next.js para `APP_BASE_PATH`, com `basePath` do framework derivado do build e rastreado por testes**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-17T19:28:00Z
- **Completed:** 2026-04-17T19:35:54Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Liguei `next.config.ts` ao contrato de build usando `APP_BASE_PATH` como fonte explícita de `basePath`, sem hardcode local de `/pkm`.
- Propaguei `APP_BASE_PATH` pelo estágio `builder` do `Dockerfile`, deixando o valor disponível ao `next build` junto dos demais metadados já injetados.
- Tornei `APP_BASE_PATH=/pkm` visível no workflow oficial de release e cobri a cadeia com testes de config e workflow.

## Task Commits

Nenhum commit foi criado. `AGENTS.md` exige aprovação humana explícita antes de qualquer commit e determina uso da skill `/commit-push`; como essa aprovação não foi solicitada nesta execução, mantive o trabalho apenas no workspace.

## Files Created/Modified

- `next.config.ts` - passa a derivar `basePath` de `APP_BASE_PATH`, com normalização via `src/lib/base-path.ts`.
- `Dockerfile` - recebe `ARG APP_BASE_PATH`, promove para `ENV` no builder e compõe `NEXTAUTH_URL` de build com o prefixo.
- `.github/workflows/release-ghcr.yml` - bakeia `APP_BASE_PATH=/pkm` nos `build-args` do build oficial.
- `src/__tests__/next-config.test.ts` - prova que o `basePath` sai de `APP_BASE_PATH`, não de hardcode.
- `src/__tests__/release-workflow.test.ts` - exige a presença de `APP_BASE_PATH=/pkm` no workflow.

## Decisions Made

- Usei `normalizeBasePath()` do módulo criado no `10-01` dentro do `next.config.ts` para manter uma única semântica de prefixo.
- Tratei `APP_BASE_PATH="/"` como ausência prática de `basePath` no framework, preservando compatibilidade sem inventar fallback para `/pkm`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- O novo teste de `next.config.ts` falhou na primeira execução porque atribuir `undefined` diretamente em `process.env` não removia a variável com segurança para esse cenário. Ajustei o helper do teste para deletar a chave explicitamente quando necessário e a suíte passou.
- `.planning/STATE.md` e `.planning/ROADMAP.md` já estavam modificados antes desta execução. Para não misturar trabalho paralelo com este plano, não alterei esses arquivos nesta entrega.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- A fundação build-time está pronta para a Phase 11 consumir `withBasePath()` em redirects, hrefs e callbacks sem depender de hardcodes de rota.
- A Phase 12 já pode reutilizar `src/__tests__/next-config.test.ts` e `src/__tests__/release-workflow.test.ts` como parte da cobertura do contrato operacional.

## Self-Check: PASSED

- `next.config.ts`, `Dockerfile`, `.github/workflows/release-ghcr.yml`, `src/__tests__/next-config.test.ts` e `src/__tests__/release-workflow.test.ts` existem e refletem a cadeia descrita neste summary.
- `npm run typecheck` passou.
- `npm test -- next-config release-workflow` passou com 7 testes verdes.

---
*Phase: 10-environment-contract-and-build-foundation*
*Completed: 2026-04-17*
