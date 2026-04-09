---
phase: 03-reading-viewer
verified: 2026-04-09T19:25:00Z
status: gaps_found
score: 13/17 must-haves verified
gaps:
  - truth: "npm test -- markdown-viewer passa (RED → GREEN)"
    status: failed
    reason: "4 dos 4 testes de markdown-viewer.test.tsx falham porque MarkdownViewer é um Server Component assíncrono (async function) e o jsdom não consegue renderizá-lo de forma síncrona. O mock de react-markdown retorna <div> mas o componente real envolve o conteúdo em <article> — o componente assíncrono nunca completa a renderização antes das assertions."
    artifacts:
      - path: "src/__tests__/markdown-viewer.test.tsx"
        issue: "Testes usam render() síncrono para componente async — article/links nunca aparecem no DOM"
      - path: "src/components/viewer/markdown-viewer.tsx"
        issue: "Server Component assíncrono (async function) incompatível com abordagem de teste síncrona do Wave 0"
    missing:
      - "Testes de markdown-viewer.test.tsx precisam de await act() ou de mock do MarkdownViewer como componente síncrono para funcionar em jsdom"
      - "Alternativamente, refatorar os testes para usar a API de teste async do React (renderHook ou waitFor)"
  - truth: "npm test -- viewer-header passa (RED → GREEN)"
    status: failed
    reason: "1 dos 6 testes de viewer-header falha: 'CTX-02: botão de download está presente e tem href correto'. O componente gera href='/api/pkm/raw/tecnologia%2Fnota.md' via encodeURIComponent, mas jsdom normaliza %2F para / no atributo href, causando querySelector com %2F retornar null."
    artifacts:
      - path: "src/__tests__/viewer-header.test.tsx"
        issue: "querySelector('a[href=\"/api/pkm/raw/tecnologia%2Fnota.md\"]') retorna null porque jsdom normaliza %2F → / no atributo href"
    missing:
      - "Teste deve usar screen.getByTestId('download-link') + getAttribute('href').includes('tecnologia') ou verificar via data-testid ao invés de querySelector por href encoded"
human_verification:
  - test: "Selecionar item na árvore e verificar renderização completa do viewer"
    expected: "Área direita exibe Markdown rico com highlight de código (Shiki), fórmulas KaTeX, tabelas GFM e header sticky com glassmorphism ao rolar"
    why_human: "Comportamento visual do Shiki e KaTeX no browser não é testável em jsdom; glassmorphism ao rolar requer interação real com scroll"
  - test: "Abrir painel de informações clicando em ℹ️ e verificar push layout"
    expected: "InfoPanel abre ao lado do conteúdo empurrando o texto (push layout, não overlay), e fecha com Escape"
    why_human: "Layout push flex e comportamento de Escape requerem renderização real no browser"
  - test: "Clicar no botão de download no ViewerHeader"
    expected: "Browser inicia download do arquivo .md com prompt, retornando 401 se não autenticado"
    why_human: "Comportamento de download autenticado e auth guard requerem servidor real"
  - test: "Verificar responsividade em viewport móvel"
    expected: "Viewer não quebra em tela pequena, max-w-prose mantém legibilidade, header não transborda"
    why_human: "RUN-04 requer inspeção visual em viewport estreito"
---

# Phase 3: Reading Viewer — Relatório de Verificação

**Phase Goal:** Usuario le conteudo principal do item em um viewer rico e estavel, com cabecalho contextual e composicao visual apropriada para leitura.
**Verificado:** 2026-04-09T19:25:00Z
**Status:** gaps_found
**Re-verificação:** Não — verificação inicial

## Objetivo Alcançado

### Verdades Observáveis

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | react-markdown, remark-gfm, remark-math, rehype-katex, @shikijs/rehype, shiki em dependencies | ✓ VERIFICADO | package.json contém todos os 6 pacotes com versões corretas |
| 2 | @tailwindcss/typography em devDependencies | ✓ VERIFICADO | package.json devDependencies com @tailwindcss/typography@^0.5.19 |
| 3 | globals.css contém @import 'katex/dist/katex.min.css' | ✓ VERIFICADO | linha 4 do globals.css |
| 4 | globals.css contém @plugin '@tailwindcss/typography' | ✓ VERIFICADO | linha 6 do globals.css |
| 5 | globals.css contém overrides --tw-prose-* com tokens do design system | ✓ VERIFICADO | 15 variáveis presentes no @layer utilities .prose |
| 6 | RawFrontmatter exportado de src/lib/pkm/types.ts com campo tipo | ✓ VERIFICADO | interface com 7 campos incluindo tipo? opcional |
| 7 | ItemRepository define getItemContent e getItemFrontmatter | ✓ VERIFICADO | métodos presentes na interface item-repository.ts |
| 8 | FsItemRepository implementa ambos os métodos com resolveAndValidatePath | ✓ VERIFICADO | 4 ocorrências de resolveAndValidatePath (1 def + 3 calls) |
| 9 | npm test -- item-repository passa incluindo novos métodos | ✓ VERIFICADO | 11/11 testes passando |
| 10 | MarkdownViewer é Server Component assíncrono com MarkdownAsync + plugins | ✓ VERIFICADO | async function, sem "use client", MarkdownAsync importado |
| 11 | MarkdownViewer aplica classe prose e prose-sm ao article container | ✓ VERIFICADO | className="prose prose-sm max-w-prose..." no article |
| 12 | Links externos recebem target=_blank e rel=noopener noreferrer | ✓ VERIFICADO | componente "a" customizado com isExternal check |
| 13 | ViewerHeader é Client Component com sticky, glass e ações CTX-02 | ✓ VERIFICADO | "use client", sticky, encodeURIComponent, aria-pressed, disabled |
| 14 | GET /api/pkm/raw/[...path] retorna 401 quando não autenticado | ✓ VERIFICADO | auth() guard na primeira linha, testes passando |
| 15 | GET /api/pkm/raw/[...path] retorna attachment quando autenticado | ✓ VERIFICADO | Content-Disposition: attachment presente, testes raw-route passando |
| 16 | npm test -- markdown-viewer passa (RED → GREEN) | ✗ FALHOU | 4/4 testes falham — async Server Component não renderiza em jsdom síncrono |
| 17 | npm test -- viewer-header passa (RED → GREEN) | ✗ FALHOU | 1/6 testes falha — jsdom normaliza %2F em href, querySelector falha |

**Pontuação:** 13/17 verdades verificadas (variáveis 1-15 + 1 parcial)

**Nota sobre o score:** ViewerPage, ViewerClientShell e as rotas library/inbox foram verificados como artefatos (Passo 4) mas não estavam nos must_haves do plano de cada wave separado. Todos estão implementados e conectados corretamente.

### Artefatos Obrigatórios

| Artefato | Esperado | Status | Detalhes |
|----------|----------|--------|----------|
| `src/__tests__/markdown-viewer.test.tsx` | Stubs RED | ✓ EXISTE | 4 testes, importa @/components/viewer/markdown-viewer |
| `src/__tests__/viewer-header.test.tsx` | Stubs RED | ✓ EXISTE | 6 testes, importa @/components/viewer/viewer-header |
| `src/__tests__/info-panel.test.tsx` | Stubs RED | ✓ EXISTE | 8 testes, importa @/components/viewer/info-panel |
| `src/__tests__/raw-route.test.ts` | Stubs RED | ✓ EXISTE | 2 testes, importa route handler |
| `package.json` | 7 dependências | ✓ EXISTE | Todos os 7 pacotes presentes e instalados |
| `src/app/globals.css` | @import katex + @plugin typography + prose overrides | ✓ EXISTE | 15 variáveis --tw-prose-* mapeadas aos tokens |
| `src/lib/pkm/types.ts` | RawFrontmatter com campo tipo | ✓ EXISTE | Interface exportada com 7 campos |
| `src/lib/pkm/item-repository.ts` | getItemContent + getItemFrontmatter | ✓ EXISTE | Métodos na interface com tipos corretos |
| `src/lib/pkm/fs-item-repository.ts` | Implementações com path validation | ✓ EXISTE | resolveAndValidatePath compartilhado, 11 testes verdes |
| `src/components/viewer/markdown-viewer.tsx` | Server Component MarkdownAsync | ✓ EXISTE | async function, sem "use client", pipeline completo |
| `src/components/viewer/viewer-header.tsx` | Client Component sticky + glassmorphism | ✓ EXISTE | "use client", sticky, glass, todas as ações |
| `src/app/api/pkm/raw/[...path]/route.ts` | GET handler com auth | ✓ EXISTE | auth() guard, 401/200, Content-Disposition |
| `src/components/viewer/info-panel.tsx` | Client Component push panel | ✓ EXISTE | panelOpen, Escape, Intl pt-BR, D-16/17/18 |
| `src/components/viewer/viewer-page.tsx` | Server Component orquestrador | ✓ EXISTE | async, getItemContent + getItemFrontmatter, ViewerClientShell |
| `src/components/viewer/viewer-client-shell.tsx` | Client Component estado | ✓ EXISTE | "use client", panelOpen, id="viewer-scroll" |
| `src/app/(shell)/library/[...path]/page.tsx` | Usa ViewerPage | ✓ EXISTE | WorkspaceItemState ausente, ViewerPage importado e usado |
| `src/app/(shell)/inbox/[item]/page.tsx` | Usa ViewerPage | ✓ EXISTE | WorkspaceItemState ausente, ViewerPage importado e usado |

### Verificação de Links Chave

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|----------|
| `viewer-header.tsx` | `#viewer-scroll` | useEffect scroll listener | ✓ WIRED | getElementById("viewer-scroll") presente no useEffect |
| `markdown-viewer.tsx` | `MarkdownAsync` | import de 'react-markdown' | ✓ WIRED | import { MarkdownAsync } (NÃO default Markdown) |
| `raw/[...path]/route.ts` | `auth()` | guard na primeira linha | ✓ WIRED | session = await auth(); if (!session) → 401 |
| `library/[...path]/page.tsx` | `viewer-page.tsx` | ViewerPage component | ✓ WIRED | import + <ViewerPage item={item} /> |
| `inbox/[item]/page.tsx` | `viewer-page.tsx` | ViewerPage component | ✓ WIRED | import + <ViewerPage item={item} /> |
| `viewer-page.tsx` | `getItemContent()` | FsItemRepository server-side | ✓ WIRED | repo.getItemContent(item.id) |
| `viewer-page.tsx` | `getItemFrontmatter()` | FsItemRepository server-side | ✓ WIRED | repo.getItemFrontmatter(item.id) |
| `viewer-client-shell.tsx` | `ViewerHeader` + `InfoPanel` | imports + render | ✓ WIRED | ambos importados e renderizados com props corretas |

### Rastreamento de Fluxo de Dados (Nível 4)

| Artefato | Variável de Dados | Fonte | Produz Dados Reais | Status |
|----------|------------------|-------|-------------------|--------|
| `viewer-page.tsx` | `content` | `repo.getItemContent(item.id)` | FsItemRepository lê filesystem | ✓ FLOWING |
| `viewer-page.tsx` | `frontmatter` | `repo.getItemFrontmatter(item.id)` | FsItemRepository lê gray-matter | ✓ FLOWING |
| `info-panel.tsx` | `frontmatter` | prop do ViewerClientShell | Propagado de ViewerPage server-side | ✓ FLOWING |
| `markdown-viewer.tsx` | `content` | prop | Propagado de ViewerPage | ✓ FLOWING |

### Spot-Checks Comportamentais

| Comportamento | Comando | Resultado | Status |
|---------------|---------|-----------|--------|
| item-repository — todos os testes | `npx vitest run item-repository` | 11/11 passando | ✓ PASS |
| info-panel — todos os testes | `npx vitest run info-panel` | 8/8 passando | ✓ PASS |
| raw-route — auth guard 401 | `npx vitest run raw-route` | 2/2 passando | ✓ PASS |
| viewer-header — CTX-01, CTX-02 (5 de 6) | `npx vitest run viewer-header` | 5/6 — 1 falha no download href | ✗ FAIL (parcial) |
| markdown-viewer — todos | `npx vitest run markdown-viewer` | 0/4 — async Server Component | ✗ FAIL |

### Cobertura de Requisitos

| Requisito | Plano | Descrição | Status | Evidência |
|-----------|-------|-----------|--------|-----------|
| VIEW-01 | 03-03, 03-05 | Área direita exibe conteúdo sem transição perceptível | ✓ SATISFEITO | ViewerPage + ViewerClientShell dentro da shell persistente |
| VIEW-02 | 03-04 | Markdown renderiza headings, listas, tabelas, código, GFM, links | ? HUMANO | Pipeline Shiki+KaTeX+GFM implementado; testes unitários falham por limitação jsdom+async |
| VIEW-03 | 03-04 | Pipeline de renderização rica baseado em bibliotecas maduras | ✓ SATISFEITO | react-markdown + remark-gfm + remark-math + rehype-katex + @shikijs/rehype |
| VIEW-08 | 03-04 | Largura máxima e composição visual para leitura | ✓ SATISFEITO | prose prose-sm max-w-prose no article container |
| CTX-01 | 03-04 | Cabeçalho exibe título do item atual | ✓ SATISFEITO | topicLabel › groupLabel em label-sm uppercase, testes passando |
| CTX-02 | 03-04 | Cabeçalho exibe ações: apresentação, download, painel | ✓ SATISFEITO (código) / ✗ FALHOU (teste download href) | Ações implementadas; download link existe mas teste específico de href falha por jsdom |
| CTX-03 | 03-04, 03-05 | Ícone ℹ️ abre painel lateral dentro da área de conteúdo | ✓ SATISFEITO | onTogglePanel + panelOpen + InfoPanel push layout, testes passando |
| CTX-04 | 03-05 | Painel exibe metadados de forma editorial | ✓ SATISFEITO | InfoPanel com Intl pt-BR, chips D-16, D-17 (omissão campos ausentes), D-18 (slot sidecar), 8/8 testes passando |
| RUN-04 | 03-04, 03-05 | Interface responsiva para mobile | ? HUMANO | max-w-prose + overflow correto implementado; responsividade requer verificação visual |

### Anti-Padrões Encontrados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| `src/lib/pkm/fs-item-repository.ts` | 87 | `searchByName` retorna `[]` com comentário "implementação stub — Fase 1" | ℹ️ INFO | Comportamento esperado e documentado; não é escopo da Phase 3 |
| `src/components/viewer/viewer-page.tsx` | 47 | `getGroupSegment` lógica de extração de group pode não detectar grupos sem prefixo `_` | ⚠️ WARNING | Grupos PKM sem prefixo `_` não seriam detectados; convenção PKM usa `_` consistentemente |
| `src/components/viewer/info-panel.tsx` | 190 | `<div data-slot="sidecar-content-phase4">` vazio | ℹ️ INFO | Slot D-18 intencional; Phase 4 preenche |

### Verificação Humana Necessária

#### 1. Renderização completa do viewer no browser

**Test:** Selecionar um item Markdown com código, tabelas e fórmulas KaTeX na árvore de navegação
**Expected:** Área direita renderiza Markdown rico com: syntax highlight do Shiki, fórmulas matemáticas KaTeX, tabelas GFM formatadas, task lists com checkboxes, links externos em nova aba
**Why human:** MarkdownViewer é Server Component assíncrono — não testável em jsdom. Shiki e KaTeX são plugins assíncronos que requerem runtime Node.js real

#### 2. Push layout do InfoPanel no browser

**Test:** Clicar no botão ℹ️ no header do viewer para abrir o InfoPanel
**Expected:** Painel de 280px abre ao lado do conteúdo Markdown (empurra o texto para a esquerda), não como overlay. Pressionar Escape fecha o painel.
**Why human:** Push layout flex (D-14) e keydown Escape (D-15) requerem renderização real e interação de usuário

#### 3. Glassmorphism ao rolar

**Test:** Rolar o conteúdo de um item Markdown longo no viewer
**Expected:** Header fica sticky e aplica efeito glassmorphism (backdrop-blur + surface 70%) após scrollTop > 8px
**Why human:** Comportamento de scroll e efeito visual não verificáveis em jsdom

#### 4. Download autenticado

**Test:** Clicar no botão de download no ViewerHeader com sessão ativa
**Expected:** Browser inicia download do arquivo .md; sem sessão retorna 401
**Why human:** Autenticação real e comportamento de download requerem servidor Next.js rodando

#### 5. Responsividade mobile (RUN-04)

**Test:** Abrir o viewer em viewport de 375px (mobile) ou redimensionar browser
**Expected:** Conteúdo não transborda horizontalmente, max-w-prose mantém legibilidade, header não quebra
**Why human:** Responsividade visual requer inspeção em viewport real

## Sumário de Gaps

Dois gaps bloqueiam o status "passed" automatizado:

**Gap 1 — Testes markdown-viewer (4 falhas):** O `MarkdownViewer` é corretamente implementado como Server Component assíncrono (`async function`) para que o Shiki funcione sem JS no cliente. Porém, os stubs de teste do Wave 0 foram escritos assumindo renderização síncrona no jsdom. O erro é `"MarkdownViewer is an async Client Component"` — jsdom trata Server Components assíncronos como Client Components assíncronos e suspende sem completar. A implementação está correta; os testes é que precisam de ajuste (await act() ou mock do componente como síncrono).

**Gap 2 — Teste viewer-header download href (1 falha):** O componente gera corretamente `href="/api/pkm/raw/tecnologia%2Fnota.md"` via `encodeURIComponent`. O jsdom, entretanto, normaliza `%2F` para `/` no atributo `href` do elemento `<a>`, fazendo `querySelector('a[href="...tecnologia%2Fnota.md"]')` retornar null. A funcionalidade está implementada corretamente; o teste precisa de uma estratégia de seleção alternativa (ex: `screen.getByTestId('download-link')` + verificar o atributo via regex).

Ambos os gaps são limitações de teste, não de implementação. A funcionalidade em si foi verificada pela análise estática do código e pelos testes do InfoPanel, raw-route e item-repository que passam completamente.

---

_Verificado: 2026-04-09T19:25:00Z_
_Verificador: Claude (gsd-verifier)_
