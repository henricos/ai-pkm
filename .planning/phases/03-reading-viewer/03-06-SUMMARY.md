---
phase: 03-reading-viewer
plan: "06"
subsystem: viewer
tags: [gap-closure, uat, math, binary, frontmatter, date-normalization]
dependency_graph:
  requires: [03-01, 03-02, 03-03, 03-04, 03-05]
  provides: [uat-gaps-closed, binary-download, date-normalization, itemkind-branch]
  affects: [viewer-page, markdown-viewer, fs-item-repository, raw-route]
tech_stack:
  added: []
  patterns:
    - remarkMath com singleDollarTextMath:false para evitar colisão com cifrões monetários
    - Normalização de Date→string ISO antes de retornar RawFrontmatter
    - Branch por itemKind em ViewerPage antes de chamar MarkdownViewer
    - Leitura binária (Buffer sem encoding) no route handler para arquivos não-.md
    - Método público resolveItemPath() delegando para resolveAndValidatePath() privado
key_files:
  modified:
    - src/components/viewer/markdown-viewer.tsx
    - src/components/viewer/viewer-page.tsx
    - src/lib/pkm/fs-item-repository.ts
    - src/app/api/pkm/raw/[...path]/route.ts
    - src/__tests__/raw-route.test.ts
    - .planning/phases/03-reading-viewer/03-UAT.md
  created:
    - src/__tests__/viewer-page.test.tsx
decisions:
  - "resolveItemPath() público delega para resolveAndValidatePath() — boundary de segurança preservado (T-3-06-01)"
  - "Branch por itemKind usa o campo já presente em NavigationItemRef — sem mudança nos callers (LibraryItemPage, InboxItemPage)"
  - "Arquivos .md no route handler continuam usando getItemContent() (strip frontmatter) — comportamento preferido pelo usuário"
metrics:
  duration: "~18 min"
  completed_date: "2026-04-10"
  tasks_completed: 4
  files_changed: 7
---

# Phase 3 Plan 06: Fechamento de Gaps UAT — Summary

**One-liner:** Quatro correções cirúrgicas fecham todos os gaps do UAT da Phase 3 — cifrão monetário sem LaTeX, binários com mensagem de formato não suportado, download de binários sem corrupção (Buffer), e painel de informações sem crash (data_captura normalizada de Date para string ISO).

## Tasks Executadas

| Task | Arquivo | Mudança | Commit |
|------|---------|---------|--------|
| 1 | markdown-viewer.tsx | `remarkMath` com `{ singleDollarTextMath: false }` | adf86a4 |
| 2 | fs-item-repository.ts | Normaliza `data_captura instanceof Date` para string ISO | 1e1e912 |
| 3 | viewer-page.tsx + viewer-page.test.tsx | Branch `item.itemKind !== 'markdown'` retorna unsupported-format | 1886983 |
| 4 | route.ts + fs-item-repository.ts + raw-route.test.ts | Buffer para binários, `resolveItemPath()` público | 2a02530 |

## Gaps UAT Fechados

| Gap | Severidade | Status |
|-----|-----------|--------|
| #1: Cifrão monetário ativa LaTeX | major | fixed |
| #2: Binários exibem conteúdo bruto | major | fixed |
| #3: Download de binários corrompido | major | fixed |
| #4: Crash do painel de informações | blocker | fixed |

## Resultado dos Testes

```
Test Files  11 passed (11)
Tests       102 passed (102)
```

Testes antes: 93 passing (94 total, 1 pré-existente falho em app-shell)
Testes depois: 102 passing (11 arquivos, todos verdes)
Novos testes adicionados: 9 (5 em viewer-page.test.tsx + 3 novos + 1 existente no raw-route.test.ts)

## Deviações do Plano

Nenhuma — plano executado exatamente como escrito.

A única adaptação menor: as assertions do `viewer-page.test.tsx` foram escritas com `.toBeTruthy()` / `.toBeNull()` em vez de `.toBeInTheDocument()` (padrão `@testing-library/jest-dom`), seguindo o padrão estabelecido pelos demais testes do projeto (sem `setupFiles` no vitest.config que configure `@testing-library/jest-dom`).

## Known Stubs

Nenhum stub introduzido por este plano.

## Self-Check: PASSED

Arquivos verificados:
- `src/components/viewer/markdown-viewer.tsx` — `singleDollarTextMath: false` presente
- `src/lib/pkm/fs-item-repository.ts` — normalização `data_captura instanceof Date` presente, `resolveItemPath()` público presente
- `src/components/viewer/viewer-page.tsx` — branch `item.itemKind !== "markdown"` presente
- `src/app/api/pkm/raw/[...path]/route.ts` — `CONTENT_TYPE_MAP`, `isBinary`, `Buffer` presentes
- `src/__tests__/viewer-page.test.tsx` — criado com 5 testes
- `src/__tests__/raw-route.test.ts` — atualizado com mock de `resolveItemPath` e `fs`
- `.planning/phases/03-reading-viewer/03-UAT.md` — todos os 4 gaps com `status: fixed`

Commits verificados: adf86a4, 1e1e912, 1886983, 2a02530 — todos presentes no log do worktree.
