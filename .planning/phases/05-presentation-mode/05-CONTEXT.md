# Phase 5: Presentation Mode - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar um modo de apresentacao interno da aplicacao que transforme o viewer atual em uma superficie minima de leitura/apresentacao, sem sacrificar a navegacao e a leitura normais como prioridade principal da `v2.0`.

Esta fase cobre:
- entrada e saida de um modo de apresentacao interno, distinto do fullscreen nativo do navegador
- remocao do chrome de manutencao para deixar o conteudo como foco visual
- controles discretos, translúcidos e auto-ocultaveis no canto inferior esquerdo
- ponteiro laser temporario utilizavel tanto dentro quanto fora do modo apresentacao
- temas prontos de leitura/apresentacao, incluindo variantes inspiradas em ChatGPT, GitHub e Excalidraw

Esta fase nao cobre:
- anotacao persistente sobre o conteudo
- marcador fixo funcional
- limpar anotacoes como funcionalidade real
- sistema global de preferencias persistidas em banco
- theming geral da shell inteira fora do contexto do viewer

</domain>

<decisions>
## Implementation Decisions

### Superficie de apresentacao
- **D-01:** O modo apresentacao deve seguir a direcao de `palco puro`: ao entrar no modo, a interface remove praticamente todo o chrome de manutencao e deixa o conteudo como foco principal.
- **D-02:** Durante o modo apresentacao, o `InfoPanel` fica indisponivel. Ele nao deve abrir nem competir com a superficie principal.
- **D-03:** O modo apresentacao e uma superficie interna da aplicacao, nao um simples toggle visual leve sobre a shell normal.

### Controles e saida do modo
- **D-04:** A referencia de comportamento para os controles e explicitamente o modo apresentacao do PowerPoint.
- **D-05:** Os controles ficam invisiveis por padrao e nao reaparecem com movimento global de mouse pela tela inteira.
- **D-06:** Existe uma regiao de ativacao no canto inferior esquerdo que revela os controles.
- **D-07:** Quando revelados, os controles devem ser discretos, semi-transparentes e auto-ocultaveis.
- **D-08:** A saida do modo apresentacao acontece por `Esc` ou por um botao dedicado de sair dentro do proprio conjunto de controles.
- **D-09:** Quando visiveis, os controles devem ter interacao normal e previsivel, nao comportamento semi-passivo.
- **D-10:** O conjunto de controles da phase 5 deve contemplar: ligar/desligar ponteiro laser e sair do modo apresentacao.
- **D-11:** O conjunto de controles pode reservar o lugar conceitual para anotacao futura, mas sem implementar marcador fixo ou limpeza de anotacoes nesta fase.

### Ponteiro laser
- **D-12:** A referencia canonica do ponteiro laser e o comportamento do Excalidraw. O objetivo nao e apenas algo parecido; e reproduzir o ponteiro do Excalidraw com a maior fidelidade pratica possivel.
- **D-13:** O ponteiro laser deve funcionar tanto dentro quanto fora do modo apresentacao, em linha com os requisitos da fase.
- **D-14:** A pesquisa tecnica desta fase deve investigar primeiro: (a) se existe componente pronto, (b) se existe implementacao reaproveitavel, ou (c) se vale engenharia reversa do comportamento do Excalidraw. Implementacao do zero e plano de fallback, nao ponto de partida.
- **D-15:** O comportamento desejado do laser inclui persistencia curta e dissipacao progressiva, seguindo a referencia do Excalidraw em vez de um cursor estatico sem memoria visual.
- **D-16:** A cor do ponteiro nao entra como configuracao funcional desta fase. O comportamento base vem antes de qualquer camada sistemica de personalizacao.

### Temas de leitura/apresentacao
- **D-17:** Os temas afetam apenas o conteudo do viewer, nao a shell inteira da aplicacao.
- **D-18:** As diferencas entre os presets devem ser moderadas: cada tema precisa ter personalidade propria, mas sem reestruturar o layout nem virar um conjunto de skins radicalmente diferentes.
- **D-19:** A troca de tema acontece pelo botao reservado no header do viewer, fora do modo apresentacao.
- **D-20:** O conjunto inicial de presets precisa incluir variantes inspiradas em ChatGPT, GitHub e Excalidraw, conforme o requisito da fase.

### the agent's Discretion
- Estrategia tecnica exata para alternar entre shell normal e superficie de apresentacao, desde que preserve o conceito de palco puro.
- Mecanismo exato de auto-hide dos controles, desde que respeite a descoberta por regiao de ativacao no canto inferior esquerdo.
- Parametros finos de tempo e suavizacao do laser, desde que o resultado busque fidelidade pratica ao Excalidraw.
- Tokens visuais exatos de cada tema de conteudo, desde que preservem diferenca moderada e nao extrapolem para theming global da app.

</decisions>

<specifics>
## Specific Ideas

- Referencia explicita do usuario para os controles: "quero a mesma experiencia do modo apresentacao do PowerPoint".
- Explicacao operacional do usuario para os controles:
  - os controles ficam invisiveis
  - existe uma regiao no canto inferior esquerdo da tela que ativa/exibe os controles
  - quando aparecem, eles sao bem discretos e semi-transparentes
- Referencia explicita do usuario para o laser: "quero copiar o ponteiro do Excalidraw".
- O usuario sugeriu que a pesquisa avalie se e possivel fazer engenharia reversa do comportamento do Excalidraw ou reaproveitar componente pronto.
- O usuario levantou a possibilidade futura de configurar a cor do ponteiro por configuracao sistemica; a ideia foi registrada, mas ficou fora da entrega desta fase.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and roadmap
- `.planning/ROADMAP.md` §Phase 5: Presentation Mode — objetivo, dependencias e criterios de sucesso
- `.planning/REQUIREMENTS.md` §PRS-01, PRS-02, PRS-03, PRS-04, PRS-05, PRS-06, PRS-07 — contratos do modo apresentacao, ponteiro e temas

### Prior phase decisions
- `.planning/STATE.md` — estado atual do projeto e decisoes recentes relevantes para a phase 5
- `.planning/phases/03-reading-viewer/03-CONTEXT.md` — `ViewerHeader`, slot reservado para tema, `InfoPanel` em push layout, modo apresentacao ja citado como fase futura
- `.planning/phases/04-asset-viewer-and-item-context/04-CONTEXT.md` — viewers de markdown/imagem/pdf/binario integrados ao mesmo `ViewerPage` e `ViewerClientShell`

### Existing discussion artifacts
- `.planning/phases/05-presentation-mode/05-DISCUSSION-LOG.md` — trilha auditavel da conversa e checkpoint parcial
- `.planning/phases/05-presentation-mode/05-DISCUSS-CHECKPOINT.json` — decisoes parciais e areas de retomada

### Design and UI references
- `DESIGN.md` — sistema visual, especialmente uso restrito do `tertiary`, no-line rule e glassmorphism
- `reference/ui/screens/04-presentation-mode/code.html` — referencia visual de composicao e atmosfera para o modo apresentacao
- `AGENTS.md` §Referência de UI — protocolo de adaptacao das referencias Stitch para implementacao real

### Existing code to extend
- `src/components/viewer/viewer-header.tsx` — botao de apresentacao hoje desabilitado e slot reservado para tema
- `src/components/viewer/viewer-client-shell.tsx` — shell cliente atual do viewer com estado do painel
- `src/components/viewer/viewer-page.tsx` — orquestracao por tipo de item para markdown, imagem, pdf e fallback
- `src/components/viewer/markdown-viewer.tsx` — viewer principal de markdown sobre o qual os temas de conteudo incidirao
- `src/components/viewer/image-viewer.tsx` — viewer de imagem que precisa continuar compativel com o modo apresentacao
- `src/components/viewer/pdf-viewer.tsx` — viewer de PDF que precisa continuar compativel com o modo apresentacao

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/viewer/viewer-header.tsx`: ja contem o botao de apresentacao desabilitado e o slot reservado para tema, o que reduz retrabalho estrutural nesta fase.
- `src/components/viewer/viewer-client-shell.tsx`: e o ponto natural para orquestrar estado client-side do modo apresentacao, visibilidade de controles e indisponibilidade do `InfoPanel`.
- `src/components/viewer/viewer-page.tsx`: ja centraliza os branches por tipo de item; o modo apresentacao precisa funcionar sobre esse mesmo entrypoint sem bifurcar a arquitetura do viewer.
- `src/components/viewer/markdown-viewer.tsx`, `image-viewer.tsx` e `pdf-viewer.tsx`: formam as superficies reais de conteudo que os temas e o laser vao atravessar.

### Established Patterns
- O viewer atual vive dentro da mesma shell persistente, sem troca de pagina perceptivel.
- O `InfoPanel` e lateral em push layout, nao overlay; a phase 5 deve desabilita-lo no modo apresentacao, nao reinterpretar esse contrato como drawer temporario.
- O projeto usa `DESIGN.md` como ancora visual e evita chrome pesado, bordas duras e solucoes visuais ruidosas.
- O `tertiary` ja e tratado no sistema como cor de foco tipo "laser-pointer", o que reforca moderacao no uso e relevancia para o ponteiro.

### Integration Points
- O botao de apresentacao em `ViewerHeader` deve deixar de ser placeholder e virar o gatilho normal para entrar no modo.
- O slot de tema em `ViewerHeader` deve virar o ponto de troca de preset de conteudo.
- O planner deve tratar o laser como camada transversal ao viewer, nao como detalhe exclusivo do markdown.
- A implementacao precisa preservar funcionamento consistente em markdown, imagem e PDF, evitando que o modo apresentacao fique "markdown-only".

</code_context>

<deferred>
## Deferred Ideas

- Marcador fixo funcional sobre o conteudo
- Acao real de limpar anotacoes
- Personalizacao da cor do ponteiro via configuracao geral/env e, no futuro, via persistencia em banco
- Theming global da shell inteira fora do contexto do viewer e do modo apresentacao

Esses itens foram mencionados durante a discussao, mas permanecem fora da entrega confirmada desta fase.

</deferred>

---

*Phase: 05-presentation-mode*
*Context gathered: 2026-04-11*
