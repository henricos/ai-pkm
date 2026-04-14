---
phase: 07-container-packaging-foundation
plan: 02
subsystem: infra
tags: [docker, compose, standalone, nextjs, ghcr-ready]
requires:
  - phase: 07-container-packaging-foundation
    plan: 01
    provides: contrato central de runtime paths para dados dinamicos e artefatos versionados
provides:
  - build standalone do Next alinhado ao runtime em container
  - imagem multi-stage nao-root sem `pkm` nem `index` embutidos
  - contrato canonico de validacao local via `docker compose` com mounts externos
affects: [phase-07-plan-03, docker, compose, runtime-config]
tech-stack:
  added: []
  patterns: [next-standalone, docker-multi-stage, external-dynamic-mounts]
key-files:
  created: [Dockerfile, .dockerignore, compose.yaml, .env.compose.example, src/__tests__/container-packaging.test.ts]
  modified: [next.config.ts, next-env.d.ts]
key-decisions:
  - "A imagem final copia apenas o runtime standalone e os artefatos versionados de referencia (`models`, `reference`, `.agents/skills`, `AGENTS.md`)."
  - "`pkm` e `index` permanecem fora da imagem e entram apenas por mount externo com `PKM_PATH=/data/pkm` e `INDEX_PATH=/data/index`."
patterns-established:
  - "A validacao local do artefato distribuivel usa `compose.yaml` como contrato oficial, nao wrappers shell."
  - "Build de producao exige envs minimas explicitas; ausencia de `INDEX_PATH` em producao falha cedo por design."
requirements-completed: [PKG-01, PKG-02, PKG-03]
duration: 0min
completed: 2026-04-14
---

# Phase 07 Plan 02: Imagem standalone e runtime canonico via compose

**Empacotamento Docker multi-stage com runtime nao-root e mounts externos reais para `pkm` e `index`**

## Accomplishments

- Ativei `output: "standalone"` em `next.config.ts` para alinhar o build ao runtime distribuivel.
- Criei `Dockerfile` multi-stage com stages `deps`, `builder` e `runner`, copiando para a imagem final apenas o runtime do Next e os artefatos versionados exigidos pelo contrato do repositorio.
- Criei `.dockerignore` excluindo `pkm`, `index`, `.git`, `.next`, `node_modules`, envs locais e lixo de workspace do contexto de build.
- Criei `compose.yaml` com mounts externos canonicos para `PKM_HOST_PATH -> /data/pkm` e `INDEX_HOST_PATH -> /data/index`, sem entrypoints ou wrappers compensatorios.
- Criei `.env.compose.example` com o minimo necessario para validar o runtime local do container.
- Adicionei `src/__tests__/container-packaging.test.ts` para cobrir o contrato do `Dockerfile`, `.dockerignore` e `compose.yaml`.

## Task Commits

Os commits atômicos não foram executados.

1. **Task 1: Gerar a imagem standalone somente com artefatos versionados** - bloqueado pelo gate de commit do `AGENTS.md`
2. **Task 2: Definir o runtime canonico via compose com mounts externos reais** - bloqueado pelo gate de commit do `AGENTS.md`

## Verification

- `npx vitest run src/__tests__/container-packaging.test.ts`
  Resultado: 3 testes passaram.
- `npm run build`
  Resultado: falhou no ambiente corrente quando executado sem `INDEX_PATH`, o que confirma o fail-fast esperado do novo contrato de produção.
- `PKM_PATH=/tmp/build/pkm INDEX_PATH=/tmp/build/index AUTH_USERNAME=build-user AUTH_PASSWORD=build-password NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234 NEXTAUTH_URL=http://127.0.0.1:3000 npm run build`
  Resultado: passou fora do sandbox; o sandbox local causava panic do Turbopack por restrição de processo/porta.
- `rg -n 'FROM .* AS|USER |EXPOSE |standalone|AGENTS\.md|reference|models|\.agents/skills' Dockerfile`
  Resultado: encontrou os markers esperados de multi-stage, standalone, artefatos versionados, `USER nextjs` e `EXPOSE 3000`.
- `rg -n '(^|/)pkm/?$|(^|/)index/?$|^\.git$|^node_modules$|^\.next$|^\.env' .dockerignore`
  Resultado: confirmou exclusao de `pkm`, `index`, `.git`, `.next`, `node_modules` e `.env`.
- `rg -n '/data/pkm|/data/index|PKM_PATH|INDEX_PATH|PKM_HOST_PATH|INDEX_HOST_PATH|build:|ports:' compose.yaml .env.compose.example`
  Resultado: confirmou build local, portas e mounts/envs externos para `pkm` e `index`.
- `docker compose version`
  Resultado: indisponivel neste WSL (`docker` nao encontrado); limita a prova operacional local aqui, mas nao invalida o contrato versionado criado no repositorio.

## Issues Encountered

- `npm run build` sem envs explicitas passou a falhar por falta de `INDEX_PATH` em producao. Isso foi mantido como comportamento intencional do contrato, e o `Dockerfile` injeta envs minimas apenas no stage de build.
- O `npm run build` dentro do sandbox local bateu num panic do Turbopack relacionado a restricao de processo/porta. O mesmo build passou fora do sandbox.
- O ambiente atual nao possui `docker compose`, entao a validacao operacional real do container permanece como checkpoint posterior da fase.
- Os commits por tarefa permaneceram bloqueados pela politica do projeto.

## Next Phase Readiness

- A fase agora tem imagem distribuivel e contrato canonico de compose prontos para serem documentados em `07-03`.
- O checkpoint humano final pode se apoiar diretamente em `compose.yaml` e `.env.compose.example`.
- A principal lacuna remanescente e operacional: executar `docker compose build/up` num ambiente com Docker disponivel e validar login + leitura do acervo montado.

## Self-Check: PASSED

- `Dockerfile`, `.dockerignore`, `compose.yaml` e `.env.compose.example` existem.
- O build standalone passa com envs explicitas coerentes com o contrato de producao.
- `pkm` e `index` nao sao embutidos na imagem nem no contexto de build.

---
*Phase: 07-container-packaging-foundation*
*Completed: 2026-04-14*
