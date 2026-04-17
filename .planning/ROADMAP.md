# Roadmap: ai-pkm

## Milestones

- [x] `v2.0` — Web viewer read-only do PKM entregue em 2026-04-13 com 6 fases e 22 planos. Arquivo completo: `.planning/milestones/v2.0-ROADMAP.md`
- [x] `v2.1` — Release e publicacao operacional da aplicacao via Docker, GitHub Actions, GHCR e Portainer. Fases 7-9. Encerrado em 2026-04-16. Arquivo: `.planning/milestones/v2.1-ROADMAP.md`
- [ ] `v2.2` — Base path configurado com sincronia app/auth. Fases 10-12.

## Current Milestone: v2.2

**Status:** Definido em 2026-04-16
**Phases:** 10-12
**Total Requirements:** 13

## Overview

O milestone `v2.2` torna a aplicacao genuinamente consciente do prefixo de rota `/pkm`. O `basePath` do Next.js passa a ser configurado a partir de `APP_BASE_PATH`, baked no build via `--build-arg` no workflow do GitHub Actions. Um contrato de ambiente explicito garante que `APP_BASE_PATH` e `NEXTAUTH_URL` estejam presentes e sincronizados no startup, com falha cedo e mensagem clara. Todos os hardcodes de `/` no codigo da aplicacao sao substituidos pelo prefixo configurado. Testes cobrem o contrato de ambiente e o comportamento das rotas com prefixo. Documentacao operacional cobre os 3 lugares de configuracao sem depender de conhecimento implicito.

## Phases

- [x] **Phase 10: Environment Contract and Build Foundation** — Contrato de ambiente validado e `basePath` configurado no framework e no pipeline de build. (completed 2026-04-17)
- [x] **Phase 11: Application Code Alignment** — Todos os pontos do codigo que referenciam rotas absolutas usam o prefixo configurado. (completed 2026-04-17)
- [ ] **Phase 12: Tests and Operational Documentation** — Testes cobrem o contrato de ambiente e as rotas com prefixo; documentacao cobre o setup completo.

## Phase Details

### Phase 10: Environment Contract and Build Foundation

**Goal**: O contrato de ambiente esta validado, o `basePath` do Next.js e configurado a partir de `APP_BASE_PATH`, o valor e baked no build pelo workflow e existe um helper central para URLs absolutas server-side.
**Depends on**: Phase 9
**Requirements**: ENV-01, ENV-02, ENV-03, CFG-01, CFG-02, CFG-03
**Success Criteria** (what must be TRUE):
  1. A aplicacao recusa subir com mensagem clara se `APP_BASE_PATH` ou `NEXTAUTH_URL` estiverem ausentes ou sem sincronia de pathname.
  2. O `next.config.ts` referencia `APP_BASE_PATH` como fonte do `basePath`, sem valor hardcoded no arquivo de config.
  3. O step de `docker build` no `release.yml` passa `--build-arg APP_BASE_PATH=/pkm` de forma visivel no codigo do workflow.
  4. Existe `withBasePath()` utilizavel para construcao de URLs absolutas e redirects server-side onde o Next.js nao aplica o prefixo automaticamente.
**Plans**: 3 plans

Plans:
- [x] 10-01-PLAN.md — Definir o módulo canônico de base path sem tocar nos consumers da aplicação
- [x] 10-02-PLAN.md — Fechar o contrato fail-fast de ambiente para `APP_BASE_PATH` e `NEXTAUTH_URL`
- [x] 10-03-PLAN.md — Propagar `APP_BASE_PATH` pela cadeia workflow → Dockerfile → Next.js build

### Phase 11: Application Code Alignment

**Goal**: Todos os redirects, hrefs e rotas absolutas hardcoded no codigo da aplicacao passam a usar o prefixo configurado via `withBasePath()` ou construcao relativa correta.
**Depends on**: Phase 10
**Requirements**: APP-01, APP-02, APP-03
**Success Criteria** (what must be TRUE):
  1. Acessar `localhost:3000/pkm` em dev exibe o shell autenticado corretamente; a raiz `localhost:3000/` retorna 404.
  2. Tentativa de acesso nao autenticado redireciona para `/pkm/login`, nao para `/login`.
  3. Apos login, o usuario e redirecionado para `/pkm`, nao para `/`.
  4. Links de preview e download de arquivos no viewer funcionam com o prefixo correto.
**Plans**: 3 plans

Plans:
- [x] 11-01-PLAN.md — Corrigir redirects server-side em ShellLayout e LoginPage (APP-01)
- [x] 11-02-PLAN.md — Corrigir pages.signIn do NextAuth e fallback de callbackUrl no LoginForm (APP-02)
- [x] 11-03-PLAN.md — Corrigir URLs de preview e download no viewer (APP-03)

### Phase 12: Tests and Operational Documentation

**Goal**: Testes verificam o contrato de ambiente e o comportamento das rotas com prefixo; documentacao operacional cobre o contrato dos 3 lugares de configuracao sem depender de conhecimento implicito.
**Depends on**: Phase 11
**Requirements**: TST-01, TST-02, DOC-01, DOC-02
**Success Criteria** (what must be TRUE):
  1. A suite de testes falha explicitamente se `APP_BASE_PATH` ou `NEXTAUTH_URL` estiverem ausentes ou divergentes, e passa quando estao sincronizados.
  2. Testes de rota cobrem os fluxos de acesso nao autenticado, login e navegacao autenticada com o prefixo `/pkm`.
  3. `docs/dev-setup.md` explica como configurar `APP_BASE_PATH` no `.env` com exemplos concretos, incluindo nota de que a raiz retorna 404.
  4. `README.md` documenta os 3 lugares de configuracao (`.env`, workflow, compose) com exemplos e nota de que mudar o path exige nova release.
**Plans**: TBD

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 10. Environment Contract and Build Foundation | 3/3 | Complete    | 2026-04-17 |
| 11. Application Code Alignment | 3/3 | Complete   | 2026-04-17 |
| 12. Tests and Operational Documentation | 0/TBD | Not started | - |

---

## Previous Milestone: v2.1

**Status:** Encerrado em 2026-04-16
**Phases:** 7-9
**Total Requirements:** 13
**Archive:** `.planning/milestones/v2.1-ROADMAP.md`

### Phase 7: Container Packaging Foundation

**Goal**: Aplicacao pode ser empacotada e validada como container Docker reproduzivel, preservando configuracao externa e montagem do `pkm`.
**Depends on**: Phase 6
**Plans**: 3 plans (expected)

**Details:**

- **Requirements**: PKG-01, PKG-02, PKG-03
- **Success Criteria**:
  1. Existe um Dockerfile funcional para a aplicacao web, produzindo imagem distribuivel sem carregar o conteudo do `pkm`.
  2. O container sobe com configuracao externa e enxerga o `pkm` apenas por path/volume montado, mantendo o mesmo modelo read-only da `v2.0`.
  3. Ha um fluxo simples e documentado para validar localmente a imagem antes de qualquer release publicada.

### Phase 8: SemVer Release Pipeline

**Goal**: Operador consegue fechar uma release SemVer e disparar automaticamente o build e a publicacao da imagem no GHCR por tag Git.
**Depends on**: Phase 7
**Plans**: 3 plans (expected)

Plans:
- [x] 08-01-PLAN.md — Fixar o contrato de rastreabilidade SemVer no build e na UI
- [x] 08-02-PLAN.md — Publicar a imagem canônica por tag Git no GitHub Actions e GHCR
- [x] 08-03-PLAN.md — Documentar o checklist operacional de release e validar a cadeia externa

**Details:**

- **Requirements**: VER-01, VER-02, VER-03, PUB-01, PUB-02, PUB-03, PUB-04
- **Status**: concluida em 2026-04-14 com release real `v2.0.2`, workflow `Release GHCR` e pacote publico no GHCR
- **Success Criteria**:
  1. O projeto passa a ter um fluxo de release coerente com SemVer completo do app Node/web.
  2. `npm version` produz o bump de versao esperado e gera os artefatos Git necessarios para a release.
  3. Um push de tag de release dispara workflow no GitHub Actions que builda a imagem em runner Ubuntu hospedado pelo GitHub.
  4. A imagem resultante e publicada no GHCR como publica, com tag imutavel `vX.Y.Z` e ponteiro `latest`.
  5. Cada release fica rastreavel entre versao do app, tag Git e imagem publicada.

### Phase 9: Portainer Deployment Flow

**Goal**: Operacao de update no servidor atual fica simples, documentada e preserva os acoplamentos corretos entre imagem publica, configuracao externa e volume do `pkm`.
**Depends on**: Phase 8
**Plans**: 2 plans (expected)

Plans:
- [x] 09-01-PLAN.md — Publicar o guia canônico de deploy/update por `docker compose` e simplificar o README
- [x] 09-02-PLAN.md — Reconciliar release, validação local e reaplicação do stack atual via Portainer

**Details:**

- **Requirements**: DEP-01, DEP-02, DEP-03
- **Status**: concluida em 2026-04-16 com quickstart revisado, guia canônico de runtime e validação humana confirmada no ambiente real
- **Success Criteria**:
  1. O servidor atual consegue consumir a nova imagem publicada sem depender de `git pull` dentro do runtime.
  2. O redeploy feito no Portainer mantem o mesmo volume do `pkm` e a configuracao externa necessaria para a aplicacao.
  3. O repositorio documenta de forma objetiva como fechar versao, publicar imagem e executar o redeploy operacional no ambiente atual.

### v2.1 Milestone Summary

**Key Decisions:**

- Distribuir a aplicacao como imagem Docker, nao como checkout Git no servidor.
- Manter o `pkm` em repositorio privado separado e sempre montado por volume/path externo.
- Tratar `npm version` como mecanismo oficial de bump, commit e tag de release.
- Publicar imagem publica no GHCR com tags `vX.Y.Z` e `latest`.
- Operar o deploy atual por pull da imagem e redeploy manual no Portainer.

**Issues Deferred:**

- Deploy remoto totalmente automatizado a partir do CI.
- Estrategias mais sofisticadas de canais de release alem de `latest`.
- Orquestracao para ambientes futuros fora do servidor caseiro atual.

**Technical Debt to Watch:**

- O projeto ainda usa `next-auth` beta na base atual; pipeline de release precisa preservar rastreabilidade suficiente para upgrades futuros.
- O fluxo inicial de deploy depende de operacao manual no Portainer, o que simplifica agora mas limita automacao futura.
- O recovery path de `npm version` em ambiente sandboxed continua sendo uma excecao operacional do agente, nao parte do fluxo canonico do operador.
