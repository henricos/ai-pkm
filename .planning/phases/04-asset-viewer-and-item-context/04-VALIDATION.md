---
phase: 4
slug: asset-viewer-and-item-context
status: planned
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-10
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` (raiz do projeto) |
| **Ambiente** | jsdom |
| **Quick run command** | `npx vitest run src/__tests__/viewer-page.test.tsx src/__tests__/info-panel.test.tsx src/__tests__/preview-route.test.ts src/__tests__/item-repository.test.ts` |
| **Full suite command** | `npm test && npm run typecheck` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run` focado nos arquivos do viewer/repository tocados
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-W0-01 | W0 | 0 | VIEW-04 | — | N/A | unit/component | `npx vitest run src/__tests__/viewer-page.test.tsx` | ✅ | ✅ planned |
| 4-W0-02 | W0 | 0 | VIEW-05 | T-4-01, T-4-02, T-4-03 | preview inline autenticado preserva `nosniff` e não vira attachment | unit/component + route | `npx vitest run src/__tests__/viewer-page.test.tsx src/__tests__/preview-route.test.ts` | ✅ | ✅ planned |
| 4-W0-03 | W0 | 0 | CTX-05 | T-4-04 | sidecar é lido do `.md` adjacente sem parsear o binário bruto | unit/component + repository | `npx vitest run src/__tests__/info-panel.test.tsx src/__tests__/item-repository.test.ts` | ✅ | ✅ planned |
| 4-nav | — | 1 | VIEW-06 | — | sidecar segue oculto da navegação e não reaparece como item separado | unit/service | `npx vitest run src/__tests__/navigation-service.test.ts src/__tests__/item-repository.test.ts` | ✅ | ✅ planned |
| 4-fallback | — | 1 | VIEW-07 | — | fallback editorial claro preserva download existente no header | unit/component | `npx vitest run src/__tests__/viewer-page.test.tsx src/__tests__/viewer-header.test.tsx` | ✅ | ✅ planned |

*Status: ✅ planned · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/__tests__/viewer-page.test.tsx` — contrato planejado para `itemKind=image` com zoom/reset e ausência de `unsupported-format`
- [x] `src/__tests__/viewer-page.test.tsx` — contrato planejado para `itemKind=pdf` com preview inline e fallback no viewer
- [x] `src/__tests__/item-repository.test.ts` — contrato planejado para leitura de sidecar adjacente sem abrir o binário como UTF-8
- [x] `src/__tests__/preview-route.test.ts` — contrato planejado para `Content-Disposition: inline`, `Content-Type` correto e auth obrigatória

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Zoom e enquadramento de imagem parecem confortáveis no viewer | VIEW-04 | Qualidade editorial e sensação de foco visual são avaliadas melhor no navegador real | Abrir 2-3 imagens do corpus, usar zoom in/out/reset e verificar que o asset permanece protagonista |
| Preview de PDF é suficiente nos navegadores alvo | VIEW-05 | O suporte nativo de PDF varia por browser e por corpus | Abrir 2-3 PDFs reais no app e confirmar preview inline; se não renderizar, validar fallback claro de download |
| Texto do sidecar não compete com o asset principal | CTX-05 | Hierarquia visual do painel lateral depende de composição real | Abrir um binário com sidecar, expandir o `InfoPanel` e confirmar leitura editorial sem parecer segundo viewer |

---

## Security Threat Model

| ID | Padrão | STRIDE | Mitigação |
|----|--------|--------|-----------|
| T-4-01 | Path traversal em rota de preview/raw | Tampering | Reusar `resolveItemPath()` no servidor e retornar 400 para `../` |
| T-4-02 | Bypass de autenticação via endpoint de preview | Elevation of Privilege | Executar `auth()` antes de qualquer leitura de filesystem |
| T-4-03 | Content sniffing em binários | Information Disclosure | Manter `X-Content-Type-Options: nosniff` nos handlers de asset |
| T-4-04 | XSS via sidecar Markdown | Tampering | Reusar pipeline segura de `react-markdown` e não introduzir `rehype-raw` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planned 2026-04-10
