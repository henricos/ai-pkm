# ai-pkm

## What This Is

O ai-pkm e a plataforma que apoia a operacao de um PKM file-first com auxilio de IA. Hoje, o sistema ja funciona de forma validada via CLI sobre o repositorio `pkm`; o proximo passo e adicionar uma experiencia web visual, limpa e leve para navegar e exibir esse acervo sem quebrar o modelo em que a IA e a unica escritora da base.

## Core Value

Permitir operar o PKM com auxilio de IA, alternando entre uma experiencia visual na web e a operacao local via CLI, sem perder compatibilidade com o modelo file-first.

## Requirements

### Validated

- ✓ Operar o PKM via CLI usando as skills existentes sobre o repositorio `pkm` — v1
- ✓ Manter o repositorio `pkm` como fonte primaria de verdade do conteudo — v1
- ✓ Preservar um modelo file-first, sem depender de banco de dados para a operacao principal — v1
- ✓ Permitir que a IA seja a escritora exclusiva da base, com o humano atuando por orientacao e aprovacao — v1

### Active

- [ ] Entregar uma interface web para navegacao e exibicao do acervo PKM, sem capacidades de edicao manual
- [ ] Exigir autenticacao single-user na interface web, inclusive em ambiente local/dev, com credenciais configuradas fora do repositorio
- [ ] Exibir uma arvore navegavel com topicos, subtopicos, grupos, arquivos e inbox, com painel esquerdo retratil
- ✓ Renderizar Markdown com boa fidelidade visual, usando bibliotecas maduras para formulas, blocos de codigo e formatacao rica — Validado na Phase 3
- [ ] Exibir imagens como item principal com boa experiencia de visualizacao, mantendo sidecars textuais ocultos da arvore e acessiveis no viewer
- [ ] Oferecer modo de apresentacao minimo com tela cheia do viewer, recolhimento do painel esquerdo, temas de leitura/apresentacao e ponteiro laser temporario
- [ ] Implementar busca textual simples por nome de arquivo, conteudo Markdown e sidecars textuais, sem indexar frontmatter
- [ ] Rodar com configuracao por variaveis de ambiente e acesso ao `pkm` por path/volume montado, preservando caminho limpo para empacotamento futuro

### Out of Scope

- Edicao manual de arquivos pela interface web — viola o principio de que a IA e a unica escritora da base
- Disparo de skills, console agentica e execucao de fluxos pela web na fase atual — reservado para uma versao futura
- Audio e video no viewer web — nao fazem parte do alvo atual
- Busca semantica por embeddings/RAG — backlog futuro, nao escopo da versao ativa
- Migracao de indices JSON para banco de dados — direcao futura, nao requisito da versao ativa
- Deploy publicado em Kubernetes/VPS e casca mobile/WebView dedicada — direcao futura, nao escopo da versao ativa

## Context

O projeto parte de uma base brownfield ja validada em CLI: as skills operacionais existem, o repositorio `pkm` e a fonte de verdade e a operacao sem banco ja provou o modelo central. A etapa atual nao e inventar um novo sistema de edicao, mas construir uma camada web de navegacao e exibicao que respeite esse modelo.

O alvo de produto foi reorganizado em versoes. A `v1` corresponde ao que ja existe hoje: operacao somente por CLI, sem banco de dados, centrada em arquivos. A `v2` passa a ser a navegacao e exibicao web do acervo. A `v3` fica reservada para a migracao dos indices JSON para banco. A `v4` fica reservada para a integracao agentica via web com Agent SDK e execucao de fluxos no navegador.

Dentro da `v2`, a prioridade e primeiro estruturar a aplicacao e entregar visualizacao confiavel do acervo, antes de aprofundar refinamentos visuais e capacidades mais avancadas de apresentacao. O modo apresentacao e desejavel na `v2`, mas e secundario em relacao ao objetivo principal de navegar e ler bem o conteudo.

A `v2` tambem precisa nascer com restricoes operacionais minimas corretas: autenticacao single-user desde o inicio, configuracao por variaveis de ambiente, e acesso ao `pkm` sempre por montagem/path externo, tanto em dev quanto em runtime futuro empacotado. O objetivo nao e resolver deploy publicado agora, mas evitar um desenho acoplado ao ambiente local atual.

A interface desejada se inspira em ferramentas como Obsidian na estrutura de navegacao, mas com visual mais clean e leve. A coluna esquerda concentra arvore, busca, configuracoes e area futura de status/chamada da console de IA; a area direita concentra o viewer do item selecionado e sua barra de acoes. Breadcrumbs nao sao necessarios porque a propria arvore ja cumpre esse papel.

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
| Rebatizar o estado atual como `v1` | O sistema ja tem uma operacao validada em CLI e isso precisa aparecer como capacidade existente, nao como hipotese | ✓ Good |
| Definir `v2` como navegacao e exibicao web | Separa claramente a camada visual da futura camada agentica, reduzindo escopo e risco | ✓ Good |
| Manter `v3` para migracao dos indices JSON para banco | Trata a persistencia derivada como evolucao posterior, sem contaminar a fase atual | ✓ Good |
| Deixar execucao agentica web para `v4` | Preserva foco da versao ativa e evita misturar viewer com console/automacao cedo demais | ✓ Good |
| Ocultar sidecars da arvore e exibi-los como informacao complementar do item principal | A unidade logica de navegacao deve ser o arquivo principal, nao seus artefatos auxiliares | ✓ Good |
| Tratar design visual detalhado como fase interna da `v2`, possivelmente com apoio de ferramenta externa | Permite primeiro estabilizar a base funcional e depois implementar a interface fiel a uma spec visual melhor trabalhada | — Pending |
| Exigir autenticacao single-user desde a `v2` | Mesmo sendo sistema de uma pessoa, a experiencia publicada e local precisa ter acesso protegido e coerente | ✓ Good |
| Tratar `pkm` como dependencia montada e configurada externamente | Evita acoplamento com o ambiente de desenvolvimento atual e prepara o caminho para Docker/deploy futuro | ✓ Good |

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
*Last updated: 2026-04-10 — Phase 3 complete (reading-viewer)*
