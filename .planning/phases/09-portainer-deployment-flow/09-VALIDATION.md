---
phase: "09"
slug: portainer-deployment-flow
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-14
---

# Phase 09 - Validation Strategy

> Contrato de validacao da fase de deploy/update operacional por imagem publicada, com `docker compose` como superficie canonica e Portainer como adaptador do mesmo compose.

---

## Test Infrastructure

| Propriedade | Valor |
|-------------|-------|
| **Framework** | Verificacoes estaticas de repo + auditoria documental |
| **Config file** | N/A |
| **Checks base da fase** | `rg`, leitura dirigida de docs e consistencia entre artefatos |
| **Checks de handoff** | coerencia entre `README.md`, guia de deploy, guia de release, guia de validacao local e guia de Portainer |
| **Observacao de ambiente** | O servidor atual e o Portainer real nao sao auditaveis neste ambiente; a fase valida o contrato documental que orienta essa operacao |

---

## Sampling Rate

- **Apos cada task documental:** rodar o `verify` automatizado do plano correspondente
- **Ao fechar a wave 1:** conferir coerencia entre `README.md` e `docs/deploy-compose-ghcr.md`
- **Ao fechar a wave 2:** conferir handoff entre release, deploy canonico, validacao local e Portainer
- **Gate estatico da fase:** `rg` de presenca e ausencia nas superfícies documentais principais
- **Checkpoint humano final:** leitura do fluxo documentado por um operador e confirmacao de que as instrucoes chegam ate a tela de login sem exigir conhecimento implícito do repo

---

## Per-Task Verification Map

| Task ID | Plano | Requisito | Threat Ref | Tipo | Comando / Evidencia | Status |
|---------|-------|-----------|------------|------|----------------------|--------|
| 09-01-T1 | 09-01 | DEP-01, DEP-03 | T-09-01, T-09-03 | docs+static | `rg -n 'ghcr.io/henricos/ai-pkm:latest|docker compose pull|docker compose up -d|PKM_HOST_PATH|INDEX_HOST_PATH|/data/pkm|/data/index|tela de login' docs/deploy-compose-ghcr.md` | ⬜ pending |
| 09-01-T2a | 09-01 | DEP-01, DEP-03 | T-09-02 | docs+static | `rg -n 'deploy-compose-ghcr\\.md|release-semver-ghcr\\.md|docker compose' README.md` | ⬜ pending |
| 09-01-T2b | 09-01 | DEP-03 | T-09-02 | negative-check | `! rg -n 'Portainer' README.md` | ⬜ pending |
| 09-01-T2c | 09-01 | DEP-03 | T-09-02 | negative-check | `! rg -n 'smoke test|rollback|banco de dados|migracao.*banco|futuro banco' README.md docs/deploy-compose-ghcr.md` | ⬜ pending |
| 09-02-T1 | 09-02 | DEP-02, DEP-03 | T-09-04 | docs+static | `rg -n 'ghcr.io/henricos/ai-pkm:latest|Portainer|PKM_HOST_PATH|INDEX_HOST_PATH|deploy-compose-ghcr\\.md' docs/portainer-stack-update.md` | ⬜ pending |
| 09-02-T2a | 09-02 | DEP-03 | T-09-05 | docs+static | `rg -n 'deploy-compose-ghcr\\.md' docs/release-semver-ghcr.md` | ⬜ pending |
| 09-02-T2b | 09-02 | DEP-03 | T-09-06 | docs+static | `rg -n 'validar localmente|Phase 7|imagem local|não o fluxo de desenvolvimento' docs/docker-validation.md` | ⬜ pending |
| 09-02-T2c | 09-02 | DEP-03 | T-09-06 | negative-check | `! rg -n 'guia de deploy do servidor|servidor atual.*docker-validation|Portainer' docs/docker-validation.md` | ⬜ pending |

*Status: ⬜ pending · ✅ green*

---

## Wave 0 Requirements

Arquivos e contratos que precisam existir antes da execucao da fase:

- [x] `09-CONTEXT.md` - decisoes travadas da fase
- [x] `09-RESEARCH.md` - pesquisa com perguntas abertas resolvidas
- [x] `09-01-PLAN.md` - quickstart publico + guia canonico por compose
- [x] `09-02-PLAN.md` - ponte operacional para Portainer e reconciliacao dos docs existentes
- [x] `09-VALIDATION.md` - contrato Nyquist da fase

---

## Manual-Only Verification

| Comportamento | Requisito | Por que manual | Encerramento esperado |
|---------------|-----------|----------------|------------------------|
| Entender o fluxo minimo de install/update sem depender de conhecimento previo do repo | DEP-01, DEP-03 | Exige leitura humana do quickstart e do guia canônico | Operador consegue seguir a narrativa ate a tela de login |
| Reaplicar o compose no ambiente atual via Portainer | DEP-02 | Depende do Portainer real do servidor atual, fora do ambiente de planning | Operador encontra uma ponte curta que reaproveita o mesmo compose e as mesmas env vars |

---

## Resultado da Auditoria Nyquist

| Requisito | Testes automatizados | Evidencia complementar | Status |
|-----------|----------------------|------------------------|--------|
| DEP-01 | checks estaticos sobre `latest`, `docker compose pull` e ausencia de `git pull` no runtime documentado | leitura humana do guia confirma update por imagem publicada | ✅ PLANNED |
| DEP-02 | checks estaticos sobre binds externos e guia curto de Portainer derivado do compose | operador do servidor confirma reaplicacao do mesmo compose | ✅ PLANNED |
| DEP-03 | checks de handoff entre README, guia de deploy, release guide e validation guide | leitura humana confirma ausencia de sobreposicao/confusao entre docs | ✅ PLANNED |

**Gaps conhecidos no momento do planning:** a operacao real no servidor atual e a interface do Portainer nao podem ser validadas daqui; o planejamento cobre a fonte de verdade documental que orienta esse ambiente.  
**Waivers:** 0

---

## Validation Sign-Off

- [x] A fase possui `09-VALIDATION.md`
- [x] Todos os requisitos da fase possuem mapeamento para evidencias automatizadas ou checkpoint humano
- [x] O `RESEARCH.md` foi fechado com perguntas resolvidas
- [x] `nyquist_compliant: true` definido no frontmatter

**Aprovacao:** planned 2026-04-14
