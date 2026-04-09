# Phase 3: Reading Viewer - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Viewer principal de Markdown com cabeçalho contextual e composição de leitura confiável. A área direita da shell atualmente exibe `WorkspaceItemState` (título + tipo + estado sem conteúdo real) — esta fase substitui isso pelo viewer rico: pipeline de renderização Markdown, cabeçalho sticky com ações e painel de informações com metadata editorial.

Esta fase cobre apenas itens Markdown (nota, url). Imagens, PDFs, sidecars como item principal e o conteúdo textual de sidecars são Phase 4. Modo de apresentação funcional é Phase 5 (o botão já aparece no header desta fase, desabilitado).

</domain>

<decisions>
## Implementation Decisions

### Pipeline de Renderização (VIEW-02, VIEW-03)
- **D-01:** `react-markdown` + `remark-gfm` como base do pipeline — mesma base usada pelo ChatGPT (rehype-react + remark ecosystem), backed by Vercel, dominante em React/Next.js 2025-2026.
- **D-02:** Shiki para syntax highlighting nos blocos de código — motor do VS Code, output HTML estático sem JS no cliente, padrão atual no ecossistema Next.js/Vercel (Astro, Nextra, Next.js docs).
- **D-03:** KaTeX para fórmulas matemáticas — `remark-math` + `rehype-katex` integrados ao pipeline. O corpus real do PKM usa fórmulas com frequência.
- **D-04:** Links externos (`http://`, `https://`) abrem em nova aba (`target="_blank"` + `rel="noopener noreferrer"`); links internos navegam dentro da shell.
- **D-05:** Callouts/admonitions sem tratamento especial nesta fase — renderizados como blockquote padrão. Revisitar na Phase 4 se o corpus real demonstrar uso expressivo.

### Composição de Leitura (VIEW-08, RUN-04)
- **D-06:** `@tailwindcss/typography` com modifier `prose-sm` como base de estilo — 14px alinhado ao `body-md` do DESIGN.md. Override das cores com tokens customizados do `tailwind.config.ts`. Padrão de mercado (Nextra, shadcn/ui docs, tailwindcss.com).
- **D-07:** Largura máxima da coluna de leitura: `max-w-prose` (~65ch), alinhada à esquerda dentro da área de conteúdo (não centrada no viewport). Alinhada ao ritmo de "Technical Journal" do DESIGN.md: assimetria intencional, título à esquerda, texto em coluna estreita. Ajuste fino (max-w-2xl, max-w-3xl) fica como Claude's Discretion baseado em testes com tabelas largas.
- **D-08:** Scroll independente — apenas a área direita rola; painel esquerdo (árvore) fica fixo. Comportamento de shell única (Obsidian, Notion, GitHub).
- **D-09:** Fundo da área de conteúdo: `surface_container_lowest` (#ffffff) — "Primary Workspaces: surface_container_lowest for maximum focus" (DESIGN.md).

### Cabeçalho do Viewer (CTX-01 revisado, CTX-02)
- **D-10:** Cabeçalho sticky — visível durante scroll com efeito glassmorphism discreto ao rolar (DESIGN.md: navigation bars com 70% opacity + `blur(12px)`).
- **D-11:** CTX-01 revisado — o cabeçalho não exibe "título do item". Motivo: filename é feio em kebab-case e H1 no Markdown não é garantido. Em vez disso, o lado esquerdo do cabeçalho mostra o caminho estrutural `tópico › grupo` (label-sm uppercase, DESIGN.md) + indicador de estado (chip discreto, cor diferencia rascunho/finalizado conforme D-10 da Phase 2). Para itens da inbox: "INBOX" no lugar de tópico/grupo.
- **D-12:** Ações no cabeçalho (CTX-02): (1) download do arquivo raw, (2) botão de modo apresentação — aparece nesta fase mas desabilitado/placeholder, Phase 5 implementa, (3) ícone ℹ️ que togela o painel de informações.
- **D-13:** Espaço reservado no layout do header para o futuro botão de troca de tema (Phase 5, PRS-06, PRS-07).

### Painel de Informações (CTX-03, CTX-04)
- **D-14:** Painel lateral direito com largura fixa ~280px que empurra o conteúdo (lado a lado, não overlay). O Markdown encolhe para o espaço restante ao abrir; volta ao normal ao fechar.
- **D-15:** Toggle pelo ícone ℹ️ no cabeçalho (abre/fecha) + tecla Escape fecha. Clicar no conteúdo Markdown não fecha o painel — padrão de painel lateral persistente (GitHub file info, VS Code sidebar, Linear).
- **D-16:** Campos e formato de apresentação — exibe tudo que existir no frontmatter:
  - `tipo` + `estado` → chips coloridos (top, maior destaque)
  - `modelo` → chip neutro
  - `tópico › grupo` → texto simples com separador `›`
  - `data_captura` → formatada como "7 mar 2026"
  - `data_publicacao` → formatada como "nov 2025" (ou precisão disponível)
  - `url` → link clicável com ícone externo (só para itens url)
  - `autores` → lista de chips (só quando presente)
- **D-17:** Campos opcionais ausentes (`autores`, `data_publicacao`) são omitidos completamente — sem "N/A", sem placeholder.
- **D-18:** Slot reservado no painel para texto do sidecar no final — vazio em Phase 3; Phase 4 preenche para binários com sidecar (CTX-05).

### Claude's Discretion
- Estrutura interna de componentes (`MarkdownViewer`, `ViewerHeader`, `InfoPanel`, etc.)
- Ajuste fino da largura máxima da coluna (max-w-prose vs max-w-2xl) baseado em testes com tabelas do corpus real
- Temas Shiki a usar (GitHub Light como padrão, GitHub Dark opcionalmente para code blocks)
- Animação de abertura/fechamento do painel de informações
- Espaçamento e tipografia interna do painel de informações

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §VIEW-01, VIEW-02, VIEW-03, VIEW-08 — contratos do viewer de Markdown
- `.planning/REQUIREMENTS.md` §CTX-01, CTX-02, CTX-03, CTX-04 — cabeçalho e painel de informações
- `.planning/REQUIREMENTS.md` §RUN-04 — responsividade mínima para mobile e WebView futuro

### Prior phase decisions
- `.planning/phases/01-secure-read-model-foundation/01-CONTEXT.md` — stack (Next.js + React + Tailwind + shadcn/ui), DESIGN.md como fonte de verdade, autenticação obrigatória
- `.planning/phases/02-navigation-shell/02-CONTEXT.md` — D-10 (estado: cor discreta), D-11 (icons por tipo), rotas `library/[...path]`, AppShell e WorkspaceItemState que será substituído

### Architecture and domain
- `.planning/ROADMAP.md` §Phase 3: Reading Viewer — objetivo, dependências e critérios de sucesso
- `.planning/phases/02-navigation-shell/02-CONTEXT.md` §code_context — `WorkspaceItemState`, `AppShell`, rotas library/inbox já implementadas

### Design system
- `DESIGN.md` — âncora canônica de estilo: tokens de cor, tipografia (prose-sm → body-md 14px), glassmorphism nav bars, No-Line Rule, surface hierarchy
- `reference/ui/screens/02-content-viewer/code.html` — referência visual do Stitch para área de conteúdo: layout, hierarquia, cabeçalho
- `AGENTS.md` §Referência de UI — protocolo de adaptação Stitch → componentes React

### PKM domain (para parsear frontmatter no info panel)
- `reference/schemas/frontmatter-item.md` — contrato completo do frontmatter: estado, modelo, data_captura, url, autores, data_publicacao
- `reference/pkm/pkm-conventions.md` — convenções de nomenclatura e estrutura

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/shell/workspace-item-state.tsx`: componente atual que exibe título/tipo/estado sem conteúdo — será **substituído** pelo viewer rico desta fase
- `src/components/shell/app-shell.tsx`: AppShell persistente com painel esquerdo e área direita — o viewer entra como filho da área direita
- `src/app/(shell)/library/[...path]/page.tsx`: rota já existente e funcional — recebe `itemId` decodificado e passa para o novo viewer
- `src/app/(shell)/inbox/[item]/page.tsx` (ou similar): rota inbox equivalente
- `src/lib/pkm/fs-item-repository.ts`: fast path para resolver item por ID e ler metadata — o viewer precisará também ler o **conteúdo** do arquivo (não apenas metadata)
- `src/lib/pkm/types.ts`: tipos `Item`, `ItemType`, `ItemEstado` — usados no cabeçalho e painel de info
- `src/components/ui/*`: shadcn/ui base (button, input, label) — reaproveitáveis para ações do header e chips do painel

### Established Patterns
- Autenticação obrigatória já garantida pelo `ShellLayout` (não replicar na página do viewer)
- Item ID = path relativo ao pkm root, URL-encoded; resolução via `getItemById()` canônico
- UI guiada por `DESIGN.md` + referências Stitch, sem copiar HTML exportado diretamente
- `surface_container_lowest` (#fff) para workspaces de foco máximo (DESIGN.md)
- Labels `label-sm` uppercase para metadata contextual (PhaseContext 2)
- Chips coloridos para estado (rascunho = cor neutra, finalizado = cor positiva)

### Integration Points
- `src/lib/pkm/item-repository.ts`: o contrato `getItem(id: string)` já retorna metadata; precisará de um novo método `getItemContent(id: string): string` para ler o Markdown raw do filesystem
- `src/app/(shell)/layout.tsx`: o ShellLayout passa `children` para a área direita — o novo viewer substitui `WorkspaceItemState` nas rotas de item
- `tailwind.config.ts`: custom tokens já configurados (tertiary, surface_container_lowest, on_surface, etc.) — os overrides do `prose` usarão esses tokens diretamente
- KaTeX CSS: precisará de import no `globals.css` ou no layout do viewer

</code_context>

<specifics>
## Specific Ideas

- **CTX-01 revisado:** Filename kebab-case é feio para o header — usar `tópico › grupo` como contexto estrutural é mais informativo e editorial. Baseado na realidade do corpus real (sem campo `title` nos arquivos).
- **Pipeline baseado no ChatGPT:** A escolha de `react-markdown` + remark ecosystem foi validada pela pesquisa — é a mesma base que o ChatGPT usa (rehype-react + remark). Não é especulação técnica, é referência de mercado.
- **prose-sm = body-md:** O modifier `prose-sm` do Tailwind usa 14px como base, coincidindo exatamente com `body-md` do DESIGN.md. Não há conflito entre o plugin e o sistema de design.
- **Slot de sidecar no painel:** O usuário quer ver a descrição textual do sidecar no final do painel de informações. Reservar o slot em Phase 3 evita refatoração em Phase 4 (CTX-05).
- **Botão de tema no header:** O header deve reservar posição para o futuro botão de troca de tema (Phase 5). Evitar um redesign completo do header naquela fase.

</specifics>

<deferred>
## Deferred Ideas

- **Troca de tema no header** — Phase 5 (PRS-06, PRS-07). O header desta fase reserva posição; a implementação do seletor de temas e o comportamento do viewer por tema acontecem em Phase 5.
- **Callouts/admonitions visuais** — Nenhum tratamento especial por ora. Se o corpus real demonstrar uso expressivo de `> [!NOTE]` ou `:::note`, adicionar plugin (remark-callout ou remark-directive) em Phase 4 ou incrementalmente.
- **Restore da URL solicitada pós-login** — Adiado desde Phase 2; continua fora do escopo desta fase.
- **Busca textual avançada** — Continua fora do escopo de toda a v2 ativa.

</deferred>

---

*Phase: 03-reading-viewer*
*Context gathered: 2026-04-09*
