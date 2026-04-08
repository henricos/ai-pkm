---
phase: 02-navigation-shell
plan: "02"
subsystem: shell
tags:
  - shell
  - navigation
  - app-router
  - auth
  - url-driven
dependency_graph:
  requires:
    - "02-01"
  provides:
    - shell-layout-authenticated
    - library-route
    - inbox-route
    - workspace-empty-state
    - workspace-item-state
    - app-shell-tests
  affects:
    - "02-03"
    - "03-content-viewer"
tech_stack:
  added:
    - "Next.js App Router route group (shell)"
    - "React client component com useState para rail recolhível"
  patterns:
    - "Layout persistente autenticado com getNavigationSnapshot server-side"
    - "URL-driven item selection via decodeLibraryParams/decodeInboxParam"
    - "Helper canônico getItemById para resolução pós-decode"
    - "aria-hidden para controle de visibilidade do rail"
key_files:
  created:
    - src/app/(shell)/layout.tsx
    - src/app/(shell)/page.tsx
    - src/app/(shell)/library/[...path]/page.tsx
    - src/app/(shell)/inbox/[item]/page.tsx
    - src/components/shell/app-shell.tsx
    - src/components/shell/workspace-empty-state.tsx
    - src/components/shell/workspace-item-state.tsx
    - src/__tests__/app-shell.test.tsx
  modified:
    - src/lib/navigation/navigation-service.ts
  deleted:
    - src/app/page.tsx
decisions:
  - "src/app/page.tsx removido — (shell)/page.tsx já resolve a rota / no App Router sem conflito"
  - "getItemById adicionado ao navigation-service como único ponto de resolução canônica pós-decode"
  - "aria-hidden usado para controle de visibilidade do rail (verificável em testes sem checar classes CSS)"
metrics:
  duration: "~18 min"
  completed: "2026-04-08"
  tasks_completed: 2
  files_created: 8
  files_modified: 1
  files_deleted: 1
requirements:
  - NAV-03
  - NAV-08
  - FIL-01
  - FIL-03
---

# Phase 02 Plan 02: Navigation Shell Summary

## One-liner

Shell persistente autenticada com App Router route group `(shell)`, rail recolhível, rotas URL-driven `library/[...path]` e `inbox/[item]`, e 18 testes cobrindo comportamentos críticos da navegação.

## What Was Built

### Task 1 — Shell persistente autenticada com rail recolhível

- `src/app/(shell)/layout.tsx`: layout server-side que chama `auth()` (T-02-05) antes de qualquer snapshot, depois carrega `getNavigationSnapshot()` e injeta em `AppShell`
- `src/app/(shell)/page.tsx`: rota `/` com `WorkspaceEmptyState` editorial (D-21)
- `src/components/shell/app-shell.tsx`: chrome estrutural com rail recolhível via `useState`, inbox compacta acima da árvore (D-01), topo do rail reservado para filtro/busca/settings futuros (D-25, FIL-01, FIL-03)
- `src/components/shell/workspace-empty-state.tsx`: estado vazio com display-lg editorial, sem listagem técnica de tópicos
- `src/app/page.tsx` removido — `(shell)/page.tsx` resolve `/` diretamente no App Router
- Design alinhado: No-Line Rule (separação por tonalidade), surface hierarchy, 8px grid, glassmorphism no rail

### Task 2 — Páginas URL-driven e workspace mínimo do item

- `src/app/(shell)/library/[...path]/page.tsx`: decode via `decodeLibraryParams` → resolução via `getItemById` → `WorkspaceItemState` (T-02-06, T-02-07)
- `src/app/(shell)/inbox/[item]/page.tsx`: decode via `decodeInboxParam` → resolução via `getItemById` → `WorkspaceItemState` (T-02-06, T-02-07)
- `src/components/shell/workspace-item-state.tsx`: mostra título/tipo/estado — sem conteúdo bruto, path absoluto ou sidecar (T-02-07)
- `getItemById` adicionado ao navigation-service: busca inbox e árvore recursivamente, nunca concatena paths ad hoc
- `src/__tests__/app-shell.test.tsx`: 18 testes — rail recolhível, persistência do workspace, namespaces library/inbox, decode canônico, round-trip itemToHref → decode

## Verification Results

- `./node_modules/.bin/tsc --noEmit`: passou sem erros
- `npm run test -- src/__tests__/app-shell.test.tsx`: 18/18 testes passando
- `npm run build` (com env vars): build completo com rotas `/`, `/library/[...path]`, `/inbox/[item]`, `/login`

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Remover `src/app/page.tsx` | No App Router, `(shell)/page.tsx` já resolve `/` — manter os dois causaria conflito |
| `getItemById` no navigation-service | Garante resolução canônica pós-decode; páginas de rota nunca concatenam paths diretamente (T-02-06) |
| `aria-hidden` para controle do rail | Verificável semanticamente nos testes sem depender de nomes de classes CSS que podem mudar |

## Deviations from Plan

### Auto-adicionado (Rule 2 — funcionalidade crítica ausente)

**1. [Rule 2 - Missing Critical] `getItemById` adicionado ao navigation-service**
- **Found during:** Task 2
- **Issue:** O plano exigia que "a resolução do item após o decode passe por helper/serviço canônico da camada de navegação/read model", mas o navigation-service não tinha nenhum método de busca por ID — apenas `getNavigationSnapshot`
- **Fix:** Adicionado `getItemById(itemId)` que busca no snapshot (inbox + árvore recursiva) e retorna `NavigationItemRef | null`
- **Files modified:** `src/lib/navigation/navigation-service.ts`
- **Commit:** 99528bb

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| Árvore exibe só tópicos raiz sem expansão interativa | `src/components/shell/app-shell.tsx` | Expansão completa da tree é escopo do próximo plano (02-03) |
| Filtro estrutural apenas reservado visualmente | `src/components/shell/app-shell.tsx` | FIL-02 e FIL-03 completos são escopo do próximo plano |
| WorkspaceItemState sem viewer rico | `src/components/shell/workspace-item-state.tsx` | Viewer rico (Markdown, imagem, PDF) é escopo da phase 3 — intencional |

Esses stubs são intencionais e documentados no plano: a phase 3 assume o viewer rico sem reestruturar as rotas.

## Threat Flags

Nenhuma superfície nova fora do threat model do plano foi introduzida. As mitigações T-02-05, T-02-06 e T-02-07 foram implementadas conforme especificado.

## Self-Check: PASSED
