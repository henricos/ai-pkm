# Roadmap: ai-pkm

## Overview

O caminho da `v2` e transformar o PKM ja validado em CLI numa experiencia web segura, read-only e fiel ao modelo file-first. A sequencia abaixo segue as dependencias reais do produto: primeiro garantir acesso/autenticacao e um modelo canonico de leitura sobre o `pkm` montado externamente; depois entregar shell de navegacao e filtro estrutural; em seguida elevar a qualidade de leitura no viewer; completar a experiencia para binarios, sidecars e fallbacks; e fechar com o modo de apresentacao, que e ativo na `v2` mas deliberadamente posterior ao nucleo de navegacao e leitura.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Secure Read Model Foundation** - Autenticacao single-user, runtime externo e modelo canonico read-only sobre o `pkm`.
- [x] **Phase 2: Navigation Shell** - Shell persistente com arvore, inbox separada, filtro estrutural e URLs navegaveis.
- [x] **Phase 3: Reading Viewer** - Viewer principal de Markdown com cabecalho contextual e composicao de leitura confiavel.
- [x] **Phase 4: Asset Viewer and Item Context** - Tratamento de imagem, PDF, sidecars e fallbacks no mesmo item logico. (completed 2026-04-11)
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
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Bootstrap Next.js 16 + design system @theme tokens + scaffolding Vitest
- [x] 01-02-PLAN.md — Autenticacao NextAuth v5 + middleware universal + tela de login Stitch→shadcn
- [x] 01-03-PLAN.md — ItemRepository interface + FsItemRepository filesystem + path traversal security
- [x] 01-04-PLAN.md — Documentacao de setup local + home autenticada + checkpoint visual

**UI hint**: yes

### Phase 2: Navigation Shell
**Goal**: Usuario navega o acervo inteiro em uma shell unica com inbox separada, arvore estruturada, filtro estrutural e selecao compartilhavel por URL.
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, NAV-07, NAV-08, FIL-01, FIL-02, FIL-03
**Success Criteria** (what must be TRUE):
  1. Usuario ve inbox destacada acima da arvore principal e consegue navegar topicos, subtopicos, grupos e arquivos sem trocar de pagina perceptivelmente.
  2. Painel esquerdo pode ser recolhido e reaberto sem perder o item aberto nem a sensacao de shell unica.
  3. O item selecionado fica destacado, com icones e indicadores visuais coerentes para tipo, status e contagens relevantes da estrutura.
  4. Usuario consegue restringir a arvore principal por nome com filtro tolerante a maiusculas/minusculas e acentos, claramente distinto de busca textual avancada e sem afetar a inbox.
  5. Cada item aberto atualiza uma URL propria e navegavel, permitindo retorno direto ao mesmo contexto.
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — NavigationSnapshot + route helpers + contagens e ancestry da shell
- [x] 02-02-PLAN.md — Layout persistente `(shell)` + rotas `library`/`inbox` + estado vazio/editorial
- [x] 02-03-PLAN.md — Inbox lane + árvore interativa + filtro estrutural com highlight
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
**Plans**: 6 plans
Plans:
- [x] 03-01-PLAN.md — Wave 0 de testes do viewer e contratos de frontmatter
- [x] 03-02-PLAN.md — Pipeline rica de Markdown com bibliotecas maduras
- [x] 03-03-PLAN.md — Painel editorial de metadados e contexto do item
- [x] 03-04-PLAN.md — ViewerHeader contextual com acoes e composicao de leitura
- [x] 03-05-PLAN.md — Integracao do viewer na shell persistente e layout responsivo
- [x] 03-06-PLAN.md — Fechamento dos gaps de UAT e re-verificacao final
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
**Plans**: 3 plans
Plans:
- [x] 04-01-PLAN.md — Wave 0 de testes para imagem, PDF, sidecar e rota de preview inline
- [x] 04-02-PLAN.md — Contrato de sidecar no ItemRepository + rota autenticada de preview inline
- [x] 04-03-PLAN.md — Viewers leves de imagem/PDF + sidecar no InfoPanel + fallback editorial
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
**Plans**: 4 plans
Plans:
- [x] 05-01-PLAN.md — Wave 0 de testes para presentation mode, hit area, laser e presets do viewer
- [x] 05-02-PLAN.md — Presentation shell interno + controles discretos + bloqueio do InfoPanel
- [x] 05-03-PLAN.md — Laser pointer overlay com rastro temporal dentro e fora do modo apresentacao
- [x] 05-04-PLAN.md — Presets ChatGPT/GitHub/Excalidraw no viewer + persistencia local + fechamento manual
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Secure Read Model Foundation | 4/4 | Completed | 2026-04-08 |
| 2. Navigation Shell | 3/3 | Completed | 2026-04-08 |
| 3. Reading Viewer | 6/6 | Completed | 2026-04-10 |
| 4. Asset Viewer and Item Context | 3/3 | Complete    | 2026-04-11 |
| 5. Presentation Mode | 0/4 | Planned | - |

## Backlog

### Phase 999.1: Eliminar flash de tema no carregamento do viewer (BACKLOG)

**Goal:** Remover o flash visual que ocorre quando o viewer carrega com o tema padrão e depois troca para o tema salvo. O usuário vê a mudança acontecer a olho nu a cada reload de página.

**Context:** O tema do viewer é salvo no `localStorage` e restaurado via `useEffect` em `viewer-client-shell.tsx`. A sequência atual é: (1) servidor renderiza com `DEFAULT_THEME`, (2) cliente hidrata com `DEFAULT_THEME` (necessário para evitar mismatch de hidratação SSR), (3) `useEffect` pós-montagem lê o `localStorage` e dispara re-render com o tema salvo. O flash é a janela visual entre os passos 2 e 3.

**Causa raiz:** O `localStorage` não está disponível no servidor, então o tema real só pode ser lido no cliente. O `useEffect` garante que servidor e cliente concordem no render inicial, mas cria um re-render extra visível.

**Solução proposta:** Injetar um `<script>` inline no `<head>` (via `layout.tsx`) que lê o `localStorage` e aplica o `data-theme` no DOM *antes* do primeiro paint e *antes* da hidratação do React — técnica usada pelo `next-themes`. Isso exige decidir se o `data-theme` permanece no container interno do viewer ou sobe para `<html>` (com escopo CSS ajustado), pois o script inline só tem acesso ao DOM raiz no momento em que roda.

**Impacto:** Puramente visual/UX — nenhuma funcionalidade afetada. Pode ser atacado de forma isolada sem risco de regressão nas features de tema já implementadas.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)
