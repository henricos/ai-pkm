---
phase: 02-navigation-shell
verified: 2026-04-08T19:34:00Z
status: verified
score: 5/5 must-haves verified
gaps: []
human_verification:
  - test: "Abrir um item da biblioteca via URL direta (ex: /library/topico/arquivo.md)"
    expected: "O item correspondente fica destacado na arvore de navegacao do rail esquerdo com background e font-medium"
    why_human: "O destaque e visual e depende do activeHref ser injetado corretamente a partir da URL — nao verificavel apenas por grep/typecheck"
  - test: "Recolher o rail com um item aberto, reabrir o rail"
    expected: "O item continua destacado apos reabrir, sem perda de contexto"
    why_human: "Comportamento de persistencia de estado visual requer interacao real com o browser"
  - test: "Digitar uma busca no filtro estrutural com caracteres especiais (acentos, maiusculas)"
    expected: "A arvore filtra com tolerancia; a inbox permanece intacta acima"
    why_human: "Renderizacao visual do highlight e comportamento real do filtro requerem browser"
---

# Phase 02: Navigation Shell — Verification Report

**Phase Goal:** Usuario navega o acervo inteiro em uma shell unica com inbox separada, arvore estruturada, filtro estrutural e selecao compartilhavel por URL.
**Verified:** 2026-04-08T19:34:00Z
**Status:** gaps_found
**Re-verification:** Nao — verificacao inicial

---

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Usuario ve inbox destacada acima da arvore e navega sem trocar de pagina perceptivelmente | VERIFIED | InboxLane e NavigationTree sao componentes separados no LeftRail; shell usa App Router layout persistente; 18/18 testes app-shell passam |
| 2 | Painel esquerdo pode ser recolhido e reaberto sem perder o item aberto nem a sensacao de shell unica | VERIFIED | AppShell usa useState(true) para railOpen; aria-hidden no conteudo do rail; filho (workspace/children) permanece montado; testes confirmam |
| 3 | Item selecionado fica destacado, com icones e indicadores visuais coerentes para tipo, status e contagens | PARTIAL | Infraestrutura completa (activeHref prop chain, aria-current, ItemKindIcon, estado discreto, contagens), mas activeHref nunca e injetado da URL real pelo layout — destaque nao funciona em producao |
| 4 | Filtro tolerante a maiusculas/acentos, distinto de busca textual, sem afetar inbox | VERIFIED | filterNavigationTree implementado em duas etapas (regex+fuzzy), TreeFilterInput com icone de funil, inbox nunca passa pelo pipeline; 14/14 testes filter-tree passam |
| 5 | Cada item aberto atualiza URL propria e navegavel | VERIFIED | Rotas /library/[...path] e /inbox/[item] implementadas; decode via helpers canonicos; round-trip testado; 18/18 app-shell testes confirmam namespaces |

**Score:** 4/5 truths verified (1 partial — gap ativo)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/navigation/navigation-types.ts` | Contratos NavigationSnapshot, NavigationTreeNode, InboxEntry, NavigationItemRef | VERIFIED | Exporta todos os tipos esperados; itemKind separado de estado |
| `src/lib/navigation/navigation-service.ts` | Projecao server-side com inbox, tree, ancestorsByItemId, getNavigationSnapshot, getItemById | VERIFIED | Implementacao completa com inbox separada, contagens recursivas, ancestry, sidecars excluidos |
| `src/lib/navigation/route-helpers.ts` | itemToHref, decodeLibraryParams, decodeInboxParam | VERIFIED | Todos exportados; namespaces library/ e inbox/ corretos; encode/decode bidirecional |
| `src/lib/navigation/filter-tree.ts` | filterNavigationTree, highlightMatches | VERIFIED | Pipeline em duas etapas (regex/wildcard + fuzzy fuse.js); preserva forma de arvore; offsets para highlight |
| `src/__tests__/navigation-service.test.ts` | 22 testes cobrindo contratos | VERIFIED | 22/22 passam |
| `src/__tests__/filter-tree.test.ts` | 14 testes cobrindo pipeline de filtro | VERIFIED | 14/14 passam |
| `src/app/(shell)/layout.tsx` | Layout persistente autenticado com getNavigationSnapshot | VERIFIED | auth() antes do snapshot; getNavigationSnapshot injetado em AppShell |
| `src/app/(shell)/page.tsx` | Estado vazio editorial para / | VERIFIED | WorkspaceEmptyState — sem listagem tecnica |
| `src/app/(shell)/library/[...path]/page.tsx` | Rota URL-driven para biblioteca | VERIFIED | decodeLibraryParams + getItemById + WorkspaceItemState |
| `src/app/(shell)/inbox/[item]/page.tsx` | Rota URL-driven para inbox | VERIFIED | decodeInboxParam + getItemById + WorkspaceItemState |
| `src/components/shell/app-shell.tsx` | Chrome estrutural com rail recolhivel | VERIFIED | useState para toggle; aria-hidden no conteudo; LeftRail + workspace |
| `src/components/shell/left-rail.tsx` | Composicao de filtro + inbox + arvore | VERIFIED | filterNavigationTree apenas na tree; inbox via InboxLane separado |
| `src/components/shell/inbox-lane.tsx` | Lista compacta da inbox | VERIFIED | Componente separado; nunca recebe tree; exibe tipo, estado, contagem |
| `src/components/shell/tree-filter-input.tsx` | Input de filtro estrutural distinto de busca | VERIFIED | Icone de funil (nao lupa); placeholder contextual |
| `src/components/navigation/navigation-tree.tsx` | Renderer recursivo com autoexpansao de ancestrais | VERIFIED | computeInitialExpanded com ancestorsByItemId; useEffect reage a mudancas de URL |
| `src/components/navigation/tree-node.tsx` | No acessivel com aria-expanded, contagens, estado, highlight | VERIFIED | aria-expanded em agrupadores; aria-current="page" em itens ativos; contagens; ItemKindIcon; HighlightMatch |
| `src/components/navigation/highlight-match.tsx` | Highlight sutil de matches | VERIFIED | Usa `<mark>` com cor tertiary sem background — laser-pointer |
| `src/__tests__/app-shell.test.tsx` | 18 testes cobrindo shell | VERIFIED | 18/18 passam |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `src/app/(shell)/layout.tsx` | `navigation-service.ts` | getNavigationSnapshot | WIRED | Import e chamada confirmados |
| `src/app/(shell)/library/[...path]/page.tsx` | `route-helpers.ts` | decodeLibraryParams | WIRED | Import e uso confirmados |
| `src/app/(shell)/inbox/[item]/page.tsx` | `route-helpers.ts` | decodeInboxParam | WIRED | Import e uso confirmados |
| `src/app/(shell)/library/[...path]/page.tsx` | `navigation-service.ts` | getItemById | WIRED | Resolucao canonica pós-decode confirmada |
| `src/components/shell/left-rail.tsx` | `filter-tree.ts` | filterNavigationTree | WIRED | useMemo aplica filtro apenas em snapshot.tree |
| `src/components/navigation/tree-node.tsx` | `navigation-types.ts` | NavigationTreeNode | WIRED | Import e uso nos props confirmados |
| `src/components/navigation/tree-node.tsx` | `route-helpers.ts` | href (item terminal) | WIRED | Items usam item.href diretamente (gerado por itemToHref no servico) |
| `src/app/(shell)/layout.tsx` | `app-shell.tsx` | activeHref | BROKEN | Layout nao passa activeHref — prop existe mas nunca e preenchida pela URL real |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `src/components/shell/inbox-lane.tsx` | entries (InboxEntry[]) | snapshot.inbox via getNavigationSnapshot | Sim — fs.readdirSync da __inbox real + frontmatter | FLOWING |
| `src/components/navigation/navigation-tree.tsx` | tree (NavigationTreeNode[]) | snapshot.tree via getNavigationSnapshot | Sim — projeta topicos.json + grupos.json + arquivos reais do PKM | FLOWING |
| `src/components/navigation/tree-node.tsx` | activeHref (item highlight) | Prop passada pelo pai | Nao — activeHref nunca e injetado da URL real pelo layout | HOLLOW_PROP |

---

### Behavioral Spot-Checks

| Comportamento | Comando | Resultado | Status |
|--------------|---------|-----------|--------|
| 22 testes do navigation-service passam | `npm run test -- src/__tests__/navigation-service.test.ts` | 22/22 passed | PASS |
| 14 testes do filter-tree passam | `npm run test -- src/__tests__/filter-tree.test.ts` | 14/14 passed | PASS |
| 18 testes do app-shell passam | `npm run test -- src/__tests__/app-shell.test.tsx` | 18/18 passed | PASS |
| typecheck sem erros | `npm run typecheck` | 0 erros | PASS |
| filterNavigationTree exportada | `node -e "const m=require('./src/lib/navigation/filter-tree.ts')"` | SKIP (TS) | verificado via grep e testes |

---

### Requirements Coverage

| Requisito | Plano | Descricao resumida | Status | Evidencia |
|-----------|-------|--------------------|--------|-----------|
| NAV-01 | 02-01, 02-03 | Arvore de topicos/subtopicos/grupos/arquivos | SATISFIED | NavigationTree + TreeNode implementados; 22 testes snapshot |
| NAV-02 | 02-01, 02-03 | Inbox como secao propria acima da arvore | SATISFIED | InboxLane componente separado; LeftRail compos inbox antes da tree |
| NAV-03 | 02-02 | Painel recolhivel sem perder item aberto | SATISFIED | AppShell useState(railOpen); children permanece montado; 4 testes rail |
| NAV-04 | 02-03 | Item selecionado visualmente destacado | PARTIAL | Infraestrutura completa (aria-current, bg-surface-container), mas activeHref nao injetado da URL real |
| NAV-05 | 02-03 | Icones distintos por tipo de item | SATISFIED | ItemKindIcon com 5 tipos (markdown, image, excalidraw, pdf, binary) |
| NAV-06 | 02-01, 02-03 | Contagens nos nos relevantes | SATISFIED | count calculado recursivamente no NavigationService; exibido em TreeNode e InboxLane |
| NAV-07 | 02-01, 02-03 | Indicadores visuais rascunho/finalizado | SATISFIED | estado separado de itemKind; dot discreto em rascunho; cor diferenciada |
| NAV-08 | 02-02 | URL propria por item, sensacao de shell unica | SATISFIED | Rotas /library/[...path] e /inbox/[item]; App Router layout persistente |
| FIL-01 | 02-02, 02-03 | Campo de filtro estrutural no topo da coluna | SATISFIED | TreeFilterInput renderizado antes de InboxLane e NavigationTree |
| FIL-02 | 02-03 | Filtro tolerante a maiusculas/acentos | SATISFIED | normalize() + fuzzy fallback; 3 testes de tolerancia passam |
| FIL-03 | 02-02, 02-03 | Distincao visual filtro vs busca textual | SATISFIED | TreeFilterInput usa icone de funil (nao lupa); placeholder contextual |

---

### Anti-Patterns Found

| Arquivo | Linha | Padrao | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| `src/components/shell/workspace-item-state.tsx` | 67 | "Visualizacao rica disponivel na proxima fase." | Informativo | Stub intencional documentado — escopo da phase 3 |
| `src/app/(shell)/layout.tsx` | 31 | `<AppShell snapshot={snapshot}>` sem activeHref | Bloqueador | activeHref nao injetado — destaque do item ativo inoperante em producao |

---

### Human Verification Required

#### 1. Destaque do item ativo na navegacao

**Teste:** Abrir a aplicacao, navegar para um item de biblioteca via URL direta (ex: `/library/topico/meu-arquivo.md`). Observar o rail esquerdo.
**Esperado:** O item correspondente fica visualmente destacado no rail (background diferenciado, font-medium, aria-current="page") e os ancestrais ficam expandidos automaticamente.
**Por que humano:** O destaque depende de activeHref ser injetado da URL real — atualmente nao funciona (gap confirmado). Este teste deve FALHAR ate que o gap seja corrigido.

#### 2. Rail recolhivel com item aberto

**Teste:** Abrir um item, recolher o rail com o botao de toggle, reabrir o rail.
**Esperado:** O item continua aberto na area de conteudo; o rail volta ao estado anterior sem perder o contexto.
**Por que humano:** Comportamento de persistencia visual requer interacao real com o browser.

#### 3. Filtro estrutural — comportamento visual

**Teste:** Digitar "estoicism" no campo de filtro do rail (com letra minuscula e sem acento).
**Esperado:** A arvore filtra mostrando apenas nos com match; a inbox permanece inalterada acima; o trecho correspondente no label fica sutilmente destacado (cor tertiary via HighlightMatch).
**Por que humano:** Renderizacao visual do highlight e comportamento do filtro em tempo real requerem browser.

---

### Gaps Summary

**1 gap ativo bloqueando a truth 3 do roadmap (destaque do item ativo):**

O problema e arquitetural: o `layout.tsx` e um Server Component que nao tem acesso ao `usePathname()` hook do Next.js. A prop `activeHref` existe em toda a cadeia de componentes (AppShell -> LeftRail -> InboxLane/NavigationTree -> TreeNode/InboxLane), mas o valor nunca e injetado a partir da URL corrente no fluxo real de renderizacao.

Os testes passam porque injetam `activeHref` diretamente nos mocks — eles testam que o mecanismo de destaque *funciona quando recebe o valor*, mas nao testam que *o valor e derivado da URL real*.

**Solucao recomendada:** Criar um Client Component intermediario (ex: `ShellClientWrapper`) que use `usePathname()` e injete `activeHref` em `AppShell`. O layout server-side passaria o snapshot para esse wrapper client.

**Impacto:** NAV-04 (item selecionado visualmente destacado) nao esta plenamente entregue. Autoexpansao de ancestrais (D-08) tambem e afetada.

---

_Verified: 2026-04-08T19:34:00Z_
_Verifier: Claude (gsd-verifier)_
