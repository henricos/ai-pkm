# Roadmap: ai-pkm

## Milestones

- [x] `v2.0` — Web viewer read-only do PKM entregue em 2026-04-13 com 6 fases e 22 planos. Arquivo completo: `.planning/milestones/v2.0-ROADMAP.md`
- [ ] `v2.1` — Release e publicacao operacional da aplicacao via Docker, GitHub Actions, GHCR e Portainer. Fases 7-9.

## Current Milestone: v2.1

**Status:** Definido em 2026-04-13
**Phases:** 7-9
**Total Requirements:** 13

## Overview

O milestone `v2.1` fecha o primeiro fluxo operacional completo de release da aplicacao web. O foco sai da experiencia de leitura entregue na `v2.0` e passa a ser versionar o app, empacotar a web em container Docker, publicar a imagem no GHCR e tornar o redeploy no servidor atual previsivel e rastreavel, sempre mantendo o `pkm` privado fora da imagem.

## Phases

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
- [ ] 09-01-PLAN.md — Publicar o guia canônico de deploy/update por `docker compose` e simplificar o README
- [ ] 09-02-PLAN.md — Reconciliar release, validação local e reaplicação do stack atual via Portainer

**Details:**

- **Requirements**: DEP-01, DEP-02, DEP-03
- **Success Criteria**:
  1. O servidor atual consegue consumir a nova imagem publicada sem depender de `git pull` dentro do runtime.
  2. O redeploy feito no Portainer mantem o mesmo volume do `pkm` e a configuracao externa necessaria para a aplicacao.
  3. O repositorio documenta de forma objetiva como fechar versao, publicar imagem e executar o redeploy operacional no ambiente atual.

## Milestone Summary

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
