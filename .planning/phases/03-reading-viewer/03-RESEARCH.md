# Phase 3: Reading Viewer — Research

**Researched:** 2026-04-09
**Domain:** Markdown rendering pipeline, viewer layout, info panel, Next.js App Router integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pipeline de Renderização (VIEW-02, VIEW-03)**
- D-01: `react-markdown` + `remark-gfm` como base do pipeline
- D-02: Shiki para syntax highlighting — `@shikijs/rehype`
- D-03: KaTeX para fórmulas — `remark-math` + `rehype-katex`
- D-04: Links externos abrem em nova aba; links internos navegam na shell
- D-05: Callouts/admonitions sem tratamento especial nesta fase — blockquote padrão

**Composição de Leitura (VIEW-08, RUN-04)**
- D-06: `@tailwindcss/typography` com `prose-sm` como base — 14px = `body-md` do DESIGN.md
- D-07: `max-w-prose` (~65ch) alinhado à esquerda dentro da área de conteúdo
- D-08: Scroll independente — apenas área direita rola; rail esquerdo fica fixo
- D-09: Fundo da área de conteúdo: `surface_container_lowest` (#ffffff)

**Cabeçalho do Viewer (CTX-01 revisado, CTX-02)**
- D-10: Cabeçalho sticky com glassmorphism discreto ao rolar
- D-11: CTX-01 revisado — cabeçalho mostra `tópico › grupo` (não título/filename)
- D-12: Ações no cabeçalho: download raw, botão de apresentação (desabilitado), toggle painel ℹ️
- D-13: Espaço reservado para futuro botão de troca de tema (Phase 5)

**Painel de Informações (CTX-03, CTX-04)**
- D-14: Painel lateral direito com largura fixa ~280px — push layout (não overlay)
- D-15: Toggle pelo ícone ℹ️; Escape fecha; clicar no Markdown não fecha
- D-16: Campos exibidos — `tipo + estado` (chips coloridos), `modelo` (chip neutro), `tópico › grupo` (texto), `data_captura` (formatada), `data_publicacao` (formatada), `url` (link com ícone externo), `autores` (chips)
- D-17: Campos ausentes omitidos completamente — sem "N/A"
- D-18: Slot reservado para texto de sidecar no final — vazio em Phase 3

### Claude's Discretion
- Estrutura interna de componentes (`MarkdownViewer`, `ViewerHeader`, `InfoPanel`, etc.)
- Ajuste fino da largura máxima da coluna (`max-w-prose` vs `max-w-2xl`)
- Temas Shiki (GitHub Light como padrão)
- Animação de abertura/fechamento do painel de informações
- Espaçamento e tipografia interna do painel de informações

### Deferred Ideas (OUT OF SCOPE)
- Troca de tema no header — Phase 5
- Callouts/admonitions visuais — Phase 4 se necessário
- Restore da URL solicitada pós-login — continua fora do escopo
- Busca textual avançada — fora do escopo de toda v2.0 ativa
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Descrição | Suporte da Pesquisa |
|----|-----------|---------------------|
| VIEW-01 | Área direita exibe conteúdo sem transição perceptível | Server Component que renderiza na mesma shell; `MarkdownAsync` compatível com RSC |
| VIEW-02 | Viewer Markdown renderiza headings, listas, tabelas, blocos de código com highlight, task lists, links, callouts | `react-markdown@10` + `remark-gfm@4` + `@shikijs/rehype@4` cobre todos |
| VIEW-03 | Pipeline baseado em bibliotecas maduras, sem HTML cru | Stack confirmado: react-markdown + remark/rehype ecosystem |
| VIEW-08 | Largura máxima e composição visual para leitura | `@tailwindcss/typography@0.5.19` + `prose-sm` + custom CSS variables |
| CTX-01 | Cabeçalho exibe contexto estrutural do item | `tópico › grupo` derivado do `Item.topic` e `Item.group` já disponíveis |
| CTX-02 | Cabeçalho exibe ações do item | Lucide icons + shadcn Button component já instalados |
| CTX-03 | Ícone de informação abre painel lateral dentro da área de conteúdo | Push layout com CSS flex + estado React local |
| CTX-04 | Painel de informações sem YAML cru | `gray-matter` já instalado; leitura adicional de campos opcionais |
| RUN-04 | Interface responsiva para mobile e WebView futuro | Tailwind responsive modifiers; painel em viewport estreito colapsa |
</phase_requirements>

---

## Summary

Esta fase substitui o `WorkspaceItemState` (Phase 2) por um viewer Markdown rico. O código base existente já tem tudo para o viewer funcionar como Server Component: `gray-matter` para parsear frontmatter, `FsItemRepository` com o path absoluto disponível via `Item.path`, e a estrutura de rotas `library/[...path]` e `inbox/[item]` funcionais.

A pesquisa confirmou que `react-markdown@10` exporta `MarkdownAsync` — a forma correta de usar plugins assíncronos como `@shikijs/rehype` em React Server Components. Nenhum código de highlighting chega ao cliente: o `@shikijs/rehype` produz HTML estático no servidor, com zero JavaScript de runtime no browser. O projeto usa Tailwind v4 com configuração CSS-first (`@import "tailwindcss"` em `globals.css`), portanto o plugin `@tailwindcss/typography` deve ser carregado via `@plugin "@tailwindcss/typography"` no CSS — não via `tailwind.config.ts`.

O `gray-matter` (v4.0.3) já está instalado e em uso no `FsItemRepository`. O método `getItemContent(id)` a criar lê o arquivo bruto, usa `matter(raw).content` para separar o Markdown do frontmatter, e retorna a string. O `getItemFrontmatter(id)` usa `matter(raw).data` para os campos do painel de informações.

**Recomendação principal:** Viewer como Server Async Component. `getItemContent()` e `getItemFrontmatter()` adicionados ao `FsItemRepository`. `MarkdownAsync` com `rehypePlugins={[rehypeShikiAsync]}` no Server Component. KaTeX CSS importado em `globals.css` via `@import "katex/dist/katex.min.css"`. Typography plugin via `@plugin "@tailwindcss/typography"` no mesmo arquivo.

---

## Standard Stack

### Core (já na decisão — aprofundando implementação)

| Biblioteca | Versão | Propósito | Status |
|------------|--------|-----------|--------|
| `react-markdown` | 10.1.0 | Componente React para renderizar Markdown | A instalar |
| `remark-gfm` | 4.0.1 | GFM: tabelas, task lists, autolinks, strikethrough | A instalar |
| `remark-math` | 6.0.0 | Parsear `$...$` e `$$...$$` para math nodes | A instalar |
| `rehype-katex` | 7.0.1 | Renderizar math nodes como HTML KaTeX | A instalar |
| `@shikijs/rehype` | 4.0.2 | Syntax highlighting via Shiki no rehype pipeline | A instalar |
| `shiki` | 4.0.2 | Motor de highlighting (dependência de @shikijs/rehype) | A instalar |
| `@tailwindcss/typography` | 0.5.19 | Plugin prose para estilizar Markdown renderizado | A instalar |
| `gray-matter` | 4.0.3 | Parsear frontmatter YAML dos arquivos Markdown | **JÁ INSTALADO** |

**Versões verificadas:** [VERIFIED: npm registry — 2026-04-09]

### Não necessita nova dependência

| Ferramenta | Por quê não precisa |
|------------|---------------------|
| `date-fns`, `dayjs`, `luxon` | `Intl.DateTimeFormat` (nativo) cobre pt-BR perfeitamente |
| Parser frontmatter adicional | `gray-matter` já instalado e em uso |
| Componente de painel / drawer | CSS flex puro + `useState` suficiente para push layout |
| Biblioteca de animação | `transition-all duration-200` do Tailwind é suficiente |

### Instalação

```bash
npm install react-markdown remark-gfm remark-math rehype-katex @shikijs/rehype shiki
npm install -D @tailwindcss/typography
```

---

## Architecture Patterns

### Estrutura de Componentes Recomendada

```
src/
├── lib/
│   └── pkm/
│       └── fs-item-repository.ts   # Adicionar getItemContent() e getItemFrontmatter()
├── components/
│   └── viewer/
│       ├── markdown-viewer.tsx      # Server Component — MarkdownAsync + plugins
│       ├── viewer-header.tsx        # Client Component — sticky header + toggle state
│       ├── info-panel.tsx           # Client Component — painel push com dados do frontmatter
│       └── viewer-page.tsx          # Server Component orquestrador da página
```

### Padrão 1: MarkdownAsync em Server Component (CRÍTICO)

`react-markdown@10` exporta três formas:
- `Markdown` — síncrono, não suporta plugins async
- `MarkdownAsync` — suporta plugins async, funciona em RSC (retorna `Promise<ReactElement>`)
- `MarkdownHooks` — para client-side async com hooks

`@shikijs/rehype` é um plugin **assíncrono**. Portanto, é obrigatório usar `MarkdownAsync` — o componente `Markdown` padrão não processa highlighting corretamente.

```typescript
// src/components/viewer/markdown-viewer.tsx
// Source: react-markdown v10 README + shikijs/shiki#829

import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";

interface MarkdownViewerProps {
  content: string;
}

// Nenhuma diretiva "use client" — este é um Server Component
export async function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <article className="prose prose-sm max-w-prose px-8 py-10">
      <MarkdownAsync
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeShiki, { theme: "github-light" }],
        ]}
        components={{
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </MarkdownAsync>
    </article>
  );
}
```

**Por que Server Component:** Zero JavaScript de highlighting no bundle do cliente. O HTML já chega highlighted do servidor. [VERIFIED: luckymedia.dev + shikijs/shiki#829]

### Padrão 2: getItemContent() e getItemFrontmatter() no FsItemRepository

O `FsItemRepository` atual usa `gray-matter` para ler frontmatter em `getItem()`. Adicionar dois métodos novos ao contrato `ItemRepository` e à implementação:

```typescript
// Adicionar à interface ItemRepository:
getItemContent(id: string): string;      // Retorna Markdown puro sem frontmatter
getItemFrontmatter(id: string): RawFrontmatter | null; // Retorna campos do frontmatter

// Tipo para o painel de informações (campos extras não em Item)
export interface RawFrontmatter {
  estado: string;
  modelo?: string;
  data_captura?: string;
  data_publicacao?: string;
  url?: string;
  autores?: string[];
}
```

**Implementação em FsItemRepository:**

```typescript
getItemContent(id: string): string {
  const absPath = this.resolveAndValidatePath(id);
  const raw = fs.readFileSync(absPath, "utf-8");
  const { content } = matter(raw);
  return content.trim();
}

getItemFrontmatter(id: string): RawFrontmatter | null {
  const absPath = this.resolveAndValidatePath(id);
  if (!fs.existsSync(absPath)) return null;
  const raw = fs.readFileSync(absPath, "utf-8");
  const { data } = matter(raw);
  return data as RawFrontmatter;
}

// Helper privado para reutilizar a lógica de validação de path:
private resolveAndValidatePath(id: string): string {
  const decoded = decodeURIComponent(id);
  const absPath = path.resolve(this.pkmRoot, decoded);
  if (!absPath.startsWith(this.pkmRoot + path.sep)) {
    throw new Error(`Path traversal detectado: ${id}`);
  }
  return absPath;
}
```

**Nota:** O `Item.path` já contém o path absoluto validado — uma alternativa é receber `Item` diretamente e ler via `item.path`, evitando revalidação. O planner escolhe a abordagem mais limpa. [VERIFIED: leitura de fs-item-repository.ts existente]

### Padrão 3: Configuração do @tailwindcss/typography no Tailwind v4

O projeto usa Tailwind v4 com configuração CSS-first — não há `tailwind.config.ts`. O plugin é carregado via `@plugin` no CSS:

```css
/* src/app/globals.css — adicionar após @import "tailwindcss" */
@plugin "@tailwindcss/typography";
```

**Customização dos tokens de cor para prose:**

O `@tailwindcss/typography@0.5.19` expõe variáveis CSS que podem ser sobrescritas:

```css
/* Adicionar após @plugin "@tailwindcss/typography" */
@layer utilities {
  .prose {
    --tw-prose-body: var(--color-on-surface);          /* #2b3437 */
    --tw-prose-headings: var(--color-on-surface);
    --tw-prose-links: var(--color-tertiary);           /* #0055d7 */
    --tw-prose-bold: var(--color-on-surface);
    --tw-prose-counters: color-mix(in srgb, var(--color-on-surface) 60%, transparent);
    --tw-prose-bullets: color-mix(in srgb, var(--color-on-surface) 40%, transparent);
    --tw-prose-hr: var(--color-outline-variant);
    --tw-prose-quotes: var(--color-on-surface);
    --tw-prose-quote-borders: var(--color-outline-variant);
    --tw-prose-captions: color-mix(in srgb, var(--color-on-surface) 60%, transparent);
    --tw-prose-code: var(--color-on-surface);
    --tw-prose-pre-code: var(--color-on-surface);
    --tw-prose-pre-bg: var(--color-surface-container-low);  /* #f1f4f6 */
    --tw-prose-th-borders: var(--color-outline-variant);
    --tw-prose-td-borders: var(--color-outline-variant);
  }
}
```

**Nota sobre peerDependencies:** `@tailwindcss/typography@0.5.19` declara `tailwindcss: ">=4.0.0-beta.1"` como peer dependency válida. [VERIFIED: npm view @tailwindcss/typography@0.5.19 peerDependencies]

### Padrão 4: KaTeX CSS no globals.css

KaTeX requer seu próprio CSS para renderizar corretamente. O método mais simples e sem dependências extras no Next.js App Router é importar diretamente no `globals.css`:

```css
/* src/app/globals.css — adicionar após os imports existentes */
@import "katex/dist/katex.min.css";
```

Isso funciona no Tailwind v4 porque o arquivo usa `@import "tailwindcss"` já no topo e o Next.js processa CSS de forma global. [VERIFIED: padrão confirmado por múltiplas implementações Next.js + rehype-katex]

### Padrão 5: Sticky Header com Glassmorphism

O `globals.css` já tem a classe `.glass`:

```css
.glass {
  background-color: color-mix(in srgb, var(--color-surface) 70%, transparent);
  backdrop-filter: blur(12px);
}
```

O header sticky pode ser:

```tsx
// viewer-header.tsx — Client Component para controlar estado do painel
"use client";

export function ViewerHeader({ topic, group, estado, itemId, onTogglePanel, panelOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById("viewer-scroll");
    const handler = () => setIsScrolled(el.scrollTop > 8);
    el?.addEventListener("scroll", handler);
    return () => el?.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-10 flex items-center justify-between h-11 px-8 transition-all duration-150",
        isScrolled ? "glass shadow-ambient" : "bg-surface-container-lowest",
      ].join(" ")}
    >
      {/* Contexto estrutural: tópico › grupo */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 truncate">
          {topic}
        </span>
        {group && (
          <>
            <span className="text-on-surface/25 text-[0.6875rem]" aria-hidden>›</span>
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 truncate">
              {group}
            </span>
          </>
        )}
        {/* Chip de estado */}
        <EstadoChip estado={estado} />
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Espaço reservado para tema — Phase 5 */}
        <div className="w-8 h-8" aria-hidden /> 
        {/* Botão apresentação — desabilitado nesta fase */}
        <button disabled className="...">...</button>
        {/* Download */}
        <a href={`/api/pkm/raw/${encodeURIComponent(itemId)}`} download ...>...</a>
        {/* Toggle painel */}
        <button onClick={onTogglePanel} aria-pressed={panelOpen} ...>ℹ️</button>
      </div>
    </header>
  );
}
```

**Pitfall de hidratação:** O glassmorphism ativado por scroll (`isScrolled`) usa `useState` + `useEffect` — padrão seguro porque o estado inicial é `false` tanto no servidor quanto no cliente. Sem divergência de hidratação. [VERIFIED: padrões de hidratação Next.js]

### Padrão 6: Push Layout para o Painel de Informações

O painel de informações empurra o conteúdo (push, não overlay). Usar CSS flex diretamente:

```tsx
// Layout wrapper no viewer — Server Component com estado Client
<div className="flex flex-1 min-w-0 h-full overflow-hidden">
  {/* Scroll container do conteúdo */}
  <div id="viewer-scroll" className="flex-1 min-w-0 overflow-y-auto">
    <ViewerHeader ... />
    <MarkdownViewer content={content} />
  </div>

  {/* Painel de informações — push via flex */}
  {panelOpen && (
    <aside
      className="w-70 shrink-0 border-l border-outline-variant/20 overflow-y-auto bg-surface-container-low transition-all duration-200"
      aria-label="Painel de informações"
    >
      <InfoPanel frontmatter={frontmatter} topic={topic} group={group} />
    </aside>
  )}
</div>
```

**Por que flex e não grid:** O flex permite que a área de conteúdo (`flex-1 min-w-0`) naturalmente encolha quando o painel abre, sem reflows. Não é necessário `transition` na largura do container principal — o flex redistribui automaticamente. [ASSUMED — padrão CSS flex bem estabelecido, mas a largura exata 280px deve ser testada com o corpus real]

### Padrão 7: Formatação de Data em pt-BR sem dependências

```typescript
// Sem date-fns ou dayjs — Intl.DateTimeFormat é suficiente
function formatDataCaptura(isoDate: string): string {
  // Ex: "2026-03-07" → "7 mar 2026"
  const date = new Date(isoDate + "T00:00:00"); // Evita timezone shift
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  // Resultado: "7 de mar. de 2026" — ajustar com replace se necessário
}

function formatDataPublicacao(isoPartial: string): string {
  // Aceita "YYYY", "YYYY-MM", "YYYY-MM-DD"
  if (/^\d{4}$/.test(isoPartial)) {
    return isoPartial; // Ex: "2025"
  }
  if (/^\d{4}-\d{2}$/.test(isoPartial)) {
    const [year, month] = isoPartial.split("-");
    const date = new Date(`${year}-${month}-01T00:00:00`);
    return new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      year: "numeric",
    }).format(date); // Ex: "nov. 2025"
  }
  // Formato completo
  return formatDataCaptura(isoPartial);
}
```

**Nota:** `Intl.DateTimeFormat` em Node.js (Next.js) pode precisar de locale data. Verificar se o runtime tem suporte a pt-BR — Next.js padrão inclui todos os locales via ICU completo. [ASSUMED — verificar em ambiente real se "pt-BR" retorna mês abreviado correto]

### Padrão 8: Derivação de Contexto Estrutural para o Header (D-11 revisado)

O header mostra `tópico › grupo`, derivados do `Item` já disponível via `getItemById()`:

```typescript
// Item.topic = "tecnologia" → formatLabel("tecnologia") = "Tecnologia"
// Item.group = "superapp" → formatLabel("superapp") = "Superapp"
// Item.topic = "__inbox" → mostrar "INBOX" em vez de tópico/grupo

function getHeaderContext(item: Item): { topic: string; group?: string } {
  if (item.topic === "__inbox") return { topic: "INBOX" };
  return {
    topic: formatLabel(item.topic),
    group: item.group ? formatLabel(item.group) : undefined,
  };
}
```

A função `formatLabel` já existe em `navigation-service.ts` — pode ser extraída para um módulo utilitário compartilhado ou duplicada. [VERIFIED: leitura de navigation-service.ts]

### Padrão 9: Download do Arquivo Raw

O header tem um link de download do arquivo raw. A API de conteúdo ainda não existe — precisará de uma Route Handler:

```typescript
// src/app/api/pkm/raw/[...path]/route.ts
// Retorna o conteúdo bruto com Content-Disposition: attachment
// Requer autenticação (verificar session antes de servir)
```

Alternativamente, o botão pode usar `item.path` para gerar o nome do arquivo, mas o conteúdo deve ser servido via API autenticada, nunca exposto diretamente. [VERIFIED: padrão de segurança Phase 1 — ARC-01, nunca expor paths absolutos]

### Anti-Patterns a Evitar

- **Usar `Markdown` (síncrono) com `@shikijs/rehype`:** O plugin async não funciona no componente síncrono. Sempre usar `MarkdownAsync` em RSC.
- **Importar KaTeX CSS em Client Component:** Causa FOUC (flash of unstyled content). Importar em `globals.css` globalmente.
- **Usar `dangerouslySetInnerHTML` com HTML processado:** `react-markdown` já produz JSX React — não usar innerHTML.
- **Colocar `MarkdownViewer` como Client Component:** Perderia o benefício do server-side highlighting. Manter como Server Component.
- **Usar `useEffect` para detectar scroll no container errado:** O scroll acontece na `<main>` do `AppShell`, não no `window`. Usar ref ou ID do elemento certo.

---

## Don't Hand-Roll

| Problema | Não construir | Usar | Razão |
|----------|--------------|------|-------|
| Syntax highlighting de código | Highlighter próprio com regex | `@shikijs/rehype` | 200+ linguagens, temas VS Code, zero JS no cliente |
| Parsing de Markdown | Parser próprio | `react-markdown` + `remark-gfm` | GFM completo incluindo edge cases de tabelas |
| Renderização de fórmulas LaTeX | Parser KaTeX próprio | `remark-math` + `rehype-katex` | Centenas de símbolos, acessibilidade, MathML |
| Parsing de frontmatter YAML | Regex/split próprio | `gray-matter` (já instalado) | Lida com tipos, strings multilinha, edge cases |
| Tipografia de leitura | CSS manual | `@tailwindcss/typography` | Espaçamento vertical, tamanhos relativos, reset para elementos Markdown |
| Formatação de data | Parser de string próprio | `Intl.DateTimeFormat` (nativo) | Sem dependência, suporte a todos os locales |

---

## Common Pitfalls

### Pitfall 1: `Markdown` vs `MarkdownAsync` com plugins assíncronos

**O que dá errado:** Usar o componente padrão `Markdown` (ou o default export de versões antigas) com `@shikijs/rehype` — o highlighting silenciosamente não acontece, os blocos de código ficam sem cor.

**Por que acontece:** `@shikijs/rehype` é um plugin assíncrono. O componente `Markdown` padrão executa plugins de forma síncrona. Sem erro explícito — simplesmente não funciona.

**Como evitar:** `import { MarkdownAsync } from "react-markdown"` — não o default export.

**Sinais de alerta:** Blocos `<code>` sem classes Shiki, ausência de `<span style="color:...">` no HTML renderizado. [VERIFIED: shikijs/shiki issue #829]

### Pitfall 2: @tailwindcss/typography com Tailwind v4 CSS-first

**O que dá errado:** Tentar adicionar `plugins: [require('@tailwindcss/typography')]` em um arquivo `tailwind.config.ts` — esse arquivo não existe no projeto (Tailwind v4 usa configuração CSS-first).

**Por que acontece:** Tailwind v4 mudou radicalmente o modelo de configuração. Plugins são carregados via `@plugin` no CSS, não via `tailwind.config.js`.

**Como evitar:** Adicionar `@plugin "@tailwindcss/typography"` diretamente em `globals.css`.

**Sinais de alerta:** Erro de módulo não encontrado ao tentar importar tailwind.config, ou classes `prose` sem efeito. [VERIFIED: tailwindcss/discussions #14120 + leitura do globals.css existente]

### Pitfall 3: KaTeX CSS ausente — fórmulas exibidas sem estilo

**O que dá errado:** `rehype-katex` gera HTML com classes KaTeX, mas sem o CSS correspondente as fórmulas aparecem como texto sem formatação (ou com layout quebrado).

**Por que acontece:** O CSS do KaTeX precisa ser carregado separadamente — não vem embutido na saída HTML.

**Como evitar:** `@import "katex/dist/katex.min.css"` em `globals.css`. Alternativa: `import "katex/dist/katex.min.css"` no layout do Server Component.

**Sinais de alerta:** Fórmulas exibidas sem espaçamento correto, símbolos empilhados incorretamente.

### Pitfall 4: Glassmorphism com `position: sticky` e `overflow: hidden`

**O que dá errado:** O header sticky não gruda se um ancestral tem `overflow: hidden`. O `AppShell` tem `overflow-y-auto` na `<main>` — o sticky funciona dentro do scroll container correto, mas se houver outro wrapper com `overflow: hidden` entre o header e o scroll container, o sticky quebrará.

**Por que acontece:** CSS `position: sticky` requer que nenhum ancestral entre o elemento e o scroll container tenha `overflow` diferente de `visible`.

**Como evitar:** Verificar a cadeia de overflow dos ancestrais. O scroll deve acontecer no container pai direto do viewer, e o header sticky deve ser filho desse container. [ASSUMED — baseado em comportamento CSS bem documentado, verificar em implementação]

### Pitfall 5: Tabelas Markdown com max-w-prose quebrando layout

**O que dá errado:** Tabelas largas (muitas colunas ou conteúdo extenso) excedem `max-w-prose` (~65ch) e causam overflow horizontal sem scroll visível.

**Por que acontece:** `@tailwindcss/typography` não adiciona scroll horizontal por padrão em tabelas.

**Como evitar:** Envolver o `<MarkdownViewer>` em um container com `overflow-x-auto`, ou adicionar ao CSS de prose:
```css
.prose table { display: block; overflow-x: auto; }
```
O planner deve incluir uma tarefa de ajuste fino após testar com o corpus real.

**Sinais de alerta:** Tabelas cortadas ou overlap com o painel de informações quando aberto. (Claude's Discretion — D-07 prevê ajuste fino de `max-w-prose` vs `max-w-2xl`)

### Pitfall 6: Scroll do painel de informações vs scroll do conteúdo

**O que dá errado:** O painel de informações e o conteúdo Markdown compartilham o mesmo scroll container — ao rolar o Markdown, o painel também rola (ou vice-versa).

**Por que acontece:** Sem isolamento de scroll, o flex container pai rola inteiro.

**Como evitar:** Cada área deve ter seu próprio `overflow-y-auto` e altura máxima. O container wrapper (`flex h-full`) não pode ter scroll; os dois filhos (`flex-1 overflow-y-auto` e `w-70 overflow-y-auto`) têm scroll independente.

### Pitfall 7: `new Date("2026-03-07")` com timezone shift

**O que dá errado:** `new Date("2026-03-07")` é parseado como UTC midnight — ao formatar em timezones negativos (ex: UTC-3), a data aparece como "6 mar 2026" em vez de "7 mar 2026".

**Por que acontece:** ISO date strings sem hora são tratadas como UTC pelo spec do JavaScript.

**Como evitar:** `new Date("2026-03-07T00:00:00")` força a interpretação como hora local. [VERIFIED: comportamento documentado no MDN]

---

## Code Examples

### Exemplo completo: pipeline de renderização

```typescript
// Source: react-markdown v10 README + @shikijs/rehype docs
import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";

export async function MarkdownViewer({ content }: { content: string }) {
  return (
    <article className="prose prose-sm max-w-prose px-8 pt-8 pb-16">
      <MarkdownAsync
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeShiki, { theme: "github-light" }],
        ]}
        components={{
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
            return (
              <a
                href={href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </MarkdownAsync>
    </article>
  );
}
```

### Exemplo: globals.css com adições da Phase 3

```css
/* Adicionar após @import "tw-animate-css" e @import "shadcn/tailwind.css": */
@import "katex/dist/katex.min.css";
@plugin "@tailwindcss/typography";

/* Overrides dos tokens de cor do prose com tokens do DESIGN.md */
@layer utilities {
  .prose {
    --tw-prose-body: var(--color-on-surface);
    --tw-prose-headings: var(--color-on-surface);
    --tw-prose-links: var(--color-tertiary);
    --tw-prose-pre-bg: var(--color-surface-container-low);
    --tw-prose-hr: var(--color-outline-variant);
    --tw-prose-quote-borders: var(--color-outline-variant);
    --tw-prose-th-borders: var(--color-outline-variant);
    --tw-prose-td-borders: var(--color-outline-variant);
  }
}
```

### Exemplo: ViewerPage Server Component orquestrador

```typescript
// src/app/(shell)/library/[...path]/page.tsx — substitui WorkspaceItemState
import { notFound } from "next/navigation";
import { decodeLibraryParams } from "@/lib/navigation/route-helpers";
import { FsItemRepository } from "@/lib/pkm/fs-item-repository";
import { ViewerHeader } from "@/components/viewer/viewer-header";
import { MarkdownViewer } from "@/components/viewer/markdown-viewer";
import { InfoPanelWrapper } from "@/components/viewer/info-panel-wrapper";

export default async function LibraryItemPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const resolvedParams = await params;
  const itemId = decodeLibraryParams(resolvedParams);

  const repo = new FsItemRepository();
  const item = repo.getItem(itemId);
  if (!item || item.type === "binario") notFound(); // Binários = Phase 4

  const content = repo.getItemContent(itemId);
  const frontmatter = repo.getItemFrontmatter(itemId);

  return <InfoPanelWrapper
    item={item}
    content={content}
    frontmatter={frontmatter}
  />;
}
```

---

## State of the Art

| Abordagem Antiga | Abordagem Atual (2025-2026) | Impacto |
|------------------|-----------------------------|---------|
| `highlight.js` / `prism.js` client-side | Shiki server-side via `@shikijs/rehype` | Zero JS no cliente para highlighting |
| `ReactMarkdown` default export síncrono | `MarkdownAsync` named export | Suporte a plugins assíncronos em RSC |
| `tailwind.config.js` com `plugins: []` | `@plugin` no CSS (`globals.css`) | Tailwind v4 CSS-first |
| `remark-gfm` v3 (CommonJS) | `remark-gfm` v4 (ESM puro) | Compatível com Next.js App Router ESM |
| `next/head` para CSS de terceiros | `@import` em `globals.css` | App Router não tem `<Head>` nas pages |

---

## Assumptions Log

| # | Afirmação | Seção | Risco se Errado |
|---|-----------|-------|-----------------|
| A1 | `Intl.DateTimeFormat("pt-BR")` retorna mês abreviado no formato esperado no runtime Node.js do Next.js | Padrão 7 | Datas exibidas em inglês ou formato inesperado — mitigar com teste manual |
| A2 | O header sticky funciona corretamente dentro do `<main>` scroll container existente no `AppShell` (sem ancestral com `overflow: hidden` quebrando sticky) | Pitfall 4 | Header não gruda ao rolar — exige ajuste de CSS |
| A3 | O push layout flex com `w-70` (280px) para o painel não causa overflow no viewport em 1280px com o rail esquerdo de 288px aberto | Padrão 6 | Necessidade de ajustar largura do painel ou comportamento responsivo |
| A4 | `@plugin "@tailwindcss/typography"` no `globals.css` é processado corretamente pelo Next.js 16 com `@tailwindcss/postcss` | Padrão 3 | Classes `prose` sem efeito — fallback: usar `@import "@tailwindcss/typography"` |

---

## Open Questions

1. **`getItemContent()` na interface vs. direto no Server Component**
   - O que sabemos: `FsItemRepository` já tem `item.path` disponível via `getItem()`
   - O que está em aberto: Deve `getItemContent()` ser adicionado à interface `ItemRepository` (contratos estáveis) ou apenas ao `FsItemRepository` para não contaminar o contrato da v3?
   - Recomendação: Adicionar à interface — a v3 também precisará servir conteúdo; o contrato genérico é valioso

2. **Download do arquivo raw: API dedicada ou link direto**
   - O que sabemos: Phase 1 estabelece que paths absolutos nunca são expostos ao cliente
   - O que está em aberto: Criar `/api/pkm/raw/[...path]` ou usar download client-side com Blob
   - Recomendação: Route Handler autenticado `/api/pkm/raw/[...path]` — consistente com a arquitetura de segurança

3. **Responsividade do painel em telas estreitas (RUN-04)**
   - O que sabemos: Em mobile, a shell com 288px de rail + 280px de painel + conteúdo ultrapassa qualquer viewport móvel
   - O que está em aberto: Painel como overlay em viewport < 768px, ou esconder painel em mobile?
   - Recomendação: Em `< md` breakpoint, painel fecha automaticamente e reabre como overlay (não push) — ou simplesmente desabilitar o botão de painel em mobile como fallback aceitável para Phase 3

---

## Environment Availability

| Dependência | Exigida Por | Disponível | Versão | Fallback |
|-------------|-------------|------------|--------|---------|
| `gray-matter` | `getItemContent()`, `getItemFrontmatter()` | Sim | 4.0.3 | — |
| `node` fs module | `FsItemRepository` | Sim | (Server Only) | — |
| npm registry | Instalação dos pacotes novos | Sim (verificado) | — | — |
| `Intl` com pt-BR | Formatação de datas | Sim (Node.js padrão) | — | Fallback: formatação manual de string |

**Sem bloqueadores identificados.** Todos os pacotes a instalar estão disponíveis no npm registry com versões estáveis verificadas.

---

## Validation Architecture

### Framework de Testes

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest 3.2.4 |
| Config | `vitest.config.ts` (raiz do projeto) |
| Ambiente | jsdom |
| Comando rápido | `npm test` (vitest run) |
| Suíte completa | `npm test` |
| Tipagem | `npm run typecheck` |

### Mapa de Requisitos → Testes

| Req ID | Comportamento | Tipo de Teste | Comando | Arquivo |
|--------|---------------|---------------|---------|---------|
| VIEW-01 | Área direita atualiza sem navegação perceptível | manual / e2e visual | — | (manual) |
| VIEW-02 | Markdown renderiza GFM completo (tabelas, task lists, code, etc.) | snapshot / render test | `npm test -- markdown-viewer` | Wave 0: `src/__tests__/markdown-viewer.test.tsx` |
| VIEW-03 | Pipeline usa bibliotecas maduras — sem HTML cru | type check | `npm run typecheck` | Verificado em compilação |
| VIEW-08 | Composição visual adequada — classe prose aplicada | render test | `npm test -- markdown-viewer` | Wave 0: `src/__tests__/markdown-viewer.test.tsx` |
| CTX-01 | Header mostra `tópico › grupo` corretos | unit | `npm test -- viewer-header` | Wave 0: `src/__tests__/viewer-header.test.tsx` |
| CTX-02 | Ações do header presentes (download, apresentação desabilitado, ℹ️) | render test | `npm test -- viewer-header` | Wave 0: `src/__tests__/viewer-header.test.tsx` |
| CTX-03 | Toggle do painel abre/fecha — estado React | unit | `npm test -- info-panel` | Wave 0: `src/__tests__/info-panel.test.tsx` |
| CTX-04 | Painel exibe campos formatados sem YAML cru | unit | `npm test -- info-panel` | Wave 0: `src/__tests__/info-panel.test.tsx` |
| RUN-04 | Responsividade — não quebra em tela pequena | manual / visual | — | (manual em DevTools mobile) |

**Testes de aceitação adicionais recomendados:**
- `getItemContent()` retorna string sem frontmatter — unit test em `item-repository.test.ts` (extensão do existente)
- `getItemFrontmatter()` retorna campos corretos — unit test em `item-repository.test.ts`
- Formatação de datas pt-BR (A1) — unit tests de `formatDataCaptura` e `formatDataPublicacao`

### Wave 0 — Gaps a criar antes de implementar

- [ ] `src/__tests__/markdown-viewer.test.tsx` — VIEW-02, VIEW-08
- [ ] `src/__tests__/viewer-header.test.tsx` — CTX-01, CTX-02
- [ ] `src/__tests__/info-panel.test.tsx` — CTX-03, CTX-04

*(Testes de integração real de Markdown/Shiki são inviáveis em jsdom — focar em unit tests de lógica e testes de render de estrutura HTML)*

---

## Security Domain

### Categorias ASVS Aplicáveis

| Categoria ASVS | Aplica | Controle Padrão |
|----------------|--------|-----------------|
| V2 Autenticação | não (já coberta na Phase 1 via ShellLayout) | — |
| V3 Session Management | não (já coberta) | — |
| V4 Access Control | sim | Autenticação verificada no ShellLayout antes de qualquer viewer |
| V5 Input Validation | sim | Path traversal validation em `resolveAndValidatePath()` |
| V6 Criptografia | não | — |

### Padrões de Ameaça Específicos

| Padrão | STRIDE | Mitigação Padrão |
|--------|--------|-----------------|
| Path traversal via `itemId` | Tampering | `resolveAndValidatePath()` com `startsWith(pkmRoot)` — já existe em `getItem()`, replicar em `getItemContent()` e `getItemFrontmatter()` |
| XSS via Markdown (links com `javascript:`) | Tampering | `react-markdown` sanitiza por padrão — `defaultUrlTransform` rejeita `javascript:` URIs |
| Exposição de path absoluto no header/painel | Information Disclosure | `Item.path` nunca é enviado ao cliente — derivar contexto visual de `item.topic`, `item.group`, `item.id` |
| Download raw de arquivo não-autenticado | Elevation of Privilege | Route Handler `/api/pkm/raw/[...path]` deve verificar `auth()` antes de servir |

---

## Sources

### Primárias (HIGH confidence)
- `src/lib/pkm/fs-item-repository.ts` — código existente, gray-matter já em uso
- `src/app/globals.css` — Tailwind v4 CSS-first confirmado, `.glass` já definido
- `src/lib/pkm/types.ts` e `src/lib/navigation/navigation-types.ts` — tipos canônicos
- `npm view` — versões verificadas em 2026-04-09: react-markdown@10.1.0, remark-gfm@4.0.1, remark-math@6.0.0, rehype-katex@7.0.1, @shikijs/rehype@4.0.2, @tailwindcss/typography@0.5.19

### Secundárias (MEDIUM confidence)
- [shikijs/shiki issue #829](https://github.com/shikijs/shiki/issues/829) — `MarkdownAsync` é a forma correta para plugins assíncronos
- [tailwindcss discussions #14120](https://github.com/tailwindlabs/tailwindcss/discussions/14120) — `@plugin` no CSS para Tailwind v4
- [luckymedia.dev — Shiki + RSC + Next.js](https://www.luckymedia.dev/blog/syntax-highlighting-with-shiki-react-server-components-and-next-js) — padrão makeSingletonHighlighter
- [tailwindlabs/tailwindcss-typography README](https://github.com/tailwindlabs/tailwindcss-typography) — `@plugin "@tailwindcss/typography"` no CSS

### Terciárias (LOW confidence — marcadas como ASSUMED)
- A1: Comportamento `Intl.DateTimeFormat("pt-BR")` em runtime Node.js — baseado em documentação MDN e experiência geral
- A3: Compatibilidade de largura do push layout em viewport médio — precisa de teste visual

---

## Metadata

**Breakdown de confiança:**
- Standard stack: HIGH — versões verificadas no registro npm
- Architecture patterns: HIGH — baseados em código existente e documentação oficial
- Pitfalls: MEDIUM-HIGH — combinação de código existente verificado + documentação + uma pitfall assumida (Pitfall 4)

**Data da pesquisa:** 2026-04-09
**Válida até:** 2026-05-09 (stack estável, mas verificar `MarkdownAsync` no react-markdown changelog se houver patch antes da execução)
