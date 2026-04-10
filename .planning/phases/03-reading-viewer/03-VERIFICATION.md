---
phase: 03-reading-viewer
verified: 2026-04-10T00:49:23Z
status: verified_complete
score: 5/5 success criteria verified + human UAT passed
re_verification:
  previous_status: gaps_found
  previous_score: 13/17
  gaps_closed:
    - "npm test -- markdown-viewer passa (RED → GREEN) — 4/4 testes verdes após mock de componente assíncrono resolvido"
    - "npm test -- viewer-header passa (RED → GREEN) — 7/7 testes verdes incluindo o download href (estratégia de seleção corrigida)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Selecionar item Markdown com código, tabelas e fórmulas KaTeX na árvore de navegação"
    expected: "Área direita renderiza Markdown rico com: syntax highlight do Shiki, fórmulas KaTeX (sem ativar com cifrão monetário), tabelas GFM formatadas, task lists com checkboxes, links externos em nova aba"
    why_human: "MarkdownViewer é Server Component assíncrono — não testável em jsdom. Shiki e KaTeX são plugins assíncronos que requerem runtime Node.js real. Critério SC-2 do ROADMAP."
  - test: "Clicar no botão ℹ️ no ViewerHeader com um item que tem data_captura sem aspas no YAML"
    expected: "InfoPanel abre sem crash, exibindo data_captura formatada como '7 mar. 2026', chips de tipo+estado no topo, campos ausentes omitidos"
    why_human: "Crash de RangeError foi corrigido (normalização de Date→string ISO em getItemFrontmatter), mas abertura real do painel e push layout flex requerem browser"
  - test: "Rolar conteúdo de item Markdown longo e observar o header"
    expected: "Header fica sticky e aplica efeito glassmorphism (backdrop-blur + surface 70%) após scrollTop > 8px; antes de rolar fica transparente"
    why_human: "Comportamento de scroll e efeito visual não verificáveis em jsdom. Critério SC-1 do ROADMAP."
  - test: "Clicar no botão de download no ViewerHeader com sessão ativa"
    expected: "Browser inicia download do arquivo .md sem frontmatter; PDF/JPG/Excalidraw baixam sem corrupção"
    why_human: "Autenticação real e comportamento de download de binários requerem servidor Next.js rodando. Gaps UAT #3 e #4 foram corrigidos mas precisam de validação manual."
  - test: "Abrir viewer em viewport de 375px (mobile) ou redimensionar browser"
    expected: "Conteúdo não transborda horizontalmente, max-w-prose mantém legibilidade, header não quebra. Critério SC-5 (RUN-04)."
    why_human: "Responsividade visual requer inspeção em viewport real. RUN-04 não é verificável em jsdom."
  - test: "Selecionar um item que seja PDF, imagem ou Excalidraw"
    expected: "Área de conteúdo exibe mensagem 'Formato não suportado para visualização' com botão de download, sem mostrar conteúdo binário bruto"
    why_human: "Branch por itemKind implementado e testado unitariamente, mas renderização real no browser para confirmar UX requer verificação manual."
---

# Phase 3: Reading Viewer — Relatório de Verificação (Re-verificação)

**Phase Goal:** Usuário lê conteúdo principal do item em um viewer rico e estável, com cabeçalho contextual e composição visual apropriada para leitura.
**Verificado:** 2026-04-10T00:49:23Z
**Status:** verified_complete
**Re-verificação:** Sim — após fechamento dos gaps da verificação anterior e confirmação do `03-HUMAN-UAT.md`

## Objetivo Alcançado

### Verdades Observáveis (Success Criteria do ROADMAP)

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| SC-1 | Ao selecionar item Markdown, área direita atualiza dentro da mesma shell com leitura confortável | ✓ VERIFICADO (codigo) / ? HUMANO (visual) | ViewerPage em library e inbox, max-w-prose prose prose-sm no article — confirmado via grep e leitura do código |
| SC-2 | Markdown complexo renderiza com boa fidelidade visual (tabelas, highlight, task lists, callouts, links) | ✓ VERIFICADO (pipeline) / ? HUMANO (fidelidade visual) | Pipeline react-markdown + remark-gfm + remark-math + rehype-katex + @shikijs/rehype instalado e configurado; singleDollarTextMath:false corrige cifrão |
| SC-3 | Cabeçalho mostra título e ações do item atual (download, apresentação, painel) | ✓ VERIFICADO | ViewerHeader: topicLabel › groupLabel, chip de estado, download link, botão apresentação disabled, toggle ℹ️ — 7/7 testes verdes |
| SC-4 | Painel de informações abre dentro da área de conteúdo e apresenta metadados de forma editorial | ✓ VERIFICADO (codigo) / ? HUMANO (abertura real) | InfoPanel: chips D-16, Intl pt-BR, campos ausentes omitidos, slot D-18, Escape fecha — 8/8 testes verdes; crash corrigido (data_captura normalizada) |
| SC-5 | Experiência não quebra em telas menores (mobile, WebView) | ✓ VERIFICADO (codigo) / ? HUMANO (visual) | max-w-prose, overflow-hidden nos containers, truncate nos spans — estrutura responsiva implementada |

**Pontuação:** 5/5 success criteria verificados no nível de código e 6/6 checks de UAT humano aprovados. Fechamento oficial da fase concluído.

### Gaps da Verificação Anterior — Status

| Gap Anterior | Status | Como foi fechado |
|---|---|---|
| `npm test -- markdown-viewer` falha (4/4) | FECHADO | Testes atualizados para mock do MarkdownViewer como componente síncrono (Wave 06); 4/4 verdes |
| `npm test -- viewer-header` falha (1/6) | FECHADO | Teste de download href corrigido para usar `screen.getByTestId('download-link')` + verificação por regex; 7/7 verdes |

### Verdades dos Planos — Verificação Completa

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | react-markdown, remark-gfm, remark-math, rehype-katex, @shikijs/rehype, shiki em dependencies | ✓ VERIFICADO | package.json linhas 18, 29, 30, 31, 32, 34 — todos os 6 pacotes presentes |
| 2 | @tailwindcss/typography em devDependencies | ✓ VERIFICADO | package.json linha 41 |
| 3 | globals.css contém @import 'katex/dist/katex.min.css' | ✓ VERIFICADO | linha 4 do globals.css |
| 4 | globals.css contém @plugin '@tailwindcss/typography' | ✓ VERIFICADO | linha 6 do globals.css |
| 5 | globals.css contém overrides --tw-prose-* com tokens do design system | ✓ VERIFICADO | --tw-prose-body, --tw-prose-links, --tw-prose-pre-bg presentes |
| 6 | RawFrontmatter exportado de src/lib/pkm/types.ts com campo tipo | ✓ VERIFICADO | `export interface RawFrontmatter` linha 53 com `tipo?: string` linha 54 |
| 7 | ItemRepository define getItemContent e getItemFrontmatter | ✓ VERIFICADO | linhas 44 e 51 de item-repository.ts |
| 8 | FsItemRepository implementa ambos com resolveAndValidatePath | ✓ VERIFICADO | 5 ocorrências do método (1 privado + 1 público resolveItemPath + 3 chamadas internas) |
| 9 | npm test -- item-repository passa com novos métodos | ✓ VERIFICADO | 11/11 testes passando |
| 10 | MarkdownViewer é Server Component assíncrono com MarkdownAsync + plugins | ✓ VERIFICADO | async function, sem "use client", MarkdownAsync importado, linha 37: singleDollarTextMath:false |
| 11 | MarkdownViewer aplica classe prose e prose-sm ao article | ✓ VERIFICADO | linha 33: `className="prose prose-sm max-w-prose..."` |
| 12 | Links externos recebem target=_blank e rel=noopener noreferrer | ✓ VERIFICADO | componente "a" customizado com isExternal check, linhas 44-52 |
| 13 | ViewerHeader é Client Component com sticky, glass e ações CTX-02 | ✓ VERIFICADO | "use client", sticky, encodeURIComponent, aria-pressed, disabled — 7/7 testes verdes |
| 14 | GET /api/pkm/raw/[...path] retorna 401 quando não autenticado | ✓ VERIFICADO | auth() guard linha 45, if(!session) → 401 linha 47; testes raw-route passando |
| 15 | GET /api/pkm/raw/[...path] retorna attachment com binários sem corrupção | ✓ VERIFICADO | CONTENT_TYPE_MAP, isBinary branch, readFileSync sem encoding para binários — 5/5 testes raw-route verdes |
| 16 | npm test -- markdown-viewer passa (RED → GREEN) | ✓ VERIFICADO | 4/4 testes verdes (gap anterior fechado) |
| 17 | npm test -- viewer-header passa (RED → GREEN) | ✓ VERIFICADO | 7/7 testes verdes (gap anterior fechado) |
| 18 | InfoPanel exibe chips de tipo+estado (D-16), omite campos ausentes (D-17), slot D-18 | ✓ VERIFICADO | frontmatter.tipo condicional, campos ausentes com &&, data-slot="sidecar-content-phase4" |
| 19 | Cifrão ($) em texto comum não ativa math mode LaTeX | ✓ VERIFICADO | linha 37 markdown-viewer: `[remarkMath, { singleDollarTextMath: false }]` |
| 20 | Arquivos não-Markdown exibem mensagem de formato não suportado | ✓ VERIFICADO | linha 54 viewer-page: `if (item.itemKind !== "markdown")` retorna div data-testid="unsupported-format" |
| 21 | data_captura normalizada para string ISO antes de retornar RawFrontmatter | ✓ VERIFICADO | linha 107 fs-item-repository: `if (data.data_captura instanceof Date)` → toISOString().slice(0, 10) |
| 22 | npm test -- info-panel passa (RED → GREEN) | ✓ VERIFICADO | 8/8 testes verdes |
| 23 | npm test -- raw-route passa (RED → GREEN) | ✓ VERIFICADO | 5/5 testes verdes |
| 24 | ViewerPage usa ViewerClientShell para gerenciar estado do painel | ✓ VERIFICADO | viewer-page importa e usa ViewerClientShell |
| 25 | library/[...path]/page.tsx usa ViewerPage em vez de WorkspaceItemState | ✓ VERIFICADO | grep retorna zero ocorrências de WorkspaceItemState; ViewerPage importado e usado |
| 26 | inbox/[item]/page.tsx usa ViewerPage em vez de WorkspaceItemState | ✓ VERIFICADO | idem |

**Pontuação geral:** 26/26 verdades verificadas no nível de código

### Artefatos Obrigatórios

| Artefato | Esperado | Status | Detalhes |
|----------|----------|--------|----------|
| `src/__tests__/markdown-viewer.test.tsx` | 4 testes GREEN | ✓ VERIFICADO | 4/4 passando |
| `src/__tests__/viewer-header.test.tsx` | 7 testes GREEN | ✓ VERIFICADO | 7/7 passando |
| `src/__tests__/info-panel.test.tsx` | 8 testes GREEN | ✓ VERIFICADO | 8/8 passando |
| `src/__tests__/raw-route.test.ts` | 5 testes GREEN | ✓ VERIFICADO | 5/5 passando |
| `src/__tests__/viewer-page.test.tsx` | 5 testes GREEN (branch itemKind) | ✓ VERIFICADO | 5/5 passando |
| `package.json` | 7 dependências de renderização | ✓ VERIFICADO | Todos os 7 pacotes presentes |
| `src/app/globals.css` | @import katex + @plugin typography + prose overrides | ✓ VERIFICADO | 15 variáveis --tw-prose-* mapeadas |
| `src/lib/pkm/types.ts` | RawFrontmatter com campo tipo | ✓ VERIFICADO | Interface exportada com 7 campos |
| `src/lib/pkm/item-repository.ts` | getItemContent + getItemFrontmatter | ✓ VERIFICADO | Métodos na interface com tipos corretos |
| `src/lib/pkm/fs-item-repository.ts` | Implementações com path validation + normalização de data | ✓ VERIFICADO | resolveAndValidatePath, resolveItemPath público, normalização de Date |
| `src/components/viewer/markdown-viewer.tsx` | Server Component MarkdownAsync, singleDollarTextMath:false | ✓ VERIFICADO | async function, sem "use client", pipeline com opção corrigida |
| `src/components/viewer/viewer-header.tsx` | Client Component sticky + glassmorphism + ações | ✓ VERIFICADO | "use client", sticky, glass, todas as ações, 7 testes verdes |
| `src/app/api/pkm/raw/[...path]/route.ts` | GET handler com auth + suporte a binários | ✓ VERIFICADO | auth() guard, 401/200/400, CONTENT_TYPE_MAP, Buffer para binários |
| `src/components/viewer/info-panel.tsx` | Client Component push panel com metadados formatados | ✓ VERIFICADO | panelOpen, Escape, Intl pt-BR, D-16/17/18, 8 testes verdes |
| `src/components/viewer/viewer-page.tsx` | Server Component orquestrador com branch por itemKind | ✓ VERIFICADO | async, getItemContent, getItemFrontmatter, branch itemKind, 5 testes verdes |
| `src/components/viewer/viewer-client-shell.tsx` | Client Component estado com id="viewer-scroll" | ✓ VERIFICADO | "use client", panelOpen, id="viewer-scroll" |
| `src/app/(shell)/library/[...path]/page.tsx` | Usa ViewerPage | ✓ VERIFICADO | WorkspaceItemState ausente, ViewerPage importado e usado |
| `src/app/(shell)/inbox/[item]/page.tsx` | Usa ViewerPage | ✓ VERIFICADO | WorkspaceItemState ausente, ViewerPage importado e usado |

### Verificação de Links Chave

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|----------|
| `viewer-header.tsx` | `#viewer-scroll` | useEffect scroll listener | ✓ WIRED | getElementById("viewer-scroll") no useEffect, linha 42 |
| `markdown-viewer.tsx` | `MarkdownAsync` | import de 'react-markdown' | ✓ WIRED | import { MarkdownAsync } — NÃO default Markdown síncrono |
| `raw/[...path]/route.ts` | `auth()` | guard na primeira linha | ✓ WIRED | session = await auth(); if (!session) → 401 |
| `library/[...path]/page.tsx` | `viewer-page.tsx` | ViewerPage component | ✓ WIRED | import + `<ViewerPage item={item} />` |
| `inbox/[item]/page.tsx` | `viewer-page.tsx` | ViewerPage component | ✓ WIRED | import + `<ViewerPage item={item} />` |
| `viewer-page.tsx` | `getItemContent()` | FsItemRepository server-side | ✓ WIRED | `repo.getItemContent(item.id)` linha 35 |
| `viewer-page.tsx` | `getItemFrontmatter()` | FsItemRepository server-side | ✓ WIRED | `repo.getItemFrontmatter(item.id)` linha 36 |
| `viewer-page.tsx` | `MarkdownViewer` | branch itemKind === "markdown" | ✓ WIRED | branch linha 54 bloqueia binários antes de chamar MarkdownViewer |
| `viewer-client-shell.tsx` | `ViewerHeader` + `InfoPanel` | imports + render com props | ✓ WIRED | ambos importados e renderizados com estado de painel |
| `fs-item-repository.ts` | `resolveItemPath()` | delega para resolveAndValidatePath() | ✓ WIRED | método público linha 115 delega para privado linha 119 |

### Rastreamento de Fluxo de Dados (Nível 4)

| Artefato | Variável de Dados | Fonte | Produz Dados Reais | Status |
|----------|------------------|-------|-------------------|--------|
| `viewer-page.tsx` | `content` | `repo.getItemContent(item.id)` | FsItemRepository lê filesystem via gray-matter | ✓ FLOWING |
| `viewer-page.tsx` | `frontmatter` | `repo.getItemFrontmatter(item.id)` | FsItemRepository lê gray-matter + normaliza Date→string | ✓ FLOWING |
| `info-panel.tsx` | `frontmatter` | prop do ViewerClientShell | Propagado de ViewerPage server-side com dado real | ✓ FLOWING |
| `markdown-viewer.tsx` | `content` | prop string | Propagado de ViewerPage (getItemContent) | ✓ FLOWING |
| `raw route handler` | `buffer / content` | fs.readFileSync (Buffer para binários, getItemContent para .md) | Leitura direta do filesystem; binários sem encoding | ✓ FLOWING |

### Spot-Checks Comportamentais

| Comportamento | Comando | Resultado | Status |
|---------------|---------|-----------|--------|
| Suite completa de testes | `npx vitest run` | 102/102 passando (11 arquivos) | ✓ PASS |
| markdown-viewer (4 testes) | `npx vitest run src/__tests__/markdown-viewer.test.tsx` | 4/4 passando | ✓ PASS |
| viewer-header (7 testes) | `npx vitest run src/__tests__/viewer-header.test.tsx` | 7/7 passando | ✓ PASS |
| info-panel (8 testes) | `npx vitest run src/__tests__/info-panel.test.tsx` | 8/8 passando | ✓ PASS |
| raw-route (5 testes) | `npx vitest run src/__tests__/raw-route.test.ts` | 5/5 passando | ✓ PASS |
| viewer-page (5 testes) | `npx vitest run src/__tests__/viewer-page.test.tsx` | 5/5 passando | ✓ PASS |
| item-repository (11 testes) | `npx vitest run src/__tests__/item-repository.test.ts` | 11/11 passando | ✓ PASS |

### Cobertura de Requisitos

| Requisito | Planos | Descrição | Status | Evidência |
|-----------|--------|-----------|--------|-----------|
| VIEW-01 | 03-03, 03-05 | Área direita exibe conteúdo sem transição perceptível | ✓ SATISFEITO | ViewerPage + ViewerClientShell dentro da shell persistente; rotas library/inbox usam ViewerPage |
| VIEW-02 | 03-04, 03-06 | Markdown renderiza headings, listas, tabelas, código, GFM, links | ✓ SATISFEITO (codigo) / ? HUMANO (visual) | Pipeline completo configurado; singleDollarTextMath:false; testes unitários 4/4 |
| VIEW-03 | 03-02, 03-04 | Pipeline de renderização rica baseado em bibliotecas maduras | ✓ SATISFEITO | react-markdown + remark-gfm + remark-math + rehype-katex + @shikijs/rehype — todas instaladas e configuradas |
| VIEW-08 | 03-04 | Largura máxima e composição visual para leitura | ✓ SATISFEITO | prose prose-sm max-w-prose no article container — testes confirmam |
| CTX-01 | 03-04 | Cabeçalho exibe título/contexto do item atual | ✓ SATISFEITO | topicLabel › groupLabel em label-sm uppercase; "INBOX" para __inbox; 7/7 testes verdes |
| CTX-02 | 03-04 | Cabeçalho exibe ações do item (download, apresentação, painel) | ✓ SATISFEITO | Download link com encodeURIComponent, botão apresentação disabled, toggle ℹ️ com aria-pressed |
| CTX-03 | 03-04, 03-05 | Ícone ℹ️ abre painel lateral dentro da área de conteúdo | ✓ SATISFEITO | onTogglePanel + panelOpen + InfoPanel push layout; 8/8 testes info-panel verdes |
| CTX-04 | 03-03, 03-05, 03-06 | Painel exibe metadados de forma editorial | ✓ SATISFEITO | InfoPanel com Intl pt-BR, chips D-16, D-17 (omissão), D-18 (slot sidecar); normalização Date corrigida |
| RUN-04 | 03-04, 03-05 | Interface responsiva para mobile | ✓ SATISFEITO (codigo) / ? HUMANO (visual) | max-w-prose + overflow-hidden + truncate nos spans — estrutura responsiva implementada |

### Anti-Padrões Encontrados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| `src/lib/pkm/fs-item-repository.ts` | 86 | `searchByName` retorna `[]` com comentário "Fase 1: implementação stub" | ℹ️ INFO | Comportamento documentado e fora do escopo da Phase 3 |
| `src/components/viewer/info-panel.tsx` | 360 | `<div data-slot="sidecar-content-phase4">` vazio | ℹ️ INFO | Slot D-18 intencional; Phase 4 preenche conforme planejado |

Nenhum anti-padrão bloqueador encontrado.

### Verificação Humana Concluída

Referência: `03-HUMAN-UAT.md` com `status: passed` em 2026-04-10.

- Renderização Markdown rica no browser: PASS
- InfoPanel abre sem crash com `data_captura` YAML não quoted: PASS
- Header sticky com glassmorphism ao rolar: PASS
- Download autenticado de `.md` e binários sem corrupção: PASS
- Responsividade mobile em 375px: PASS
- Itens não-Markdown exibem fallback de formato não suportado: PASS

## Sumário

A Phase 3 está completamente implementada no nível de código com **102/102 testes passando**. O bloqueio de `typecheck` pós-entrega também foi eliminado no fechamento oficial da fase. Os dois gaps da verificação anterior foram fechados:

1. **markdown-viewer tests:** mock do componente assíncrono resolvido — 4/4 verdes
2. **viewer-header download href:** estratégia de seleção corrigida via data-testid — 7/7 verdes

Os quatro gaps do UAT (cifrão monetário, binários brutos, download corrompido, crash do painel) também foram corrigidos pelo plano 06 e estão marcados como `status: fixed` no 03-UAT.md. A verificação humana requerida foi concluída com aprovação integral em `03-HUMAN-UAT.md`.

---

_Verificado: 2026-04-10T00:49:23Z_
_Verificador: Claude (gsd-verifier)_
_Verificação: Re-verificação após gap closure (planos 03-06)_
