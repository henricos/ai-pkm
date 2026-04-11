---
phase: 04-asset-viewer-and-item-context
verified: 2026-04-11T15:30:10Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Abrir 2-3 imagens reais do corpus e confirmar enquadramento, zoom in/out/reset"
    expected: "Asset ocupa a area principal, fica centralizado; controles se limitam a zoom in/out/reset; sem chrome pesado"
    why_human: "Comportamento visual e suporte nativo do browser nao podem ser verificados por grep/typecheck"
  - test: "Abrir 2-3 PDFs reais em pelo menos um navegador alvo"
    expected: "Preview inline aparece no viewer quando o browser suporta PDF embutido; quando nao suportado, fallback de download fica claro dentro da area do PDF"
    why_human: "Suporte a <object type='application/pdf'> varia por browser e nao e verificavel programaticamente"
  - test: "Abrir um binario com sidecar e expandir o InfoPanel"
    expected: "Texto complementar (SidecarMarkdown) aparece ao final com separador visual e label 'Contexto'; hierarquia editorial menor que o asset principal; sem YAML cru exposto"
    why_human: "Julgamento visual de hierarquia editorial requer observacao humana no browser real"
  - test: "Abrir um .excalidraw"
    expected: "UnsupportedViewer exibido com mensagem clara e CTA de download; sem regressao da shell"
    why_human: "Coerencia editorial e ausencia de regressao visual exigem validacao no browser"
---

# Phase 4: Asset Viewer and Item Context — Relatorio de Verificacao

**Objetivo da fase:** Usuario abre imagens e PDFs com comportamento previsivel, e binario + sidecar passam a aparecer como um unico item logico com contexto complementar acessivel.
**Verificado em:** 2026-04-11T15:30:10Z
**Status:** passed
**Re-verificacao:** Sim — UAT humana concluida em `04-UAT.md`

---

## Conquista do Objetivo

### Verdades Observaveis (ROADMAP Success Criteria)

| # | Verdade | Status | Evidencia |
|---|---------|--------|-----------|
| 1 | Imagens abrem como conteudo principal com enquadramento e zoom confortaveis | VERIFIED | UAT humana em `04-UAT.md`, teste 1: 2-3 imagens reais aprovadas no browser com asset centralizado, `object-contain` e controles limitados a zoom in/out/reset. |
| 2 | PDFs contam com preview suficiente quando suportado; quando nao, interface deixa claro o fallback de download | VERIFIED | UAT humana em `04-UAT.md`, teste 2: preview inline aprovado no Chrome. Observacao cosmetica registrada sobre chrome do viewer nativo, sem bloquear a aprovacao. |
| 3 | Sidecars textuais deixam de poluir a navegacao e aparecem apenas como contexto do item binario principal | VERIFIED | `navigation-service.test.ts` testa "Sidecar NAO aparece como item independente na tree" — 22 testes passando. Sidecar e consumido exclusivamente via `getBinaryContext()` → `sidecarContent` → `InfoPanel`. |
| 4 | Quando arquivo nao tem preview renderizavel, usuario recebe mensagem clara e consegue baixar | VERIFIED | `UnsupportedViewer` renderiza mensagem editorial ("Visualizacao nao disponivel para este formato") + CTA "Use o botao de download". `ViewerPage` roteia `binary` e `excalidraw` para este componente. |
| 5 | Binarios com sidecar exibem texto complementar dentro do painel de informacoes do item principal | VERIFIED | `InfoPanel` aceita `sidecarContent?: string | null`; slot `sidecar-content-phase4` renderiza `SidecarMarkdown` quando presente; 13 testes de `info-panel.test.tsx` passando. |

**Score final:** 5/5 verdades verificadas. Tres por evidencias automatizadas e duas por UAT humana registrada em `04-UAT.md`.

**Nota:** A observacao cosmetica do Chrome para PDF nativo foi registrada como nao-bloqueante na UAT e nao invalida os criterios de sucesso da fase.

---

### Artefatos Obrigatorios

| Artefato | Esperado | Status | Detalhes |
|----------|----------|--------|----------|
| `src/components/viewer/image-viewer.tsx` | Viewer leve de imagem com zoom in/out/reset | VERIFIED | 66 linhas. Implementa `useState(scale)`, botoes zoom-in/zoom-out/zoom-reset com `data-testid`. `object-contain` presente. Sem dependencias externas pesadas. |
| `src/components/viewer/pdf-viewer.tsx` | Viewer de PDF com `<object>` e fallback interno | VERIFIED | 49 linhas. Usa `<object type="application/pdf">` com `data={previewUrl}`. Fallback com link para `downloadUrl`. Sem pdf.js. |
| `src/components/viewer/unsupported-viewer.tsx` | Fallback editorial reutilizavel | VERIFIED | 34 linhas. `data-testid="unsupported-format"` presente. Mensagem editorial revisada. `data-item-kind={itemKind}` para rastreabilidade. |
| `src/components/viewer/sidecar-markdown.tsx` | Render do sidecar com react-markdown | VERIFIED | 28 linhas. Usa `react-markdown` + `remarkGfm`. Sem `rehype-raw`. `data-testid="sidecar-markdown-content"`. Tipografia menor (`prose-xs`). |
| `src/components/viewer/viewer-page.tsx` | Orquestracao por itemKind + contexto binario | VERIFIED | Branch `itemKind` no topo antes de qualquer `getItemContent()`. `getBinaryContext()` chamado para todos os nao-markdown. `previewHref`/`downloadHref` derivados por endpoint. |
| `src/lib/pkm/types.ts` | Tipo `BinaryContext` | VERIFIED | Interface `BinaryContext { sidecarContent: string | null; sidecarFrontmatter: RawFrontmatter | null }` presente (linhas 83-88). |
| `src/lib/pkm/item-repository.ts` | Contrato `getBinaryContext` | VERIFIED | Metodo `getBinaryContext(id: string): BinaryContext` declarado na interface (linha 59). |
| `src/lib/pkm/fs-item-repository.ts` | Implementacao segura de `getBinaryContext` | VERIFIED | Le apenas o `.md` adjacente via `gray-matter`. Nunca le o binario como UTF-8. Retorna `{ null, null }` quando sidecar ausente. `resolveItemPath()` publico para reutilizacao no route handler. |
| `src/app/api/pkm/preview/[...path]/route.ts` | Rota inline autenticada com nosniff | VERIFIED | `auth()` no topo (T-04-02). `resolveItemPath()` como boundary (T-04-01). `Content-Disposition: inline`. `X-Content-Type-Options: nosniff`. |

---

### Verificacao de Links Chave

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `viewer-page.tsx` | `item-repository.ts` | `getBinaryContext()` antes de `getItemContent()` | WIRED | `getItemContent()` aparece apenas no branch `markdown`. `getBinaryContext()` chamado para todos os outros branches (linha 72). |
| `image-viewer.tsx` | `/api/pkm/preview/[...path]` | `src={previewHref}` | WIRED | `previewHref = /api/pkm/preview/${encodedId}` derivado em `viewer-page.tsx` e passado como `src` ao `ImageViewer`. |
| `pdf-viewer.tsx` | `/api/pkm/preview/[...path]` | `data` do `<object type="application/pdf">` | WIRED | `previewUrl` recebe `previewHref`; `<object data={previewUrl}>` na linha 26 de `pdf-viewer.tsx`. |
| `preview route` | `fs-item-repository.ts` | `resolveItemPath()` para traversal guard | WIRED | Linha 54: `const absPath = repo.resolveItemPath(itemId)`. Path traversal capturado no `catch` (linha 82). |
| `info-panel.tsx` | `sidecar-markdown.tsx` | slot `sidecar-content-phase4` | WIRED | `SidecarMarkdown` importado em `info-panel.tsx` (linha 19). Renderizado condicionalmente em `sidecarContent ?` (linha 193-202). |
| `viewer-client-shell.tsx` | `info-panel.tsx` | `sidecarContent` prop | WIRED | Prop `sidecarContent` declarada em `ViewerClientShellProps` (linha 31) e passada ao `InfoPanel` (linha 73). |

---

### Rastreio de Fluxo de Dados (Level 4)

| Artefato | Variavel de Dados | Fonte | Produz Dados Reais | Status |
|----------|-------------------|-------|--------------------|--------|
| `ImageViewer` | `src: string` | `previewHref = /api/pkm/preview/${item.id}` no `ViewerPage` | Sim — `item.id` vem do sistema de navegacao; rota le arquivo real via `fs.readFileSync(absPath)` | FLOWING |
| `PdfViewer` | `previewUrl: string` | Idem — `previewHref` do `ViewerPage` | Sim | FLOWING |
| `InfoPanel` (sidecar) | `sidecarContent: string | null` | `binaryContext.sidecarContent` via `getBinaryContext()` no `ViewerPage` | Sim — `getBinaryContext()` le o `.md` adjacente real via `fs.readFileSync(sidecarPath, "utf-8")` + `gray-matter` | FLOWING |
| `SidecarMarkdown` | `content: string` | Passado do `InfoPanel` via prop | Sim — dado real lido do sidecar | FLOWING |

---

### Spot-Checks Comportamentais (Level 7b)

| Comportamento | Comando | Resultado | Status |
|--------------|---------|-----------|--------|
| 45 testes da fase 4 passando | `npx vitest run viewer-page info-panel preview-route item-repository` | 45 passed (4 files) | PASS |
| Suites de regressao passando | `npx vitest run` | 126/126 passed (12 files) | PASS |
| TypeScript sem erros | `npm run typecheck` | Sem saida de erros | PASS |
| `getItemContent()` nao chamado para binarios | grep em `viewer-page.tsx` | Aparece apenas no branch `itemKind === "markdown"` | PASS |
| `rehype-raw` ausente nos viewers | grep em `src/components/viewer/` | Sem ocorrencias em arquivos de producao | PASS |
| `Content-Disposition: inline` na rota de preview | grep em `preview/route.ts` | Linha 76: `inline; filename=` | PASS |
| `X-Content-Type-Options: nosniff` | grep em `preview/route.ts` | Linha 77: presente | PASS |

---

### Cobertura de Requisitos

| Requisito | Plano | Descricao | Status | Evidencia |
|-----------|-------|-----------|--------|-----------|
| VIEW-04 | 04-01, 04-03 | Viewer de imagem com zoom | SATISFIED | `ImageViewer` com zoom in/out/reset implementado; testes passando |
| VIEW-05 | 04-01, 04-02, 04-03 | Preview inline de PDF separado de download | SATISFIED | `PdfViewer` + rota `/api/pkm/preview` com `inline`; rota `/api/pkm/raw` mantida com `attachment` |
| VIEW-06 | 04-02, 04-03 | Rota autenticada para preview | SATISFIED | `auth()` guard no topo da rota de preview; 401 para nao autenticado |
| VIEW-07 | 04-01, 04-03 | Fallback claro para formatos sem preview | SATISFIED | `UnsupportedViewer` com mensagem editorial + CTA de download |
| CTX-05 | 04-01, 04-02, 04-03 | Sidecar como contexto do item binario no painel | SATISFIED | `getBinaryContext()` + `SidecarMarkdown` no `InfoPanel` via slot `sidecar-content-phase4` |

---

### Anti-Patterns Encontrados

| Arquivo | Linha | Padrao | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| `fs-item-repository.ts` | 86-88 | `searchByName` retorna `[]` sempre (stub documentado) | Info | Pre-existente (Fase 1); fora do escopo da Fase 4; seam preparada conforme ARC-04 |

Sem blockers. Nenhum TODO/FIXME/PLACEHOLDER encontrado nos arquivos da fase 4.

---

### Verificacao Humana Necessaria

Nenhuma pendencia aberta. Os quatro checkpoints humanos foram aprovados em `04-UAT.md`:

1. Enquadramento e zoom de imagem
2. Preview inline de PDF
3. Sidecar no InfoPanel com hierarquia editorial
4. Fallback para `.excalidraw`

---

### Resumo de Gaps

Nenhum gap de implementacao identificado. Todos os artefatos existem, sao substanciais, estao conectados e o fluxo de dados e real.

A validacao humana pendente foi encerrada por meio de `04-UAT.md`, com 4/4 checkpoints aprovados e nenhuma issue aberta.

Conclusao: a fase atende ao objetivo e fica formalmente verificada como `passed`.

---

_Verificado: 2026-04-11T15:30:10Z_
_Verificador: Claude (gsd-verifier)_
