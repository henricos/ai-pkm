# Architecture Research

**Domain:** aplicacao Next.js self-hosted para PKM file-first com arvore navegavel, viewer e inbox
**Researched:** 2026-04-06
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                           App Shell (UI)                            │
├──────────────────────────────────────────────────────────────────────┤
│  Tree / Inbox Panel   │   Viewer Surface   │   Search / UI State    │
│  URL-driven selection │   Markdown/Image   │   collapse, mode, tabs │
└───────────────┬───────────────────────┬──────────────────────────────┘
                │                       │
                ▼                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      Next.js App Router Boundary                    │
├──────────────────────────────────────────────────────────────────────┤
│  Server Components     │  Route Handlers    │  Client islands       │
│  initial tree/viewer   │  search/item APIs  │  tree interactions    │
└───────────────┬───────────────────────┬──────────────────────────────┘
                │                       │
                ▼                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      Application / Domain Layer                     │
├──────────────────────────────────────────────────────────────────────┤
│  Content service  │  Navigation service  │  Search service          │
│  viewer models    │  tree/inbox models   │  text lookup abstraction │
└───────────────┬───────────────────────┬──────────────────────────────┘
                │                       │
                ▼                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Content Access / Integration Layer               │
├──────────────────────────────────────────────────────────────────────┤
│  PKM filesystem adapter  │  JSON index reader  │  future DB adapter  │
│  frontmatter parsing     │  topology bootstrap  │  derived index only │
└───────────────┬───────────────────────┬──────────────────────────────┘
                │                       │
                ▼                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                             Data Stores                             │
├──────────────────────────────────────────────────────────────────────┤
│  pkm/ repo (source of truth) │ index/*.json │ future SQLite/Postgres │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| App shell | manter layout persistente, painel esquerdo, viewer e URL atual | `app/(viewer)/layout.tsx` com estado de UI minimo no cliente |
| Tree and inbox navigator | listar estrutura navegavel e destacar selecao atual | Client Component com dados iniciais do servidor + fetch incremental |
| Viewer renderer | renderizar item selecionado como Markdown, imagem ou PDF depois | Server Component para payload inicial, client islands para UX local |
| Route handlers | expor leitura de item, busca e metadados sem vazar filesystem para o cliente | `app/api/*/route.ts` com DTOs Zod |
| Content service | transformar arquivos reais em modelos de navegação e viewer | modulos TS puros em `src/server/content` |
| Search service | abstrair busca textual para hoje em filesystem/indices e amanha em banco | interface unica com implementacoes trocaveis |
| PKM adapter | encapsular leitura de `pkm/`, parsing de frontmatter, sidecars e regras de visibilidade | `fs/promises`, `gray-matter`, detectores de tipo |
| Index reader | usar `index/topicos.json` e `index/grupos.json` como bootstrap de topologia | modulos somente leitura |
| Future agent boundary | reservar endpoints, estado e slot visual para console futuro sem acoplar ao viewer | route group ou slot separado, sem motor agente na v2 |

## Recommended Project Structure

```text
src/
├── app/
│   ├── (viewer)/
│   │   ├── layout.tsx                 # shell persistente da experiencia principal
│   │   ├── page.tsx                   # estado vazio / landing do viewer
│   │   ├── inbox/
│   │   │   ├── page.tsx               # lista de inbox como area propria
│   │   │   └── [...path]/
│   │   │       └── page.tsx           # item selecionado dentro da inbox
│   │   └── library/
│   │       └── [...path]/
│   │           └── page.tsx           # item selecionado na base principal
│   ├── api/
│   │   ├── tree/route.ts              # arvore e contagens
│   │   ├── items/[kind]/[...path]/route.ts
│   │   ├── search/route.ts
│   │   └── health/route.ts
│   └── layout.tsx                     # providers globais minimos
├── components/
│   ├── shell/                         # frame da app, split panes, toolbar
│   ├── tree/                          # tree node renderers, inbox list
│   ├── viewer/                        # markdown/image/pdf viewer
│   └── search/                        # caixa de busca e resultados
├── lib/
│   ├── contracts/                     # tipos e schemas Zod compartilhados
│   ├── navigation/                    # helpers de rotas, path ids, breadcrumbs tecnicos
│   └── utils/                         # funcoes puras sem regra de negocio
├── server/
│   ├── content/                       # services de item, tree, inbox, media, sidecar
│   ├── search/                        # interface SearchBackend + adapters
│   ├── adapters/
│   │   ├── pkm-fs/                    # leitura real do repositorio
│   │   ├── json-index/                # leitura dos indices derivados atuais
│   │   └── future-db/                 # placeholder so quando v3 chegar
│   └── cache/                         # cache local por processo e invalidacao
└── styles/                            # tokens e estilos globais
```

### Structure Rationale

- **`app/`:** concentra somente roteamento, layouts e bordas HTTP. Regra de negocio nao fica aqui.
- **`components/`:** UI reutilizavel e agnostica da origem dos dados.
- **`server/content/`:** coracao da v2. Aqui mora a traducao entre filesystem real e modelos da interface.
- **`server/adapters/`:** separa fonte de verdade atual (`pkm/` + JSON indices) do futuro indice em banco. Essa e a boundary mais importante para nao reescrever a app na v3.
- **`lib/contracts/`:** evita drift entre Server Components, Route Handlers e clientes.

## Architectural Patterns

### Pattern 1: URL-Driven Selection with Persistent Shell

**What:** a selecao do item fica na URL; o shell principal fica num layout persistente. O painel esquerdo nao remonta a cada clique, e o viewer troca conforme a rota.
**When to use:** exatamente no caso desta v2, onde a experiencia deve parecer SPA e a selecao precisa ser compartilhavel, restauravel e navegavel por back/forward.
**Trade-offs:** melhora navegacao e previsibilidade; exige pensar em encoding estavel de paths e em mapeamento entre URL e item logico.

**Example:**
```typescript
// app/(viewer)/library/[...path]/page.tsx
export default async function LibraryItemPage({
  params,
}: {
  params: Promise<{ path: string[] }>
}) {
  const { path } = await params
  const item = await getViewerItem({ scope: 'library', path })
  return <ViewerSurface item={item} />
}
```

### Pattern 2: Content Gateway over Raw Filesystem

**What:** nenhum componente UI le diretamente `pkm/`. Toda leitura passa por um gateway que conhece sidecars, regras de ocultacao, inbox, grupos e parsing de frontmatter.
**When to use:** sempre que a origem e file-first, mas a UI precisa de um modelo mais limpo que a arvore bruta do disco.
**Trade-offs:** adiciona uma camada a mais; em troca, reduz acoplamento e prepara a troca futura do backend de busca/indexacao.

**Example:**
```typescript
export interface ContentRepository {
  getTree(): Promise<NavigationTree>
  getInbox(): Promise<InboxList>
  getViewerItem(input: ViewerItemRef): Promise<ViewerItem>
}

export class FsContentRepository implements ContentRepository {
  // Encapsula fs, indices JSON e regras de sidecar
}
```

### Pattern 3: Read-Optimized API Boundary

**What:** Route Handlers pequenos e especificos para leitura: tree, item, search. Sem CRUD generico, sem endpoints especulativos de escrita.
**When to use:** v2 e leitura pura; ainda nao existe motivo para surface area maior.
**Trade-offs:** menos flexivel para futuras mutacoes, mas muito mais simples e coerente agora.

**Example:**
```typescript
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? ''
  const result = await searchService.search(query)
  return Response.json(SearchResultSchema.parse(result))
}
```

### Pattern 4: Swap-Ready Search Backend

**What:** busca textual atras de uma interface unica. Hoje pode ler arquivos e sidecars; depois pode apontar para SQLite sem mudar UI nem rotas.
**When to use:** agora. Busca e o ponto com maior chance de mudar entre v2 e v3.
**Trade-offs:** pequena abstracao a mais desde o inicio, mas paga rapido porque isola a futura indexacao.

## Data Flow

### Request Flow

```text
[Clique em item da arvore]
    ↓
[Next Link / router.push]
    ↓
[Rota /library/[...path] ou /inbox/[...path]]
    ↓
[Server Component page.tsx]
    ↓
[Content service]
    ↓
[PKM adapter + index reader]
    ↓
[pkm/ + index/*.json]
    ↓
[Viewer model normalizado]
    ↓
[Viewer Surface]
```

### State Management

```text
[URL] = fonte de verdade da selecao
    ↓
[layout persistente]
    ↓
[estado client-only]
collapse do painel | aba do viewer | modo apresentacao | query de busca
```

Recomendacao: nao introduzir store global para tudo. Use:

- URL para item selecionado e escopo (`library` vs `inbox`)
- estado local/contexto leve para painel, tema de leitura e interacoes efemeras
- cache de dados no servidor; no cliente, apenas o necessario para transicoes suaves

### Key Data Flows

1. **Bootstrap da shell:** layout carrega arvore resumida, contagens da inbox e estado inicial do viewer. Essa resposta precisa ser pequena o suficiente para abrir rapido.
2. **Selecao de item:** a URL muda; o viewer carrega o item via Server Component. O painel permanece montado.
3. **Busca textual:** UI envia query para `searchService`; o backend procura em nomes, Markdown e sidecars; o resultado devolve refs navegaveis, nao blobs completos.
4. **Resolucao de item logico:** service transforma arquivo principal + sidecar em uma unidade unica de viewer. Sidecar nao aparece como node independente.
5. **Inbox separada:** inbox e um namespace proprio, com listagem e contadores independentes da arvore principal. Nao misture `__inbox/` dentro da tree normal.
6. **Futuro reindex:** quando v3 chegar, um indexador atualiza SQLite; `searchService` e partes de `contentService` podem ler do indice derivado, mantendo `pkm/` como verdade.

## Suggested Build Order

1. **Content contracts and filesystem adapter**
   - Definir `NavigationTree`, `ViewerItem`, `InboxItem`, `SearchHit`.
   - Implementar parser do PKM real, sidecars e regras de ocultacao.
   - Sem isso, a UI tende a codificar regras erradas do dominio.

2. **Read-only application services**
   - `getTree`, `getInbox`, `getViewerItem`, `search`.
   - Aqui se estabiliza a boundary que a v3 vai preservar.

3. **App shell with URL-driven routes**
   - Layout persistente, painel retratil, rotas `library` e `inbox`, estado vazio.
   - Isso garante a experiencia SPA cedo e evita refatorar navegacao depois.

4. **Viewer surface**
   - Markdown primeiro, imagem em seguida, PDF se entrar na v2.
   - O viewer deve receber modelo pronto; nao conhecer filesystem.

5. **Search**
   - Primeiro busca simples em backend com interface pronta para trocar a implementacao.
   - Nao construa indexador dedicado antes de validar a UX da busca.

6. **Future-ready seams**
   - Health endpoint, tags de invalidacao, placeholders de `server/search` para SQLite.
   - Nao implemente console agente agora; apenas reserve um boundary visual e de rotas.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 operador, acervo moderado | monolito modular no Next.js, leitura por filesystem + caches de processo |
| acervo maior, busca lenta | introduzir SQLite como indice derivado para busca e listagens pesadas |
| agente web e tarefas longas | adicionar modulo de sessions/jobs no backend, mantendo viewer separado |

### Scaling Priorities

1. **Primeiro gargalo:** busca textual e montagem de arvore grande. Resolva com indice derivado e cache, nao quebrando o app em microservicos.
2. **Segundo gargalo:** viewer de documentos pesados e streaming de console futuro. Resolva com boundaries dedicadas de payload e jobs, nao misturando isso com o shell principal.

## Anti-Patterns

### Anti-Pattern 1: Ler `pkm/` direto dentro de componentes espalhados

**What people do:** cada page/component abre arquivos, resolve frontmatter e decide sozinho se sidecar aparece ou nao.
**Why it's wrong:** duplica regra de negocio, dificulta testes e torna a migracao para indice derivado cara.
**Do this instead:** centralize tudo em `server/content` e `server/adapters`.

### Anti-Pattern 2: Tratar a arvore de disco como a UX final

**What people do:** espelhar a estrutura crua do filesystem no cliente, incluindo sidecars e detalhes internos.
**Why it's wrong:** a arvore fica ruidosa e a UI passa a depender de detalhes que deveriam ser privados.
**Do this instead:** exponha uma navegacao semantica: item logico, inbox separada, sidecar complementar.

### Anti-Pattern 3: Colocar selecao principal em store global em vez de URL

**What people do:** guardar item selecionado so em Zustand/Context e navegar sem rota real.
**Why it's wrong:** quebra refresh, deep link, back/forward e torna o shell mais fragil.
**Do this instead:** URL como fonte da selecao; store apenas para UI efemera.

### Anti-Pattern 4: Introduzir banco como dependencia obrigatoria da v2

**What people do:** antecipar SQLite em tudo, inclusive para abrir paginas basicas, porque "vai existir depois".
**Why it's wrong:** adiciona migracoes, sincronizacao e invalidacao cedo demais, antes de a UI provar valor.
**Do this instead:** mantenha banco como adapter futuro da camada de leitura.

### Anti-Pattern 5: Embutir console agente no mesmo estado e nos mesmos componentes do viewer

**What people do:** projetar viewer, shell e console como um unico bloco desde o inicio.
**Why it's wrong:** mistura concerns de leitura, jobs longos e interacao conversacional; a v2 fica superprojetada.
**Do this instead:** deixe um boundary explicito para `workspace/console` ou slot futuro, sem implementar o motor agora.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| `pkm/` mounted volume | acesso direto via adapter de filesystem | fonte primaria de verdade; leitura somente na v2 |
| `index/*.json` | leitura como bootstrap de topologia | nao editar diretamente; apenas consumir |
| futuro SQLite | adapter opcional da camada `search/content` | indice derivado, reconstruivel |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `app/*` ↔ `server/content/*` | chamada direta no servidor | preferivel para Server Components |
| client components ↔ `app/api/*` | HTTP/JSON | use quando a interacao for incremental no cliente |
| `server/content` ↔ `server/adapters` | interfaces TypeScript | principal seam para v3 |
| future console ↔ viewer shell | slot/layout boundary | compartilha shell, nao compartilha regra de negocio |

## Recommendation

Para a v2, o desenho tipico e correto e um **monolito modular em Next.js App Router**: shell persistente, selecao por URL, leitura centralizada do PKM por uma camada de servico, e endpoints enxutos de leitura para busca e atualizacoes incrementais. O que precisa ser bem desenhado agora nao e “infra”, e sim a **boundary entre interface e origem file-first**.

O ponto de maior cuidado e evitar que a UI conheca detalhes do filesystem. Se `server/content` devolver modelos semanticos estaveis, voce consegue evoluir a busca e a indexacao na v3, e adicionar console agente na v4, sem refazer a navegacao principal. Se a v2 pular essa boundary, ela vira uma app acoplada ao disco e dificil de expandir.

## Sources

- Projeto: `/home/henrico/github/henricos/ai-pkm/.planning/PROJECT.md` — requisitos e escopo atuais do milestone
- Projeto: `/home/henrico/github/henricos/ai-pkm/.planning/PROJECT.md` — contexto do produto e modo file-first
- Projeto: `/home/henrico/github/henricos/ai-pkm/.planning/REQUIREMENTS.md` — constraints de single-user, self-hosted e fonte de verdade
- Projeto: `/home/henrico/github/henricos/ai-pkm/.planning/research/ARCHITECTURE.md` — pesquisa de arquitetura disponível até aqui
- Next.js, Layouts and Pages: https://nextjs.org/docs/app/getting-started/layouts-and-pages — layouts persistentes no App Router, base para shell SPA-like [HIGH]
- Next.js, Dynamic Route Segments: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes — selecao por URL com catch-all segments [HIGH]
- Next.js, Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers — boundary HTTP pequena para leitura incremental [HIGH]
- Next.js, Backend for Frontend: https://nextjs.org/docs/app/guides/backend-for-frontend — padrao de BFF no proprio app Next.js [HIGH]
- Next.js, Preserving UI State: https://nextjs.org/docs/app/guides/preserving-ui-state — manter shell e estado de UI entre transicoes [HIGH]
- Next.js, Single-Page Applications: https://nextjs.org/docs/app/guides/single-page-applications — recomendacoes para experiencia SPA no App Router [HIGH]
- Next.js, Self-Hosting: https://nextjs.org/docs/app/guides/self-hosting — base para deployment self-hosted do monolito [HIGH]
- React, `useTransition`: https://react.dev/reference/react/useTransition — transicoes nao bloqueantes para interacoes locais mais suaves [HIGH]

---
*Architecture research for: ai-pkm v2 viewer architecture*
*Researched: 2026-04-06*
