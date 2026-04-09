---
plan: 03-05
phase: 03-reading-viewer
status: complete
wave: 4
completed_at: 2026-04-09
---

# SUMMARY — 03-05: InfoPanel + ViewerPage + ViewerClientShell + wiring das rotas

## O que foi construído

Loop completo do viewer: seleção de item na árvore → ViewerPage → Markdown rico + header sticky + painel de informações abrível.

## Tarefas executadas

| # | Tarefa | Status | Commit |
|---|--------|--------|--------|
| 1 | InfoPanel — Client Component com push layout e metadados pt-BR | ✓ | 10ffc5d |
| 2 | ViewerPage + ViewerClientShell + rotas library e inbox | ✓ | 2cf2bf7 |

## Artefatos criados/modificados

### src/components/viewer/info-panel.tsx
- **Tipo:** Client Component (`"use client"`)
- **Push layout:** `aside w-[280px] shrink-0` ao lado do conteúdo (D-14)
- **D-15:** `useEffect` captura tecla Escape → `onClose()`
- **D-16:** chips de tipo + estado no topo com maior destaque
- **D-17:** todos os campos ausentes omitidos completamente — sem N/A
- **D-18:** `<div data-slot="sidecar-content-phase4">` vazio reservado para Phase 4
- **Formatação pt-BR:** `Intl.DateTimeFormat("pt-BR")` para `data_captura` ("7 mar. 2026") e `data_publicacao` ("nov. 2025")
- **URL:** renderizado como `<a target="_blank" rel="noopener noreferrer">`
- **Autores:** cada autor como chip neutro
- **panelOpen=false:** retorna `null` (não renderiza)

### src/components/viewer/viewer-client-shell.tsx
- **Tipo:** Client Component (`"use client"`)
- **Estado:** `panelOpen` com `useState`, `togglePanel` e `closePanel` via `useCallback`
- **id="viewer-scroll":** no div de scroll — ViewerHeader escuta este elemento para glassmorphism
- **Layout:** `flex h-full overflow-hidden` → `div#viewer-scroll (flex-1 overflow-y-auto)` + `InfoPanel (w-[280px])`

### src/components/viewer/viewer-page.tsx
- **Tipo:** Server Component assíncrono
- **Dados:** `getItemContent(item.id)` + `getItemFrontmatter(item.id)` via `FsItemRepository`
- **Derivação:** `topic` e `group` extraídos do `item.id` (path relativo PKM)
- **Segurança T-3-03:** `item.path` absoluto nunca chega ao cliente; apenas `item.id` (relativo) processado server-side
- **Fallback:** `frontmatter ?? { estado: item.estado }` quando frontmatter indisponível

### src/app/(shell)/library/[...path]/page.tsx
- `WorkspaceItemState` substituído por `ViewerPage` — viewer rico com Markdown + header + painel

### src/app/(shell)/inbox/[item]/page.tsx
- `WorkspaceItemState` substituído por `ViewerPage` — mesmo viewer para itens da inbox

## Verificação de critérios

```
✓ WorkspaceItemState ausente em library/page.tsx
✓ WorkspaceItemState ausente em inbox/page.tsx
✓ ViewerPage em ambas as rotas
✓ id="viewer-scroll" em viewer-client-shell.tsx
✓ getItemContent() em viewer-page.tsx
✓ getItemFrontmatter() em viewer-page.tsx
✓ frontmatter.tipo renderizado condicionalmente (D-16)
✓ data-slot="sidecar-content-phase4" presente (D-18)
✓ Escape handler presente (D-15)
✓ Intl.DateTimeFormat pt-BR para datas
```

## Desvios

- Tarefa 1 (InfoPanel) executada por subagente que atingiu limite de uso antes de commitar/criar SUMMARY; commitado e continuado inline pelo orchestrator.
- Tarefa 2 executada inline pelo orchestrator (mesmo motivo: subagente sem permissão de Bash no ambiente de worktree).

## Loop fechado

```
Usuário clica em item na LeftRail
  → NavLink navega para /library/{path} ou /inbox/{item}
  → LibraryItemPage / InboxItemPage chama getItemById (server)
  → ViewerPage: getItemContent + getItemFrontmatter (server)
  → ViewerClientShell: renderiza header sticky + scroll + painel
  → MarkdownViewer: Markdown rico com Shiki + KaTeX + GFM
  → InfoPanel: metadados formatados em pt-BR (abrível via ℹ️ ou Escape)
```
