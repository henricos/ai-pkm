---
phase: 08-semver-release-pipeline
plan: 01
subsystem: infra
tags: [semver, docker, nextjs, build-metadata, vitest]
requires:
  - phase: 07-container-packaging-foundation
    provides: imagem standalone e contrato de build/runtime Docker com mounts externos
provides:
  - contrato explícito de versão SemVer e hash curto propagado para a build do Next
  - build args de release no Dockerfile para APP_VERSION e NEXT_PUBLIC_GIT_HASH
  - teste estático protegendo rastreabilidade entre package.json, Next config, UI e Dockerfile
affects: [phase-08-plan-02, ghcr, release-traceability, login-ui]
tech-stack:
  added: []
  patterns: [build-metadata-contract, env-first-release-traceability, static-repo-contract-tests]
key-files:
  created: [src/__tests__/release-traceability.test.ts]
  modified: [next.config.ts, Dockerfile, src/app/(auth)/login/page.tsx]
key-decisions:
  - "A versão pública da app passa a preferir APP_VERSION, depois npm_package_version, e por último package.json.version."
  - "O hash público do build passa a preferir NEXT_PUBLIC_GIT_HASH explícito, mantendo git rev-parse como fallback local de desenvolvimento."
  - "O footer da tela de login continua como ponto operacional de conferência e agora consome o mesmo contrato de build usado na imagem."
patterns-established:
  - "Releases publicadas entram no build do Next por variáveis explícitas, sem depender de git disponível no runtime final."
  - "Testes de contrato de release validam arquivos do repositório por leitura direta, no mesmo estilo do contrato de empacotamento."
requirements-completed: [VER-01, VER-03]
duration: 0min
completed: 2026-04-14
---

# Phase 08 Plan 01: Contrato local de rastreabilidade SemVer

**Versão SemVer pública e hash curto agora entram pelo mesmo contrato de build no Next, no Dockerfile e no footer operacional de login**

## Performance

- **Duration:** sessão única
- **Started:** 2026-04-14T17:52:01Z
- **Completed:** 2026-04-14T17:52:01Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Criei `src/__tests__/release-traceability.test.ts` para proteger o contrato entre `package.json`, `next.config.ts`, `Dockerfile` e footer da tela de login.
- Atualizei `next.config.ts` para expor `NEXT_PUBLIC_APP_VERSION` e `NEXT_PUBLIC_GIT_HASH` a partir de um contrato determinístico orientado a env, com fallback seguro para desenvolvimento.
- Ajustei o `Dockerfile` para aceitar `ARG APP_VERSION` e `ARG NEXT_PUBLIC_GIT_HASH` e exportar esses valores no stage `builder`.
- Mantive a conferência operacional no login, agora renderizando `vX.Y.Z · abc1234` a partir do mesmo contrato usado no build publicado.

## Task Commits

Os commits atômicos não foram executados por instrução explícita do operador e pela política de `AGENTS.md`.

## Files Created/Modified

- `src/__tests__/release-traceability.test.ts` - teste estático do contrato de rastreabilidade local da release.
- `next.config.ts` - injeta `NEXT_PUBLIC_APP_VERSION` e `NEXT_PUBLIC_GIT_HASH` com precedência explícita para release publicada.
- `Dockerfile` - aceita e exporta build args de versão/hash para o stage `builder`.
- `src/app/(auth)/login/page.tsx` - renderiza versão/hash a partir do contrato de build público.

## Decisions Made

- Usei `package.json.version` como fallback final da versão da app para preservar uma fonte estável de SemVer fora do ambiente de build.
- Mantive o fallback de `git rev-parse --short HEAD` apenas para dev/local, atendendo o contrato do plano sem reintroduzir dependência de git no runtime final.
- Não criei script ou wrapper de release; o contrato foi fechado apenas via env de build, UI e teste estático, como pedido no plano.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Relaxei a asserção do teste do footer para refletir a implementação planejada**
- **Found during:** Task 1 (teste estático de rastreabilidade)
- **Issue:** A primeira versão do teste exigia o literal `NEXT_PUBLIC_APP_VERSION` dentro do JSX, mas o plano permitia renderização indireta por variável derivada.
- **Fix:** Ajustei o teste para exigir a derivação explícita da variável e o uso de `v{appVersion}` no footer.
- **Files modified:** `src/__tests__/release-traceability.test.ts`
- **Verification:** `npx vitest run src/__tests__/release-traceability.test.ts src/__tests__/container-packaging.test.ts`

---

**Total deviations:** 1 auto-fix (1 bug)
**Impact on plan:** Nenhum scope creep; o ajuste só alinhou o teste ao contrato real especificado.

## Issues Encountered

- Um `.next/lock` órfão de um build anterior bloqueou a verificação final com `next build`; o lock temporário foi removido e o build foi rerodado com sucesso.
- O build exibiu um warning do Turbopack sobre tracing amplo a partir de `next.config.ts`, mas compilou e finalizou normalmente.

## Known Stubs

Nenhum.

## Threat Flags

Nenhum novo surface além do contrato de metadata já previsto no threat model do plano.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- O repositório agora tem um contrato local verificável para versão/hash antes da publicação no CI.
- A Phase 08 Plan 02 já pode reutilizar `APP_VERSION` e `NEXT_PUBLIC_GIT_HASH` como entrada canônica do workflow de publicação no GHCR.
- Não há bloqueio funcional restante para este plano.

## Verification

- `npx vitest run src/__tests__/release-traceability.test.ts src/__tests__/container-packaging.test.ts`
  Resultado: 7 testes passaram.
- `APP_VERSION=2.0.1 NEXT_PUBLIC_GIT_HASH=abcdef1 PKM_PATH=/tmp/build/pkm INDEX_PATH=/tmp/build/index AUTH_USERNAME=build-user AUTH_PASSWORD=build-password NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234 NEXTAUTH_URL=http://127.0.0.1:3000 npm run build`
  Resultado: build concluído com sucesso; apenas warning de tracing do Turbopack em `next.config.ts`.
- `rg -n 'NEXT_PUBLIC_APP_VERSION|NEXT_PUBLIC_GIT_HASH' next.config.ts src/app/'(auth)'/login/page.tsx`
  Resultado: markers encontrados em `next.config.ts` e `src/app/(auth)/login/page.tsx`.
- `rg -n 'ARG APP_VERSION|ARG NEXT_PUBLIC_GIT_HASH|ENV APP_VERSION|ENV NEXT_PUBLIC_GIT_HASH' Dockerfile`
  Resultado: build args e envs explícitos encontrados no `Dockerfile`.

## Self-Check: PASSED

- `src/__tests__/release-traceability.test.ts` existe.
- `next.config.ts`, `Dockerfile` e `src/app/(auth)/login/page.tsx` contêm os markers exigidos pelo plano.
- `.planning/phases/08-semver-release-pipeline/08-01-SUMMARY.md` foi criado.

---
*Phase: 08-semver-release-pipeline*
*Completed: 2026-04-14*
