---
phase: "10"
slug: environment-contract-and-build-foundation
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-17
---

# Phase 10 - Validation Strategy

> Contrato de validacao da fundacao de `APP_BASE_PATH`, sincronia obrigatoria com `NEXTAUTH_URL` e propagacao do prefixo pela cadeia workflow -> Dockerfile -> Next.js.

---

## Test Infrastructure

| Propriedade | Valor |
|-------------|-------|
| **Framework** | Vitest + verificacoes estaticas de repo |
| **Config file** | `vitest.config.ts` |
| **Checks base da fase** | `npm run typecheck`, testes unitarios focados e `rg` em arquivos de config |
| **Checks de handoff** | coerencia entre helper central, contrato de env e cadeia de build |
| **Observacao de ambiente** | O ambiente atual nao tem `vitest` instalado nem `docker` disponivel; a fase planeja os checks que devem rodar no workspace preparado e no CI local do operador |

---

## Sampling Rate

- **Apos cada task da wave 1:** rodar o `verify` do plano `10-01`
- **Apos cada task da wave 2:** rodar o `verify` do plano correspondente (`10-02` ou `10-03`)
- **Gate estatico da fase:** conferir por `rg` a presenca de `APP_BASE_PATH` em `env.ts`, `next.config.ts`, `Dockerfile` e workflow
- **Gate comportamental da fase:** testes unitarios cobrindo helper, contrato de env e config/workflow
- **Checkpoint humano final:** leitura rapida do contrato documentado nos arquivos de config para confirmar que a Phase 10 nao consumiu escopo da Phase 11

---

## Per-Task Verification Map

| Task ID | Plano | Requisito | Threat Ref | Tipo | Comando / Evidencia | Status |
|---------|-------|-----------|------------|------|----------------------|--------|
| 10-01-T1 | 10-01 | CFG-03 | T-10-01, T-10-02 | unit | `npm test -- with-base-path` | ⬜ pending |
| 10-01-T2 | 10-01 | CFG-03 | T-10-03 | static | `rg -n "redirect|callback|next/link|auto-prefix" src/lib/base-path.ts` | ⬜ pending |
| 10-02-T1a | 10-02 | ENV-01, ENV-02 | T-10-04 | unit | `npm test -- env` com casos de ausencia de `APP_BASE_PATH` e `NEXTAUTH_URL` | ⬜ pending |
| 10-02-T1b | 10-02 | ENV-03 | T-10-05, T-10-06 | unit | `npm test -- env` com casos de divergencia entre `APP_BASE_PATH=/pkm` e `NEXTAUTH_URL`, e caso valido `https://host/pkm` | ⬜ pending |
| 10-03-T1 | 10-03 | CFG-01 | T-10-08, T-10-09 | unit | `npm test -- next-config` | ⬜ pending |
| 10-03-T2 | 10-03 | CFG-02 | T-10-07 | unit+static | `npm test -- release-workflow` e `rg -n "APP_BASE_PATH=/pkm" .github/workflows/release-ghcr.yml` | ⬜ pending |

*Status: ⬜ pending · ✅ green*

---

## Wave 0 Requirements

Arquivos e contratos que precisam existir antes da execucao da fase:

- [x] `10-RESEARCH.md` - pesquisa com risco e fronteira da fase
- [x] `10-01-PLAN.md` - helper central de base path
- [x] `10-02-PLAN.md` - contrato fail-fast de `APP_BASE_PATH` + `NEXTAUTH_URL`
- [x] `10-03-PLAN.md` - propagacao workflow -> Dockerfile -> Next.js
- [x] `10-VALIDATION.md` - contrato Nyquist da fase

---

## Manual-Only Verification

| Comportamento | Requisito | Por que manual | Encerramento esperado |
|---------------|-----------|----------------|------------------------|
| Confirmar que a fase nao puxou rewrites de redirects, hrefs e callback URLs | CFG-03 | Exige leitura humana do diff planejado contra a fronteira com a Phase 11 | Foundation pronta, consumers ainda intactos |
| Confirmar que o contrato operacional trava `NEXTAUTH_URL` em `APP_BASE_PATH` e nao em `/api/auth` | ENV-03 | Exige leitura humana para evitar reinterpretacao indevida da ambiguidade historica do Auth.js | Implementacao segue o roadmap do milestone sem expandir escopo |

---

## Resultado da Auditoria Nyquist

| Requisito | Testes automatizados | Evidencia complementar | Status |
|-----------|----------------------|------------------------|--------|
| ENV-01 | `npm test -- env` para ausencia de `APP_BASE_PATH` | leitura de `src/lib/env.ts` confirma fail-fast com `process.exit(1)` | ✅ PLANNED |
| ENV-02 | `npm test -- env` para ausencia de `NEXTAUTH_URL` | leitura de `src/lib/env.ts` confirma permanencia do contrato obrigatorio | ✅ PLANNED |
| ENV-03 | `npm test -- env` para divergencia e caso valido `https://host/pkm` | checkpoint humano confirma que a phase nao reinterpretou o contrato como `/api/auth` | ✅ PLANNED |
| CFG-01 | `npm test -- next-config` | `rg -n "basePath:" next.config.ts` | ✅ PLANNED |
| CFG-02 | `npm test -- release-workflow` + `rg -n "APP_BASE_PATH=/pkm" .github/workflows/release-ghcr.yml` | leitura de `Dockerfile` confirma propagacao do `ARG` ao builder | ✅ PLANNED |
| CFG-03 | `npm test -- with-base-path` | leitura de `src/lib/base-path.ts` confirma fronteira de uso vs auto-prefixo do framework | ✅ PLANNED |

**Gaps conhecidos no momento do planning:** o ambiente atual de orchestration nao tem `vitest` instalado nem `docker` disponivel, entao a validacao fica planejada mas nao executada neste turno.  
**Waivers:** 0

---

## Validation Sign-Off

- [x] A fase possui `10-VALIDATION.md`
- [x] Todos os requisitos da fase possuem mapeamento para evidencias automatizadas ou checkpoint humano
- [x] O `RESEARCH.md` registrou a ambiguidade de auth e o plano a travou operacionalmente
- [x] `nyquist_compliant: true` definido no frontmatter

**Aprovacao:** planned 2026-04-17
