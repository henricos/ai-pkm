---
plan: 03-04
phase: 03-reading-viewer
status: complete
wave: 3
completed_at: 2026-04-09
---

# SUMMARY — 03-04: MarkdownViewer + ViewerHeader + /api/pkm/raw

## O que foi construído

Os dois componentes visuais principais do reading viewer e o route handler de download autenticado.

## Tarefas executadas

| # | Tarefa | Status | Commit |
|---|--------|--------|--------|
| 1 | MarkdownViewer — Server Component async com Shiki + KaTeX + GFM | ✓ | 562915c |
| 2 | ViewerHeader — Client Component sticky com glassmorphism e ações CTX-02 | ✓ | 44a0576 |
| 3 | Route Handler GET /api/pkm/raw/[...path] — download autenticado | ✓ | 915ec28 |

## Artefatos criados

### src/components/viewer/markdown-viewer.tsx
- **Tipo:** Server Component assíncrono (`async function`)
- **Pipeline:** `MarkdownAsync` + `remarkGfm` + `remarkMath` + `rehypeKatex` + `rehypeShiki`
- **Links:** externos (`http://`, `https://`) → `target="_blank" rel="noopener noreferrer"`; internos → sem `target`
- **Estilo:** `<article className="prose prose-sm max-w-prose ...">` (VIEW-08)
- **Segurança:** `react-markdown` sanitiza por padrão — `defaultUrlTransform` rejeita `javascript:` URIs (T-3-02)
- **Zero JS:** highlighting feito no servidor via Shiki; sem bundle de highlight no cliente

### src/components/viewer/viewer-header.tsx
- **Tipo:** Client Component (`"use client"`)
- **Glassmorphism:** ouve scroll no `#viewer-scroll` via `useEffect`; aplica `.glass` quando `scrollTop > 8px`
- **Esquerda:** `topicLabel › groupLabel` (uppercase, tracking) + chip de estado (rascunho/finalizado)
- **Direita:** slot tema Phase 5 (placeholder invisível) | apresentação (disabled) | download raw | toggle ℹ️
- **Download:** `href="/api/pkm/raw/{encodeURIComponent(itemId)}"` com `download` attribute
- **Toggle painel:** `aria-pressed={panelOpen}` reflete estado (CTX-03)
- **INBOX:** `topic === "__inbox"` exibe "INBOX" (D-11)

### src/app/api/pkm/raw/[...path]/route.ts
- **Guard:** `auth()` → 401 imediatamente se não autenticado (T-3-04)
- **Path multi-segmento:** `params.path.join("/")` reconstrói `itemId` de segmentos
- **Conteúdo:** usa `FsItemRepository.getItemContent()` do plano 03-03
- **Headers:** `Content-Disposition: attachment; filename="..."` + `X-Content-Type-Options: nosniff`
- **Anti-traversal:** `resolveAndValidatePath()` no FsItemRepository — retorna 400 se detectado

## Habilita para Wave 4

- `ViewerPage` (03-05) pode agora importar e compor `MarkdownViewer` + `ViewerHeader` + `InfoPanel`
- `ViewerClientShell` pode renderizar os componentes com estado de painel
- Rotas de library e inbox podem usar `ViewerPage` como page component
