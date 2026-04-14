---
phase: 07-container-packaging-foundation
plan: "03"
subsystem: documentation
status: complete
tags: [docker, documentation, runtime-contract, checkpoint]
dependency_graph:
  requires: [07-01, 07-02]
  provides:
    - guia-canonico-de-validacao-docker
    - contrato-documentado-de-refresh-externo
    - checkpoint-operacional-validado
  affects:
    - PKG-03
    - phase-08
tech_stack:
  added: []
  patterns:
    - documentacao-operacional-com-fluxo-compose-canonico
    - separacao-entre-dados-dinamicos-e-artefatos-versionados
    - validacao-http-programatica-com-sessao-autenticada
key_files:
  created:
    - docs/docker-validation.md
  modified:
    - README.md
    - docs/dev-setup.md
    - .env.compose.example
    - compose.yaml
    - src/lib/auth.ts
decisions:
  - O fluxo oficial de validacao do artefato Docker passa a ser `docker compose`, nao `docker run` ad hoc.
  - `pkm` e `index` permanecem dados dinamicos externos e precisam evoluir juntos enquanto `index` for dinamico.
  - A fase nao adiciona `healthcheck` enquanto nao existir endpoint seguro e desacoplado de auth/proxy.
  - O runtime de container declara `AUTH_TRUST_HOST=true` explicitamente para evitar falha de sessao em `localhost`.
metrics:
  duration: "~20 min"
  completed_date: "2026-04-14"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 5
---

# Phase 07 Plan 03: Documentação do runtime Docker e checkpoint final

**Status:** COMPLETE

**One-liner:** Guia canônico de validação Docker com `docker compose`, contrato explícito de refresh externo para `pkm` + `index` e checkpoint operacional fechado com sessão autenticada e leitura real do acervo montado.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Documentar o fluxo oficial de validacao Docker da fase | N/A — bloqueado por governanca de commit | `README.md`, `docs/dev-setup.md`, `docs/docker-validation.md` |
| 2 | Registrar o contrato de refresh externo futuro e o impacto para agentes | N/A — bloqueado por governanca de commit | `docs/docker-validation.md` |
| 3 | Executar o checkpoint operacional final do runtime replanejado | N/A — validado sem commit | `docs/docker-validation.md`, `.planning/phases/07-container-packaging-foundation/07-VALIDATION.md` |

## What Was Built

### Task 1 — Guia oficial da validacao Docker

- Criei `docs/docker-validation.md` como roteiro canônico da fase para preparar env local, validar `PKM_HOST_PATH` + `INDEX_HOST_PATH`, executar `docker compose config`, `docker compose build web` e `docker compose up -d web`.
- Atualizei `README.md` para apontar para o novo guia e remover a orientação antiga baseada em `docker run` ad hoc.
- Ajustei `docs/dev-setup.md` para separar explicitamente `npm run dev` do runtime empacotado validado por compose.

### Task 2 — Contrato de refresh externo e impacto futuro

- Documentei que `pkm` e `index` continuam fora da imagem como dados dinâmicos de runtime.
- Registrei que `models`, `reference`, `.agents/skills` e `AGENTS.md` seguem versionados dentro da release.
- Explicitei que o primeiro refresh operacional deve acontecer fora da UI web e fora do processo principal do container, atualizando `pkm` e `index` em conjunto.

### Task 3 — Checkpoint operacional validado

- Build da imagem local concluído com sucesso via `docker compose build web`.
- Serviço `web` subiu e permaneceu `Up` em `0.0.0.0:3000->3000/tcp`.
- Sessão anônima validada como `null`.
- Login HTTP validado com sucesso usando as credenciais do runtime.
- Rota protegida `GET /api/pkm/topics` respondeu com tópicos reais do acervo montado externamente.

## Verification

- `rg -n 'docker compose|docs/docker-validation|INDEX_HOST_PATH|PKM_HOST_PATH|npm run dev|healthcheck' README.md docs/dev-setup.md docs/docker-validation.md`
  Resultado: passou; confirmou fluxo compose, docs de referência e separação entre dev local e runtime container.
- `rg -n 'refresh externo|index|pkm|models|reference|\\.agents/skills|AGENTS\\.md' docs/docker-validation.md`
  Resultado: passou; confirmou contrato de refresh externo e separação entre artefatos dinâmicos e versionados.
- `test -f docs/docker-validation.md && test -f .planning/phases/07-container-packaging-foundation/07-VALIDATION.md && rg -n 'docker compose config|docker compose build|docker compose up|/data/pkm|/data/index' docs/docker-validation.md .planning/phases/07-container-packaging-foundation/07-VALIDATION.md`
  Resultado: passou; o roteiro do checkpoint contém os comandos e mounts canônicos.
- `docker compose --env-file /tmp/ai-pkm-compose.env config`
  Resultado: passou; mounts resolvidos para `/data/pkm` e `/data/index`, com `PKM_PATH` e `INDEX_PATH` coerentes.
- `docker compose --env-file /tmp/ai-pkm-compose.env build web`
  Resultado: passou; imagem `ai-pkm:local` reconstruída com sucesso.
- `docker compose --env-file /tmp/ai-pkm-compose.env up -d --force-recreate web`
  Resultado: passou; container recriado e iniciado com sucesso.
- `docker compose --env-file /tmp/ai-pkm-compose.env ps`
  Resultado: `ai-pkm-web-1` em estado `Up`.
- `curl -s -c /tmp/ai-pkm.cookies http://127.0.0.1:3000/api/auth/csrf`
  Resultado: retornou `csrfToken`.
- `curl -s http://127.0.0.1:3000/api/auth/session`
  Resultado: `null` antes do login.
- `curl -s -b /tmp/ai-pkm.cookies -c /tmp/ai-pkm.cookies -X POST http://127.0.0.1:3000/api/auth/callback/credentials ...`
  Resultado: login concluído com sucesso.
- `curl -s -b /tmp/ai-pkm.cookies http://127.0.0.1:3000/api/auth/session`
  Resultado: sessão autenticada para o usuário `codex`.
- `curl -s -b /tmp/ai-pkm.cookies http://127.0.0.1:3000/api/pkm/topics`
  Resultado: retornou tópicos reais (`saude`, `carreira`, `desenvolvimento-pessoal`, `tecnologia`, `cultura`) a partir do acervo montado.

## Issues Encountered

- O primeiro runtime do container subiu com erro de Auth.js: `Host must be trusted` ao acessar `/api/auth/session`.
- Corrigi em dois níveis para estabilizar o contrato empacotado:
  - `trustHost: true` em `src/lib/auth.ts`
  - `AUTH_TRUST_HOST=true` explícito no `compose.yaml` e na documentação/env de compose
- `curl` com `GET` para `127.0.0.1` falhava dentro do sandbox, mas os mesmos endpoints responderam normalmente fora dele. O checkpoint HTTP final foi executado fora do sandbox para evitar falso negativo de ambiente.

## Deviations from Plan

### Auto-fixed Issues

**1. Runtime container exigia trust host explícito para o Auth.js**
- **Found during:** Task 3
- **Issue:** o serviço subia, mas a criação/leitura de sessão falhava em `localhost` com `Host must be trusted`.
- **Fix:** adição de `trustHost: true` em `src/lib/auth.ts` e `AUTH_TRUST_HOST=true` no contrato do compose/documentação.
- **Files modified:** `src/lib/auth.ts`, `compose.yaml`, `.env.compose.example`, `docs/docker-validation.md`
- **Verification:** rebuild do container + login HTTP + chamada autenticada de `/api/pkm/topics`

## Commit Governance

- Os commits por tarefa não foram executados.
- O bloqueio vem do `AGENTS.md`: este repositório proíbe commits automáticos e exige aprovação explícita do operador com uso da skill `/commit-push`.

## Self-Check: PASSED

- [x] `docs/docker-validation.md` — FOUND
- [x] `README.md` atualizado para apontar ao guia canônico — FOUND
- [x] `docs/dev-setup.md` atualizado para separar dev local de runtime container — FOUND
- [x] checkpoint operacional concluído com imagem buildada, container `Up`, sessão autenticada e rota protegida respondendo — FOUND

---
*Phase: 07-container-packaging-foundation*
*Completed: 2026-04-14*
