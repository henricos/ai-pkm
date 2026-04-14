---
phase: "08"
slug: semver-release-pipeline
status: planned
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-14
---

# Phase 08 - Validation Strategy

> Contrato de validacao da fase de release SemVer e publicacao no GHCR.

---

## Test Infrastructure

| Propriedade | Valor |
|-------------|-------|
| **Framework** | Vitest 3.x + verificacoes estaticas de repo |
| **Config file** | `vitest.config.ts` |
| **Checks base da fase** | `npm test`, `npm run typecheck`, `npm run build` |
| **Checks de CI/config** | `rg` em `package.json`, `Dockerfile`, `next.config.ts`, docs e workflow de release |
| **Observacao de ambiente** | GitHub Actions e GHCR nao sao executaveis no ambiente atual de planning; a validacao externa fica como checkpoint operacional |

---

## Sampling Rate

- **Apos cada task de codigo/config:** rodar o verify automatizado definido no plano correspondente
- **Ao fechar a wave de governanca local:** `npm test && npm run typecheck`
- **Ao fechar a wave de pipeline:** `npm run build`
- **Gate estatico da fase:** `npm test && npm run typecheck && npm run build`
- **Checkpoint humano final:** executar o checklist de release e conferir rastreabilidade entre `package.json`, tag Git e imagem publicada

---

## Per-Task Verification Map

| Task ID | Plano | Requisito | Threat Ref | Tipo | Comando / Evidencia | Status |
|---------|-------|-----------|------------|------|----------------------|--------|
| 08-01-T1 | 08-01 | VER-01, VER-02 | T-08-01, T-08-02 | test+static | `npm run test && npm run typecheck` | ⬜ pending |
| 08-01-T2 | 08-01 | VER-01, VER-03 | T-08-03 | static | `rg -n 'version|NEXT_PUBLIC_GIT_HASH|npm_package_version' package.json next.config.ts src/app/'(auth)'/login/page.tsx` | ⬜ pending |
| 08-02-T1 | 08-02 | PUB-01, PUB-02, PUB-03, PUB-04 | T-08-04, T-08-05 | static | `rg -n 'on:|tags:|ubuntu|ghcr.io/henricos/ai-pkm|docker/build-push-action|docker/login-action|latest|org.opencontainers.image.version|org.opencontainers.image.revision|org.opencontainers.image.source' .github/workflows` | ⬜ pending |
| 08-02-T2 | 08-02 | VER-03, PUB-03, PUB-04 | T-08-06 | build+static | `npm run build` e inspeccao de labels/tags no workflow e no `Dockerfile` | ⬜ pending |
| 08-02-T3 | 08-02 | PUB-03 | T-08-06 | preflight+manual | `test -f .github/workflows/release-ghcr.yml && test -f docs/release-semver-ghcr.md` + confirmacao manual de pacote publico e vinculado ao repositório | ⬜ pending |
| 08-03-T1 | 08-03 | VER-02, VER-03 | T-08-07 | docs | `rg -n 'npm version|working tree limpa|main|git push|--follow-tags|GHCR|vX.Y.Z|latest' README.md docs` | ⬜ pending |
| 08-03-T2 | 08-03 | VER-02, VER-03, PUB-01, PUB-03, PUB-04 | T-08-08 | preflight+manual | `test -f docs/release-semver-ghcr.md && test -f .github/workflows/release-ghcr.yml && rg -n 'git checkout main|npm version|git push origin main --follow-tags|ghcr.io/henricos/ai-pkm' docs/release-semver-ghcr.md .github/workflows/release-ghcr.yml` + checklist humano de release | ⬜ pending |

*Status: ⬜ pending · ✅ green*

---

## Wave 0 Requirements

Arquivos e contratos que precisam existir antes do checkpoint externo:

- [ ] `.github/workflows/` - workflow de publicacao por tag
- [ ] documentacao canonica de release SemVer
- [ ] ajustes de rastreabilidade entre versao da app, hash e imagem
- [ ] preflight automatizado do checkpoint final sem `MISSING`
- [x] `08-VALIDATION.md` - contrato Nyquist da fase

---

## Manual-Only Verification

| Comportamento | Requisito | Por que manual | Encerramento esperado |
|---------------|-----------|----------------|------------------------|
| Executar release oficial a partir de `main` | VER-02 | Exige contexto Git real e decisao do operador | Operador confirma branch correta e working tree limpa antes do `npm version` |
| Publicar imagem por push de tag | PUB-01, PUB-03, PUB-04 | Depende de GitHub Actions + GHCR fora do ambiente local | Operador confirma workflow disparado pela tag e imagem publicada em `ghcr.io/henricos/ai-pkm` |
| Confirmar pacote publico e vinculado ao repositorio | PUB-03 | O estado do GHCR nao e auditavel localmente | Operador confirma pacote ligado a `henricos/ai-pkm` e visibilidade `public` |
| Conferir rastreabilidade completa | VER-03 | Parte da evidencia esta fora do repo | Operador confirma equivalencia entre versao do `package.json`, tag Git e imagem publicada |

---

## Resultado da Auditoria Nyquist

| Requisito | Testes automatizados | Evidencia complementar | Status |
|-----------|----------------------|------------------------|--------|
| VER-01 | grep/tests sobre versao e exibicao de hash | checkpoint humano apos build/release | ✅ PLANNED |
| VER-02 | docs + verificacoes estaticas do fluxo | execucao real de `npm version` em branch oficial | ✅ PLANNED |
| VER-03 | grep de labels OCI, tags e wiring de hash | conferencia no GitHub/GHCR | ✅ PLANNED |
| PUB-01 | workflow com gatilho por tag | execucao real do workflow | ✅ PLANNED |
| PUB-02 | workflow com runner Ubuntu e build action | run real no GitHub Actions | ✅ PLANNED |
| PUB-03 | login/push para GHCR no workflow | imagem publica visivel no registry | ✅ PLANNED |
| PUB-04 | derivacao de `vX.Y.Z` e `latest` no workflow | imagem com ambas as tags no GHCR | ✅ PLANNED |

**Gaps conhecidos no momento do planning:** GitHub Actions e GHCR nao sao executaveis no ambiente atual; a prova final depende de checkpoint operacional.  
**Waivers:** 0

---

## Validation Sign-Off

- [x] A fase possui `08-VALIDATION.md`
- [x] Todos os requisitos da fase possuem trilha de verificacao planejada
- [x] O checkpoint humano final cobre branch, tag, workflow e imagem publicada
- [x] `nyquist_compliant: true` definido no frontmatter

**Aprovacao:** planned 2026-04-14
