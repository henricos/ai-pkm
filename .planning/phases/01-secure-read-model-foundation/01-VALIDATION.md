---
phase: 1
slug: secure-read-model-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (unit/integration) + Playwright (e2e) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | ACC-01 | T-1-01 | Auth middleware blocks unauthenticated access | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | ACC-02 | T-1-02 | Credentials validated against env vars only | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | ACC-03 | T-1-03 | Session cookie is httpOnly | integration | `npm run test` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | ARC-01 | — | ItemRepository.listTopics() returns Topic[] | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | ARC-02 | — | ItemRepository.getItem(id) resolves stable ID | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 1 | ARC-03 | — | ItemRepository reads from PKM_PATH env var | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 2 | RUN-01 | T-1-04 | App fails fast when required env vars missing | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 2 | RUN-02 | — | PKM_PATH resolves correctly to mounted dir | integration | `npm run build` | ❌ W0 | ⬜ pending |
| 1-03-03 | 03 | 2 | RUN-03 | — | dev-setup.md exists and covers all env vars | manual | — | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 2 | ARC-04 | — | ItemRepository interface exported from lib/pkm | unit | `npm run test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/auth.test.ts` — stubs for ACC-01, ACC-02, ACC-03
- [ ] `src/__tests__/item-repository.test.ts` — stubs for ARC-01, ARC-02, ARC-03, ARC-04
- [ ] `src/__tests__/env.test.ts` — stubs for RUN-01, RUN-02
- [ ] `vitest.config.ts` — vitest configuration
- [ ] `package.json test script` — `"test": "vitest run"`

*Wave 0 installs vitest and creates test stubs before any feature work begins.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login flow funciona no browser com credenciais válidas | ACC-01 | UI interaction | Abrir `/`, ser redirecionado para `/login`, submeter credenciais corretas, verificar redirecionamento para `/` autenticado |
| Aplicação sobe com PKM_PATH apontando para pasta montada externamente | RUN-03 | Filesystem mount | Configurar `.env.local` com `PKM_PATH=../pkm`, rodar `npm run dev`, verificar que navegação exibe tópicos reais |
| Setup doc cobre todos os env vars obrigatórios | RUN-03 | Doc review | Ler `docs/dev-setup.md` e confirmar que todos os 5 env vars estão documentados com exemplos |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
