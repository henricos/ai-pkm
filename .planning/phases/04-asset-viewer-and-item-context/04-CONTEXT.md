# Phase 4: Asset Viewer and Item Context - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Completar o viewer para itens nao-Markdown da `v2`: imagens e PDFs passam a abrir como conteudo principal com comportamento previsivel, binario + sidecar passam a ser tratados como um unico item logico, e formatos sem preview continuam com fallback claro de download. Esta fase nao adiciona edicao, busca textual, controles avancados de apresentacao nem UI pesada de media viewer.

</domain>

<decisions>
## Implementation Decisions

### Viewer de imagem
- **D-01:** Imagens abrem como conteudo principal do viewer, centralizadas e tratadas como peca principal da tela, nao como anexo secundario.
- **D-02:** A experiencia de imagem deve ser clean e editorial, sem barras, molduras ou chrome pesado que destoem do restante da shell.
- **D-03:** O comportamento base e `object-contain` com enquadramento confortavel e controles minimos de zoom in/out + reset simples. Pan livre, toolbar extensa e outras ferramentas avancadas nao sao prioridade.

### Viewer de PDF
- **D-04:** PDF usa preview inline basico e limpo dentro do viewer quando o navegador suportar, sem UI carregada nem abrir outra aba por padrao.
- **D-05:** O foco do PDF e o conteudo. Controles como busca interna, barra rica, thumbnails e chrome de leitor completo sao extras e nao obrigatorios nesta fase.
- **D-06:** O download continua sendo a acao normal do browser a partir do botao existente no header; nao e necessario abrir outra aba nem criar fluxo alternativo.

### Sidecar e contexto complementar
- **D-07:** Binario + sidecar continuam sendo um unico item logico: o sidecar nao reaparece na navegacao e entra apenas como contexto do item principal.
- **D-08:** O conteudo do sidecar deve ser lido do arquivo Markdown associado e exibido no final do `InfoPanel`.
- **D-09:** O texto do sidecar deve ser apresentado de forma editorial com renderizacao Markdown rica, nao como YAML, texto cru de arquivo ou bloco tecnico.

### Fallbacks e formatos nao renderizaveis
- **D-10:** O fallback atual de formato nao suportado esta aceito como base da fase 4; nao precisa ser redesenhado nem ganhar novos comportamentos.
- **D-11:** O unico ajuste desejado no fallback atual e tornar a mensagem um pouco mais legivel/editorial, escurecendo um pouco o texto e aumentando levemente a tipografia.

### Preview de Excalidraw
- **D-12:** Ha preferencia explicita por preview somente leitura de `.excalidraw`, sem editor embutido e sem virar uma subfase de edicao.
- **D-13:** Se o preview read-only de Excalidraw for viavel com baixo custo e sem introduzir uma superficie de edicao, ele deve entrar nesta fase; caso contrario, o planner pode definir fallback claro sem expandir escopo.

### the agent's Discretion
- Biblioteca concreta de zoom/preview de imagem, desde que preserve a experiencia clean e evite chrome pesado.
- Estrategia tecnica exata de preview inline de PDF, desde que seja basica, embutida e degrade para download sem outra aba obrigatoria.
- Forma exata de renderizar o Markdown do sidecar dentro do `InfoPanel`, desde que pareca contexto editorial e nao um segundo viewer competindo com o principal.
- Viabilidade tecnica final do preview read-only de `.excalidraw`, desde que qualquer solucao mantenha ausencia de edicao.

</decisions>

<specifics>
## Specific Ideas

- "O importante e focar no conteudo" foi a direcao central para imagem e PDF: o viewer nao deve introduzir barras, bordas ou UI chamativa que brigue com a leitura.
- Para PDFs, zoom e find foram explicitamente classificados como extras, nao como alvo principal da fase.
- O sidecar e um `.md` associado ao binario, nao um dump de frontmatter; por isso ele deve ser exibido como conteudo complementar, nao como metadado tecnico.
- Excalidraw com preview e desejavel, mas apenas se continuar claramente read-only e nao contaminar a fase com capacidades de edicao.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §VIEW-04, VIEW-05, VIEW-06, VIEW-07 — contratos do viewer de imagem, PDF, sidecar e fallback
- `.planning/REQUIREMENTS.md` §CTX-05 — sidecar textual no painel de informacoes do item principal
- `.planning/ROADMAP.md` §Phase 4: Asset Viewer and Item Context — objetivo, dependencias e criterios de sucesso

### Prior phase decisions
- `.planning/phases/01-secure-read-model-foundation/01-CONTEXT.md` — `ItemRepository`, item logico read-only, `pkm` externo e preview `.excalidraw` previamente citado como backlog futuro
- `.planning/phases/02-navigation-shell/02-CONTEXT.md` — sidecars fora da navegacao e separacao entre tipo visual e estado
- `.planning/phases/03-reading-viewer/03-CONTEXT.md` — push layout do `InfoPanel`, slot reservado para sidecar, header com download e viewer principal integrado a shell

### Design and visual references
- `DESIGN.md` — no-line rule, superficies tonais e direcao de workspace clean focado em conteudo
- `reference/ui/screens/03-media-viewer/code.html` — referencia de composicao para midia central como protagonista e contexto lateral complementar
- `reference/ui/screens/03-media-viewer/screen.png` — captura visual da referencia Stitch da tela de midia
- `AGENTS.md` §Referência de UI — adaptar a intencao visual sem copiar HTML bruto

### PKM domain
- `reference/pkm/pkm-conventions.md` — convencoes de sidecar e estrutura geral do PKM
- `reference/schemas/frontmatter-item.md` — contrato de frontmatter do item principal, complementar ao conteudo do sidecar

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/viewer/viewer-page.tsx`: ja separa branch `markdown` vs formatos nao suportados; e o ponto natural para introduzir viewers especificos de imagem, PDF e Excalidraw
- `src/components/viewer/viewer-client-shell.tsx`: ja oferece a moldura certa do viewer com scroll proprio e `InfoPanel` em push layout
- `src/components/viewer/info-panel.tsx`: ja tem o slot `data-slot="sidecar-content-phase4"` reservado para receber o contexto complementar do sidecar
- `src/components/viewer/viewer-header.tsx`: ja oferece download autenticado e toggle do painel; a fase 4 pode reaproveitar isso sem redesenhar o header
- `src/app/api/pkm/raw/[...path]/route.ts`: ja entrega download autenticado de binarios com `Content-Type` por extensao
- `src/lib/pkm/fs-item-repository.ts`: ja detecta `sidecarPath` para binarios e expoe `getItemContent()`/`getItemFrontmatter()`; e o lugar natural para adicionar leitura do sidecar
- `src/lib/navigation/navigation-service.ts`: ja exclui sidecars da arvore e classifica `image`, `pdf`, `excalidraw` e `binary`

### Established Patterns
- Viewer continua dentro da mesma shell persistente, sem trocar de pagina perceptivelmente
- Conteudo principal deve ocupar a area direita como workspace focado em `surface_container_lowest`
- `InfoPanel` continua lateral e editorial, sem overlay e sem despejar dados crus
- Download segue pelo botao existente do header e pela route autenticada raw

### Integration Points
- Novos viewers de asset entram por `ViewerPage`, usando `item.itemKind` como chave de roteamento
- O conteudo do sidecar deve entrar no `InfoPanel`, nao no canvas principal do asset
- O planner deve validar se preview de `.excalidraw` pode reaproveitar parser/render read-only sem introduzir editor
- Testes atuais em `src/__tests__/viewer-page.test.tsx` cobrem o fallback atual e precisarao ser evoluidos para os novos branches de `image`, `pdf` e possivelmente `excalidraw`

</code_context>

<deferred>
## Deferred Ideas

- Toolbar rica de media viewer com muitos controles, barras persistentes, thumbnails ou chrome semelhante a app de galeria
- Busca interna de PDF, painel de paginas e outros recursos de leitor completo
- Qualquer capacidade de edicao, anotacao ou manipulacao persistente sobre imagem, PDF ou Excalidraw
- Se o preview read-only de `.excalidraw` exigir uma superficie de edicao disfarcada ou custo excessivo, a expansao dessa experiencia vira fase futura

</deferred>

---

*Phase: 04-asset-viewer-and-item-context*
*Context gathered: 2026-04-10*
