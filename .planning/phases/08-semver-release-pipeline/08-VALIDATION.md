---
phase: "08"
slug: semver-release-pipeline
status: validated
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
| 08-01-T1 | 08-01 | VER-01, VER-02 | T-08-01, T-08-02 | test+static | `npm test` e `npm run typecheck` passaram localmente antes da release real | ✅ green |
| 08-01-T2 | 08-01 | VER-01, VER-03 | T-08-03 | static | contrato de versao/hash validado em `package.json`, `next.config.ts` e `src/app/(auth)/login/page.tsx`; release real `v2.0.2` confirmou a trilha | ✅ green |
| 08-02-T1 | 08-02 | PUB-01, PUB-02, PUB-03, PUB-04 | T-08-04, T-08-05 | static | workflow `release-ghcr.yml` em `main`; run real `24425136375` criada por push da tag `v2.0.2` | ✅ green |
| 08-02-T2 | 08-02 | VER-03, PUB-03, PUB-04 | T-08-06 | build+static | `npm run build` passou com ambiente explicito; job `publish` publicou imagem com `latest` e `v2.0.2` | ✅ green |
| 08-02-T3 | 08-02 | PUB-03 | T-08-06 | preflight+manual | pacote publico `ghcr.io/henricos/ai-pkm` confirmado na pagina publica do GitHub Packages | ✅ green |
| 08-03-T1 | 08-03 | VER-02, VER-03 | T-08-07 | docs | `docs/release-semver-ghcr.md` e `README.md` permanecem como fluxo oficial; skill `/fechar-versao` passou a orquestrar o mesmo contrato | ✅ green |
| 08-03-T2 | 08-03 | VER-02, VER-03, PUB-01, PUB-03, PUB-04 | T-08-08 | preflight+manual | release real `v2.0.2` executada, pushado `main --follow-tags`, workflow concluido com `success` e pacote publico confirmado | ✅ green |

*Status: ✅ green*

---

## Wave 0 Requirements

Arquivos e contratos que precisam existir antes do checkpoint externo:

- [x] `.github/workflows/` - workflow de publicacao por tag
- [x] documentacao canonica de release SemVer
- [x] ajustes de rastreabilidade entre versao da app, hash e imagem
- [x] preflight automatizado do checkpoint final sem `MISSING`
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
| VER-01 | grep/tests sobre versao e exibicao de hash | release real `v2.0.2` e footer versionado | ✅ VALIDATED |
| VER-02 | docs + verificacoes estaticas do fluxo | release real com `npm version` e recovery controlado de sandbox | ✅ VALIDATED |
| VER-03 | grep de labels OCI, tags e wiring de hash | tag `v2.0.2`, commit `02e540c` e pacote publicado | ✅ VALIDATED |
| PUB-01 | workflow com gatilho por tag | run `24425136375` disparada por push da tag `v2.0.2` | ✅ VALIDATED |
| PUB-02 | workflow com runner Ubuntu e build action | job `publish` concluido com `success` em runner Ubuntu | ✅ VALIDATED |
| PUB-03 | login/push para GHCR no workflow | pacote publico `ghcr.io/henricos/ai-pkm` confirmado | ✅ VALIDATED |
| PUB-04 | derivacao de `vX.Y.Z` e `latest` no workflow | pagina publica do pacote confirmou `latest` e `v2.0.2` | ✅ VALIDATED |

**Gaps conhecidos no momento do planning:** nenhum gap remanescente para os requisitos da fase; a cadeia foi validada com release real `v2.0.2`.  
**Waivers:** 0

---

## Validation Sign-Off

- [x] A fase possui `08-VALIDATION.md`
- [x] Todos os requisitos da fase possuem trilha de verificacao planejada
- [x] O checkpoint humano final cobre branch, tag, workflow e imagem publicada
- [x] `nyquist_compliant: true` definido no frontmatter

**Aprovacao:** validated 2026-04-14
