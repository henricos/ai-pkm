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
| **Checks de handoff** | coerencia entre `README.md`, guia de release, guia de desenvolvimento local e apontamentos permanentes do repositorio |
| **Observacao de ambiente** | O servidor atual e o Portainer real nao sao auditaveis neste ambiente; a fase valida o contrato documental que orienta essa operacao |

---

## Sampling Rate

- **Apos cada task documental:** rodar o `verify` automatizado do plano correspondente
- **Ao fechar a wave 1:** conferir coerencia interna do quickstart no `README.md`
- **Ao fechar a wave 2:** conferir handoff entre release, runtime canonico e desenvolvimento local
- **Gate estatico da fase:** `rg` de presenca e ausencia nas superfícies documentais principais
- **Checkpoint humano final:** leitura do fluxo documentado por um operador e confirmacao de que as instrucoes chegam ate a tela de login sem exigir conhecimento implícito do repo

---

## Per-Task Verification Map

| Task ID | Plano | Requisito | Threat Ref | Tipo | Comando / Evidencia | Status |
|---------|-------|-----------|------------|------|----------------------|--------|
| 09-01-T1 | 09-01 | DEP-01, DEP-03 | T-09-01, T-09-03 | docs+static | `rg -n 'ghcr.io/henricos/ai-pkm:latest|docker compose pull|docker compose up -d|/data/pkm|/data/index|tela de login' README.md` | ⬜ pending |
| 09-01-T2a | 09-01 | DEP-01, DEP-03 | T-09-02 | docs+static | `rg -n 'release-semver-ghcr\\.md|docker compose' README.md` | ⬜ pending |
| 09-01-T2b | 09-01 | DEP-03 | T-09-02 | negative-check | `! rg -n 'Portainer' README.md` | ⬜ pending |
| 09-01-T2c | 09-01 | DEP-03 | T-09-02 | negative-check | `! rg -n '\.env\.compose|env-file|smoke test|rollback|banco de dados|migracao.*banco|futuro banco' README.md` | ⬜ pending |
| 09-02-T1 | 09-02 | DEP-02, DEP-03 | T-09-04 | docs+static | `rg -n 'README\\.md|/fechar-versao|npm version patch\\|minor\\|major' docs/release-semver-ghcr.md && rg -n 'README\\.md' docs/dev-setup.md && rg -n 'docs/release-semver-ghcr\\.md|/fechar-versao' AGENTS.md` | ⬜ pending |
| 09-02-T2a | 09-02 | DEP-03 | T-09-05 | negative-check | `! test -e .env.compose.example && ! test -e docs/portainer-stack-update.md && ! test -e docs/docker-validation.md` | ⬜ pending |

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
| Reaplicar o compose no ambiente atual usando o quickstart revisado | DEP-02 | Depende do ambiente real do servidor atual, fora do ambiente de planning | Operador consegue usar o mesmo compose documentado sem depender de artefatos auxiliares como `.env.compose` |

---

## Resultado da Auditoria Nyquist

| Requisito | Testes automatizados | Evidencia complementar | Status |
|-----------|----------------------|------------------------|--------|
| DEP-01 | checks estaticos sobre `latest`, `docker compose pull` e ausencia de `git pull` no runtime documentado | leitura humana do guia confirma update por imagem publicada | ✅ PLANNED |
| DEP-02 | checks estaticos sobre binds externos e passada humana do quickstart revisado | operador do servidor confirma reaplicacao do mesmo compose | ✅ PLANNED |
| DEP-03 | checks de handoff entre README, release guide, dev guide e apontamentos permanentes | leitura humana confirma ausencia de sobreposicao/confusao entre docs | ✅ PLANNED |

**Gaps conhecidos no momento do planning:** a operacao real no servidor atual e a interface do Portainer nao podem ser validadas daqui; o planejamento cobre a fonte de verdade documental que orienta esse ambiente.  
**Waivers:** 0

---

## Validation Sign-Off

- [x] A fase possui `09-VALIDATION.md`
- [x] Todos os requisitos da fase possuem mapeamento para evidencias automatizadas ou checkpoint humano
- [x] O `RESEARCH.md` foi fechado com perguntas resolvidas
- [x] `nyquist_compliant: true` definido no frontmatter

**Aprovacao:** planned 2026-04-14
