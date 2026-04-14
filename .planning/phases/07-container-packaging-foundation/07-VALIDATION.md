---
phase: "07"
slug: container-packaging-foundation
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-14
---

# Phase 07 - Validation Strategy

> Contrato de validacao da fase replanejada de empacotamento Docker, agora cobrindo separacao entre artefatos versionados e dados dinamicos de runtime.

---

## Test Infrastructure

| Propriedade | Valor |
|-------------|-------|
| **Framework** | Vitest 3.x + jsdom |
| **Config file** | `vitest.config.ts` |
| **Checks base da fase** | `npm test`, `npm run typecheck`, `npm run build` |
| **Smoke Docker canonico** | `docker compose config`, `docker compose build web`, `docker compose up -d web`, `docker compose ps` |
| **Observacao de ambiente** | Docker e Compose nao estao disponiveis no ambiente atual de planning; os smokes permanecem como gate operacional da execucao |

---

## Sampling Rate

- **Apos cada task de codigo/config:** rodar o verify automatizado definido no plano correspondente
- **Ao fechar a wave 1:** `npm test && npm run typecheck`
- **Ao fechar a wave 2:** `npm run build`
- **Gate operacional da fase:** `npm test && npm run typecheck && npm run build && docker compose config && docker compose build web && docker compose up -d web && docker compose ps`
- **Checkpoint humano final:** login real na aplicacao + confirmacao de leitura do `pkm` e do `index` montados externamente

---

## Per-Task Verification Map

| Task ID | Plano | Requisito | Threat Ref | Tipo | Comando / Evidencia | Status |
|---------|-------|-----------|------------|------|----------------------|--------|
| 07-01-T1 | 07-01 | PKG-01, PKG-02 | T-07-01, T-07-02 | typecheck | `npm run typecheck` | ⬜ pending |
| 07-01-T2 | 07-01 | PKG-01, PKG-02 | T-07-01, T-07-03 | test+static | `npm run test && npm run typecheck` | ⬜ pending |
| 07-01-G1 | 07-01 | PKG-02 | T-07-01 | static | `rg -n 'process\\.cwd\\(\\).*index|path\\.join\\(process\\.cwd\\(\\), \"index\"\\)' src/lib` deve voltar vazio ou apenas ocorrencias justificadas no novo modulo central | ⬜ pending |
| 07-02-T1 | 07-02 | PKG-01 | T-07-04, T-07-06 | build | `npm run build` | ⬜ pending |
| 07-02-T2 | 07-02 | PKG-01, PKG-02, PKG-03 | T-07-04, T-07-05, T-07-07 | static | `rg -n '/data/pkm|/data/index|PKM_PATH|INDEX_PATH|PKM_HOST_PATH|INDEX_HOST_PATH' compose.yaml .env.compose.example` | ⬜ pending |
| 07-02-G1 | 07-02 | PKG-01 | T-07-04 | static | `rg -n '(^|/)pkm/?$|(^|/)index/?$|^\\.git$|^node_modules$|^\\.next$|^\\.env' .dockerignore` | ⬜ pending |
| 07-03-T1 | 07-03 | PKG-03 | T-07-09, T-07-10 | docs | `rg -n 'docker compose|docs/docker-validation|INDEX_HOST_PATH|PKM_HOST_PATH|npm run dev|healthcheck' README.md docs/dev-setup.md docs/docker-validation.md` | ⬜ pending |
| 07-03-T2 | 07-03 | PKG-03 | T-07-09 | docs/audit | `rg -n 'refresh externo|index|pkm|models|reference|\\.agents/skills|AGENTS\\.md' docs/docker-validation.md` | ⬜ pending |
| 07-03-T3 | 07-03 | PKG-01, PKG-02, PKG-03 | T-07-08, T-07-09 | manual+smoke | `docs/docker-validation.md` + `docker compose config && docker compose build web && docker compose up -d web && docker compose ps` | ⬜ pending |

*Status: ⬜ pending · ✅ green*

---

## Wave 0 Requirements

Arquivos e contratos que precisam existir antes do gate Docker:

- [ ] `src/lib/runtime-paths.ts` - contrato central de resolucao de paths
- [ ] `Dockerfile` - imagem multi-stage com runtime standalone nao-root
- [ ] `.dockerignore` - contexto de build sem `pkm/` nem `index/`
- [ ] `compose.yaml` - runtime canonico com mounts externos para `pkm` e `index`
- [ ] `.env.compose.example` - template minimo para o compose
- [x] `07-VALIDATION.md` - contrato Nyquist da fase

---

## Manual-Only Verification

| Comportamento | Requisito | Por que manual | Encerramento esperado |
|---------------|-----------|----------------|------------------------|
| Login real no container distribuivel | PKG-03 | Envolve browser real, auth e bootstrap completo do runtime | Operador confirma acesso em `http://localhost:3000` |
| Leitura do `pkm` montado externamente | PKG-02, PKG-03 | Depende de bind mount real do host | Operador confirma navegacao do acervo sem erro de `PKM_PATH` |
| Leitura coerente do `index` externo | PKG-02, PKG-03 | Precisa provar que `index` nao foi cristalizado na imagem | Operador confirma ausencia de erro de indices e comportamento coerente com os mounts |
| Prova operacional final do artefato Docker | PKG-01, PKG-03 | Docker nao esta disponivel no ambiente de planning | Checkpoint humano do plano `07-03` encerra a fase |

---

## Resultado da Auditoria Nyquist

| Requisito | Testes automatizados | Evidencia complementar | Status |
|-----------|----------------------|------------------------|--------|
| PKG-01 | `npm run build`, verificacoes de `Dockerfile` e `.dockerignore` | `docker compose build web` no checkpoint operacional | ✅ PLANNED |
| PKG-02 | verificacoes de paths centrais + `compose.yaml` | mounts reais de `pkm` e `index` em `docker compose up` | ✅ PLANNED |
| PKG-03 | verificacoes de documentacao e contrato compose | checkpoint humano com login real e leitura do acervo | ✅ PLANNED |

**Gaps conhecidos no momento do planning:** Docker/Compose indisponiveis no ambiente atual; cobertura operacional sera executada na fase, nao durante a revisao de planning.  
**Waivers:** 0

---

## Validation Sign-Off

- [x] A fase possui `07-VALIDATION.md` replanejado
- [x] Todos os planos apontam para evidencias automatizadas ou checkpoint humano documentado
- [x] PKG-01, PKG-02 e PKG-03 possuem mapeamento para comandos/evidencias
- [x] O checkpoint manual final cobre `pkm` e `index` externos
- [x] `nyquist_compliant: true` definido no frontmatter

**Aprovacao:** planned 2026-04-14
