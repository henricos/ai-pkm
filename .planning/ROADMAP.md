# Roadmap: ai-pkm

## Overview

O caminho da `v2` e transformar o PKM ja validado em CLI numa experiencia web segura, read-only e fiel ao modelo file-first. A sequencia abaixo segue as dependencias reais do produto: primeiro garantir acesso/autenticacao e um modelo canonico de leitura sobre o `pkm` montado externamente; depois entregar shell de navegacao e filtro estrutural; em seguida elevar a qualidade de leitura no viewer; completar a experiencia para binarios, sidecars e fallbacks; e fechar com o modo de apresentacao, que e ativo na `v2` mas deliberadamente posterior ao nucleo de navegacao e leitura.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Secure Read Model Foundation** - Autenticacao single-user, runtime externo e modelo canonico read-only sobre o `pkm`.
- [ ] **Phase 2: Navigation Shell** - Shell persistente com arvore, inbox separada, filtro estrutural e URLs navegaveis.
- [ ] **Phase 3: Reading Viewer** - Viewer principal de Markdown com cabecalho contextual e composicao de leitura confiavel.
- [ ] **Phase 4: Asset Viewer and Item Context** - Tratamento de imagem, PDF, sidecars e fallbacks no mesmo item logico.
- [ ] **Phase 5: Presentation Mode** - Modo de apresentacao interno com temas prontos e ponteiro laser temporario.

## Phase Details

### Phase 1: Secure Read Model Foundation
**Goal**: Usuario consegue abrir a aplicacao com login protegido e a web passa a ler o `pkm` montado externamente por um modelo canonico read-only, sem romper o fluxo file-first.
**Depends on**: Nothing (first phase)
**Requirements**: ACC-01, ACC-02, ACC-03, ARC-01, ARC-02, ARC-03, ARC-04, RUN-01, RUN-02, RUN-03
**Success Criteria** (what must be TRUE):
  1. Usuario precisa se autenticar em qualquer ambiente, inclusive local/dev, antes de acessar a interface web.
  2. A aplicacao inicia com credenciais e path do `pkm` vindos de configuracao externa, sem depender de conteudo embutido no repositorio.
  3. Navegacao, viewer e futuras seams de busca passam a consumir o mesmo item logico read-only, com identidade estavel para o mesmo conteudo.
  4. Existe um fluxo documentado e reproduzivel para subir a aplicacao localmente apontando para um `pkm` montado por path/volume.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Navigation Shell
**Goal**: Usuario navega o acervo inteiro em uma shell unica com inbox separada, arvore estruturada, filtro estrutural e selecao compartilhavel por URL.
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, NAV-07, NAV-08, FIL-01, FIL-02, FIL-03
**Success Criteria** (what must be TRUE):
  1. Usuario ve inbox destacada acima da arvore principal e consegue navegar topicos, subtopicos, grupos e arquivos sem trocar de pagina perceptivelmente.
  2. Painel esquerdo pode ser recolhido e reaberto sem perder o item aberto nem a sensacao de shell unica.
  3. O item selecionado fica destacado, com icones e indicadores visuais coerentes para tipo, status e contagens relevantes da estrutura.
  4. Usuario consegue restringir a inbox e a arvore por nome com filtro tolerante a maiusculas/minusculas e acentos, claramente distinto de busca textual avancada.
  5. Cada item aberto atualiza uma URL propria e navegavel, permitindo retorno direto ao mesmo contexto.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Reading Viewer
**Goal**: Usuario le conteudo principal do item em um viewer rico e estavel, com cabecalho contextual e composicao visual apropriada para leitura.
**Depends on**: Phase 2
**Requirements**: VIEW-01, VIEW-02, VIEW-03, VIEW-08, CTX-01, CTX-02, CTX-03, CTX-04, RUN-04
**Success Criteria** (what must be TRUE):
  1. Ao selecionar um item Markdown, a area direita atualiza o conteudo dentro da mesma shell e exibe leitura confortavel em largura e composicao adequadas.
  2. Markdown complexo renderiza com boa fidelidade visual, incluindo tabelas, blocos de codigo com highlight, task lists, callouts e links clicaveis.
  3. O cabecalho do viewer mostra titulo e acoes do item atual, incluindo download, entrada em apresentacao e acesso ao painel de informacoes.
  4. O painel de informacoes abre dentro da area de conteudo e apresenta metadados de forma editorial, sem despejar YAML cru nem parecer codigo-fonte.
  5. A experiencia nao quebra em telas menores a ponto de inviabilizar uso mobile ou empacotamento futuro em WebView.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Asset Viewer and Item Context
**Goal**: Usuario abre imagens e PDFs com comportamento previsivel, e binario + sidecar passam a aparecer como um unico item logico com contexto complementar acessivel.
**Depends on**: Phase 3
**Requirements**: VIEW-04, VIEW-05, VIEW-06, VIEW-07, CTX-05
**Success Criteria** (what must be TRUE):
  1. Imagens abrem como conteudo principal com enquadramento e zoom confortaveis, sem parecer anexo secundario.
  2. PDFs contam com preview suficiente quando suportado e, quando nao for possivel, a interface deixa claro o fallback de download.
  3. Sidecars textuais deixam de poluir a navegacao e passam a aparecer apenas como contexto do item binario principal.
  4. Quando um arquivo nao tem preview renderizavel, o usuario recebe mensagem clara e ainda consegue baixar o arquivo diretamente.
  5. Binarios com sidecar exibem o texto complementar dentro do painel de informacoes do item principal.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Presentation Mode
**Goal**: Usuario consegue transformar o viewer em uma superficie minima de leitura/apresentacao sem sacrificar a navegacao e leitura normais como prioridade principal da `v2`.
**Depends on**: Phase 4
**Requirements**: PRS-01, PRS-02, PRS-03, PRS-04, PRS-05, PRS-06, PRS-07
**Success Criteria** (what must be TRUE):
  1. Usuario pode entrar e sair de um modo de apresentacao interno da aplicacao, distinto do fullscreen nativo do navegador.
  2. No modo de apresentacao, a interface oculta shell e elementos de manutencao, deixando o conteudo principal como foco visual.
  3. Controles discretos e auto-ocultaveis permitem sair do modo e ligar ou desligar ponteiro e anotacao quando esse recurso existir.
  4. O ponteiro laser temporario funciona sobre o conteudo e seu rastro desaparece progressivamente, inclusive fora do modo de apresentacao.
  5. Usuario pode alternar entre temas prontos de leitura/apresentacao, incluindo variantes inspiradas em ChatGPT, GitHub e Excalidraw.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Secure Read Model Foundation | 0/TBD | Not started | - |
| 2. Navigation Shell | 0/TBD | Not started | - |
| 3. Reading Viewer | 0/TBD | Not started | - |
| 4. Asset Viewer and Item Context | 0/TBD | Not started | - |
| 5. Presentation Mode | 0/TBD | Not started | - |
