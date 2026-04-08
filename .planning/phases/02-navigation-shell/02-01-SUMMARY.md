---
phase: 02-navigation-shell
plan: "01"
subsystem: navigation
tags:
  - navigation
  - snapshot
  - read-model
  - route-helpers
  - tdd
dependency_graph:
  requires:
    - 01-03 (FsItemRepository, tipos PKM)
    - index/topicos.json
    - index/grupos.json
  provides:
    - NavigationSnapshot (inbox + tree + ancestorsByItemId)
    - NavigationItemRef, NavigationTreeNode, InboxEntry, NavigationItemKind
    - itemToHref, decodeLibraryParams, decodeInboxParam
  affects:
    - 02-02 (shell persistente consome getNavigationSnapshot)
    - 02-03 (árvore filtrável consome NavigationSnapshot)
    - 02-04 (viewer de item consome NavigationItemRef e hrefs canônicos)
tech_stack:
  added:
    - "@radix-ui/react-collapsible@^1.1.12"
    - "@radix-ui/react-scroll-area@^1.2.10"
    - "@radix-ui/react-tooltip@^1.2.8"
    - "fuse.js@^7.3.0"
  patterns:
    - NavigationSnapshot server-side acima do ItemRepository
    - Projeção de inbox separada da biblioteca estruturada
    - Ancestry calculada no servidor para reveal por URL direta
    - itemKind visual ortogonal ao estado do item
key_files:
  created:
    - src/lib/navigation/navigation-types.ts
    - src/lib/navigation/navigation-service.ts
    - src/lib/navigation/route-helpers.ts
    - src/__tests__/navigation-service.test.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - "NavigationService projetado acima do FsItemRepository, sem inflar a interface ItemRepository (A1 do RESEARCH confirmada)"
  - "Sidecars detectados por dupla extensão (.ext.md, .ext.excalidraw) e excluídos da árvore"
  - "ancestorsByItemId construído incrementalmente durante a projeção, cobrindo tópico → subtópico → grupo"
  - "itemToHref usa namespace separado library/ vs inbox/ sem concatenação livre nos componentes"
metrics:
  duration: "8 min"
  completed_date: "2026-04-08"
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 2
  tests_added: 22
  tests_passing: 22
---

# Phase 02 Plan 01: Navigation Snapshot e namespaces de URL Summary

**One-liner:** NavigationSnapshot server-side com inbox separada, contagens recursivas, ancestry por item e hrefs canônicos library/inbox via route-helpers tipados.

## What Was Built

Fundação semântica da fase 2: um read model de navegação acima do `FsItemRepository` que expõe um snapshot único consumível pela shell persistente e pelos componentes seguintes.

### Arquivos criados

- **`src/lib/navigation/navigation-types.ts`** — contratos `NavigationSnapshot`, `NavigationTreeNode`, `InboxEntry`, `NavigationItemRef` e `NavigationItemKind`; separação explícita entre tipo visual (`itemKind`) e estado operacional (`estado`)
- **`src/lib/navigation/navigation-service.ts`** — `getNavigationSnapshot()`: projeção server-side de inbox e árvore estruturada, contagens recursivas em todos os agrupadores, `ancestorsByItemId` para reveal por URL direta, detecção e exclusão de sidecars
- **`src/lib/navigation/route-helpers.ts`** — `itemToHref()`, `decodeLibraryParams()`, `decodeInboxParam()`: conversão bidirecional entre item lógico e URL canônica nos namespaces `library/` e `inbox/`
- **`src/__tests__/navigation-service.test.ts`** — 22 testes cobrindo os 6 contratos do plano: separação inbox/tree, contagens, itemKind por extensão, estado independente, hrefs canônicos e ancestry

### Dependências adicionadas

`@radix-ui/react-collapsible`, `@radix-ui/react-scroll-area`, `@radix-ui/react-tooltip` e `fuse.js` — usados pelos planos seguintes da fase 2 (árvore interativa e filtro estrutural).

## Verification

```
npm run typecheck  → PASSOU (sem erros)
npm run test       → 33/33 testes passando (22 novos + 11 anteriores)
```

Critérios verificados manualmente no código:
- `inbox` e `tree` são campos separados no snapshot
- `ancestorsByItemId` existe e mapeia apenas agrupadores da biblioteca (inbox excluída)
- `itemToHref()` produz somente namespaces `library/` e `inbox/`
- Sidecar não aparece como item estrutural independente (filtro por dupla extensão)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Tipagem] Funções auxiliares do teste com `any` implícito**
- **Encontrado durante:** Task 1 — typecheck após criação do arquivo de testes
- **Problema:** funções `collectItems`, `findItemByIdFragment`, etc. usavam `typeof snapshot.tree[0]["items"]` que gerava `any` implícito sem a implementação presente
- **Correção:** extraídas como funções tipadas explicitamente com `NavigationTreeNode[]` e `NavigationItemRef[]` importados do contrato de tipos
- **Arquivos modificados:** `src/__tests__/navigation-service.test.ts`
- **Commit:** 6135062

Nenhuma outra desvio — plano executado conforme especificado.

## Known Stubs

Nenhum stub de dados. O `getNavigationSnapshot()` projeta dados reais do PKM via índices e filesystem. O `searchByName()` herdado do `FsItemRepository` continua como stub documentado da fase 1, mas não faz parte do escopo deste plano.

## Threat Flags

Nenhuma nova superfície de segurança introduzida além do modelo já planejado no `<threat_model>` do plano. As mitigações T-02-01, T-02-02 e T-02-03 foram implementadas:
- Ancestry e contagens calculadas exclusivamente no servidor
- Nenhum path absoluto exposto no snapshot
- Escopo de item tipado explicitamente; hrefs gerados apenas via `route-helpers.ts`

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/lib/navigation/navigation-types.ts | FOUND |
| src/lib/navigation/navigation-service.ts | FOUND |
| src/lib/navigation/route-helpers.ts | FOUND |
| src/__tests__/navigation-service.test.ts | FOUND |
| .planning/phases/02-navigation-shell/02-01-SUMMARY.md | FOUND |
| commit 6135062 (Task 1) | FOUND |
| commit 27bfb56 (Task 2) | FOUND |
