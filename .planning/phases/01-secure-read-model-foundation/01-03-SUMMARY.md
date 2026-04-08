---
phase: 01-secure-read-model-foundation
plan: "03"
subsystem: read-model
tags: [item-repository, filesystem, typescript, path-traversal, gray-matter, vitest, api-route]
dependency_graph:
  requires:
    - 01-01 (next.js scaffold, vitest, env.ts stub)
    - 01-02 (env.ts completo com PKM_PATH validado, auth())
  provides:
    - pkm-types-contract
    - item-repository-interface
    - fs-item-repository-impl
    - get-topics-endpoint
  affects:
    - 01-04 (dev setup — documenta PKM_PATH e como o read model é acessado)
tech_stack:
  added: []
  patterns:
    - Interface + implementação filesystem com seam para v3 (ARC-04)
    - Fast path via index/topicos.json e index/grupos.json (ARC-01)
    - Path traversal prevenido via path.resolve + startsWith (T-1-10)
    - gray-matter para parsing de frontmatter YAML de itens individuais
    - Inferência de ItemType exclusivamente pelo nome do arquivo (nunca frontmatter)
key_files:
  created:
    - src/lib/pkm/types.ts
    - src/lib/pkm/item-repository.ts
    - src/lib/pkm/fs-item-repository.ts
    - src/app/api/pkm/topics/route.ts
  modified:
    - src/__tests__/item-repository.test.ts (test.todo → implementação real)
    - .gitignore (pkm → /pkm para não ignorar src/lib/pkm/)
decisions:
  - "inferType() usa somente nome do arquivo: prefixo url_ → url; .ext.md → binario (sidecar); não-.md → binario; demais → nota"
  - "searchByName() retorna [] como stub intencional — seam ARC-04 preparada para implementação futura sem alterar interface"
  - "Índices lidos de process.cwd()/index/ (raiz do ai-pkm) — não de PKM_PATH — conforme RESEARCH.md A2"
  - "path.resolve(pkmRoot, decoded) + startsWith(pkmRoot + sep) como boundary de path traversal (T-1-10)"
metrics:
  duration: "6 min"
  completed_date: "2026-04-08"
  tasks_completed: 2
  files_created: 4
  files_modified: 2
---

# Phase 1 Plan 03: Interface ItemRepository + FsItemRepository + Endpoint de Validação — Summary

**One-liner:** Interface ItemRepository com seam para v3, implementação FsItemRepository com path traversal prevenido via path.resolve, e endpoint GET /api/pkm/topics protegido por auth — 11 testes passando.

---

## O que foi entregue

### Tarefa 1: Contratos TypeScript — types.ts e ItemRepository

**src/lib/pkm/types.ts** — tipos canônicos do domínio PKM:
- `ItemType`: `"nota" | "url" | "binario"` — inferido do nome do arquivo, nunca do frontmatter
- `ItemEstado`: `"rascunho" | "finalizado"` — espelha o campo `estado` do frontmatter
- `Item`: interface com `id` (path relativo ao pkm root), `path` (absoluto), `name`, `type`, `estado`, `topic`, `group?`, `dataCaptura`, `url?` (apenas type=url), `sidecarPath?` (apenas binário com sidecar)
- `Subtopic`, `Topic`, `Group`: estruturas de navegação alinhadas com `index/topicos.json` e `index/grupos.json`

**src/lib/pkm/item-repository.ts** — interface de abstração (ARC-04):
- `listTopics(): Topic[]` — fast path via index/topicos.json
- `listGroups(topic: string): Group[]` — fast path via index/grupos.json filtrado
- `getItem(id: string): Item | null` — resolve path relativo com validação de segurança
- `searchByName(q: string): Item[]` — seam preparada para busca futura

### Tarefa 2: FsItemRepository + endpoint + testes (TDD)

**src/lib/pkm/fs-item-repository.ts** — implementação filesystem:

Construtor:
```typescript
this.pkmRoot = path.resolve(env.PKM_PATH);
this.indexDir = path.join(process.cwd(), "index");
```

Validação de path traversal em `getItem()`:
```typescript
const absPath = path.resolve(this.pkmRoot, decoded);
if (!absPath.startsWith(this.pkmRoot + path.sep) && absPath !== this.pkmRoot) {
  throw new Error(`Path traversal detectado: ${id}`);
}
```

Inferência de tipo:
```typescript
private inferType(filename: string, relPath: string): ItemType {
  if (filename.startsWith("url_")) return "url";
  const isSidecar = /\.[^.]+\.[^.]+$/.test(relPath);
  if (isSidecar) return "binario";
  if (!relPath.endsWith(".md")) return "binario";
  return "nota";
}
```

**src/app/api/pkm/topics/route.ts** — endpoint de validação:
- `GET /api/pkm/topics` — verifica sessão via `auth()` e retorna `{ topics: Topic[] }`
- Sem sessão: `401 Unauthorized`
- Erro de filesystem: `500` com mensagem (sem stack trace)

**src/__tests__/item-repository.test.ts** — 5 testes implementados (era test.todo):
- `ARC-01`: `listTopics()` retorna `Topic[]` de topicos.json
- `ARC-01`: `listGroups("tecnologia")` retorna grupos filtrados
- `ARC-02`: `getItem()` resolve ID estável (path relativo)
- `ARC-03`: `getItem("tecnologia/url_exemplo.md")` retorna `type === "url"`
- `ARC-04`: `FsItemRepository` satisfaz `ItemRepository` (typecheck + runtime)
- `RUN-02`: `getItem("../../../etc/passwd")` lança `Error("Path traversal detectado")`

### Localização dos índices JSON em runtime

Os índices ficam em `process.cwd()/index/` — raiz do repositório `ai-pkm`. Em produção/Docker, garantir que o volume inclui o diretório `index/` do ai-pkm junto com o código. `PKM_PATH` aponta exclusivamente para o repositório `pkm/` montado externamente.

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] .gitignore ignorava src/lib/pkm/ por padrão glob**

- **Encontrado durante:** Tarefa 1 (ao tentar fazer git add)
- **Issue:** O `.gitignore` continha `pkm` (sem `/` inicial), o que faz o git ignorar qualquer diretório chamado `pkm` em qualquer profundidade — incluindo `src/lib/pkm/`
- **Fix:** Alterado para `/pkm` (com `/` inicial) para restringir o ignore à pasta raiz `pkm/` montada externamente, sem afetar `src/lib/pkm/`
- **Arquivos modificados:** `.gitignore`
- **Commit:** `1a59a30`

---

## Known Stubs

| Arquivo | Conteúdo stub | Razão | Plano que resolve |
|---------|---------------|-------|------------------|
| `src/lib/pkm/fs-item-repository.ts` `searchByName()` | Retorna `[]` sempre | Fase 1 não inclui busca textual; seam ARC-04 preparada | Fase futura (busca) |

O stub de `searchByName` é **intencional** — a interface já declara o método, a implementação retorna lista vazia, e a seam está preparada para implementação futura sem alterar os consumers.

---

## Threat Flags

Nenhuma nova superfície de segurança além do threat model do plano. Mitigações implementadas:

- **T-1-10** (path traversal): `path.resolve(pkmRoot, decoded) + startsWith(pkmRoot + sep)` — qualquer `../` que escape o pkm root lança `Error("Path traversal detectado")`. Testado via `RUN-02`.
- **T-1-11** (exposição de estrutura): Endpoint protegido por `auth()` no Route Handler + middleware universal. Sem sessão → 401.
- **T-1-12** (PKM_PATH malicioso): `path.resolve()` normaliza o path; a validação de prefix impede acesso fora do pkm_root.

---

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `src/lib/pkm/types.ts` | FOUND |
| `src/lib/pkm/item-repository.ts` | FOUND |
| `src/lib/pkm/fs-item-repository.ts` | FOUND |
| `src/app/api/pkm/topics/route.ts` | FOUND |
| `src/__tests__/item-repository.test.ts` | FOUND (5 testes implementados) |
| commit `1a59a30` (Tarefa 1) | FOUND |
| commit `7892c0e` (Tarefa 2) | FOUND |
| `npm run test` passa | PASSED (11 passed) |
| `npm run typecheck` passa | PASSED |
| Path traversal testado | CONFIRMED (RUN-02) |
| Sem test.todo() remanescentes em item-repository.test.ts | CONFIRMED |
