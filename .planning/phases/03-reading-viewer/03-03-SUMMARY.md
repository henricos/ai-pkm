---
phase: 03-reading-viewer
plan: "03"
subsystem: pkm-repository
tags: [item-repository, frontmatter, types, path-traversal, tdd]
dependency_graph:
  requires: [03-02]
  provides: [getItemContent, getItemFrontmatter, RawFrontmatter]
  affects: [markdown-viewer, info-panel]
tech_stack:
  added: []
  patterns: [gray-matter-parse, resolve-and-validate-path, interface-extension]
key_files:
  created: []
  modified:
    - src/lib/pkm/types.ts
    - src/lib/pkm/item-repository.ts
    - src/lib/pkm/fs-item-repository.ts
    - src/__tests__/item-repository.test.ts
decisions:
  - "resolveAndValidatePath() extraído como método privado compartilhado para evitar duplicação do guard de segurança T-3-01"
  - "RawFrontmatter usa campo estado como string (não ItemEstado) para máxima compatibilidade com frontmatter bruto"
metrics:
  duration: "~12 min"
  completed: "2026-04-09"
  tasks_completed: 2
  files_modified: 4
---

# Phase 03 Plan 03: ItemRepository — getItemContent e getItemFrontmatter

Extensão do ItemRepository com getItemContent() e getItemFrontmatter(), exportação de RawFrontmatter com campo tipo (D-16), e método privado resolveAndValidatePath() como guard de segurança T-3-01 compartilhado entre os três métodos de leitura.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Adicionar RawFrontmatter a types.ts e métodos à interface ItemRepository | 9c62e9f | src/lib/pkm/types.ts, src/lib/pkm/item-repository.ts |
| 2 | Implementar getItemContent() e getItemFrontmatter() em FsItemRepository | 63a4bce | src/lib/pkm/fs-item-repository.ts, src/__tests__/item-repository.test.ts |

## What Was Built

### RawFrontmatter (types.ts)

Nova interface exportada com campos do frontmatter de itens PKM para consumo pelo InfoPanel:

- `tipo?` (string opcional) — para chips coloridos do D-16
- `estado` (string obrigatório) — estado editorial do item
- `modelo?`, `data_captura?`, `data_publicacao?`, `url?`, `autores?` — campos opcionais

### Interface ItemRepository atualizada

Dois novos métodos adicionados ao contrato:

- `getItemContent(id: string): string` — retorna Markdown puro sem frontmatter (VIEW-01)
- `getItemFrontmatter(id: string): RawFrontmatter | null` — retorna metadados para InfoPanel (CTX-04)

### FsItemRepository — implementação

- `resolveAndValidatePath(id)` — método privado que centraliza decode + validação anti-path traversal; usado por `getItem()`, `getItemContent()` e `getItemFrontmatter()`
- `getItemContent()` — usa `gray-matter` para extrair body sem frontmatter, aplica `.trim()`
- `getItemFrontmatter()` — usa `gray-matter` para extrair `data`, faz cast para `RawFrontmatter`
- `getItem()` refatorado para usar `resolveAndValidatePath()` (sem mudança de comportamento)

### Testes

5 novos testes adicionados em `item-repository.test.ts`:

| Teste | Requisito | Comportamento verificado |
|-------|-----------|--------------------------|
| VIEW-01: getItemContent retorna Markdown sem frontmatter | VIEW-01 | Conteúdo presente, frontmatter ausente, delimitadores ausentes |
| T-3-01: getItemContent lança path traversal | T-3-01 | `../../../etc/passwd` lança "Path traversal detectado" |
| CTX-04: getItemFrontmatter retorna campos incluindo tipo | CTX-04 | estado, tipo, url, autores corretos |
| T-3-01: getItemFrontmatter lança path traversal | T-3-01 | `../../../etc/passwd` lança "Path traversal detectado" |
| CTX-04: getItemFrontmatter retorna null para inexistente | CTX-04 | arquivo ausente retorna null |

**Resultado:** 11/11 testes passando (6 existentes + 5 novos). Nenhuma regressão.

## Verification Results

```
npx tsc --noEmit → sem erros em types.ts, item-repository.ts, fs-item-repository.ts
vitest run item-repository → 11 passed (11)
grep "resolveAndValidatePath" fs-item-repository.ts → 4 ocorrências (1 def + 3 calls)
grep "export interface RawFrontmatter" types.ts → 1 ocorrência
grep "tipo?" types.ts → campo tipo opcional presente
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Variável `decoded` indefinida após extração do resolveAndValidatePath**

- **Found during:** Tarefa 2
- **Issue:** Ao refatorar `getItem()` para usar `resolveAndValidatePath()`, a variável `decoded` foi removida mas ainda era usada para inferir tipo, tópico e nome do item
- **Fix:** Mantida a declaração `const decoded = decodeURIComponent(id)` em `getItem()` (o método resolve o path internamente mas getItem precisa de decoded para outras operações)
- **Files modified:** src/lib/pkm/fs-item-repository.ts
- **Commit:** 63a4bce

## Known Stubs

Nenhum stub introduzido neste plano. Os métodos implementados retornam dados reais do filesystem.

## Threat Flags

Nenhuma surface nova além do que foi modelado em `<threat_model>`. As ameaças T-3-01 e T-3-03 foram mitigadas conforme planejado.

## Self-Check: PASSED

- [x] src/lib/pkm/types.ts — modificado com RawFrontmatter
- [x] src/lib/pkm/item-repository.ts — interface atualizada com getItemContent e getItemFrontmatter
- [x] src/lib/pkm/fs-item-repository.ts — implementação com resolveAndValidatePath
- [x] src/__tests__/item-repository.test.ts — 5 novos testes adicionados
- [x] Commit 9c62e9f — Tarefa 1 (tipos e interface)
- [x] Commit 63a4bce — Tarefa 2 (implementação e testes)
- [x] 11/11 testes passando sem regressão
