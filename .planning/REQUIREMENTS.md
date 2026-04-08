# Requirements: ai-pkm

**Defined:** 2026-04-06
**Core Value:** Permitir operar o PKM com auxilio de IA, alternando entre uma experiencia visual na web e a operacao local via CLI, sem perder compatibilidade com o modelo file-first.

## v2 Requirements

Requirements para a `v2`, focada em navegacao e exibicao web do acervo PKM. A `v1` ja validada permanece CLI-only; a `v2` nao inclui edicao manual nem execucao agentica via web.

### Access

- [ ] **ACC-01**: Interface web exige autenticacao single-user em todos os ambientes, incluindo local/dev.
- [ ] **ACC-02**: Login usa usuario e senha fixos configurados por variaveis de ambiente ou configuracao externa equivalente, sem credenciais commitadas no repositorio.
- [ ] **ACC-03**: Usuario autenticado pode acessar a experiencia completa da `v2` sem modelo multiusuario ou papeis adicionais.

### Navigation

- [ ] **NAV-01**: Usuario pode navegar a base estruturada do `pkm` por meio de uma coluna esquerda com arvore de topicos, subtopicos, grupos e arquivos.
- [ ] **NAV-02**: Inbox aparece como secao propria acima da arvore principal, com destaque visual e lista propria, sem representacao em arvore.
- [ ] **NAV-03**: Painel esquerdo pode ser recolhido e reaberto sem perder o item atualmente exibido.
- [ ] **NAV-04**: Item atualmente selecionado fica visualmente destacado na navegacao.
- [ ] **NAV-05**: Navegacao exibe icones distintos para os tipos de item `nota`, `url` e `binario`.
- [ ] **NAV-06**: Navegacao exibe contagens de itens junto dos nos relevantes da estrutura e da inbox.
- [ ] **NAV-07**: Navegacao usa indicadores visuais para diferenciar itens `rascunho/incompleto` de itens `finalizado`.
- [ ] **NAV-08**: Ao selecionar um item, a interface mantem a sensacao de shell unica, mas atualiza uma URL propria e navegavel para esse item.

### Viewer

- [ ] **VIEW-01**: Area direita exibe o conteudo do item selecionado sem transicao para outra pagina perceptivel.
- [ ] **VIEW-02**: Viewer de Markdown renderiza headings, listas, tabelas, blockquotes, blocos de codigo com highlight, task lists, links clicaveis e callouts/admonitions.
- [ ] **VIEW-03**: Viewer de Markdown usa pipeline de renderizacao rica baseada em bibliotecas maduras, sem HTML cru como estrategia principal.
- [ ] **VIEW-04**: Viewer de imagem exibe o binario principal com experiencia de visualizacao confortavel, incluindo zoom e enquadramento adequados.
- [ ] **VIEW-05**: Arquivos PDF podem ser abertos no viewer com suporte de preview suficiente ou fallback claro de download quando preview nao for possivel.
- [ ] **VIEW-06**: Sidecar textual nao aparece como item separado na navegacao; o sistema trata binario e sidecar como um unico item logico.
- [ ] **VIEW-07**: Itens nao renderizaveis exibem mensagem clara de impossibilidade de preview e oferecem download direto do arquivo.
- [ ] **VIEW-08**: Viewer respeita largura maxima e composicao visual apropriada para leitura, sem parecer explorador bruto de arquivos.

### Item Context

- [ ] **CTX-01**: Cabecalho da area direita exibe o titulo do item atual.
- [ ] **CTX-02**: Cabecalho da area direita exibe acoes do item atual, incluindo entrada em modo apresentacao, download e acesso ao painel de informacoes.
- [ ] **CTX-03**: Um unico icone de informacao abre painel lateral direito, dentro da area de conteudo, para exibir informacoes complementares do item atual.
- [ ] **CTX-04**: Painel de informacoes apresenta metadados e texto complementar de maneira visualmente agradavel, sem despejar YAML cru ou visual de codigo-fonte.
- [ ] **CTX-05**: Para binarios com sidecar, o painel de informacoes exibe o texto complementar associado ao item principal.

### Filtering

- [ ] **FIL-01**: Topo da coluna esquerda oferece campo de filtro estrutural dedicado a restringir a arvore principal por nome, sem buscar em conteudo nem afetar a inbox.
- [ ] **FIL-02**: Filtro estrutural e tolerante a diferencas de maiusculas/minusculas e acentos.
- [ ] **FIL-03**: Interface diferencia visualmente filtro estrutural de busca textual avancada, por exemplo com iconografia distinta.

### Presentation

- [ ] **PRS-01**: Usuario pode acionar um modo de apresentacao interno da aplicacao, distinto do fullscreen nativo do navegador.
- [ ] **PRS-02**: Modo de apresentacao oculta painel esquerdo, busca, configuracoes, status, cabecalho do viewer e outros elementos de manutencao, deixando apenas o conteudo principal.
- [ ] **PRS-03**: Modo de apresentacao exibe controles discretos, translucidos e auto-ocultaveis no canto inferior esquerdo.
- [ ] **PRS-04**: Controles minimos do modo de apresentacao incluem sair do modo, ligar/desligar ponteiro e ligar/desligar anotacao quando esse recurso existir.
- [ ] **PRS-05**: Sistema oferece ponteiro laser temporario, com rastro que desaparece progressivamente, utilizavel tanto dentro quanto fora do modo de apresentacao.
- [ ] **PRS-06**: Sistema oferece lista de temas prontos de leitura/apresentacao, sem capacidade de montar ou editar temas pela interface.
- [ ] **PRS-07**: Conjunto inicial de temas inclui variacoes inspiradas em ChatGPT, GitHub e Excalidraw.

### Architecture and Read Model

- [ ] **ARC-01**: Camada web consome o repositorio `pkm` por meio de um modelo de leitura read-only, sem transformar banco de dados em fonte primaria de verdade na `v2`.
- [ ] **ARC-02**: Sistema define identidade estavel de item logico para uso consistente entre navegacao, viewer e busca.
- [ ] **ARC-03**: Inbox, arvore, viewer e busca compartilham o mesmo modelo semantico de item, em vez de espelhar o filesystem cru diretamente na UI.
- [ ] **ARC-04**: Busca e indexacao ficam atras de contratos internos preparados para futura troca de implementacao, preservando o caminho para `v3`.

### Runtime and Delivery

- [ ] **RUN-01**: Aplicacao recebe configuracao operacional por variaveis de ambiente, incluindo credenciais de acesso e localizacao do `pkm`.
- [ ] **RUN-02**: Aplicacao assume que o `pkm` esta disponivel por path ou volume montado externamente, sem embutir o acervo no proprio codigo da plataforma.
- [ ] **RUN-03**: Projeto documenta como rodar a aplicacao em ambiente local/dev com as dependencias e configuracoes minimas necessarias.
- [ ] **RUN-04**: Interface web e responsiva o suficiente para nao quebrar em uso mobile e nao inviabilizar empacotamento futuro em WebView.

## v3 Requirements

Requisitos preliminares de backlog para futura migracao de indices JSON para banco:

- **V3-01**: Substituir indices JSON reconstruiveis por indice derivado em banco sem alterar o `pkm` como fonte primaria de verdade.
- **V3-02**: Preservar contratos de navegacao, viewer e busca ja estabelecidos na `v2`.
- **V3-03**: Permitir reconstrucao deterministica do indice a partir do repositorio `pkm`.

## v4 Requirements

Requisitos preliminares de backlog para futura execucao agentica via web:

- **V4-01**: Permitir execucao de fluxos via web sem alterar o principio de que a IA e a unica escritora da base.
- **V4-02**: Expor status, console e interacao de aprovacao no navegador preservando compatibilidade com operacao local via CLI.
- **V4-03**: Reaproveitar boundaries internas da `v2` para evitar acoplamento entre viewer e camada agentica.

## Out of Scope

Explicitamente fora de escopo da `v2` ativa.

| Feature | Reason |
|---------|--------|
| Edicao manual de arquivos na web | Contraria o principio de IA como escritora exclusiva da base |
| Mover, renomear ou criar itens pela interface | A `v2` e estritamente de navegacao e exibicao |
| Execucao de skills ou console agentica na web | Reservado para `v4` |
| Audio e video no viewer | Nao fazem parte do alvo real de uso desta versao |
| Busca semantica / embeddings / RAG | Fica para backlog futuro, apos validacao da busca lexical |
| Busca textual avancada com popup/lista de resultados | Fica para backlog pos-`v2`; a `v2` ativa fica apenas com filtro estrutural |
| Graph view | Alto custo e baixo valor para a fase atual |
| Customizacao manual de temas pela interface | Direcao de produto rejeitada; apenas temas prontos liberados pelo sistema |
| Integracao completa do editor Excalidraw | Escopo amplo demais e proximo demais de edicao manual |
| Deploy publicado em Kubernetes/VPS e casca mobile dedicada | Direcao futura; a `v2` so precisa nascer preparada, nao entregar isso agora |

## Traceability

Preenchido durante a criacao do roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACC-01 | Phase 1 | Pending |
| ACC-02 | Phase 1 | Pending |
| ACC-03 | Phase 1 | Pending |
| NAV-01 | Phase 2 | Pending |
| NAV-02 | Phase 2 | Pending |
| NAV-03 | Phase 2 | Pending |
| NAV-04 | Phase 2 | Pending |
| NAV-05 | Phase 2 | Pending |
| NAV-06 | Phase 2 | Pending |
| NAV-07 | Phase 2 | Pending |
| NAV-08 | Phase 2 | Pending |
| VIEW-01 | Phase 3 | Pending |
| VIEW-02 | Phase 3 | Pending |
| VIEW-03 | Phase 3 | Pending |
| VIEW-04 | Phase 4 | Pending |
| VIEW-05 | Phase 4 | Pending |
| VIEW-06 | Phase 4 | Pending |
| VIEW-07 | Phase 4 | Pending |
| VIEW-08 | Phase 3 | Pending |
| CTX-01 | Phase 3 | Pending |
| CTX-02 | Phase 3 | Pending |
| CTX-03 | Phase 3 | Pending |
| CTX-04 | Phase 3 | Pending |
| CTX-05 | Phase 4 | Pending |
| FIL-01 | Phase 2 | Pending |
| FIL-02 | Phase 2 | Pending |
| FIL-03 | Phase 2 | Pending |
| PRS-01 | Phase 5 | Pending |
| PRS-02 | Phase 5 | Pending |
| PRS-03 | Phase 5 | Pending |
| PRS-04 | Phase 5 | Pending |
| PRS-05 | Phase 5 | Pending |
| PRS-06 | Phase 5 | Pending |
| PRS-07 | Phase 5 | Pending |
| ARC-01 | Phase 1 | Pending |
| ARC-02 | Phase 1 | Pending |
| ARC-03 | Phase 1 | Pending |
| ARC-04 | Phase 1 | Pending |
| RUN-01 | Phase 1 | Pending |
| RUN-02 | Phase 1 | Pending |
| RUN-03 | Phase 1 | Pending |
| RUN-04 | Phase 3 | Pending |

**Coverage:**
- v2 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

## Backlog Notes

Itens explicitamente registrados como backlog futuro:

- Preview somente leitura de `.excalidraw`, quando viavel dentro do modelo de viewer
- Integracao mais profunda com framework/editor Excalidraw em versao posterior
- Anotacao persistente efemera sobre o conteudo, com acao de limpar tudo e camada acompanhando scroll
- Exportacao em PDF do item atual
- Busca textual avancada em popup/lista de resultados
- Requisitos preliminares de `v3` e `v4`

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after roadmap traceability update*
