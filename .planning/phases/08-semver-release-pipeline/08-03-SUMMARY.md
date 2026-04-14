---
phase: 08-semver-release-pipeline
plan: 03
subsystem: infra
tags: [semver, release, ghcr, github-actions, docs]
requires:
  - phase: 08-01
    provides: contrato de rastreabilidade de versao na UI e no build
  - phase: 08-02
    provides: workflow Release GHCR por tag vX.Y.Z
provides:
  - guia canonico de release SemVer baseado em npm version
  - ponte no README para o fluxo oficial de release
  - registro de checkpoint externo pendente para validacao real da cadeia GitHub Actions -> GHCR
affects: [phase-09-portainer-deployment-flow, release-operations]
tech-stack:
  added: []
  patterns: [checklist operacional curto, release nativa sem wrapper, automacao futura via skill]
key-files:
  created: [docs/release-semver-ghcr.md, .planning/phases/08-semver-release-pipeline/08-03-SUMMARY.md]
  modified: [README.md]
key-decisions:
  - "O fluxo oficial de release continua nativo e auditavel: git fetch, main, working tree limpa, gate local, npm version e push com --follow-tags."
  - "Qualquer automacao guiada futura deve apenas orquestrar os comandos canonicos, preferencialmente via skill."
patterns-established:
  - "Release docs first: o repositorio ensina o operador a usar o workflow versionado em vez de esconder a cadeia real."
  - "Checkpoint externo obrigatorio: tag real, workflow GitHub Actions e GHCR permanecem fora do ambiente local."
requirements-completed: []
duration: 9min
completed: 2026-04-14
---

# Phase 8 Plan 03: Summary

**Checklist canônico de release SemVer com `npm version`, `git push --follow-tags` e conferência explícita de rastreabilidade entre Git, UI e GHCR**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-14T18:04:06Z
- **Completed:** 2026-04-14T18:13:10Z
- **Tasks:** 1 concluída localmente, 1 pendente por checkpoint externo
- **Files modified:** 3

## Accomplishments

- Criei `docs/release-semver-ghcr.md` como procedimento canônico e curto da release SemVer da Phase 8.
- Atualizei o `README.md` para apontar para o guia oficial de release e publicação no GHCR.
- Rodei as verificações locais do plano e registrei que a prova ponta a ponta da release real continua pendente fora do ambiente local.

## Task Status

1. **Task 1: Documentar o checklist canônico de release SemVer** - concluída localmente, sem commit por solicitação do operador.
2. **Task 2: Validar uma release real ponta a ponta** - bloqueada por checkpoint humano externo; depende de `npm version` real, `git push origin main --follow-tags`, GitHub Actions e GHCR.

## Files Created/Modified

- `docs/release-semver-ghcr.md` - guia canônico da release com comandos exatos, rastreabilidade e regra contra wrapper opaco.
- `README.md` - ponte curta para o fluxo oficial de release SemVer e publicação em `ghcr.io/henricos/ai-pkm`.
- `.planning/phases/08-semver-release-pipeline/08-03-SUMMARY.md` - registro desta execução parcial com checkpoint externo pendente.

## Verification

- `rg -n 'git checkout main|git diff --quiet && git diff --cached --quiet|npm version patch\\|minor\\|major|git push origin main --follow-tags|ghcr.io/henricos/ai-pkm|preferencialmente via skill' docs/release-semver-ghcr.md` ✅
- `rg -n 'release-semver-ghcr\\.md' README.md` ✅
- `test -f docs/release-semver-ghcr.md && test -f .github/workflows/release-ghcr.yml` ✅
- `rg -n 'Release GHCR|ghcr.io/henricos/ai-pkm|docker/build-push-action|docker/login-action' .github/workflows/release-ghcr.yml` ✅
- `rg -n 'NEXT_PUBLIC_APP_VERSION|NEXT_PUBLIC_GIT_HASH|npm_package_version' "src/app/(auth)/login/page.tsx" package.json` ✅
- `npm test` ✅
- `npm run typecheck` ✅
- `npm run build` ✅ com ambiente temporário explícito e execução fora do sandbox; houve warning de tracing em `next.config.ts`, mas o build completou com sucesso.

## Decisions Made

- Mantive a documentação no nível operacional mínimo exigido pelo plano, sem criar script wrapper, alias ou `Make` target.
- Não avancei para a Task 2 porque o plano a define como checkpoint humano bloqueante e a solicitação do operador pediu explicitamente para parar antes da release real.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reexecução do build fora do sandbox**
- **Found during:** Verificação automatizada local
- **Issue:** O `next build` falhou no sandbox com erro de permissão do Turbopack (`creating new process` / `binding to a port`).
- **Fix:** Reexecutei o build com variáveis temporárias explícitas e permissão fora do sandbox apenas para concluir a verificação local.
- **Files modified:** nenhum arquivo de código
- **Verification:** `npm run build` concluiu com sucesso

---

**Total deviations:** 1 auto-fix (1 blocking)
**Impact on plan:** Nenhuma mudança de escopo. A correção só destravou a verificação local.

## Issues Encountered

- O primeiro `npm run build` sem env explícito falhou porque `INDEX_PATH` é obrigatório em produção; isso foi resolvido ao usar um ambiente temporário de build.
- Um lock residual em `.next/lock` apareceu após uma execução interrompida; ele foi removido antes do build final.

## User Setup Required

Para concluir a Task 2, o operador precisa executar uma release real fora deste ambiente:

- rodar o checklist de `docs/release-semver-ghcr.md` a partir de `main`
- escolher e executar `npm version patch|minor|major`
- publicar com `git push origin main --follow-tags`
- confirmar no GitHub Actions o workflow `Release GHCR`
- confirmar no GHCR as tags `vX.Y.Z` e `latest`
- conferir no footer do login o formato `vX.Y.Z · abc1234`

## Next Phase Readiness

- A superfície documental da Phase 8 está pronta para uso operacional.
- A validação ponta a ponta da release real permanece pendente e é o único bloqueio externo remanescente deste plano.

## Self-Check: PASSED

- `docs/release-semver-ghcr.md` existe.
- `README.md` contém o link para `docs/release-semver-ghcr.md`.
- `.planning/phases/08-semver-release-pipeline/08-03-SUMMARY.md` existe.

---
*Phase: 08-semver-release-pipeline*
*Completed: 2026-04-14*
