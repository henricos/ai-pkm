# Project Research Summary

**Project:** ai-pkm
**Domain:** plataforma web self-hosted para PKM file-first, com navegação em árvore e viewer read-only
**Researched:** 2026-04-06
**Confidence:** MEDIUM

## Executive Summary

O `ai-pkm v2` não deve ser tratado como editor de notas nem como “mini CMS”. A pesquisa converge para um viewer web read-only, desktop-first, construído como monólito modular em Next.js App Router, com leitura direta do repositório `pkm`, navegação em árvore, inbox separada e renderização rica de Markdown/imagens. O valor do produto está em tornar o PKM file-first navegável e apresentável no navegador sem quebrar a regra central: a IA continua sendo a única escritora da base.

O caminho recomendado é pragmático: Next.js + React + Ant Design para o shell exploratório, Tailwind para a superfície de leitura, e uma camada de serviços que converte o filesystem bruto em itens lógicos estáveis. Busca textual deve nascer server-side e já preparada para migrar para SQLite FTS5 como índice derivado, mas sem tornar banco uma dependência estrutural da v2. O viewer precisa tratar binário + sidecar como uma única entidade, porque esse é o principal ganho de UX específico do domínio.

Os maiores riscos não são de framework, e sim de modelagem. Se a app espelhar o filesystem cru, misturar busca com filtro da árvore, improvisar o renderer Markdown ou confiar demais em watchers, a v2 ficará acoplada ao disco e cara de evoluir para `v3` e `v4`. A mitigação correta é definir cedo contratos estáveis de item lógico, busca e leitura, validar o renderer com corpus real do `pkm` e manter o índice derivado explicitamente reconstruível.

## Key Findings

### Recommended Stack

A recomendação de stack é forte e coerente com o escopo atual: Next.js App Router self-hosted em Node para shell, BFF e leitura server-side; React 19 para separar shell pesada de ilhas interativas; Ant Design para tree, splitter e navegação; Tailwind para leitura e identidade visual; SQLite FTS5 como busca principal derivada quando a v2 precisar sair do backend simples para índice de produção. O padrão geral é evitar invenção de infraestrutura e concentrar esforço na boundary entre UI e `pkm`.

O viewer deve usar pipeline AST de Markdown, não HTML cru nem MDX. Para isso, a combinação `react-markdown` + `remark`/`rehype` é a linha principal. Imagens pedem viewer client-only com pan/zoom; PDF entra como viewer separado, lazy e com fallback explícito, porque a pesquisa marca essa área como mais sujeita a degradação real.

**Core technologies:**
- `Next.js App Router 15.5.x`: shell web, rotas e route handlers — melhor encaixe para monólito self-hosted com leitura de filesystem.
- `React 19.2.x`: composição do viewer e ilhas interativas — reduz hydration desnecessária no shell.
- `Node.js 20.9+`: runtime único — compatível com Next atual e com watchers, SQLite e leitura local do `pkm`.
- `TypeScript 5.x`: contratos e serviços — reduz drift entre viewer, indexação e APIs internas.
- `Ant Design 5.27.3`: tree, splitter e shell desktop-like — acelera a navegação sem reinventar componentes pesados.
- `Tailwind CSS 4.x`: layout, tokens e superfícies de leitura — dá controle visual sem depender do tema cru do AntD.
- `SQLite FTS5 + better-sqlite3`: índice derivado e busca textual — caminho recomendado para busca robusta sem infraestrutura extra.

### Expected Features

As table stakes são claras: árvore recolhível com reveal do item ativo, inbox separada, busca textual rápida, Markdown de alta fidelidade, visualização de imagens de primeira classe, resolução estável de links internos e layout de duas colunas que degrade bem em telas menores. Sem isso, o produto parecerá incompleto mesmo respeitando o modelo file-first.

Os diferenciais corretos para `ai-pkm` não são “mais IA” nem edição na web. São o modelo de item lógico para binários com sidecars ocultos, workflow read-only confiável, busca sidecar-aware, modo apresentação derivado do próprio viewer e uma distinção visual forte entre base consolidada e inbox. Em contrapartida, edição inline, drag-and-drop estrutural, graph view precoce, busca semântica e console agente web devem ficar fora da `v2`.

**Must have (table stakes):**
- Árvore navegável recolhível com auto-reveal do item ativo — navegação principal do acervo.
- Inbox separada da base principal — deixa visível o material pendente sem poluir a taxonomia.
- Renderização Markdown de alta fidelidade — define a qualidade percebida do produto.
- Viewer de imagem com zoom e framing decente — essencial para screenshots, diagramas e referências visuais.
- Busca lexical por nome, Markdown e sidecars textuais — baseline de recuperação.
- Resolução estável de links internos — requisito de navegação PKM.
- Ocultação de sidecars na árvore com acesso no viewer — polimento central do domínio.

**Should have (competitive):**
- Modelo de item lógico para binário + sidecar — principal diferenciador funcional da v2.
- Busca sidecar-aware com resultado apontando para o item principal — melhora recall sem poluir a navegação.
- Modo apresentação minimalista — amplia o uso do acervo como superfície de leitura/apresentação.
- Temas de leitura/apresentação curados — aumenta a sensação de produto intencional.
- Painel contextual de conteúdo relacionado — opção melhor que graph view no curto prazo.

**Defer (v2.x/v3+):**
- Console agentico web e execução de skills no navegador — reservado para versão posterior.
- Busca semântica / embeddings — só depois de provar limites da busca lexical.
- Graph view — alto custo e baixo valor inicial.
- Edição manual na web e reorganização drag-and-drop — conflitantes com o modelo do produto.

### Architecture Approach

A direção arquitetural correta é um monólito modular em Next.js com shell persistente, seleção orientada por URL e leitura centralizada por uma camada de domínio que traduz o `pkm` em modelos semânticos de navegação, viewer e busca. A UI não deve conhecer o filesystem cru. `app/` fica com rotas e bordas HTTP; `server/content` concentra regras de item lógico, inbox, sidecars e parsing; `server/adapters` isola `pkm/` e índices JSON hoje, deixando a porta aberta para SQLite depois. A busca deve nascer atrás de uma interface única, porque é o ponto com maior chance de mudança entre `v2` e `v3`.

**Major components:**
1. Shell persistente da aplicação — mantém layout, painel esquerdo, viewer e seleção orientada por URL.
2. Camada de conteúdo/leitura — traduz `pkm`, frontmatter, grupos, inbox e sidecars em modelos estáveis.
3. Serviços de busca e navegação — expõem árvore, item, inbox e resultados sem vazar detalhes do disco.
4. Viewers especializados — Markdown, imagem e PDF como boundaries independentes, com lazy loading e fallback.

### Critical Pitfalls

1. **Renderer Markdown ad hoc** — evitar MDX e HTML cru por padrão; padronizar uma única pipeline AST e validar com corpus real do `pkm`.
2. **Espelhar o filesystem cru na árvore** — criar desde o início um `logical_item_id` que una primário e sidecar, consumido por árvore, busca e viewer.
3. **Misturar busca global com filtro da árvore** — separar navegação, filtro local e busca global; resultado precisa mostrar caminho e “revelar na árvore”.
4. **Preview binário sem fallback explícito** — cada tipo deve ter estados `supported`, `degraded`, `failed` ou `no-preview`, mantendo sidecar e download acessíveis.
5. **Confiar demais em watchers** — usar watch como sinal de suspeita, não como verdade; prever reconciliação determinística e rebuild completo suportado.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Canonical Read Model
**Rationale:** tudo depende de uma tradução correta entre filesystem e item lógico; começar pela UI antes disso cristaliza regras erradas.
**Delivers:** contratos de `NavigationTree`, `ViewerItem`, `SearchHit`, `logical_item_id`, regras de inbox e mapeamento binário+sidecar.
**Addresses:** hidden sidecar handling, separate inbox lane, stable internal identity.
**Avoids:** espelhar filesystem cru, vazar índice derivado como verdade, inviabilizar busca futura.

### Phase 2: Shell and Route Foundation
**Rationale:** a experiência principal depende de shell persistente e seleção via URL; isso precisa estabilizar cedo para evitar refactor estrutural.
**Delivers:** layout persistente, rotas `library`/`inbox`, painel esquerdo recolhível, estado vazio e seleção compartilhável.
**Uses:** Next.js App Router, React 19, Ant Design shell.
**Implements:** app shell, route boundaries e navegação básica.

### Phase 3: Core Viewer Quality
**Rationale:** a qualidade percebida do produto vem do viewer; sem isso a árvore vira só um explorador de arquivos bonito.
**Delivers:** renderer Markdown unificado, viewer de imagem com pan/zoom, resolução de links internos e baseline de temas de leitura.
**Addresses:** high-fidelity Markdown, first-class image viewing, readable themes, stable internal links.
**Avoids:** renderer ad hoc, pseudo-CMS com MDX, modo apresentação cosmético construído cedo demais.

### Phase 4: Search and Context
**Rationale:** busca precisa nascer sobre o modelo canônico e sobre contratos preparados para FTS, não como filtro improvisado da árvore.
**Delivers:** busca lexical server-side, resultados com caminho completo, reveal na árvore, hits vindos de sidecar apontando para item principal.
**Uses:** search service swap-ready; início simples com interface pronta para SQLite FTS5.
**Implements:** search API, resultado navegável e distinção entre filtro local e busca global.
**Avoids:** acoplamento da busca à árvore, formato de resultado inconsistente, refactor total quando entrar FTS.

### Phase 5: Reliability and Presentation
**Rationale:** depois que leitura e busca estiverem corretas, vale fechar lacunas de robustez e a camada de apresentação.
**Delivers:** fallback de preview para PDF/binários, estratégia de sync/reindex segura, modo apresentação funcional e temas curados.
**Addresses:** PDF preview, presentation mode, sync fidelity.
**Avoids:** fullscreen cosmético, falhas silenciosas de preview, divergência entre CLI/Git e web.

### Phase Ordering Rationale

- A ordem correta é modelagem de leitura -> shell -> viewer -> busca -> robustez/apresentação, porque sidecars, inbox e identidade lógica são dependências de quase todo o resto.
- Busca deve vir depois do modelo canônico, mas antes de refinamentos como apresentação, já que é P1 e influencia contratos centrais do backend.
- Presentation mode e related-content são melhores como extensões de um viewer estável do que como workstreams paralelos desde o início.
- A v2 deve evitar dependência estrutural de banco; a seam para SQLite entra cedo, a implementação pesada pode entrar só quando a UX básica estiver validada.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** validar corpus real do `pkm` para renderer Markdown, links internos e casos de HTML inesperado.
- **Phase 4:** detalhar contrato de indexação e plano de transição do backend simples para SQLite FTS5 sem quebrar a UI.
- **Phase 5:** pesquisar limites reais de PDF.js/react-pdf em navegadores alvo e definir estratégia de degradação.

Phases with standard patterns (skip research-phase):
- **Phase 1:** modelagem de contratos e gateway de leitura seguem padrões internos já bem definidos pelos relatórios.
- **Phase 2:** shell persistente com App Router, layout e seleção via URL é padrão maduro e bem documentado.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Baseado majoritariamente em docs oficiais e recomendações estáveis do ecossistema. |
| Features | MEDIUM | Boa convergência de mercado, mas parte do diferencial depende de validação com o uso real do operador. |
| Architecture | MEDIUM | Direção é forte, porém ainda inferida para este codebase e precisa ser validada contra implementação real da v2. |
| Pitfalls | MEDIUM | Riscos são plausíveis e bem fundamentados, mas vários dependem de como o corpus real e o ambiente de sync se comportam. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Corpus Markdown real:** falta validar a diversidade real de notas, fórmulas, tabelas, HTML embutido e links internos antes de congelar o renderer.
- **Estratégia inicial de busca:** a seam para SQLite está clara, mas ainda precisa decisão operacional sobre quando sair de backend simples para FTS5.
- **Critérios de preview PDF:** a pesquisa confirma risco, mas não define ainda limites concretos de tamanho/performance para o acervo alvo.
- **Sincronização por Git/watchers:** ainda precisa plano explícito de reconciliação e testes com rename, move e escritas atômicas vindas da CLI.
- **Painel de contexto relacionado:** é recomendação promissora, mas ainda sem definição firme de heurísticas mínimas para v2.x.

## Sources

### Primary (HIGH confidence)
- [STACK.md](/home/henrico/github/henricos/ai-pkm/.planning/research/STACK.md) — stack recomendado, versões, arquitetura base e alternativas rejeitadas.
- [ARCHITECTURE.md](/home/henrico/github/henricos/ai-pkm/.planning/research/ARCHITECTURE.md) — boundary entre UI e filesystem, estrutura de projeto e ordem de construção.
- React versions: https://react.dev/versions — baseline `React 19.2`.
- Next.js App Router / self-hosting / route handlers: https://nextjs.org/docs/app
- SQLite FTS5 official docs: https://sqlite.org/fts5.html

### Secondary (MEDIUM confidence)
- [FEATURES.md](/home/henrico/github/henricos/ai-pkm/.planning/research/FEATURES.md) — table stakes, diferenciais e anti-features para `v2`.
- [PITFALLS.md](/home/henrico/github/henricos/ai-pkm/.planning/research/PITFALLS.md) — riscos de renderer, item lógico, busca, preview e sync.
- Obsidian help, Docusaurus e VitePress docs — sinais de expectativa de navegação, leitura e estrutura.

### Tertiary (LOW confidence)
- OpenAlternative comparison pages: https://openalternative.co/compare/anytype/vs/logseq — apenas sinal de mercado, não base para decisões de arquitetura.

---
*Research completed: 2026-04-06*
*Ready for roadmap: yes*
