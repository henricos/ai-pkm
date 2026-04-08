# Phase 2: Navigation Shell - Research

**Researched:** 2026-04-08
**Domain:** shell persistente App Router + árvore de navegação + inbox separada + filtro estrutural client-side
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Inbox lane
- **D-01:** A inbox aparece como bloco proprio acima da arvore principal, nunca como ramo da tree.
- **D-02:** A inbox usa lista simples de itens, nao arvore nem cards.
- **D-03:** A inbox deve ser compacta, com densidade de fila operacional.
- **D-04:** Os sinais visuais da inbox ficam no minimo necessario: contador e tipo do item; sem metadata adicional por padrao.
- **D-05:** A secao da inbox pode ser recolhida como uma gaveta/caixa discreta quando o contador estiver zerado.
- **D-06:** A direcao visual pode sugerir um "escaninho/gaveta" somente se isso couber no design minimalista geral; se destoar, usar uma caixa simples e discreta.

### Tree behavior
- **D-07:** No carregamento inicial, a arvore mostra apenas os topicos raiz; subtopicos e grupos comecam fechados.
- **D-08:** Ao abrir um item por URL direta, a shell deve autoexpandir todos os ancestrais para revelar o item ativo.
- **D-09:** Contagens aparecem em todos os agrupadores estruturais: topicos, subtópicos e grupos.
- **D-10:** O estado `rascunho` vs `finalizado` deve ser visivel por cor de forma clara, mas discreta.
- **D-11:** Os icones representam tipo de item, nao estado. Tipos explicitamente desejados: Markdown, imagem, diagrama Excalidraw, PDF e binario generico.
- **D-12:** O comportamento de clique e misto: agrupadores expandem/recolhem; itens terminais abrem o conteudo.

### Filter interaction
- **D-13:** O filtro estrutural atua somente sobre a arvore principal, nao sobre a inbox.
- **D-14:** O filtro reage em tempo real a cada tecla.
- **D-15:** O match nao pode depender apenas do inicio do nome; deve encontrar ocorrencias em qualquer parte do nome.
- **D-16:** Quando possivel, o filtro deve aceitar curinga simples com `*`.
- **D-17:** Quando um item casa com o filtro, os itens nao correspondentes devem ser escondidos, preservando a apresentacao em forma de arvore.
- **D-18:** O trecho com match deve receber highlight sutil no nome do no.
- **D-19:** O estado vazio do filtro deve ser separado da inbox; a inbox continua fora do escopo do filtro.
- **D-20:** A tolerancia do filtro deve ser maior que case/accent-insensitive puro, aceitando match parcial com pequenas variacoes simples de digitacao, sem virar busca agressiva demais.

### URL and selection model
- **D-21:** A rota sem item selecionado deve mostrar um estado vazio editorial na area direita.
- **D-22:** Biblioteca estruturada e inbox usam namespaces distintos na URL: `library/...` e `inbox/...`.
- **D-23:** Clicar num item da inbox deve navegar para uma rota propria da inbox, sem overlay temporario.
- **D-24:** Cada item aberto entra no historico normal do browser.
- **D-25:** Apos login, a aplicacao cai sempre em `"/"`; nao precisa restaurar a URL originalmente pedida nesta fase.
- **D-26:** A URL visivel do item usa estrategia mista: na `library`, pode refletir o path real do item; na `inbox`, usa uma convencao especial propria do namespace.

### Claude's Discretion
- Estrategia exata para persistir expansao local da arvore alem do reveal do item ativo.
- Mapeamento tecnico final entre tipos de arquivo e icones concretos, desde que respeite a separacao entre tipo e estado.
- Forma exata de implementar o suporte a curinga `*` e fuzzy leve, desde que permaneça filtro estrutural e nao busca textual avancada.
- Linguagem visual exata da "gaveta" da inbox, desde que permaneça discreta e coerente com `DESIGN.md`.

### Deferred Ideas (OUT OF SCOPE)
- Filtrar a inbox junto com a arvore — explicitamente rejeitado nesta fase
- Restaurar URL originalmente pedida apos login — adiado; nesta fase o retorno cai sempre em `"/"`
- Busca textual avancada/popup/lista de resultados — continua fora do escopo da fase 2
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | Usuario pode navegar a base estruturada do `pkm` por meio de uma coluna esquerda com arvore de topicos, subtopicos, grupos e arquivos | `NavigationSnapshot` server-side + tree client component |
| NAV-02 | Inbox aparece como secao propria acima da arvore principal | bloco `InboxLane` fora da tree e fora do filtro |
| NAV-03 | Painel esquerdo pode ser recolhido e reaberto sem perder o item atualmente exibido | shell persistente em `layout.tsx` + estado local do rail |
| NAV-04 | Item atualmente selecionado fica visualmente destacado na navegacao | selecao derivada da URL atual |
| NAV-05 | Navegacao exibe icones distintos para `nota`, `url` e `binario` | `lucide-react` + mapa de tipo visual |
| NAV-06 | Navegacao exibe contagens de itens junto dos nos relevantes | contagens calculadas no read model de navegacao |
| NAV-07 | Navegacao usa indicadores visuais para diferenciar `rascunho/incompleto` de `finalizado` | estado separado de tipo, exposto no snapshot |
| NAV-08 | Ao selecionar um item, a interface mantem shell unica e atualiza URL propria | rotas `library/...` e `inbox/...` sob layout compartilhado |
| FIL-01 | Topo da coluna esquerda oferece campo de filtro estrutural dedicado | `TreeFilterInput` client-side, sem busca textual |
| FIL-02 | Filtro estrutural e tolerante a maiusculas/minusculas e acentos | normalizacao + Fuse `ignoreDiacritics` |
| FIL-03 | Interface diferencia visualmente filtro estrutural de busca textual avancada | rotulo, placeholder e iconografia especificos de filtro |
</phase_requirements>

---

## Summary

A recomendação pragmática para a fase 2 é **manter a shell inteira dentro de um layout persistente do App Router e subir um read model de navegação acima do `ItemRepository` atual**, em vez de tentar fazer a árvore diretamente sobre `listTopics()` e `getItem()`. O `FsItemRepository` da fase 1 já prova a leitura segura e a identidade por `id`, mas ainda não expõe inbox, filhos estruturais, contagens nem relações de ancestrais suficientes para a navegação desta fase. [VERIFIED: src/lib/pkm/fs-item-repository.ts] [VERIFIED: src/lib/pkm/item-repository.ts] [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md]

Para esta fase, a recomendação **não** é introduzir um tree widget pesado como Ant Design. O projeto já está pinado em Next 16.2.2, React 19.2.4, Tailwind 4.2.2, shadcn/ui e `lucide-react`, e a UX exigida mistura inbox em lista, árvore customizada, contagens, estado por cor e reveal por URL. Um tree headless/recursivo com Radix `Collapsible` e `ScrollArea` encaixa melhor no stack existente e evita custo de tema/override desnecessário. [VERIFIED: package.json] [CITED: https://www.radix-ui.com/primitives/docs/components/collapsible] [CITED: https://www.radix-ui.com/primitives/docs/components/scroll-area]

O filtro estrutural deve nascer como **filtro local da árvore, não como busca global disfarçada**. A melhor implementação para esta fase é client-side sobre um snapshot estrutural já carregado, com normalização de acentos, substring em qualquer posição, curinga `*` por regex segura e fuzzy leve via Fuse apenas como fallback controlado. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md] [CITED: https://www.fusejs.io/api/options.html] [VERIFIED: .planning/research/PITFALLS.md]

**Primary recommendation:** use `app/(shell)/layout.tsx` persistente + `NavigationSnapshot` server-side + tree recursiva em client component com Radix/Lucide/Fuse, e selecao sempre orientada por URL em `library/...` e `inbox/...`. [CITED: https://nextjs.org/docs/app/guides/caching-without-cache-components] [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/layout]

## Project Constraints (from CLAUDE.md)

- Ler `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md` e `.planning/ROADMAP.md` antes de implementar ou planejar. [VERIFIED: AGENTS.md]
- A interface web da `v2` e estritamente de navegacao e exibicao; nao pode introduzir edicao manual. [VERIFIED: AGENTS.md] [VERIFIED: .planning/PROJECT.md]
- O `pkm` continua sendo fonte primaria de verdade e a web consome conteudo por path/volume montado externamente. [VERIFIED: AGENTS.md] [VERIFIED: .planning/PROJECT.md]
- Sidecars nao devem vazar como itens principais de navegacao; a UI deve respeitar o item logico. [VERIFIED: AGENTS.md] [VERIFIED: .planning/PROJECT.md]
- A implementacao visual deve seguir `DESIGN.md` e adaptar a referencia do Stitch sem copiar HTML bruto para `src/`. [VERIFIED: AGENTS.md] [VERIFIED: DESIGN.md]
- Este repositório usa `pt-BR` para comunicação e documentação autoral; nomes estruturais e codigo continuam em ingles. [VERIFIED: AGENTS.md]
- Commits automáticos são proibidos; artefatos de planejamento podem ser escritos, mas não commitados sem aprovação humana. [VERIFIED: AGENTS.md]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `16.2.2` no repo; `16.2.3` atual no npm (2026-04-08) | shell persistente, layouts e rotas `library`/`inbox` | A fase 2 depende diretamente de layout compartilhado e navegação parcial do App Router; manter o patch já pinado evita upgrade fora de escopo. [VERIFIED: package.json] [VERIFIED: npm registry] [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/layout] |
| `react` / `react-dom` | `19.2.4` no repo; `19.2.5` atual no npm (2026-04-08) | componentes client-side do rail, tree e filtro | O projeto já está alinhado com React 19 e a fase 2 precisa só de ilhas interativas pequenas sobre dados server-side. [VERIFIED: package.json] [VERIFIED: npm registry] |
| `lucide-react` | `1.7.0` | ícones de tipo, disclosure e estado auxiliar | Já está instalado, evita nova biblioteca de ícones e cobre bem o vocabulário necessário da árvore. [VERIFIED: package.json] [VERIFIED: npm registry] |
| `@radix-ui/react-collapsible` | `1.1.12` publicada em 2025-08-13 | expand/collapse acessível dos agrupadores | Resolve disclosure acessível, controlado ou não-controlado, com baixo acoplamento visual. [VERIFIED: npm registry] [CITED: https://www.radix-ui.com/primitives/docs/components/collapsible] |
| `@radix-ui/react-scroll-area` | `1.2.10` publicada em 2025-08-13 | rail com scroll customizável sem perder comportamento nativo | O rail da shell vai concentrar inbox, filtro e árvore; `ScrollArea` mantém scroll nativo e styling controlado. [VERIFIED: npm registry] [CITED: https://www.radix-ui.com/primitives/docs/components/scroll-area] |
| `fuse.js` | `7.3.0` publicada em 2026-04-04 | fuzzy leve e highlight para filtro estrutural | Permite `ignoreDiacritics`, `includeMatches` e `ignoreLocation`, que cobrem bem o requisito desta fase sem virar busca full-text. [VERIFIED: npm registry] [CITED: https://www.fusejs.io/api/options.html] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@radix-ui/react-tooltip` | `1.2.8` publicada em 2025-08-13 | hint do botão de recolher rail e affordances compactas | Use só em chrome da shell, não em cada nó da árvore. [VERIFIED: npm registry] [CITED: https://www.radix-ui.com/primitives/docs/components/tooltip] |
| `@radix-ui/react-separator` | `1.1.8` publicada em 2025-04-22 | separação visual sutil entre inbox e árvore | Opcional, útil se a hierarquia tonal não bastar sozinha. [VERIFIED: npm registry] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tree recursiva com Radix + Tailwind | Ant Design `Tree` | AntD continua viável em abstrato, mas nesta base adiciona nova linguagem visual, tema paralelo e override pesado para um caso que já exige renderer customizado. [VERIFIED: package.json] [VERIFIED: .planning/research/STACK.md] |
| Fuse + normalização manual | filtro 100% manual | O manual puro funciona para substring e `*`, mas perde ranking leve e índices de highlight; use manual para wildcard e Fuse para fuzzy/controlado. [CITED: https://www.fusejs.io/api/options.html] |
| `library/[...path]` + `inbox/[item]` | query string `?item=` | Path segments deixam a URL compartilhável, legível e coerente com o item selecionado; query string empobrece reveal e back/forward. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md] [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/layout] |

**Installation:**
```bash
npm install @radix-ui/react-collapsible @radix-ui/react-scroll-area @radix-ui/react-tooltip fuse.js
```

**Version verification:** `next@16.2.3` saiu em `2026-04-08`, `react@19.2.5` em `2026-04-08`, `fuse.js@7.3.0` em `2026-04-04`, `@radix-ui/react-collapsible@1.1.12` em `2025-08-13`, `@radix-ui/react-scroll-area@1.2.10` em `2025-08-13` e `@radix-ui/react-tooltip@1.2.8` em `2025-08-13`. A recomendação desta fase é **manter** `next@16.2.2` e `react@19.2.4` já pinados no repo, e só adicionar as dependências faltantes. [VERIFIED: package.json] [VERIFIED: npm registry]

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── app/
│   ├── (shell)/
│   │   ├── layout.tsx               # shell autenticada persistente
│   │   ├── page.tsx                 # empty state editorial em "/"
│   │   ├── library/
│   │   │   └── [...path]/page.tsx   # item da biblioteca
│   │   └── inbox/
│   │       └── [item]/page.tsx      # item da inbox
├── components/
│   ├── shell/
│   │   ├── app-shell.tsx
│   │   ├── left-rail.tsx
│   │   ├── inbox-lane.tsx
│   │   └── tree-filter-input.tsx
│   └── navigation/
│       ├── navigation-tree.tsx
│       ├── tree-node.tsx
│       └── highlight-match.tsx
├── lib/
│   ├── navigation/
│   │   ├── navigation-types.ts
│   │   ├── navigation-service.ts
│   │   ├── route-helpers.ts
│   │   └── filter-tree.ts
│   └── pkm/
│       └── item-repository.ts
```

### Pattern 1: Persistent Shell in Shared Layout

**What:** colocar o rail e o workspace dentro de um `layout.tsx` compartilhado e deixar só o conteúdo da direita variar por rota. [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/layout]

**When to use:** exatamente nesta fase, porque o objetivo é “shell única” com navegação perceptivelmente contínua. [VERIFIED: .planning/ROADMAP.md]

**Why:** layouts são UI compartilhada entre rotas, e o Router Cache do App Router reutiliza layouts compartilhados em navegação client-side. [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/layout] [CITED: https://nextjs.org/docs/app/guides/caching-without-cache-components]

**Example:**
```tsx
// Source: Next.js App Router layout docs
export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const snapshot = await getNavigationSnapshot()
  return <AppShell snapshot={snapshot}>{children}</AppShell>
}
```

### Pattern 2: Navigation Snapshot Above ItemRepository

**What:** criar um serviço de navegação que consome o `ItemRepository` e índices existentes para devolver um snapshot pronto para inbox, árvore, contagens e ancestry. [VERIFIED: src/lib/pkm/item-repository.ts] [VERIFIED: index/topicos.json] [VERIFIED: index/grupos.json]

**When to use:** antes de montar qualquer componente da shell; sem isso a UI fica acoplada ao filesystem cru. [VERIFIED: .planning/research/PITFALLS.md]

**Example:**
```ts
type NavigationSnapshot = {
  inbox: InboxEntry[]
  tree: TreeNode[]
  ancestorsByItemId: Record<string, string[]>
}
```

### Pattern 3: URL-Driven Selection with Distinct Namespaces

**What:** `"/"` abre empty state; `"/library/<path-real>"` abre item estruturado; `"/inbox/<filename>"` abre item da inbox. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md]

**When to use:** sempre que a seleção precisar ser compartilhável, entrar no histórico do navegador e revelar o item na árvore. [VERIFIED: .planning/ROADMAP.md]

**Example:**
```ts
export function itemToHref(item: NavigationItem) {
  return item.scope === "inbox"
    ? `/inbox/${encodeURIComponent(item.slug)}`
    : `/library/${item.pathSegments.map(encodeURIComponent).join("/")}`
}
```

### Pattern 4: Two-Step Structural Filter

**What:** usar uma pipeline de filtro local: `normalização + wildcard seguro` primeiro; `Fuse` depois só para fuzzy leve quando não houver `*`. [CITED: https://www.fusejs.io/api/options.html]

**When to use:** no rail, em tempo real, sem tocar inbox nem conteúdo do viewer. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md]

**Example:**
```ts
const fuse = new Fuse(flatNodes, {
  keys: ["labelNormalized"],
  includeMatches: true,
  ignoreDiacritics: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
  threshold: 0.3,
})
```

### Anti-Patterns to Avoid

- **Árvore diretamente sobre `readdir`:** isso quebra o item lógico, reabre o problema de sidecar e força regra de domínio no frontend. [VERIFIED: .planning/research/PITFALLS.md]
- **Filtro achatando a árvore em lista de resultados:** contraria D-17 e destrói contexto de navegação. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md]
- **Novo kit visual pesado só para a tree:** nesta base, isso aumenta custo de implementação sem resolver a parte realmente difícil, que é o modelo de navegação. [VERIFIED: package.json]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Disclosure acessível dos nós | animação e ARIA de collapse do zero | Radix `Collapsible` | Já entrega controle de estado, teclado e data attributes úteis para styling. [CITED: https://www.radix-ui.com/primitives/docs/components/collapsible] |
| Scroll customizado do rail | scrollbar manual com overlay e listeners | Radix `ScrollArea` | Mantém scroll nativo e styling previsível. [CITED: https://www.radix-ui.com/primitives/docs/components/scroll-area] |
| Fuzzy leve + índices de match | algoritmo caseiro de ranking | `fuse.js` | `includeMatches`, `ignoreDiacritics` e `threshold` já cobrem o caso com menos erro. [CITED: https://www.fusejs.io/api/options.html] |
| Mapping de ícones por tipo | set novo de ícones ou SVGs avulsos | `lucide-react` | Já existe no projeto e reduz drift visual. [VERIFIED: package.json] |

**Key insight:** o valor desta fase está no `NavigationSnapshot` e na semântica de URL, não em reinventar disclosure, scroll ou fuzzy matching. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md]

## Common Pitfalls

### Pitfall 1: `ItemRepository` insuficiente para a shell
**What goes wrong:** tentar montar inbox, árvore e contagens apenas com `listTopics()` e `getItem()`. [VERIFIED: src/lib/pkm/item-repository.ts]
**Why it happens:** a fase 1 fechou a seam de leitura, mas não a projeção específica de navegação. [VERIFIED: src/lib/pkm/item-repository.ts] [VERIFIED: .planning/phases/01-secure-read-model-foundation/01-VERIFICATION.md]
**How to avoid:** adicionar `NavigationService` separado, sem inflar a interface de viewer/busca. [ASSUMED]
**Warning signs:** múltiplas chamadas por nó, lógica de ancestry no componente e contagens recalculadas no client. [ASSUMED]

### Pitfall 2: estado ativo calculado no server layout
**What goes wrong:** o rail não atualiza destaque corretamente porque o layout é persistente e o estado ativo foi resolvido só no servidor. [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/layout] [CITED: https://nextjs.org/docs/app/guides/caching-without-cache-components]
**Why it happens:** shared layouts não devem depender de re-render completo a cada clique. [CITED: https://nextjs.org/docs/app/guides/caching-without-cache-components]
**How to avoid:** deixar o rail como client component e derivar seleção por `usePathname()` ou segmentos. [ASSUMED]
**Warning signs:** highlight atrasado, reveal inconsistente ou rail remontando inteiro. [ASSUMED]

### Pitfall 3: filtro estrutural agressivo demais
**What goes wrong:** qualquer typo vira match e a árvore perde previsibilidade. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md]
**Why it happens:** threshold alto e fuzzy sobre labels muito curtas. [CITED: https://www.fusejs.io/api/options.html]
**How to avoid:** limitar `threshold` a ~`0.3`, exigir `minMatchCharLength >= 2` e priorizar substring/wildcard antes do fuzzy. [CITED: https://www.fusejs.io/api/options.html] [ASSUMED]
**Warning signs:** um caractere retorna metade da árvore ou highlights “quebrados”. [ASSUMED]

### Pitfall 4: inbox tratada como “quase tree”
**What goes wrong:** a inbox perde distinção operacional e parece só mais um ramo da biblioteca. [VERIFIED: .planning/research/PITFALLS.md]
**Why it happens:** reaproveitar o mesmo renderer para tudo é tentador. [VERIFIED: .planning/research/PITFALLS.md]
**How to avoid:** `InboxLane` separado, sem filtro, sem ancestry e com compactação própria. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md]
**Warning signs:** filtro afetando inbox, contagem misturada e linguagem visual indistinta. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md]

## Code Examples

Verified patterns from official sources and repo context:

### Shared Layout for Shell
```tsx
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/layout
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section>{children}</section>
}
```

### Radix Collapsible Node
```tsx
// Source: https://www.radix-ui.com/primitives/docs/components/collapsible
<Collapsible.Root open={open} onOpenChange={setOpen}>
  <Collapsible.Trigger asChild>
    <button type="button">Toggle</button>
  </Collapsible.Trigger>
  <Collapsible.Content>{children}</Collapsible.Content>
</Collapsible.Root>
```

### Fuse Match Metadata
```ts
// Source: https://www.fusejs.io/api/options.html
const fuse = new Fuse(items, {
  includeMatches: true,
  ignoreDiacritics: true,
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Página inteira remonta a cada clique | shared layouts + partial rendering no App Router | App Router moderno; docs atuais em 2026 | Permite shell persistente real sem SPA manual. [CITED: https://nextjs.org/docs/app/guides/caching-without-cache-components] |
| Tree widget monolítico como default | componentes headless/unstyled + design tokens do app | tendência consolidada no ecossistema atual [ASSUMED] | Favorece encaixe no design system existente e menor override. [ASSUMED] |

**Deprecated/outdated:**
- Usar query string como identidade principal do item nesta shell é tecnicamente possível, mas piora legibilidade e compartilhamento frente a rotas por segmento. [ASSUMED]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `NavigationService` deve nascer separado do `ItemRepository`, e não como expansão direta da interface existente | Architecture Patterns | Médio — pode deslocar a divisão de planos, mas não muda o objetivo da fase |
| A2 | `usePathname()` é suficiente para derivar seleção ativa no rail sem precisar de store global | Common Pitfalls | Baixo — se houver corner case, a correção é trocar para segmentos ou contexto leve |
| A3 | Threshold de `0.3` é o melhor ponto de partida para o fuzzy leve desta árvore | Common Pitfalls | Baixo — ajuste fino de UX, não arquitetura |
| A4 | Tree headless com Radix é mais pragmática que AntD para este repo específico | Standard Stack | Médio — se o time preferir AntD, muda a camada visual e parte do plano, não os contratos centrais |

## Open Questions (RESOLVED)

1. **A rota da inbox deve usar filename puro ou slug derivado de `Item.id`?**
   - What we know: `__inbox/` não admite subpastas e a convenção atual usa nomes únicos por arquivo. [VERIFIED: reference/pkm/pkm-structure.md]
   - Resolution: usar filename URL-encoded nesta fase e manter helper único de conversão; não introduzir ID artificial novo enquanto `__inbox/` continuar flat e sem colisões observadas. [RESOLVED]

2. **A expansão do rail deve persistir por `sessionStorage` ou só em memória da sessão React?**
   - What we know: o reveal do item ativo é obrigatório; persistência além disso ficou em discretion. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md]
   - Resolution: começar com estado em memória + reveal por URL; não persistir expansão manual em `sessionStorage` nesta fase. Se a UX ficar insuficiente, isso volta como ajuste posterior, sem bloquear a arquitetura atual. [RESOLVED]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js app shell e testes | ✓ | `v22.18.0` | — |
| npm | instalação das dependências da fase | ✓ | `10.9.3` | — |
| Next CLI | build/dev da shell | ✓ | `16.2.2` | — |

**Missing dependencies with no fallback:**
- None. [VERIFIED: local environment]

**Missing dependencies with fallback:**
- None. [VERIFIED: local environment]

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `Vitest 3.2.4` + `jsdom` [VERIFIED: package.json] [VERIFIED: vitest.config.ts] |
| Config file | `vitest.config.ts` [VERIFIED: vitest.config.ts] |
| Quick run command | `npm run test` [VERIFIED: package.json] |
| Full suite command | `npm run test && npm run typecheck && npm run build` [VERIFIED: package.json] |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01/NAV-02/NAV-06/NAV-07 | snapshot gera inbox e árvore com contagens e estado | unit | `npm run test -- navigation-service` [ASSUMED] | ❌ Wave 0 |
| NAV-03/NAV-04/NAV-08 | rail persiste e seleção segue URL | component | `npm run test -- app-shell` [ASSUMED] | ❌ Wave 0 |
| FIL-01/FIL-02/FIL-03 | filtro estrutural preserva tree, ignora inbox e destaca match | unit/component | `npm run test -- filter-tree` [ASSUMED] | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test` [VERIFIED: package.json]
- **Per wave merge:** `npm run test && npm run typecheck` [VERIFIED: package.json]
- **Phase gate:** `npm run test && npm run typecheck && npm run build` [VERIFIED: package.json]

### Wave 0 Gaps
- [ ] `src/__tests__/navigation-service.test.ts` — cobre NAV-01, NAV-02, NAV-06, NAV-07 [ASSUMED]
- [ ] `src/__tests__/filter-tree.test.ts` — cobre FIL-01, FIL-02, FIL-03 [ASSUMED]
- [ ] `src/__tests__/app-shell.test.tsx` — cobre NAV-03, NAV-04, NAV-08 [ASSUMED]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | reutilizar proteção universal já entregue na fase 1; nenhuma rota da shell deve contornar `auth()` ou middleware. [VERIFIED: .planning/phases/01-secure-read-model-foundation/01-VERIFICATION.md] |
| V3 Session Management | yes | sessão continua delegada ao NextAuth/Auth.js já pinado no projeto. [VERIFIED: package.json] [VERIFIED: src/lib/auth.ts] |
| V4 Access Control | yes | todos os dados de navegação devem vir do servidor autenticado; não expor paths absolutos nem índices crus ao cliente. [VERIFIED: src/lib/pkm/fs-item-repository.ts] [ASSUMED] |
| V5 Input Validation | yes | validar segmentos de rota e escapar wildcard/regex do filtro. [VERIFIED: src/lib/pkm/fs-item-repository.ts] [ASSUMED] |
| V6 Cryptography | no | a fase 2 não adiciona nova criptografia; reaproveita a camada de autenticação existente. [VERIFIED: .planning/phases/01-secure-read-model-foundation/01-VERIFICATION.md] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| path traversal via `library/...` | Tampering | resolver seleção por `Item.id` validado pelo servidor; nunca mapear segmentos direto para `fs` no client. [VERIFIED: src/lib/pkm/fs-item-repository.ts] |
| regex abuse em wildcard do filtro | Denial of Service | limitar comprimento da query, escapar regex e não rodar padrão arbitrário vindo do usuário. [ASSUMED] |
| vazamento de estrutura interna do disco | Information Disclosure | DTO de navegação só com IDs/labels/hrefs; sem `path` absoluto no payload para o client. [ASSUMED] |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md] - decisões travadas da fase 2
- [VERIFIED: src/lib/pkm/item-repository.ts] - contrato atual do read model
- [VERIFIED: src/lib/pkm/fs-item-repository.ts] - limites do repositório atual e defesa contra traversal
- [VERIFIED: package.json] - stack realmente instalada
- [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/layout] - layouts compartilhados no App Router
- [CITED: https://nextjs.org/docs/app/guides/caching-without-cache-components] - reutilização de layouts e comportamento de navegação
- [CITED: https://www.fusejs.io/api/options.html] - opções de fuzzy/highlight
- [CITED: https://www.radix-ui.com/primitives/docs/components/collapsible] - disclosure acessível
- [CITED: https://www.radix-ui.com/primitives/docs/components/scroll-area] - scroll nativo customizável

### Secondary (MEDIUM confidence)
- [VERIFIED: .planning/research/ARCHITECTURE.md] - direção ampla de shell persistente e seleção por URL
- [VERIFIED: .planning/research/PITFALLS.md] - riscos específicos de árvore, inbox e filtro
- [VERIFIED: DESIGN.md] - restrições de linguagem visual do rail

### Tertiary (LOW confidence)
- Nenhuma. [VERIFIED: research session]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - recomendação alinhada ao repo atual e verificada em npm/docs oficiais. [VERIFIED: package.json] [VERIFIED: npm registry]
- Architecture: HIGH - o App Router e o boundary de navegação estão bem suportados por contexto local e docs oficiais. [VERIFIED: .planning/phases/02-navigation-shell/02-CONTEXT.md] [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/layout]
- Pitfalls: MEDIUM - os riscos são claros, mas alguns detalhes de UX dependem da validação com o corpus real. [VERIFIED: .planning/research/PITFALLS.md]

**Research date:** 2026-04-08
**Valid until:** 2026-05-08
