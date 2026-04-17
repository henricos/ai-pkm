---
phase: 12
slug: tests-and-operational-documentation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + @testing-library/react |
| **Config file** | `vitest.config.ts` (raiz do projeto) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 0 | TST-02 | — | Redirect não autenticado → `/pkm/login` | contract | `npm test -- route-prefix.test.ts` | ❌ W0 | ⬜ pending |
| 12-01-02 | 01 | 1 | TST-01 | — | N/A | unit | `npm test -- env.test.ts` | ✅ | ⬜ pending |
| 12-01-03 | 01 | 1 | TST-02 | — | Redirect não autenticado → `/pkm/login` | contract | `npm test -- route-prefix.test.ts` | ❌ W0 | ⬜ pending |
| 12-02-01 | 02 | 1 | DOC-01 | — | N/A | manual | Verificar conteúdo de `docs/dev-setup.md` | ✅ | ⬜ pending |
| 12-02-02 | 02 | 1 | DOC-02 | — | N/A | manual | Verificar conteúdo de `README.md` e `compose.yaml` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/route-prefix.test.ts` — stubs/arquivo base para TST-02 (fluxos de rota com prefixo)

*Infraestrutura existente (Vitest já configurado) cobre todos os outros requisitos.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `docs/dev-setup.md` menciona `APP_BASE_PATH` com exemplos e nota de 404 na raiz | DOC-01 | Verificação de conteúdo de documentação | `grep -n "APP_BASE_PATH" docs/dev-setup.md` deve retornar ≥1 resultado; checar presença de nota sobre 404 |
| `README.md` documenta 3 lugares de configuração com nota de release | DOC-02 | Verificação de conteúdo de documentação | `grep -n "APP_BASE_PATH" README.md` deve retornar ≥1; checar presença de tabela/lista com `.env`, workflow e compose |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
