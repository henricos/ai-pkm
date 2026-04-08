---
phase: 02-navigation-shell
plan: "03"
subsystem: navigation-shell
tags: [navigation, filter, tree, inbox, rail, ui]
dependency_graph:
  requires:
    - "02-01"
    - "02-02"
  provides:
    - "rail-interativo-completo"
    - "filtro-estrutural"
    - "inbox-lane"
    - "navigation-tree"
  affects:
    - "src/components/shell"
    - "src/components/navigation"
    - "src/lib/navigation"
tech_stack:
  added:
    - "fuse.js (fuzzy search, já presente nas deps)"
  patterns:
    - "TDD: RED-GREEN para pipeline de filtro"
    - "Filtro client-side em duas etapas: regex/wildcard + fuzzy fallback"
    - "Árvore recursiva com disclosure acessível"
    - "Derivação de item ativo exclusivamente da URL (T-02-10)"
key_files:
  created:
    - src/lib/navigation/filter-tree.ts
    - src/__tests__/filter-tree.test.ts
    - src/components/navigation/highlight-match.tsx
    - src/components/navigation/item-kind-icon.tsx
    - src/components/navigation/navigation-tree.tsx
    - src/components/navigation/tree-node.tsx
    - src/components/shell/inbox-lane.tsx
    - src/components/shell/left-rail.tsx
    - src/components/shell/tree-filter-input.tsx
  modified:
    - src/components/shell/app-shell.tsx
decisions:
  - "Filtro em duas etapas: regex/wildcard primeiro, fuzzy fuse.js apenas como fallback com threshold conservador 0.35 — reduz falsos positivos (T-02-11)"
  - "ItemKindIcon extraído como componente compartilhado para InboxLane e TreeNode"
  - "HighlightMatch usa <mark> sem background (bg-transparent) para highlight sutil — apenas cor tertiary como laser-pointer"
metrics:
  duration: "~14 min"
  completed_date: "2026-04-08"
  tasks_completed: 2
  files_created: 9
  files_modified: 1
---

# Phase 02 Plan 03: Rail Interativo com Inbox, Árvore e Filtro Estrutural

**One-liner:** Rail completo com inbox separada, árvore recursiva com disclosure acessível, filtro client-side substring/wildcard/fuzzy com highlight de match, item ativo derivado da URL.

## O que foi entregue

### Task 1 — Pipeline de filtro estrutural (TDD)

**Arquivos:** `src/lib/navigation/filter-tree.ts`, `src/__tests__/filter-tree.test.ts`, `src/components/navigation/highlight-match.tsx`, `src/components/shell/tree-filter-input.tsx`

Pipeline `filterNavigationTree` em duas etapas:
1. Normalização + regex/wildcard (`*` escapado via `patternToRegex` — T-02-09)
2. Fallback fuzzy via `fuse.js` com threshold 0.35 (conservador — T-02-11)

Resultado sempre preserva a forma de árvore com ancestrais necessários (nunca lista achatada). Items do resultado carregam `matchOffsets: [number, number][]` para highlight sutil.

`highlightMatches` quebra o rótulo em segmentos `{ text, highlight }` para renderização com `<mark>`.

`HighlightMatch` renderiza o rótulo com trechos de match em `tertiary` sem background — sutil, como laser-pointer (DESIGN.md §6).

`TreeFilterInput` usa ícone de funil (não lupa) para distinguir visualmente filtro estrutural de busca textual avançada (FIL-03).

**14 testes cobrindo:** filtro vazio, substring em qualquer posição, wildcard `*`, tolerância de caixa/acento/desvio, preservação de árvore e offsets de highlight.

**Commit:** `6c442c5`

---

### Task 2 — Rail interativo com inbox e árvore

**Arquivos:** `src/components/shell/inbox-lane.tsx`, `src/components/shell/left-rail.tsx`, `src/components/navigation/navigation-tree.tsx`, `src/components/navigation/tree-node.tsx`, `src/components/navigation/item-kind-icon.tsx`, `src/components/shell/app-shell.tsx` (modificado)

**InboxLane** — lista compacta acima da árvore, componente separado que nunca passa pelo pipeline `filterNavigationTree` (T-02-12, D-13, D-19). Exibe ícone de tipo (D-11), estado discreto rascunho/finalizado (D-10), contagem.

**NavigationTree** — renderer recursivo com estado de expansão local. Inicia mostrando só raízes (D-07), autoexpande ancestrais ao detectar item ativo por URL (D-08). Recomputa expandidos quando `activeHref` muda.

**TreeNode** — nó acessível com `aria-expanded` nos agrupadores, `aria-current="page"` nos itens ativos. Agrupadores apenas expandem/recolhem (sem `href`) — D-12. Contagens em agrupadores (D-09). Estado visual discreto (D-10). Highlight via `HighlightMatch`.

**ItemKindIcon** — componente compartilhado extraído para reutilização entre `InboxLane` e `TreeNode`.

**LeftRail** — compõe filtro + inbox + árvore. Aplica `filterNavigationTree` somente à `tree` do snapshot — inbox fica intacta.

**AppShell** — integra `LeftRail` com `activeHref` passado pelo pai (derivado da URL — T-02-10).

**Commit:** `532aaca`

---

## Verificação

- `npm run typecheck`: passou limpo
- `npm run test -- src/__tests__/filter-tree.test.ts`: 14/14 testes passaram
- `npm run test -- src/__tests__/app-shell.test.tsx`: 18/18 testes passaram
- `npm run build`: compilação TypeScript bem-sucedida (10s); falha no data collection por env vars ausentes no CI — comportamento esperado e documentado na fase 1

### Confirmações de código

- Inbox renderizada por `InboxLane`, componente separado da árvore
- Agrupadores não têm `href` — só `onToggle` via `button`
- Item ativo derivado de `activeHref === item.href` (T-02-10)
- Filtro `filterNavigationTree` nunca recebe `snapshot.inbox`

---

## Deviations from Plan

### Auto-adicionado

**1. [Rule 2 - Missing Component] ItemKindIcon extraído como componente compartilhado**
- **Found during:** Task 2
- **Issue:** `InboxLane` e `TreeNode` precisavam do mesmo ícone de tipo. Duplicar o SVG inline violaria DRY e tornaria manutenção frágil.
- **Fix:** Extraído `ItemKindIcon` em `src/components/navigation/item-kind-icon.tsx`
- **Files modified:** `src/components/navigation/item-kind-icon.tsx` (criado), `src/components/shell/inbox-lane.tsx`, `src/components/navigation/tree-node.tsx`

Fora isso, o plano foi executado exatamente como escrito.

---

## Known Stubs

Nenhum. O `activeHref` é prop obrigatória passada pelo pai (página Next.js que lê `usePathname()` ou `pathname` da rota). O `AppShell` expõe a prop — o caller é responsável por injetá-la. Não há hardcode de dados vazios nos componentes críticos.

---

## Threat Flags

Nenhum novo surface fora do threat model do plano.

---

## Self-Check: PASSED

Arquivos criados verificados:
- `src/lib/navigation/filter-tree.ts` — existe
- `src/__tests__/filter-tree.test.ts` — existe (14 testes passam)
- `src/components/navigation/highlight-match.tsx` — existe
- `src/components/navigation/item-kind-icon.tsx` — existe
- `src/components/navigation/navigation-tree.tsx` — existe
- `src/components/navigation/tree-node.tsx` — existe
- `src/components/shell/inbox-lane.tsx` — existe
- `src/components/shell/left-rail.tsx` — existe
- `src/components/shell/tree-filter-input.tsx` — existe
- `src/components/shell/app-shell.tsx` — modificado

Commits verificados:
- `6c442c5` — Task 1 (filtro + testes + highlight + input)
- `532aaca` — Task 2 (rail interativo completo)
