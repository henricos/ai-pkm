---
phase: 08-semver-release-pipeline
plan: 02
status: checkpoint-blocked
requirements:
  - PUB-01
  - PUB-02
  - PUB-03
  - PUB-04
  - VER-03
files_modified:
  - .github/workflows/release-ghcr.yml
  - src/__tests__/release-workflow.test.ts
decisions:
  - Workflow de release publica apenas por tag `vX.Y.Z` e falha fora de `main`.
  - A imagem canônica publicada é `ghcr.io/henricos/ai-pkm` com tags `vX.Y.Z` e `latest`.
  - O fechamento de `PUB-03` depende de publish real no GHCR com pacote vinculado ao repositório e visibilidade pública.
---

# Phase 08 Plan 02 Summary

Pipeline de release por tag Git para GHCR com gate de `main`, validação de versão contra `package.json` e labels OCI de rastreabilidade.

## Resultado

Task 1 e Task 2 foram implementadas localmente:

- criado `.github/workflows/release-ghcr.yml` com trigger por tag `v*.*.*`, runner `ubuntu-latest`, permissões mínimas, login no GHCR, gate de ancestry em `origin/main`, validação `package.json` vs tag e publicação de `ghcr.io/henricos/ai-pkm` com `latest` + `vX.Y.Z`
- criado `src/__tests__/release-workflow.test.ts` protegendo trigger, runner, permissões, nome canônico da imagem, gate de `main`, checagem de versão e labels OCI

## Validações Locais

- `npx vitest run src/__tests__/release-workflow.test.ts` -> passou
- `npm test` -> passou
- `npm run typecheck` -> passou
- `APP_VERSION=2.0.1 NEXT_PUBLIC_GIT_HASH=abcdef1 PKM_PATH=/tmp/build/pkm INDEX_PATH=/tmp/build/index AUTH_USERNAME=build-user AUTH_PASSWORD=build-password NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234 NEXTAUTH_URL=http://127.0.0.1:3000 npm run build` -> passou
- `rg -n "tags:\\s*\\[\\s*'v\\*\\.\\*\\.\\*'\\s*\\]|ubuntu-latest|ghcr.io/henricos/ai-pkm|docker/login-action|docker/build-push-action|org.opencontainers.image.version|org.opencontainers.image.revision|org.opencontainers.image.source|merge-base --is-ancestor|latest|GITHUB_REF_NAME#v|package.json" .github/workflows/release-ghcr.yml` -> passou

Observação: o `build` precisou ser rerodado fora do sandbox local porque o Turbopack tentou abrir processo/porta auxiliar e falhou com `Operation not permitted` no ambiente isolado. Fora dessa limitação do sandbox, o build concluiu com sucesso.

## Bloqueio Externo

`PUB-03` permanece pendente até o primeiro publish real no GHCR. O fechamento exige confirmar fora do repositório que:

- o pacote `ghcr.io/henricos/ai-pkm` foi criado ou vinculado ao repositório `henricos/ai-pkm`
- a visibilidade final do pacote está `public`

Sem essa checagem externa, o plano fica corretamente parado no checkpoint humano bloqueante da Task 3.
