---
phase: "06"
slug: eliminar-flash-tema-viewer
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-13
---

# Phase 06 — Validation Strategy

> Contrato de validacao da fase de hardening visual do tema do viewer.

---

## Test Infrastructure

| Propriedade | Valor |
|-------------|-------|
| **Framework** | Vitest 3.x + jsdom |
| **Comando rapido** | `npx vitest run src/__tests__/viewer-theme.test.tsx` |
| **Suite da fase** | `npx vitest run src/__tests__/viewer-client-shell.test.tsx src/__tests__/viewer-theme.test.tsx` |
| **Checks complementares** | `npm run typecheck`, `npm run build` |
| **Runtime observado** | ~2.5s suite da fase + build verde |

---

## Per-Task Verification Map

| Task ID | Plano | Requisito | Threat Ref | Tipo | Comando / Evidencia | Status |
|---------|-------|-----------|------------|------|----------------------|--------|
| 06-01-T1 | 06-01 | PRS-06, PRS-07 | T-06-03 | unit | `npx vitest run src/__tests__/viewer-theme.test.tsx` | ✅ green |
| 06-01-T2 | 06-01 | PRS-06, PRS-07 | T-06-01, T-06-02, T-06-04 | unit | `npx vitest run src/__tests__/viewer-client-shell.test.tsx src/__tests__/viewer-theme.test.tsx` | ✅ green |
| 06-01-T3 | 06-01 | PRS-06, PRS-07 | T-06-01, T-06-04 | manual | `06-UAT.md` registra checkpoint humano aprovado na aplicacao real | ✅ green |

*Status: ⬜ pending · ✅ green*

---

## Manual-Only Verification

| Comportamento | Requisito | Por que seria manual | Encerramento |
|---------------|-----------|----------------------|--------------|
| Reload sem flash perceptivel do preset salvo | PRS-06, PRS-07 | O criterio depende de first paint real em browser | Validado manualmente pelo operador e registrado em `06-UAT.md` |

---

## Resultado da Auditoria Nyquist

| Requisito | Testes automatizados | Evidencia complementar | Status |
|-----------|----------------------|------------------------|--------|
| PRS-06 | `viewer-theme.test.tsx`, `viewer-client-shell.test.tsx` | `npm run typecheck`, `npm run build` | ✅ COVERED |
| PRS-07 | `viewer-theme.test.tsx`, `viewer-client-shell.test.tsx` | `06-VERIFICATION.md` confirma escopo local e fallbacks benignos | ✅ COVERED |

**Total de testes automatizados da fase:** 38 passando em 2026-04-13
**Gaps encontrados:** 0
**Waivers:** 0

---

## Validation Sign-Off

- [x] Todas as tasks possuem verify automatizado ou encerramento documentado
- [x] Sem 3 tasks consecutivas sem evidencia
- [x] Suite da fase verde em 2026-04-13
- [x] `npm run typecheck` verde
- [x] `npm run build` verde
- [x] `nyquist_compliant: true` definido no frontmatter

**Aprovacao:** approved 2026-04-13
