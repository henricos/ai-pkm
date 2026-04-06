# Stack Research

**Domain:** viewer web self-hosted para PKM file-first
**Researched:** 2026-04-06
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Next.js App Router | 15.5.x | shell web, routing, SSR/RSC, assets, route handlers | Continua sendo o stack padrão para apps React full-stack self-hosted. Para este projeto, o ganho principal nao e SEO, e sim App Router + Route Handlers + deploy Node unico, que combinam com BFF local, leitura de filesystem e streaming de previews. `next start` e suportado em self-host com feature set completo; `static export` e explicitamente limitado. | HIGH |
| React | 19.2.x | UI do viewer e composicao dos viewers ricos | React 19 e o baseline atual documentado. Para um knowledge viewer, o valor real e Server Components para shell pesada e hydration so onde ha interacao: arvore, busca, imagem com pan/zoom, PDF, presentation mode. | HIGH |
| Node.js | 20.9+ | runtime self-hosted unico | O proprio Next.js atual pede Node 20.9+ como requisito minimo. Tambem encaixa com leitura direta do repositório `pkm`, watchers e SQLite local sem introduzir outro processo. | HIGH |
| TypeScript | 5.x | contratos da indexacao, viewer state e APIs internas | Nao e diferencial por si so, mas neste projeto reduz custo de evolucao do modelo derivado do `pkm` e evita drift entre viewer, indexador e route handlers. Patch exato nao foi verificado; manter na linha estavel mais recente do repo. | MEDIUM |
| Tailwind CSS | 4.x | layout, tokens e superfícies de leitura | Em 2026, o caminho padrao com Next continua sendo Tailwind. Aqui ele deve controlar layout, densidade, tipografia e modos de leitura/apresentacao. E melhor do que depender do estilo default de uma library de componentes para um app cuja qualidade principal e leitura. A versao maior `4.x` e inferida a partir da documentacao atual; patch exato nao foi verificado. | MEDIUM |
| Ant Design | 5.27.3 | shell de navegacao: Tree, Splitter, Drawer, Tabs, Input, Tooltip | Para esta v2, AntD continua sendo a escolha pragmatica. A arvore navegavel, paines retrateis e shell desktop-like importam mais do que liberdade total de design system. AntD reduz trabalho de infra de UI e ja esta alinhado com a arquitetura atual do projeto. Use Tailwind para a camada visual do reader; nao use tema default cru do AntD como linguagem do produto. | HIGH |
| better-sqlite3 + SQLite FTS5 | better-sqlite3 12.2.0 / FTS5 built-in | indice derivado, busca textual e snippets | Para um viewer single-user e file-first, FTS5 e o padrao certo: simples, local, reconstruivel e forte o suficiente para busca por nome, markdown e sidecars. `better-sqlite3` e a integracao Node mais pragmatica e performatica; FTS5 tem `MATCH`, `highlight()`, `snippet()` e ranking sem infraestrutura extra. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| react-markdown | 10.1.0 | renderizacao Markdown em React sem `dangerouslySetInnerHTML` | Base do viewer de notas. Use com pipeline `remark`/`rehype` em server render sempre que possivel. | HIGH |
| remark-parse | 11.0.0 | parse CommonMark | Parte do pipeline markdown principal. | HIGH |
| remark-gfm | 4.0.1 | tabelas, task lists, autolinks, footnotes | Habilite por default para corresponder ao que usuarios esperam de markdown moderno. | HIGH |
| remark-math | 6.0.0 | parse de formulas | Ative apenas quando formulas realmente fizerem parte do corpus. | HIGH |
| remark-rehype | 11.x | ponte markdown -> HTML AST | Necessario para combinar markdown com plugins rehype. O major e verificado; patch exato nao foi verificado. | MEDIUM |
| rehype-sanitize | 6.0.0 | sanitizacao do HTML gerado | Obrigatorio se o viewer aceitar HTML embutido ou plugins que possam introduzir HTML. | HIGH |
| rehype-slug | 5.0.0 | ids em headings | Use para deep-links, TOC e presentation mode com navegacao por secoes. | MEDIUM |
| rehype-autolink-headings | 7.1.0 | ancora clicavel em headings | Use junto com `rehype-slug` para compartilhar secoes sem criar breadcrumbs artificiais. | HIGH |
| rehype-pretty-code + shiki | 0.14.1 / 3.12.2 | blocos de codigo com highlighting de alta qualidade | Melhor escolha para leitura de codigo. Prefira highlight estatico e consistente, nao highlight client-only. | HIGH |
| rehype-katex + katex | 7.0.1 / 0.16.22 | renderizacao matematica | Use quando `remark-math` estiver ativo. KaTeX e mais leve e mais rapido que MathJax para viewer. | HIGH |
| react-pdf + pdfjs-dist | 10.1.0 / 5.4.x | preview de PDF no browser | Melhor caminho para preview paginado, zoom e thumbnails em React. Carregue so no client e isole em boundary propria. `pdfjs-dist` patch exato variou nos resultados, entao trate `5.4.x` como linha recomendada. | HIGH |
| react-zoom-pan-pinch | 3.7.0 | pan/zoom de imagem e diagramas | Use no viewer de imagem em tela normal e fullscreen. Evita depender do preview basico do browser. | HIGH |
| next/image | builtin | otimização e loading de imagens | Use para imagens normais; troque para `<img>` dentro do pan/zoom quando controle fino de transform for necessario. | HIGH |
| Fuse.js | 7.1.0 | fuzzy matching instantaneo no client | Use apenas para filtro local rapido da arvore e de resultados ja carregados. Nao substitui busca principal. | HIGH |
| @tanstack/react-virtual | 3.13.12 | virtualizacao de listas e resultados | Adicione quando a arvore ou a lista de resultados crescer o suficiente para degradar scroll. Nao comece customizando tudo cedo demais. | HIGH |
| chokidar | 4.0.3 | watch do repositório `pkm` | Use para refresh local e reindexacao incremental sem depender de polling bruto. | HIGH |
| fast-glob | 3.3.3 | varredura inicial do repositório | Bom para bootstrap do indice e jobs de rebuild. | HIGH |
| gray-matter | 4.0.3 | parse do frontmatter | Use no indexador; ignore frontmatter na busca textual, mas preserve seus metadados estruturais no indice. | HIGH |
| screenfull | 6.0.2 | fullscreen/presentation mode | Camada fina sobre Fullscreen API. Use para modo apresentacao do viewer, nao para controlar navegacao da aplicacao inteira. | MEDIUM |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Playwright | testes E2E do viewer | Essencial para validar arvore, busca, PDF, fullscreen e regressao visual basica em ambiente real de browser. |
| Vitest | testes unitarios do indexador e parser | Bom para pipeline de parse, logica sidecar/binario e ranking de busca. |
| ESLint + TypeScript strict | disciplina de manutencao | Importante porque a aplicacao mistura filesystem, cache, indexacao e viewers client/server. |

## Architecture Choice For v2

Use uma arquitetura de **processo unico Node.js + Next.js App Router + SQLite derivado + acesso direto ao filesystem do `pkm`**.

Pontos prescritivos:

- O `pkm` continua montado no filesystem e e a fonte primaria de verdade.
- A aplicacao web le o repositorio diretamente; ela nao grava no `pkm` nesta v2.
- O indice SQLite e derivado e reconstruivel.
- A shell principal deve ser server-rendered; viewers interativos ficam em client islands.
- A busca principal roda no servidor sobre FTS5.
- O filtro instantaneo da arvore pode usar `Fuse.js` apenas sobre dados ja carregados.
- Binario + sidecar textual devem virar um **item logico unico** no indice e na UI.
- Markdown deve ser renderizado por pipeline AST (`remark`/`rehype`), nao por HTML cru.
- PDF e imagem devem ter viewers separados, com carregamento lazy e boundaries de erro proprias.

### App Structure

| Layer | Choice | Why |
|------|--------|-----|
| App shell | Next.js layouts + AntD `Layout`/`Splitter` + Tailwind | Resolve rapidamente painel esquerdo retratil, viewer e barra de acoes sem reinventar shell desktop-like. |
| Tree navigation | AntD `Tree` primeiro; virtualizacao so se necessario | O componente ja cobre expand/collapse, selecao e estrutura hierarquica. Nao vale gastar a v2 construindo tree headless do zero. |
| Search API | route handler em Next + SQL FTS5 | Mantem busca perto do indice e evita mandar corpus para o browser. |
| Markdown viewer | `react-markdown` + `remark`/`rehype` pipeline | Seguro, extensivel e adequado para custom renderers de links, imagens, code blocks e sidecars. |
| Image viewer | viewer client-only com `react-zoom-pan-pinch` | Entrega zoom, pan e fullscreen sem depender de bibliotecas abandonadas. |
| PDF viewer | viewer client-only com `react-pdf` | Melhor opcao pragmatica para preview paginado no ecossistema React. |
| Refresh/indexacao | `chokidar` + rebuild incremental | Combina com modelo file-first e evita depender de sync manual para o ambiente local/self-hosted. |

## Installation

```bash
# Core
npm install next@15 react@19 react-dom@19 antd@5 tailwindcss @tailwindcss/postcss postcss

# Indexacao e busca
npm install better-sqlite3 drizzle-orm chokidar fast-glob gray-matter fuse.js
npm install -D drizzle-kit @types/better-sqlite3

# Markdown viewer
npm install react-markdown@10 remark-parse@11 remark-gfm@4 remark-math@6 remark-rehype rehype-sanitize@6 rehype-slug rehype-autolink-headings@7 rehype-pretty-code@0.14 shiki@3 rehype-katex@7 katex@0.16

# Binary viewers
npm install react-pdf@10 pdfjs-dist react-zoom-pan-pinch@3 screenfull

# Optional performance
npm install @tanstack/react-virtual

# Dev
npm install -D vitest playwright typescript eslint
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js App Router | Vite + React Router | So faz sentido se o projeto abandonar SSR/RSC e assumir uma SPA pura. Para este caso, perde simplicidade de shell + BFF unico. |
| Ant Design shell | shadcn/ui + Radix primitives | Use apenas se a prioridade absoluta for um design system totalmente autoral e houver budget para construir tree, splitter e shell com mais codigo proprio. |
| SQLite FTS5 | cliente-only search com Lunr/FlexSearch/MiniSearch | So serve para acervos pequenos ou demos offline. Para `pkm` real com sidecars e corpus crescente, e inferior como busca principal. |
| react-pdf | embed do viewer padrao do browser ou PDF.js cru | Use embed nativo apenas para preview minimo. Use PDF.js cru so se precisar de viewer muito customizado alem do custo justificavel de manter. |
| react-markdown + unified | MDX | Use MDX somente se o repositorio passar a conter conteudo executavel de interface. Para PKM file-first, MDX introduz poder demais e superficie de risco desnecessaria. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `next export` / static export como estrategia principal | O proprio Next documenta suporte limitado; voce perde boa parte do que importa aqui: leitura dinamica do filesystem, busca server-side e viewers ricos sem gambiarra. | `next build` + `next start` em Node self-hosted |
| Browser-only full-text search como indice primario | Empurra corpus demais para o cliente, piora cold start e complica sidecars/snippets/ranking. | SQLite FTS5 no servidor + Fuse.js so para filtro local |
| `react-pdf-js` | O pacote esta deprecated no npm. | `react-pdf` + `pdfjs-dist` |
| bibliotecas antigas de pinch/zoom como `react-pinch-zoom-pan` | Ha pacotes deprecated/abandonados e com manutencao fraca. | `react-zoom-pan-pinch` |
| renderizacao Markdown baseada em `dangerouslySetInnerHTML` | Piora seguranca e reduz capacidade de customizar AST, links, headings, code e sidecars. | `react-markdown` + `remark`/`rehype` |
| MDX como formato padrao do acervo | Mistura conteudo com codigo executavel sem necessidade para um viewer; aumenta risco e acoplamento do repositório. | Markdown puro + frontmatter + sidecars |

## Stack Patterns by Variant

**Se a v2 ficar estritamente local/single-user:**
- Use `better-sqlite3` diretamente e trate FTS5 como primeira classe.
- Porque a simplicidade operacional e mais valiosa do que abstrair demais o banco.

**Se a v2 precisar abrir milhares de nos e resultados:**
- Adicione `@tanstack/react-virtual` nas listas mais pesadas.
- Porque virtualizacao precoce na arvore inteira aumenta complexidade; aplique onde profiling mostrar gargalo real.

**Se o corpus tiver pouca formula e pouco codigo:**
- Mantenha `remark-gfm` por default e carregue math/highlight so quando necessario.
- Porque o viewer ganha simplicidade e reduz custo de renderizacao.

**Se PDF continuar secundario, como o milestone sugere:**
- Entregue `react-pdf` com preview paginado basico e fullscreen, sem annotations nem editor.
- Porque PDF aqui e capacidade de leitura, nao uma vertical completa de documentos.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@15.5.x` | `react@19.x`, `react-dom@19.x`, `node@20.9+` | Base recomendada para o app inteiro. |
| `react-markdown@10.1.0` | `remark-gfm@4.0.1`, `remark-math@6.0.0`, `rehype-sanitize@6.0.0` | Pipeline AST moderno e seguro. |
| `remark-parse@11.0.0` | `remark-gfm@4.x`, `remark-rehype@11.x` | A propria documentacao de `remark-gfm` referencia `remark-parse` 11+. |
| `react-pdf@10.1.0` | `pdfjs-dist@5.4.x` | Em Next, o viewer deve ser client-only e configurar worker do PDF.js. |
| `better-sqlite3@12.2.0` | SQLite com FTS5 | Use WAL e SQL manual para virtual tables FTS5 mesmo que o resto use ORM. |

## Recommendation Summary

Para a `ai-pkm v2`, o stack mais correto nao e “web CMS”, nem “SPA de notas”, nem “MDX docs site”. E:

- **Next.js App Router self-hosted em Node**
- **Ant Design para shell de explorador**
- **Tailwind para a superficie de leitura e identidade visual**
- **SQLite FTS5 como busca primaria derivada**
- **`react-markdown` + `remark`/`rehype` para Markdown rico**
- **`react-zoom-pan-pinch` para imagens**
- **`react-pdf` para PDF**

Isso respeita o modelo file-first, entrega viewer de alta qualidade sem banco como fonte primaria e nao antecipa complexidade de edicao nem agent runtime web.

## Sources

- React versions: https://react.dev/versions — verificado `React 19.2`
- Next.js docs, App Router: https://nextjs.org/docs/app
- Next.js docs, self-hosting: https://nextjs.org/docs/app/guides/self-hosting
- Next.js docs, deploying: https://nextjs.org/docs/app/getting-started/deploying
- Next.js npm package: https://www.npmjs.com/package/next
- Tailwind + Next guide: https://tailwindcss.com/docs/guides/nextjs
- Ant Design docs: https://ant.design/docs/react/introduce/
- Ant Design npm package: https://www.npmjs.com/package/antd
- SQLite FTS5 official docs: https://sqlite.org/fts5.html
- Drizzle SQLite docs: https://orm.drizzle.team/docs/get-started-sqlite
- better-sqlite3 npm: https://www.npmjs.com/package/better-sqlite3
- react-markdown npm: https://www.npmjs.com/package/react-markdown
- remark-parse npm: https://www.npmjs.com/package/remark-parse
- remark-gfm npm: https://www.npmjs.com/package/remark-gfm
- remark-math npm: https://www.npmjs.com/package/remark-math
- rehype-sanitize npm: https://www.npmjs.com/package/rehype-sanitize
- rehype-slug npm: https://www.npmjs.com/package/rehype-slug/v/5.0.0
- rehype-autolink-headings npm: https://www.npmjs.com/package/rehype-autolink-headings
- rehype-pretty-code npm: https://www.npmjs.com/package/rehype-pretty-code
- shiki npm: https://www.npmjs.com/package/shiki
- rehype-katex npm: https://www.npmjs.com/package/rehype-katex
- katex npm: https://www.npmjs.com/package/katex
- PDF.js getting started: https://mozilla.github.io/pdf.js/getting_started/
- react-pdf npm: https://www.npmjs.com/package/react-pdf
- pdfjs-dist npm: https://www.npmjs.com/package/pdfjs-dist
- react-zoom-pan-pinch npm: https://www.npmjs.com/package/react-zoom-pan-pinch
- Fuse.js npm: https://www.npmjs.com/package/fuse.js
- @tanstack/react-virtual npm: https://www.npmjs.com/package/@tanstack/react-virtual
- chokidar npm: https://www.npmjs.com/package/chokidar
- fast-glob npm: https://www.npmjs.com/package/fast-glob
- gray-matter npm: https://www.npmjs.com/package/gray-matter
- screenfull npm: https://www.npmjs.com/package/screenfull

---
*Stack research for: ai-pkm v2 viewer web*
*Researched: 2026-04-06*
