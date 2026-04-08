---
phase: 2
slug: navigation-shell
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-08
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (unit/component) + jsdom |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run typecheck && npm run build` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test && npm run typecheck`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | NAV-01 | T-02-01 | Snapshot separa inbox da árvore e calcula contagens corretamente | unit | `npm run test -- src/__tests__/navigation-service.test.ts` | ❌ W1 | ⬜ pending |
| 2-01-02 | 01 | 1 | NAV-02 | T-02-03 | Inbox usa namespace distinto e fica fora da árvore estrutural | unit | `npm run test -- src/__tests__/navigation-service.test.ts` | ❌ W1 | ⬜ pending |
| 2-01-03 | 01 | 1 | NAV-06 | T-02-01 | Agrupadores expõem `count` consistente | unit | `npm run test -- src/__tests__/navigation-service.test.ts` | ❌ W1 | ⬜ pending |
| 2-01-04 | 01 | 1 | NAV-07 | T-02-01 | Estado visual é mantido separado do tipo do item | unit | `npm run test -- src/__tests__/navigation-service.test.ts` | ❌ W1 | ⬜ pending |
| 2-01-05 | 01 | 1 | NAV-08 | T-02-02 | Hrefs canônicos e ancestry suportam reveal por URL | unit | `npm run test -- src/__tests__/navigation-service.test.ts` | ❌ W1 | ⬜ pending |
| 2-02-01 | 02 | 2 | NAV-03 | T-02-05 | Shell persiste e rail recolhe/reabre sem perder o item | component | `npm run test -- src/__tests__/app-shell.test.tsx` | ❌ W2 | ⬜ pending |
| 2-02-02 | 02 | 2 | NAV-04 | T-02-10 | Item ativo é derivado da URL e destacado corretamente | component | `npm run test -- src/__tests__/app-shell.test.tsx` | ❌ W2 | ⬜ pending |
| 2-02-03 | 02 | 2 | NAV-08 | T-02-06 | Rotas `library` e `inbox` resolvem item por helper canônico seguro | component | `npm run test -- src/__tests__/app-shell.test.tsx` | ❌ W2 | ⬜ pending |
| 2-03-01 | 03 | 3 | FIL-01 | T-02-12 | Filtro atua só na árvore principal e nunca toca a inbox | unit | `npm run test -- src/__tests__/filter-tree.test.ts` | ❌ W3 | ⬜ pending |
| 2-03-02 | 03 | 3 | FIL-02 | T-02-09 | Filtro tolera caixa, acento e pequena variação sem virar busca agressiva | unit | `npm run test -- src/__tests__/filter-tree.test.ts` | ❌ W3 | ⬜ pending |
| 2-03-03 | 03 | 3 | FIL-03 | T-02-12 | UI diferencia filtro estrutural de busca futura por rótulo e iconografia | component | `npm run test -- src/__tests__/filter-tree.test.ts` | ❌ W3 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/navigation-service.test.ts` — cobre NAV-01, NAV-02, NAV-06, NAV-07, NAV-08
- [ ] `src/__tests__/app-shell.test.tsx` — cobre NAV-03, NAV-04, NAV-08
- [ ] `src/__tests__/filter-tree.test.ts` — cobre FIL-01, FIL-02, FIL-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Inbox destacada acima da árvore parece distinta e discreta | NAV-02 | Avaliação visual/editorial | Abrir a shell no navegador e confirmar separação visual clara sem parecer ramo da tree |
| Rail recolhe e reabre mantendo sensação de shell única | NAV-03 | UX real de navegação | Alternar o rail com um item aberto em `library/...` e verificar que o workspace não se perde |
| Filtro estrutural parece filtro da árvore, não busca global | FIL-03 | Semântica visual | Digitar no campo do rail e verificar rótulo, placeholder e ausência de affordance de busca full-text |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all required test artifacts for this phase
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
