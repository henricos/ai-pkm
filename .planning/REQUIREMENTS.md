# Requirements: ai-pkm

**Defined:** 2026-04-06
**Core Value:** Permitir operar o PKM com auxilio de IA, alternando entre uma experiencia visual na web e a operacao local via CLI, sem perder compatibilidade com o modelo file-first.

## v2.0 Requirements

Requirements para a `v2.0`, focada em navegacao e exibicao web do acervo PKM. A `v1.0` ja validada permanece CLI-only; a `v2.0` nao inclui edicao manual nem execucao agentica via web.

### Access

- [x] **ACC-01**: Interface web exige autenticacao single-user em todos os ambientes, incluindo local/dev.
- [x] **ACC-02**: Login usa usuario e senha fixos configurados por variaveis de ambiente ou configuracao externa equivalente, sem credenciais commitadas no repositorio.
- [x] **ACC-03**: Usuario autenticado pode acessar a experiencia completa da `v2.0` sem modelo multiusuario ou papeis adicionais.

### Navigation

- [x] **NAV-01**: Usuario pode navegar a base estruturada do `pkm` por meio de uma coluna esquerda com arvore de topicos, subtopicos, grupos e arquivos.
- [x] **NAV-02**: Inbox aparece como secao propria acima da arvore principal, com destaque visual e lista propria, sem representacao em arvore.
- [x] **NAV-03**: Painel esquerdo pode ser recolhido e reaberto sem perder o item atualmente exibido.
- [x] **NAV-04**: Item atualmente selecionado fica visualmente destacado na navegacao.
- [x] **NAV-05**: Navegacao exibe icones distintos para os tipos de item `nota`, `url` e `binario`.
- [x] **NAV-06**: Navegacao exibe contagens de itens junto dos nos relevantes da estrutura e da inbox.
- [x] **NAV-07**: Navegacao usa indicadores visuais para diferenciar itens `rascunho/incompleto` de itens `finalizado`.
- [x] **NAV-08**: Ao selecionar um item, a interface mantem a sensacao de shell unica, mas atualiza uma URL propria e navegavel para esse item.

### Viewer

- [x] **VIEW-01**: Area direita exibe o conteudo do item selecionado sem transicao para outra pagina perceptivel.
- [x] **VIEW-02**: Viewer de Markdown renderiza headings, listas, tabelas, blockquotes, blocos de codigo com highlight, task lists, links clicaveis e callouts/admonitions.
- [x] **VIEW-03**: Viewer de Markdown usa pipeline de renderizacao rica baseada em bibliotecas maduras, sem HTML cru como estrategia principal.
- [x] **VIEW-04**: Viewer de imagem exibe o binario principal com experiencia de visualizacao confortavel, incluindo zoom e enquadramento adequados.
- [x] **VIEW-05**: Arquivos PDF podem ser abertos no viewer com suporte de preview suficiente ou fallback claro de download quando preview nao for possivel.
- [x] **VIEW-06**: Sidecar textual nao aparece como item separado na navegacao; o sistema trata binario e sidecar como um unico item logico.
- [x] **VIEW-07**: Itens nao renderizaveis exibem mensagem clara de impossibilidade de preview e oferecem download direto do arquivo.
- [x] **VIEW-08**: Viewer respeita largura maxima e composicao visual apropriada para leitura, sem parecer explorador bruto de arquivos.

### Item Context

- [x] **CTX-01**: Cabecalho da area direita exibe o titulo do item atual.
- [x] **CTX-02**: Cabecalho da area direita exibe acoes do item atual, incluindo entrada em modo apresentacao, download e acesso ao painel de informacoes.
- [x] **CTX-03**: Um unico icone de informacao abre painel lateral direito, dentro da area de conteudo, para exibir informacoes complementares do item atual.
- [x] **CTX-04**: Painel de informacoes apresenta metadados e texto complementar de maneira visualmente agradavel, sem despejar YAML cru ou visual de codigo-fonte.
- [x] **CTX-05**: Para binarios com sidecar, o painel de informacoes exibe o texto complementar associado ao item principal.

### Filtering

- [x] **FIL-01**: Topo da coluna esquerda oferece campo de filtro estrutural dedicado a restringir a arvore principal por nome, sem buscar em conteudo nem afetar a inbox.
- [x] **FIL-02**: Filtro estrutural e tolerante a diferencas de maiusculas/minusculas e acentos.
- [x] **FIL-03**: Interface diferencia visualmente filtro estrutural de busca textual avancada, por exemplo com iconografia distinta.

### Presentation

- [x] **PRS-01**: Usuario pode acionar um modo de apresentacao interno da aplicacao, distinto do fullscreen nativo do navegador.
- [x] **PRS-02**: Modo de apresentacao oculta painel esquerdo, busca, configuracoes, status, cabecalho do viewer e outros elementos de manutencao, deixando apenas o conteudo principal.
- [x] **PRS-03**: Modo de apresentacao exibe controles discretos, translucidos e auto-ocultaveis no canto inferior esquerdo.
- [x] **PRS-04**: Controles minimos do modo de apresentacao incluem sair do modo, ligar/desligar ponteiro e ligar/desligar anotacao quando esse recurso existir.
- [x] **PRS-05**: Sistema oferece ponteiro laser temporario, com rastro que desaparece progressivamente, utilizavel tanto dentro quanto fora do modo de apresentacao.
- [x] **PRS-06**: Sistema oferece lista de temas prontos de leitura/apresentacao, sem capacidade de montar ou editar temas pela interface.
- [x] **PRS-07**: Conjunto inicial de temas inclui variacoes inspiradas em ChatGPT, GitHub e Excalidraw.

### Architecture and Read Model

- [x] **ARC-01**: Camada web consome o repositorio `pkm` por meio de um modelo de leitura read-only, sem transformar banco de dados em fonte primaria de verdade na `v2.0`.
- [x] **ARC-02**: Sistema define identidade estavel de item logico para uso consistente entre navegacao, viewer e busca.
- [x] **ARC-03**: Inbox, arvore, viewer e busca compartilham o mesmo modelo semantico de item, em vez de espelhar o filesystem cru diretamente na UI.
- [x] **ARC-04**: Busca e indexacao ficam atras de contratos internos preparados para futura troca de implementacao, preservando o caminho para `v4.0`.

### Runtime and Delivery

- [x] **RUN-01**: Aplicacao recebe configuracao operacional por variaveis de ambiente, incluindo credenciais de acesso e localizacao do `pkm`.
- [x] **RUN-02**: Aplicacao assume que o `pkm` esta disponivel por path ou volume montado externamente, sem embutir o acervo no proprio codigo da plataforma.
- [x] **RUN-03**: Projeto documenta como rodar a aplicacao em ambiente local/dev com as dependencias e configuracoes minimas necessarias.
- [x] **RUN-04**: Interface web e responsiva o suficiente para nao quebrar em uso mobile e nao inviabilizar empacotamento futuro em WebView.

## v2.1 Requirements

Requisitos preliminares de backlog para empacotamento, release e publicacao da aplicacao:

- **V2.1-01**: Distribuir a aplicacao como imagem Docker, sem embutir o conteudo do `pkm` na imagem.
- **V2.1-02**: Preservar o `pkm` como repositorio privado separado, montado na aplicacao por path/volume externo.
- **V2.1-03**: Versionar o aplicativo Node/web com SemVer completo e fluxo de bump via `npm version`.
- **V2.1-04**: Publicar imagem da aplicacao por pipeline automatizado no GitHub Actions para o GHCR com tags `vX.Y.Z` e `latest`.
- **V2.1-05**: Permitir atualizacao operacional simples no servidor por pull da imagem publicada e redeploy/recreate no Portainer.

## v3.0 Requirements

Requisitos preliminares de backlog para a refatoracao conceitual do dominio do PKM:

- **V3-01**: Consolidar `item` como unidade central do dominio, substituindo a leitura centrada em arquivos heterogeneos.
- **V3-02**: Reorganizar o modelo conceitual do sistema em tres dimensoes explicitas para cada item: origem/autoria, assunto e tipo.
- **V3-03**: Fazer `tipo` deixar de ocupar o papel semantico que hoje esta misturado com `modelo`, tornando modelos consequencia do tipo adotado.
- **V3-04**: Planejar e executar a migracao de naming, contratos, indices, skills, aplicacao web e conteudo do PKM de forma consistente e sem refatoracao circular descontrolada.
- **V3-05**: Estabilizar o dominio refatorado antes de qualquer migracao estrutural de indices para banco.

## v4.0 Requirements

Requisitos preliminares de backlog para futura migracao de indices JSON para banco:

- **V4-01**: Substituir indices JSON reconstruiveis por indice derivado em banco sem alterar o `pkm` como fonte primaria de verdade.
- **V4-02**: Preservar contratos de navegacao, viewer e busca ja estabelecidos na `v2.0` e refinados na `v3.0`.
- **V4-03**: Permitir reconstrucao deterministica do indice a partir do repositorio `pkm`.

## v5.0 Requirements

Requisitos preliminares de backlog para futura execucao agentica via web:

- **V5-01**: Permitir execucao de fluxos via web sem alterar o principio de que a IA e a unica escritora da base.
- **V5-02**: Expor status, console e interacao de aprovacao no navegador preservando compatibilidade com operacao local via CLI.
- **V5-03**: Reaproveitar boundaries internas da `v2.0` e `v3.0` para evitar acoplamento entre viewer e camada agentica.

## Out of Scope

Explicitamente fora de escopo da `v2.0` ativa.

| Feature | Reason |
|---------|--------|
| Edicao manual de arquivos na web | Contraria o principio de IA como escritora exclusiva da base |
| Mover, renomear ou criar itens pela interface | A `v2.0` e estritamente de navegacao e exibicao |
| Execucao de skills ou console agentica na web | Reservado para `v5.0` |
| Audio e video no viewer | Nao fazem parte do alvo real de uso desta versao |
| Busca semantica / embeddings / RAG | Fica para backlog futuro, apos validacao da busca lexical |
| Busca textual avancada com popup/lista de resultados | Fica para backlog pos-`v2.0`; a `v2.0` ativa fica apenas com filtro estrutural |
| Graph view | Alto custo e baixo valor para a fase atual |
| Customizacao manual de temas pela interface | Direcao de produto rejeitada; apenas temas prontos liberados pelo sistema |
| Integracao completa do editor Excalidraw | Escopo amplo demais e proximo demais de edicao manual |
| Deploy publicado em Kubernetes/VPS e casca mobile dedicada | Direcao futura; a `v2.0` so precisa nascer preparada, nao entregar isso agora |

## Traceability

Preenchido durante a criacao do roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACC-01 | Phase 1 | Validated |
| ACC-02 | Phase 1 | Validated |
| ACC-03 | Phase 1 | Validated |
| NAV-01 | Phase 2 | Validated |
| NAV-02 | Phase 2 | Validated |
| NAV-03 | Phase 2 | Validated |
| NAV-04 | Phase 2 | Validated |
| NAV-05 | Phase 2 | Validated |
| NAV-06 | Phase 2 | Validated |
| NAV-07 | Phase 2 | Validated |
| NAV-08 | Phase 2 | Validated |
| VIEW-01 | Phase 3 | Validated |
| VIEW-02 | Phase 3 | Validated |
| VIEW-03 | Phase 3 | Validated |
| VIEW-04 | Phase 4 | Validated |
| VIEW-05 | Phase 4 | Validated |
| VIEW-06 | Phase 4 | Validated |
| VIEW-07 | Phase 4 | Validated |
| VIEW-08 | Phase 3 | Validated |
| CTX-01 | Phase 3 | Validated |
| CTX-02 | Phase 3 | Validated |
| CTX-03 | Phase 3 | Validated |
| CTX-04 | Phase 3 | Validated |
| CTX-05 | Phase 4 | Validated |
| FIL-01 | Phase 2 | Validated |
| FIL-02 | Phase 2 | Validated |
| FIL-03 | Phase 2 | Validated |
| PRS-01 | Phase 5 | Validated |
| PRS-02 | Phase 5 | Validated |
| PRS-03 | Phase 5 | Validated |
| PRS-04 | Phase 5 | Validated |
| PRS-05 | Phase 5 | Validated |
| PRS-06 | Phase 5 | Validated |
| PRS-07 | Phase 5 | Validated |
| ARC-01 | Phase 1 | Validated |
| ARC-02 | Phase 1 | Validated |
| ARC-03 | Phase 1 | Validated |
| ARC-04 | Phase 1 | Validated |
| RUN-01 | Phase 1 | Validated |
| RUN-02 | Phase 1 | Validated |
| RUN-03 | Phase 1 | Validated |
| RUN-04 | Phase 3 | Validated |

**Coverage:**
- v2.0 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

## Backlog Notes

Itens explicitamente registrados como backlog futuro:

- Preview somente leitura de `.excalidraw`, quando viavel dentro do modelo de viewer
- Integracao mais profunda com framework/editor Excalidraw em versao posterior
- Anotacao persistente efemera sobre o conteudo, com acao de limpar tudo e camada acompanhando scroll
- Exportacao em PDF do item atual
- Busca textual avancada em popup/lista de resultados
- Requisitos preliminares de `v2.1`, `v3.0`, `v4.0` e `v5.0`

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-13 after phase 6 official closure*
