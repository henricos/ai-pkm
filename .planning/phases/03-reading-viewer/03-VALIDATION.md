---
phase: 3
slug: reading-viewer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-09
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` (raiz do projeto) |
| **Ambiente** | jsdom |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run typecheck` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run typecheck`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-W0-01 | W0 | 0 | VIEW-02, VIEW-08 | — | N/A | unit/snapshot | `npm test -- markdown-viewer` | ❌ W0 | ⬜ pending |
| 3-W0-02 | W0 | 0 | CTX-01, CTX-02 | — | N/A | render | `npm test -- viewer-header` | ❌ W0 | ⬜ pending |
| 3-W0-03 | W0 | 0 | CTX-03, CTX-04 | — | N/A | unit | `npm test -- info-panel` | ❌ W0 | ⬜ pending |
| 3-repo | — | 1 | VIEW-01 | T-3-01 | getItemContent valida path traversal igual a getItem | unit | `npm test -- item-repository` | ❌ W0 | ⬜ pending |
| 3-viewer | — | 1 | VIEW-02, VIEW-08 | — | N/A | snapshot | `npm test -- markdown-viewer` | ❌ W0 | ⬜ pending |
| 3-header | — | 1 | CTX-01, CTX-02 | T-3-03 | paths absolutos nunca enviados ao cliente | render | `npm test -- viewer-header` | ❌ W0 | ⬜ pending |
| 3-panel | — | 2 | CTX-03, CTX-04 | — | N/A | unit | `npm test -- info-panel` | ❌ W0 | ⬜ pending |
| 3-dates | — | 2 | CTX-04 | — | N/A | unit | `npm test -- date-format` | ❌ W0 | ⬜ pending |
| 3-download | — | 2 | CTX-02 | T-3-04 | Route Handler verifica auth() antes de servir | unit | `npm test -- raw-route` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/markdown-viewer.test.tsx` — VIEW-02, VIEW-08 (estrutura HTML, classe prose aplicada, render sem crash)
- [ ] `src/__tests__/viewer-header.test.tsx` — CTX-01 (tópico › grupo), CTX-02 (botões presentes: download, apresentação desabilitado, ℹ️)
- [ ] `src/__tests__/info-panel.test.tsx` — CTX-03 (toggle abre/fecha), CTX-04 (campos formatados)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Área direita atualiza sem navegação perceptível | VIEW-01 | Comportamento visual de SPA — sem URL change perceptível | Selecionar item na árvore → verificar que área direita atualiza sem flash de página |
| Responsividade mobile | RUN-04 | Requer DevTools ou dispositivo real | Abrir DevTools → 375px → verificar que viewer não quebra layout |
| Glassmorphism header ao rolar | CTX-01 | Comportamento visual/CSS | Rolar conteúdo longo → verificar opacity + blur no header sticky |
| Shiki syntax highlight renderiza corretamente | VIEW-02 | jsdom não renderiza CSS | Abrir item com código no browser → verificar highlight visual |

---

## Security Threat Model

| ID | Padrão | STRIDE | Mitigação |
|----|--------|--------|-----------|
| T-3-01 | Path traversal via `itemId` em `getItemContent()` | Tampering | `resolveAndValidatePath()` com `startsWith(pkmRoot)` — replicar exatamente o padrão de `getItem()` |
| T-3-02 | XSS via Markdown (links `javascript:`) | Tampering | `react-markdown` sanitiza por padrão — `defaultUrlTransform` rejeita `javascript:` URIs; não substituir por `rehype-raw` |
| T-3-03 | Exposição de path absoluto no cliente | Information Disclosure | `Item.path` nunca enviado ao cliente — usar `item.topic`, `item.group`, `item.id` |
| T-3-04 | Download raw sem autenticação | Elevation of Privilege | Route Handler `/api/pkm/raw/[...path]` deve chamar `auth()` e retornar 401 se não autenticado |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
