---
plan: 04-03
phase: 04-asset-viewer-and-item-context
status: complete
completed_at: 2026-04-10
tasks_total: 3
tasks_completed: 3
self_check: PASSED
---

# Summary — 04-03: Viewers Visuais e Contexto de Item

## O que foi construído

Experiência visual completa da fase 4: viewers leves para imagem e PDF, sidecar renderizado no InfoPanel e fallback editorial para formatos sem preview.

## Task 1: Componentes novos (VIEW-04, VIEW-05, VIEW-07, CTX-05)

- **`src/components/viewer/image-viewer.tsx`** — ImageViewer com zoom in/out/reset, `object-contain`, centralizado. Sem chrome pesado, sem pan livre (D-01, D-03, D-03b).
- **`src/components/viewer/pdf-viewer.tsx`** — PdfViewer com `<object type="application/pdf">` apontando para `/api/pkm/preview`. Fallback interno com link de download quando o browser não suporta PDF embutido (D-04, D-05, D-06b).
- **`src/components/viewer/unsupported-viewer.tsx`** — UnsupportedViewer com cópia editorial revisada, extraído do fallback inline do ViewerPage (D-10, D-11, D-13).
- **`src/components/viewer/sidecar-markdown.tsx`** — SidecarMarkdown com `react-markdown` (sync) + `remark-gfm`, sem `rehype-raw` (T-04-07). Tipografia editorial menor que o viewer principal (D-09).

## Task 2: Integração de componentes existentes

- **`src/components/viewer/viewer-page.tsx`** — Branch por `itemKind` movido ao topo antes de qualquer `getItemContent()` (T-04-06). `getBinaryContext()` chamado para todos os itens não-markdown. `sidecarFrontmatter` usado como fonte de metadados do InfoPanel para binários (binários não têm frontmatter próprio). URLs `previewHref`/`downloadHref` derivadas explicitamente por endpoint.
- **`src/components/viewer/viewer-client-shell.tsx`** — `sidecarContent` adicionado como prop opcional, repassado ao InfoPanel.
- **`src/components/viewer/info-panel.tsx`** — `sidecarContent` prop adicionada. Slot `sidecar-content-phase4` agora renderiza `SidecarMarkdown` com separador visual e label **"Contexto"** (D-08, D-09). Sem `sidecarContent`, slot permanece vazio (sem regressão Phase 3).

## Task 3: Verificação manual (aprovada)

Corpus real validado no browser:
- Imagem `levels-ai-coding.jpg`: ImageViewer, zoom funcional, InfoPanel com `estado: finalizado`, `data_captura: 9 abr. 2026` e seção **Contexto** com markdown editorial.
- PDF: preview inline via `/api/pkm/preview`, fallback de download quando não suportado.
- Sidecar no InfoPanel: separador + label "Contexto" + markdown rico.
- Excalidraw: UnsupportedViewer sem regressão.

## Desvios

- Mock de `FsItemRepository` em `viewer-page.test.tsx` atualizado para incluir `getBinaryContext` — o teste 04-01 havia omitido o método que 04-03 exigiria.
- `frontmatter` para binários derivado do `sidecarFrontmatter` (não de `getItemFrontmatter()` no binário): binários lidos como UTF-8 retornam `{}` do gray-matter, quebrando os chips de estado no InfoPanel.

## key-files.created

- src/components/viewer/image-viewer.tsx
- src/components/viewer/pdf-viewer.tsx
- src/components/viewer/unsupported-viewer.tsx
- src/components/viewer/sidecar-markdown.tsx

## key-files.modified

- src/components/viewer/viewer-page.tsx
- src/components/viewer/viewer-client-shell.tsx
- src/components/viewer/info-panel.tsx
- src/__tests__/viewer-page.test.tsx

## Self-Check

- [x] 126/126 testes passando
- [x] TypeScript sem erros
- [x] `getItemContent()` nunca chamado para binários (T-04-06, T-04-05)
- [x] Sidecar renderizado sem rehype-raw (T-04-07)
- [x] Preview usa inline, download usa attachment (T-04-03, VIEW-05)
- [x] Shell existente preservada sem refactor amplo
- [x] Validação humana aprovada no corpus real
