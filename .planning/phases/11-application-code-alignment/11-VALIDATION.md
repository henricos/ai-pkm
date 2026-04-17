---
phase: 11
slug: application-code-alignment
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-17
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (jsdom) |
| **Config file** | `vitest.config.ts` |
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
| 11-01-01 | 01 | 1 | APP-01 | — | redirect nao autenticado vai para `/pkm/login` | unit | `npm test -- auth` | ✅ auth.test.ts | ⬜ pending |
| 11-01-02 | 01 | 1 | APP-01 | — | redirect pos-login vai para `/pkm` | unit | `npm test -- auth` | ✅ auth.test.ts | ⬜ pending |
| 11-01-03 | 02 | 2 | APP-02 | — | `pages.signIn` do NextAuth tem `/pkm/login` | unit | `npm test -- auth` | ✅ auth.test.ts | ⬜ pending |
| 11-01-04 | 02 | 2 | APP-02 | — | callbackUrl fallback resulta em `/pkm` | unit | `npm test -- login-form` | ⏭ Phase 12 | ⬜ pending |
| 11-01-05 | 03 | 1 | APP-03 | — | previewHref e downloadHref no viewer contem `/pkm` | unit | `npm test -- viewer-page` | ✅ viewer-page.test.tsx | ⬜ pending |
| 11-01-06 | 03 | 1 | APP-03 | — | download link no viewer-header contem `/pkm` | unit | `npm test -- viewer-header` | ✅ viewer-header.test.tsx | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky · ⏭ delegado à fase seguinte*

---

## Wave 0 Requirements

Nenhum. A Phase 11 não adiciona arquivos de teste formais — essa responsabilidade pertence à Phase 12 (TST-01/TST-02), conforme declarado em CONTEXT.md (Claude's Discretion) e RESEARCH.md (Validation Architecture).

O comportamento 11-01-04 (callbackUrl fallback para `/pkm`) será coberto por `src/__tests__/login-form.test.tsx` criado na Phase 12. A implementação desta fase deixa pontos observáveis claros: prop `fallbackUrl`, função `isValidCallback`, e fallback explícito para `withBasePath("/")`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `localhost:3000/pkm` exibe shell autenticado; `localhost:3000/` retorna 404 | APP-01 | Requer servidor rodando com `APP_BASE_PATH=/pkm` | `npm run dev`, acessar ambas as URLs no browser |
| Fluxo completo de login/logout com prefixo correto | APP-01, APP-02 | Requer sessao real com NextAuth | Acessar `localhost:3000/pkm/login`, fazer login, verificar redirect para `/pkm` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or explicitly delegated to Phase 12
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (none required in this phase)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
