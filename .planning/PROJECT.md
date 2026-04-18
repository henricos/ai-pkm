# ai-pkm

## What This Is

O ai-pkm e a plataforma que apoia a operacao de um PKM file-first com auxilio de IA. O sistema combina uma operacao validada via CLI sobre o repositorio `pkm` com uma interface web read-only autenticada, publicada como imagem Docker no GHCR e servida em `/pkm` com `basePath` baked no build. A IA e a unica escritora da base; o humano navega via web ou opera via CLI.

## Core Value

Permitir operar o PKM com auxilio de IA, alternando entre uma experiencia visual na web e a operacao local via CLI, sem perder compatibilidade com o modelo file-first.

## Versioning

O projeto adota duas camadas complementares de versao:

- **Milestones de planning/GSD** usam SemVer curto no formato `vMAJOR.MINOR` (ex: `v1.0`, `v1.1`, `v2.0`).
- **Versao do aplicativo Node/web** usa SemVer completo no formato `MAJOR.MINOR.PATCH` (ex: `2.0.0`).

O terceiro numero (`PATCH`) fica reservado para hotfixes e releases pontuais do aplicativo, mas nao nomeia milestones de planejamento.

## Requirements

### Validated

- ✓ Operar o PKM via CLI usando as skills existentes sobre o repositorio `pkm` — v1.0
- ✓ Manter o repositorio `pkm` como fonte primaria de verdade do conteudo — v1.0
- ✓ Preservar um modelo file-first, sem depender de banco de dados para a operacao principal — v1.0
- ✓ Permitir que a IA seja a escritora exclusiva da base, com o humano atuando por orientacao e aprovacao — v1.0
- ✓ Entregar uma interface web para navegacao e exibicao do acervo PKM, sem capacidades de edicao manual — v2.0
- ✓ Exigir autenticacao single-user na interface web, inclusive em ambiente local/dev, com credenciais configuradas fora do repositorio — Phase 1
- ✓ Exibir uma arvore navegavel com topicos, subtopicos, grupos, arquivos e inbox, com painel esquerdo retratil — Phase 2
- ✓ Rodar com configuracao por variaveis de ambiente e acesso ao `pkm` por path/volume montado, preservando caminho limpo para empacotamento futuro — Phase 1
- ✓ Renderizar Markdown com boa fidelidade visual, usando bibliotecas maduras para formulas, blocos de codigo e formatacao rica — Phase 3
- ✓ Exibir imagens como item principal com boa experiencia de visualizacao, mantendo sidecars textuais ocultos da arvore e acessiveis no viewer — Phase 4
- ✓ Oferecer modo de apresentacao minimo com tela dedicada ao viewer, recolhimento da shell, temas de leitura/apresentacao e ponteiro laser temporario — Phase 5
- ✓ Eliminar o flash perceptivel do preset de tema do viewer entre SSR, hidratacao e tema persistido — Phase 6
- ✓ Fechar versionamento SemVer do app Node/web com release operacional baseada em `npm version` — Phase 8
- ✓ Publicar imagem publica no GHCR por pipeline automatizado no GitHub Actions — Phase 8
- ✓ Configurar `APP_BASE_PATH` como fonte unica do `basePath` do Next.js, baked no build via Docker build arg — Phase 10
- ✓ Validar sincronia obrigatoria entre `APP_BASE_PATH` e `NEXTAUTH_URL` em runtime, com falha cedo e mensagem clara — Phase 10
- ✓ Adotar `withBasePath()` e o prefixo configurado nos redirects, hrefs, callbacks e rotas absolutas da aplicacao — Phase 11
- ✓ Documentar o contrato operacional dos 3 lugares de configuracao: `.env` (dev), workflow CI (build) e compose (runtime) — Phase 12

### Active

(nenhum requisito ativo — proximo milestone a definir via `/gsd-new-milestone`)

### Out of Scope

- Edicao manual de arquivos pela interface web — viola o principio de que a IA e a unica escritora da base
- Disparo de skills, console agentica e execucao de fluxos pela web na fase atual — reservado para uma versao futura
- Audio e video no viewer web — nao fazem parte do alvo atual
- Busca semantica por embeddings/RAG — backlog futuro, nao escopo da versao ativa
- Migracao de indices JSON para banco de dados — direcao futura, nao requisito da versao ativa
- Deploy publicado em Kubernetes/VPS e casca mobile/WebView dedicada — direcao futura, nao escopo da versao ativa

## Context

O projeto parte de uma base brownfield ja validada em CLI: as skills operacionais existem, o repositorio `pkm` e a fonte de verdade e a operacao sem banco ja provou o modelo central. A etapa atual nao e inventar um novo sistema de edicao, mas construir uma camada web de navegacao e exibicao que respeite esse modelo.

O alvo de produto foi reorganizado em versoes. A `v1.0` corresponde ao que ja existe hoje: operacao somente por CLI, sem banco de dados, centrada em arquivos. A `v2.0` passa a ser a navegacao e exibicao web do acervo. A `v2.1` fica reservada para empacotamento, pipeline de release e publicacao operacional da aplicacao. A `v3.0` passa a ser a refatoracao conceitual do dominio do PKM, consolidando `item` como unidade central e reorganizando as dimensoes de origem/autoria, assunto e tipo. A `v4.0` fica reservada para a migracao dos indices JSON para banco. A `v5.0` fica reservada para a integracao agentica via web com Agent SDK e execucao de fluxos no navegador.

Dentro da `v2.0`, a prioridade e primeiro estruturar a aplicacao e entregar visualizacao confiavel do acervo, antes de aprofundar refinamentos visuais e capacidades mais avancadas de apresentacao. O modo apresentacao e desejavel na `v2.0`, mas e secundario em relacao ao objetivo principal de navegar e ler bem o conteudo.

A `v2.0` tambem precisa nascer com restricoes operacionais minimas corretas: autenticacao single-user desde o inicio, configuracao por variaveis de ambiente, e acesso ao `pkm` sempre por montagem/path externo, tanto em dev quanto em runtime futuro empacotado. O objetivo nao e resolver deploy publicado agora, mas evitar um desenho acoplado ao ambiente local atual.

A `v2.1` tem foco estritamente operacional: fechar um fluxo reproduzivel de empacotamento, publicacao e deploy da aplicacao como container Docker, com versionamento SemVer do app Node, pipeline automatizado no GitHub Actions, publicacao de imagem no GHCR e redeploy simples no servidor atual via Portainer, sempre mantendo o `pkm` privado fora da imagem e montado por volume.

A `v3.0` muda o proprio vocabulário central do projeto. Em vez de tratar o PKM principalmente como conjunto de arquivos heterogeneos, o sistema passa a assumir `item` como unidade conceitual principal, com tres dimensoes explicitas: origem/autoria, assunto e tipo. Essa mudanca reinterpreta termos que hoje aparecem em lugares diferentes do sistema e exige uma sequencia de migracao muito bem planejada, porque afeta simultaneamente taxonomia, modelos, contratos, indices, skills, aplicacao web e o proprio conteudo do PKM.

A interface desejada se inspira em ferramentas como Obsidian na estrutura de navegacao, mas com visual mais clean e leve. A coluna esquerda concentra arvore, busca, configuracoes e area futura de status/chamada da console de IA; a area direita concentra o viewer do item selecionado e sua barra de acoes. Breadcrumbs nao sao necessarios porque a propria arvore ja cumpre esse papel.

Com a Phase 5 concluida, a `v2.0` ja cobre navegacao, leitura rica, viewers de binarios e um modo de apresentacao funcional com presets de tema e ponteiro laser. O principal trabalho aberto dentro da experiencia atual saiu do nucleo funcional e entrou em backlog de refinamento visual, como o flash de tema durante o carregamento do viewer.

Com a Phase 6 concluida, a `v2.0` ativa fica fechada para o milestone atual. O hardening do preset eliminou o descompasso restante entre SSR, hidratacao e tema persistido no viewer, sem transformar o theming em concern global da aplicacao. O proximo passo deixa de ser implementacao corretiva dentro da `v2.0` e passa a ser definir entre `v2.1` e `v3.0` o proximo milestone de produto.

## Current State

O `v2.2` foi entregue em `2026-04-18`, fechando o ciclo de infraestrutura web do projeto. A aplicacao agora roda em `/pkm` com `basePath` baked no build, contrato de ambiente explicito e documentacao operacional completa.

**Historico de versoes:**
- `v2.0` (2026-04-13): primeira versao web funcional — autenticacao, shell, viewer rico de Markdown, presentation mode, hardening de tema.
- `v2.1` (2026-04-16): empacotamento Docker, pipeline de release SemVer no GHCR, deploy via Portainer.
- `v2.2` (2026-04-18): `basePath=/pkm` baked no build, contrato fail-fast de ambiente, redirects e URLs com prefixo, 218 testes, documentacao dos 3 lugares de configuracao.

Os artefatos historicos estao arquivados em `.planning/milestones/`.

## Next Milestone Goals

O proximo candidato natural e `v3.0`, a refatoracao conceitual do dominio PKM: consolidar `item` como unidade central com tres dimensoes explicitas (origem/autoria, assunto, tipo). Essa mudanca afeta taxonomia, modelos, contratos, indices, skills e aplicacao web — exige planejamento cuidadoso antes de qualquer execucao.

Use `/gsd-new-milestone` para definir escopo, requisitos e roadmap do proximo milestone.

## Constraints

- **Product model**: A web da fase atual e estritamente de navegacao e exibicao — a edicao continua fora do escopo para preservar o papel da IA como escritora exclusiva
- **Source of truth**: O repositorio `pkm` continua como fonte primaria de verdade — a camada web nao pode romper o modelo file-first
- **Compatibility**: A nova experiencia web nao pode quebrar nem substituir a operacao local via CLI — as duas devem coexistir
- **Authentication**: A interface web exige login single-user em todos os ambientes, inclusive local/dev — acesso nao deve ficar aberto por conveniencia de desenvolvimento
- **Runtime config**: Credenciais e paths devem vir de variaveis de ambiente ou configuracao externa — nada sensivel entra em commit
- **PKM access**: O `pkm` e sempre montado externamente por path/volume — a aplicacao nao assume conteudo embutido no proprio repo
- **Viewer scope**: Markdown e imagem sao prioritarios; PDF e secundario; audio/video ficam fora — alinhado ao uso real esperado do acervo
- **Search scope**: A busca textual da versao ativa cobre nome de arquivo, Markdown e sidecars textuais, mas nao frontmatter nem embeddings — para manter complexidade controlada
- **UI approach**: O projeto deve preferir bibliotecas maduras e padroes consolidados para renderizacao e visualizacao — evitar reinventar componentes centrais cedo demais
- **Responsiveness**: A interface deve degradar bem em mobile e evitar decisoes que inviabilizem uso futuro em WebView — sem transformar mobile em escopo principal agora

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rebatizar o estado atual como `v1.0` | O sistema ja tem uma operacao validada em CLI e isso precisa aparecer como capacidade existente, nao como hipotese | ✓ Good |
| Definir `v2.0` como navegacao e exibicao web | Separa claramente a camada visual da futura camada agentica, reduzindo escopo e risco | ✓ Good |
| Reservar `v2.1` para empacotamento e pipeline de release/publicacao | Fecha a operacao de distribuicao da aplicacao sem antecipar mudancas conceituais nem banco | ✓ Good |
| Definir `v3.0` como refatoracao conceitual do dominio PKM | Resolve inconsistencias de naming e modelo mental antes de uma migracao estrutural maior | ✓ Good |
| Empurrar a migracao de indices JSON para banco para `v4.0` | Evita cristalizar no banco uma taxonomia ainda inconsistente | ✓ Good |
| Deixar execucao agentica web para `v5.0` | Preserva foco da versao ativa e evita misturar viewer com console/automacao cedo demais | ✓ Good |
| Ocultar sidecars da arvore e exibi-los como informacao complementar do item principal | A unidade logica de navegacao deve ser o arquivo principal, nao seus artefatos auxiliares | ✓ Good |
| Priorizar viewers leves para imagem e preview inline nativo para PDF na `v2.0` | Entrega uma experiencia focada no conteudo sem introduzir stacks pesadas cedo demais | ✓ Good |
| Tratar design visual detalhado como fase interna da `v2.0`, possivelmente com apoio de ferramenta externa | Permite primeiro estabilizar a base funcional e depois implementar a interface fiel a uma spec visual melhor trabalhada | — Pending |
| Exigir autenticacao single-user desde a `v2.0` | Mesmo sendo sistema de uma pessoa, a experiencia publicada e local precisa ter acesso protegido e coerente | ✓ Good |
| Tratar `pkm` como dependencia montada e configurada externamente | Evita acoplamento com o ambiente de desenvolvimento atual e prepara o caminho para Docker/deploy futuro | ✓ Good |
| Implementar presentation mode como estado interno da shell, sem nova rota nem fullscreen nativo obrigatorio | Preserva continuidade de leitura e evita bifurcar a arquitetura do viewer para uma capability secundariada `v2.0` | ✓ Good |
| Resolver o flash de tema com bootstrap pre-paint local ao viewer | Fecha o ultimo gap visual da `v2.0` sem promover theming global nem introduzir mismatch de hidratacao | ✓ Good |
| Distribuir a aplicacao por imagem Docker publicada, e nao por `git pull` dentro do runtime | Mantem deploy mais previsivel, rastreavel e portavel entre servidores | ✓ Good |
| Usar GHCR publico com tags `vX.Y.Z` e `latest` como estrategia inicial de distribuicao | Simplifica operacao no servidor caseiro e preserva referencia exata de release por SemVer | ✓ Good |
| Materializar o fluxo de fechamento de versao como skill operacional sem wrapper opaco | Reduz friccao para novas releases preservando `npm version` e o checklist real do projeto | ✓ Good |
| Baked `APP_BASE_PATH=/pkm` no workflow (Opcao B), sem variavel GitHub Actions | Cloudflare Tunnel preserva o path — app precisa ser consciente do prefixo; mudar path exige nova release (aceito) | ✓ Good |
| `withBasePath()` usada apenas em fronteiras server-side; `next/link` prefixa via framework | Evita double-prefix e mantém semântica clara de onde o prefixo é aplicado | ✓ Good |
| `isValidCallback()` bloqueando open redirect no LoginForm sem `process.env` no cliente | Client Components nao tem acesso a APP_BASE_PATH; calcular server-side e passar como prop e o padrao correto | ✓ Good |
| `library/page.tsx` e `inbox/page.tsx` criados para garantir auth check em rotas indice | Next.js nao executa layout para rotas sem page.tsx; rotas indice retornavam 404 sem redirect para login | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-18 — milestone v2.2 encerrado; aplicacao serve em /pkm com basePath baked, 218 testes e documentacao operacional completa*
