---
phase: 11-application-code-alignment
plan: "03"
subsystem: viewer
tags: [base-path, viewer, server-component, prop-drilling, withBasePath]
dependency_graph:
  requires:
    - src/lib/base-path.ts
  provides:
    - URLs de preview e download com prefixo /pkm no viewer
  affects:
    - src/components/viewer/viewer-page.tsx
    - src/components/viewer/viewer-client-shell.tsx
    - src/components/viewer/viewer-header.tsx
tech_stack:
  added: []
  patterns:
    - withBasePath() aplicado em Server Component; prop drilling para Client Component
key_files:
  modified:
    - src/components/viewer/viewer-page.tsx
    - src/components/viewer/viewer-client-shell.tsx
    - src/components/viewer/viewer-header.tsx
    - src/__tests__/viewer-header.test.tsx
    - src/__tests__/viewer-client-shell.test.tsx
decisions:
  - "downloadHref calculado antes de todos os branches (inclusive markdown) em viewer-page.tsx para manter interface uniforme de ViewerClientShell"
  - "viewer-client-shell.tsx atualizado como intermediário na cadeia de props (desvio necessário, não mencionado no plano)"
metrics:
  duration: "~20min"
  completed_date: "2026-04-17"
  tasks_completed: 2
  files_modified: 5
---

# Phase 11 Plan 03: Viewer URL Prefix — SUMMARY

**One-liner:** URLs de preview inline e download no viewer agora incluem o prefixo `/pkm` via `withBasePath()` calculado em Server Component e passado como prop para Client Components.

## Tasks Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|----------|
| 1 | Corrigir URLs de asset em viewer-page.tsx e passar downloadHref | 739d9f5 | viewer-page.tsx, viewer-client-shell.tsx |
| 2 | Remover href literal de viewer-header.tsx e usar prop downloadHref | 34837f1 | viewer-header.tsx, viewer-header.test.tsx, viewer-client-shell.test.tsx |

## O que foi entregue

- `viewer-page.tsx` importa `withBasePath` de `@/lib/base-path` e aplica nas URLs `previewHref` e `downloadHref`
- Cálculo de `encodedId`/`previewHref`/`downloadHref` movido para antes do branch `markdown` — todos os tipos de item recebem `downloadHref` via prop
- `viewer-client-shell.tsx` recebe `downloadHref: string` como prop obrigatória e repassa para `ViewerHeader`
- `viewer-header.tsx` aceita `downloadHref: string` na interface; link de download usa `href={downloadHref}` em vez de template literal `/api/pkm/raw/${encodeURIComponent(itemId)}`
- Testes atualizados: `defaultProps` e todos os `render()` nos dois arquivos de teste incluem `downloadHref`; CTX-02 agora verifica que o href contém `/pkm`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] viewer-client-shell.tsx adicionado à cadeia de props**

- **Found during:** Task 1
- **Issue:** O plano descreve a cadeia `viewer-page.tsx → ViewerHeader`, mas `ViewerHeader` é instanciado dentro de `viewer-client-shell.tsx` (Client Component intermediário). Sem atualizar `viewer-client-shell.tsx`, a prop `downloadHref` não chegaria ao destino.
- **Fix:** Adicionada prop `downloadHref: string` à interface `ViewerClientShellProps` e desestruturação em `ViewerClientShell`; repassada para `ViewerHeader` no JSX.
- **Files modified:** `src/components/viewer/viewer-client-shell.tsx`
- **Commit:** 739d9f5

**2. [Rule 1 - Bug] encodedId/downloadHref movidos para antes do branch markdown**

- **Found during:** Task 1
- **Issue:** O plano calculava `encodedId`/`downloadHref` somente no bloco de itens não-markdown, mas `ViewerClientShell` agora exige `downloadHref` como prop obrigatória em todos os branches — inclusive markdown.
- **Fix:** Cálculo movido para antes de qualquer branch `itemKind`, garantindo que markdown também receba `downloadHref`.
- **Files modified:** `src/components/viewer/viewer-page.tsx`
- **Commit:** 739d9f5

**3. [Rule 1 - Bug] Testes existentes atualizados para prop obrigatória**

- **Found during:** Task 2 (verificação TypeScript)
- **Issue:** `npx tsc --noEmit` retornou 23 erros porque os testes de `viewer-header` e `viewer-client-shell` não passavam `downloadHref`.
- **Fix:** `downloadHref` adicionado em `defaultProps` de `viewer-client-shell.test.tsx` e em todos os `render()` de `viewer-header.test.tsx`; teste CTX-02 atualizado para verificar `/pkm` no href.
- **Files modified:** `src/__tests__/viewer-header.test.tsx`, `src/__tests__/viewer-client-shell.test.tsx`
- **Commit:** 34837f1

## Verificação Final

- `grep -rn "/api/pkm/preview/" src/components/viewer/viewer-page.tsx` — apenas dentro de `withBasePath()`
- `grep -rn "/api/pkm/raw/" src/components/viewer/` — nenhum template literal sem prefixo (só comentário e prop `downloadHref`)
- `npx tsc --noEmit` — exit 0
- `npm test -- viewer-page viewer-header viewer-client-shell` — 32 testes passando (3 arquivos)

## Known Stubs

Nenhum. Todas as URLs são calculadas dinamicamente com `withBasePath()`.

## Threat Flags

Nenhum. As superfícies de rede (endpoints `/api/pkm/preview/` e `/api/pkm/raw/`) já existiam antes desta fase. O prefixo não expõe nova superfície — apenas adiciona o `basePath` configurado nas URLs geradas.

## Self-Check: PASSED

- [x] `src/components/viewer/viewer-page.tsx` existe e contém `withBasePath`
- [x] `src/components/viewer/viewer-header.tsx` existe e contém `href={downloadHref}`
- [x] Commit 739d9f5 existe
- [x] Commit 34837f1 existe
- [x] `npx tsc --noEmit` retornou exit 0
- [x] 32 testes passando
