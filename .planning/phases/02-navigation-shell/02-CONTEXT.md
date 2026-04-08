# Phase 2: Navigation Shell - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar a shell persistente de navegacao da `v2`: inbox separada acima da arvore principal, painel esquerdo retratil, filtro estrutural por nome e selecao compartilhavel por URL, mantendo a sensacao de uma superficie unica. Esta fase nao inclui busca textual avancada, viewer rico de conteudo, modo apresentacao ou tratamento completo de binarios/PDF.

</domain>

<decisions>
## Implementation Decisions

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

### the agent's Discretion
- Estrategia exata para persistir expansao local da arvore alem do reveal do item ativo.
- Mapeamento tecnico final entre tipos de arquivo e icones concretos, desde que respeite a separacao entre tipo e estado.
- Forma exata de implementar o suporte a curinga `*` e fuzzy leve, desde que permaneça filtro estrutural e nao busca textual avancada.
- Linguagem visual exata da "gaveta" da inbox, desde que permaneça discreta e coerente com `DESIGN.md`.

</decisions>

<specifics>
## Specific Ideas

- A inbox pode lembrar um escaninho/gaveta, mas sem "desenhar" demais nem quebrar o minimalismo da interface.
- O filtro estrutural deve parecer claramente um filtro da arvore, nao uma busca global do acervo.
- A arvore deve continuar parecendo arvore mesmo filtrada; nao deve colapsar para uma lista plana de resultados.
- A diferenca entre tipo e estado precisa ser legivel: icones dizem "o que e", cor diz "em que estado esta".

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and requirements
- `.planning/PROJECT.md` — contexto da `v2`, shell tipo Obsidian com visual mais clean e leve, sidecars ocultos da navegacao
- `.planning/REQUIREMENTS.md` §NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, NAV-07, NAV-08 — contratos da shell, tree, inbox, destaque, icones, contagens e URL navegavel
- `.planning/REQUIREMENTS.md` §FIL-01, FIL-02, FIL-03 — filtro estrutural por nome, tolerancia e diferenciacao visual em relacao a busca textual
- `.planning/ROADMAP.md` §Phase 2: Navigation Shell — objetivo, dependencias e criterios de sucesso da fase
- `.planning/STATE.md` — fase 1 concluida; fase 2 ainda nao iniciada; restricoes acumuladas sobre read model e autenticacao

### Prior phase decisions
- `.planning/phases/01-secure-read-model-foundation/01-CONTEXT.md` — decisoes herdadas sobre `ItemRepository`, item logico, autenticacao obrigatoria, `pkm` read-only e uso de `DESIGN.md` + Stitch

### Architecture and research
- `.planning/research/ARCHITECTURE.md` — shell persistente, selecao orientada por URL, rotas `library`/`inbox`, boundary entre `app/` e camada de conteudo
- `.planning/research/STACK.md` — recomendacao pragmatica para tree navigation com Ant Design `Tree` e shell desktop-like
- `.planning/research/FEATURES.md` — rationale para arvore recolhivel, inbox separada, sidecars fora da tree e layout de duas colunas
- `.planning/research/PITFALLS.md` §Pitfall 7 — risco de tratar inbox como quase igual a base principal; necessidade de comportamento e sinais distintos
- `.planning/research/SUMMARY.md` — sintese da direcao arquitetural: shell persistente, selecao por URL, inbox separada e item logico sem vazar filesystem cru

### Visual references
- `DESIGN.md` — fonte canonica de tokens, tipografia, elevacao e principios visuais
- `.planning/STITCH-BRIEF.md` — brief estrutural da shell, incluindo inbox destacada, filtro no topo do rail e principio de shell unica
- `reference/ui/screens/02-content-viewer/code.html` — referencia visual do rail com inbox + tree no viewer de conteudo
- `reference/ui/screens/03-media-viewer/code.html` — referencia visual adicional de tree/inbox e hierarquia do rail
- `AGENTS.md` §Referência de UI — regra de adaptar Stitch para componentes reais sem copiar HTML bruto

### PKM domain
- `reference/pkm/pkm-conventions.md` — convencoes de nomenclatura, sidecars e papel estrutural do PKM
- `reference/pkm/pkm-structure.md` — estrutura da `__inbox/` e separacao entre inbox e base organizada
- `index/topicos.json` — topicos validos para bootstrap da tree
- `index/grupos.json` — grupos e topologia estrutural para bootstrap da tree

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/pkm/item-repository.ts`: contrato read-only que a navegacao deve consumir sem acoplar a UI ao filesystem cru
- `src/lib/pkm/fs-item-repository.ts`: fast path atual para topicos/grupos e resolucao de item por ID estavel
- `src/lib/pkm/types.ts`: tipos canonicos `Item`, `Topic`, `Group` e semantica de `ItemType`/`ItemEstado`
- `src/app/page.tsx`: home autenticada atual que sera substituida pela shell da fase 2
- `src/components/ui/*`: base de componentes shadcn ja presente para inputs/botoes/labels

### Established Patterns
- Autenticacao obrigatoria em qualquer ambiente antes de instanciar a experiencia principal
- `pkm` como fonte primaria read-only acessada por `PKM_PATH`
- UI guiada por `DESIGN.md` e referencias do Stitch, sem copiar HTML exportado diretamente
- Item logico como unidade semantica compartilhada entre navegacao, viewer e busca futura

### Integration Points
- A shell deve substituir `src/app/page.tsx` por um layout/rota persistente autenticado
- A tree e a inbox devem nascer sobre o read model existente, mas provavelmente exigirao um modelo de navegacao acima do `FsItemRepository`
- As rotas `library/...` e `inbox/...` previstas na pesquisa arquitetural sao o ponto natural de integracao para selecao por URL
- O filtro estrutural pode ser implementado no cliente sobre dados estruturais da tree, sem virar busca full-text

</code_context>

<deferred>
## Deferred Ideas

- Filtrar a inbox junto com a arvore — explicitamente rejeitado nesta fase
- Restaurar URL originalmente pedida apos login — adiado; nesta fase o retorno cai sempre em `"/"`
- Busca textual avancada/popup/lista de resultados — continua fora do escopo da fase 2

</deferred>

---

*Phase: 02-navigation-shell*
*Context gathered: 2026-04-08*
