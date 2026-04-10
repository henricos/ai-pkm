---
plan: 04-02
phase: 04-asset-viewer-and-item-context
status: complete
completed_at: 2026-04-10
tasks_total: 2
tasks_completed: 2
self_check: PASSED
---

# Summary — 04-02: Foundation de Backend

## O que foi construído

Foundation de backend da fase 4: contrato de contexto binário e rota de preview inline autenticada.

## Task 1: Contrato de repositório para sidecar (CTX-05, D-07, D-08)

- **`src/lib/pkm/types.ts`** — Interface `BinaryContext` adicionada com `sidecarContent: string | null` e `sidecarFrontmatter: RawFrontmatter | null`.
- **`src/lib/pkm/item-repository.ts`** — Método `getBinaryContext(id: string): BinaryContext` adicionado ao contrato da interface.
- **`src/lib/pkm/fs-item-repository.ts`** — Implementação de `getBinaryContext`: lê apenas o `.md` adjacente via `gray-matter`, nunca lê o binário como UTF-8. Retorna contexto nulo quando sidecar ausente, sem lançar erro.

Segurança: `resolveAndValidatePath()` bloqueia path traversal antes de qualquer acesso ao filesystem.

## Task 2: Rota de preview inline (VIEW-05, T-04-01, T-04-02, T-04-03)

- **`src/app/api/pkm/preview/[...path]/route.ts`** — Nova rota criada, semanticamente separada de `/api/pkm/raw`:
  - `Content-Disposition: inline` (permite visualização embutida no browser)
  - `X-Content-Type-Options: nosniff` presente
  - `auth()` guard obrigatório antes de qualquer operação de filesystem
  - Reutiliza `resolveItemPath()` como boundary de path traversal

Rota `/api/pkm/raw` intacta — continua usando `attachment` para download.

## Verificação

```
✓ src/__tests__/item-repository.test.ts  (16 testes — 38 total com navigation-service)
✓ src/__tests__/navigation-service.test.ts (22 testes)
✓ src/__tests__/preview-route.test.ts    (7 testes)
✓ src/__tests__/raw-route.test.ts        (5 testes)
```

Todos os contratos RED do 04-01 agora passam GREEN.

## key-files.created

- src/app/api/pkm/preview/[...path]/route.ts

## key-files.modified

- src/lib/pkm/types.ts
- src/lib/pkm/item-repository.ts
- src/lib/pkm/fs-item-repository.ts

## Desvios

Nenhum. Implementação seguiu exatamente o PLAN.md sem broad refactor.

## Self-Check

- [x] Todos os testes passando GREEN
- [x] `getBinaryContext` nunca lê binário como UTF-8 (validado por spy no mock)
- [x] Rota `/api/pkm/raw` intacta — apenas `attachment`
- [x] Rota `/api/pkm/preview` usa apenas `inline`
- [x] `resolveItemPath()` reutilizado como boundary de segurança
