---
phase: 04-asset-viewer-and-item-context
plan: "01"
subsystem: testing
tags: [tdd, wave-0, viewer, preview-route, sidecar, red-green]
dependency_graph:
  requires: []
  provides:
    - contratos RED para ImageViewer e PdfViewer (VIEW-04, VIEW-05)
    - contrato RED para getBinaryContext no FsItemRepository (CTX-05)
    - contrato RED para sidecar no InfoPanel (CTX-05)
    - contrato RED para rota /api/pkm/preview/[...path] (T-04-01, T-04-02, T-04-03)
  affects:
    - src/components/viewer/viewer-page.tsx (Wave 1: novos branches image/pdf)
    - src/lib/pkm/fs-item-repository.ts (Wave 1: getBinaryContext)
    - src/components/viewer/info-panel.tsx (Wave 1: prop sidecarContent)
    - src/app/api/pkm/preview/[...path]/route.ts (Wave 1: criar rota nova)
tech_stack:
  added: []
  patterns:
    - TDD RED-first para contratos de segurança de rota
    - Spy em métodos do repositório para prevenir parse UTF-8 acidental de binários
    - Mock de componentes ainda inexistentes via vi.mock para RED antecipado
key_files:
  created:
    - src/__tests__/preview-route.test.ts
  modified:
    - src/__tests__/viewer-page.test.tsx
    - src/__tests__/item-repository.test.ts
    - src/__tests__/info-panel.test.tsx
decisions:
  - "Testes RED referenciam paths reais dos componentes que Wave 1 criará para garantir que os mocks serão substituídos por implementações reais"
  - "T-04-05 usa spy no getItemContent() do repositório para travar o contrato de não-leitura de binários como UTF-8 diretamente no ViewerPage"
  - "preview-route.test.ts espelha raw-route.test.ts mas com Content-Disposition: inline, documentando explicitamente a separação semântica entre as duas rotas"
metrics:
  duration: "~3 minutos"
  completed_date: "2026-04-10"
  tasks_completed: 3
  tasks_total: 3
  files_created: 1
  files_modified: 3
---

# Phase 4 Plan 01: Contratos de Validação Wave 0 — Summary

Plano de testes TDD Wave 0 que congela todos os contratos de segurança e comportamento da Phase 4 antes de qualquer implementação. Quatro arquivos de teste descrevem os branches finais de viewer por itemKind, leitura segura de sidecar, renderização editorial do sidecar no painel e rota de preview inline autenticada.

## Tasks Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|----------|
| 1 | Testes de viewer para imagem, PDF e fallback editorial | fe5ce0d | src/__tests__/viewer-page.test.tsx |
| 2 | Testes de sidecar no repositório e InfoPanel | deb0b24 | src/__tests__/item-repository.test.ts, src/__tests__/info-panel.test.tsx |
| 3 | Teste dedicado da rota de preview inline autenticada | 74b56d1 | src/__tests__/preview-route.test.ts (novo) |

## Resultado dos Testes

Estado esperado no final da Wave 0: **RED deliberado** para os contratos novos, **GREEN preservado** para regressão da Phase 3.

```
Arquivos falhos (RED — esperado):  4
Arquivos passando (GREEN):         1 (navigation-service.test.ts)
Testes RED:                       12
Testes GREEN:                     48
```

### Contratos RED criados

**viewer-page.test.tsx** (5 testes RED):
- VIEW-04: `itemKind=image` renderiza `ImageViewer` com controles de zoom/reset, sem `unsupported-format`
- VIEW-05: `itemKind=pdf` renderiza `PdfViewer` com `previewUrl` separada de `downloadUrl`, sem `unsupported-format`
- T-04-05: `getItemContent()` NÃO é chamado para `image`, `pdf` nem `binary`

**item-repository.test.ts** (5 testes RED):
- D-07/D-08: `getBinaryContext()` retorna `sidecarContent` do `.md` adjacente sem ler o binário
- D-08: `getBinaryContext()` retorna `sidecarFrontmatter` do `.md` adjacente
- D-07: `getBinaryContext()` retorna contexto nulo quando sidecar inexistente
- T-04-05: `getBinaryContext()` lança `Path traversal` para ids com `../`

**info-panel.test.tsx** (5 testes RED):
- CTX-05/D-08: sidecar aparece no slot `sidecar-content-phase4` quando fornecido
- D-08: sidecar renderizado sem YAML cru e sem frontmatter exposto
- D-09: slot `sidecar-content-phase4` aparece depois dos metadados do item principal
- CTX-05: slot ausente quando `sidecarContent` é `null` ou não fornecido

**preview-route.test.ts** (7 testes RED — arquivo novo):
- T-04-02: `401` sem sessão antes de qualquer operação de filesystem
- T-04-03/VIEW-05: `Content-Disposition: inline` (não `attachment`)
- Content-Type correto para `.pdf` e imagens, com `X-Content-Type-Options: nosniff`
- T-04-01: path traversal retorna `400` sem tocar o filesystem real
- `404` sem vazar path absoluto do servidor na resposta
- Separação semântica explícita: `/api/pkm/preview` → inline, `/api/pkm/raw` → attachment

### GREEN preservado

**navigation-service.test.ts** (todos passando):
- "Sidecar NÃO aparece como item independente na tree" — regressão garantida sem mudança no `navigation-service`

## Deviations from Plan

None — plano executado exatamente como escrito.

## Known Stubs

Nenhum — este plano é exclusivamente de testes. Não há implementação com stubs.

## Threat Flags

Nenhum — os testes deste plano implementam as próprias mitigações de ameaça registradas no threat model da Phase 4 (T-04-01 a T-04-05).

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/__tests__/viewer-page.test.tsx | FOUND |
| src/__tests__/item-repository.test.ts | FOUND |
| src/__tests__/info-panel.test.tsx | FOUND |
| src/__tests__/preview-route.test.ts | FOUND |
| .planning/phases/04-asset-viewer-and-item-context/04-01-SUMMARY.md | FOUND |
| commit fe5ce0d (task 1) | FOUND |
| commit deb0b24 (task 2) | FOUND |
| commit 74b56d1 (task 3) | FOUND |
