---
phase: "07"
slug: container-packaging-foundation
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-13
---

# Phase 07 — Validation Strategy

> Contrato de validacao da fase de empacotamento Docker, amarrando checks de arquivo, build da app e smoke operacional do container.

---

## Test Infrastructure

| Propriedade | Valor |
|-------------|-------|
| **Framework** | Vitest 3.x + jsdom |
| **Config file** | `vitest.config.ts` |
| **Comando rapido** | `npm test` |
| **Checks base da fase** | `npm test`, `npm run typecheck`, `npm run build` |
| **Smoke Docker canonico** | `docker compose config`, `docker compose build web`, `docker compose up -d web`, `docker compose ps` |
| **Observacao de ambiente** | Docker e Compose nao estao disponiveis no ambiente atual de planejamento; os smokes permanecem como gate operacional da execucao da fase |

---

## Sampling Rate

- **Apos cada task de codigo/config:** rodar o verify automatizado definido no plano correspondente
- **Ao fechar a wave 1-2:** `npm test && npm run typecheck`
- **Gate operacional da fase:** `npm test && npm run typecheck && npm run build && docker compose config && docker compose build web && docker compose up -d web && docker compose ps`
- **Checkpoint humano final:** login real na aplicacao + confirmacao de leitura do `pkm` montado em `/data/pkm`

---

## Per-Task Verification Map

| Task ID | Plano | Requisito | Threat Ref | Tipo | Comando / Evidencia | Status |
|---------|-------|-----------|------------|------|----------------------|--------|
| 07-01-T1 | 07-01 | PKG-01 | T-07-03, T-07-04 | build | `npm run build` | ⬜ pending |
| 07-01-T2 | 07-01 | PKG-01 | T-07-01, T-07-02 | static | `rg -n 'FROM .* AS|USER |EXPOSE |COPY .*index|npm ci|server\\.js' Dockerfile && rg -n '(^|/)pkm/?$|^\\.git$|^node_modules$|^\\.next$|^\\.env\\.local$' .dockerignore` | ⬜ pending |
| 07-02-T1 | 07-02 | PKG-02, PKG-03 | T-07-05, T-07-06 | static | `rg -n '/data/pkm|PKM_PATH|PKM_HOST_PATH|:ro|ports:|build:' compose.yaml && rg -n 'PKM_HOST_PATH|AUTH_USERNAME|AUTH_PASSWORD|NEXTAUTH_SECRET|NEXTAUTH_URL' .env.compose.example` | ⬜ pending |
| 07-02-T2 | 07-02 | PKG-02 | T-07-07, T-07-08 | static | `if rg -n 'entrypoint:|command:|healthcheck:|docker run' compose.yaml; then exit 1; else exit 0; fi` | ⬜ pending |
| 07-03-T1 | 07-03 | PKG-03 | T-07-10, T-07-11 | docs | `rg -n 'docker compose|docs/docker-validation|npm run dev|healthcheck|path externo|pkm/' README.md docs/dev-setup.md docs/docker-validation.md` | ⬜ pending |
| 07-03-T2 | 07-03 | PKG-03 | T-07-09 | docs/audit | `rg -n 'D-09|path externo|pkm/' .planning/phases/07-container-packaging-foundation/07-CONTEXT.md && rg -n 'path externo|pkm/' docs/docker-validation.md` | ⬜ pending |
| 07-03-T3 | 07-03 | PKG-01, PKG-03 | T-07-09, T-07-10 | manual+smoke | `docs/docker-validation.md` + `docker compose config && docker compose build web && docker compose up -d web && docker compose ps` | ⬜ pending |

*Status: ⬜ pending · ✅ green*

---

## Wave 0 Requirements

Arquivos e contratos que precisam existir antes do gate Docker:

- [ ] `Dockerfile` — imagem multi-stage com runtime standalone nao-root
- [ ] `.dockerignore` — contexto de build sem `pkm/` nem lixo local
- [ ] `compose.yaml` — runtime canonico com bind mount externo em `/data/pkm`
- [ ] `.env.compose.example` — template minimo para o compose
- [x] `07-VALIDATION.md` — contrato Nyquist da fase

---

## Manual-Only Verification

| Comportamento | Requisito | Por que manual | Encerramento esperado |
|---------------|-----------|----------------|------------------------|
| Login real no container distribuivel | PKG-03 | Envolve browser real, auth e bootstrap completo do runtime | Operador confirma acesso em `http://localhost:3000` |
| Leitura do `pkm` montado externamente | PKG-02, PKG-03 | Depende de bind mount real do host; nao ha substituto equivalente neste ambiente | Operador confirma navegacao do acervo sem erro de `PKM_PATH` |
| Prova operacional final do artefato Docker | PKG-01, PKG-03 | Docker nao esta disponivel no ambiente de planejamento | Checkpoint humano do plano `07-03` encerra a fase |

---

## Resultado da Auditoria Nyquist

| Requisito | Testes automatizados | Evidencia complementar | Status |
|-----------|----------------------|------------------------|--------|
| PKG-01 | `npm run build`, verificacoes de `Dockerfile`/`.dockerignore` | `docker compose build web` no checkpoint operacional | ✅ PLANNED |
| PKG-02 | verificacoes de `compose.yaml` e `.env.compose.example` | `docker compose up -d web` + bind mount real em `/data/pkm` | ✅ PLANNED |
| PKG-03 | verificacoes de documentacao e contrato compose | checkpoint humano com login real e leitura do acervo | ✅ PLANNED |

**Gaps conhecidos no momento do planning:** Docker/Compose indisponiveis no ambiente atual; cobertura operacional sera executada na fase, nao durante a revisao de planning.
**Waivers:** 0

---

## Validation Sign-Off

- [x] A fase agora possui `07-VALIDATION.md`
- [x] Todos os planos apontam para evidencias automatizadas ou checkpoint humano documentado
- [x] PKG-01, PKG-02 e PKG-03 possuem mapeamento para comandos/evidencias
- [x] O checkpoint manual final e a prova operacional de PKG-01 e PKG-03
- [x] `nyquist_compliant: true` definido no frontmatter

**Aprovacao:** planned 2026-04-13
