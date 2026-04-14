# Phase 09: Portainer Deployment Flow - Research

**Researched:** 2026-04-14  
**Domain:** documentacao operacional de deploy/update via imagem publicada no GHCR  
**Confidence:** MEDIUM

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** O procedimento oficial de deploy/update no servidor deve apontar para `ghcr.io/henricos/ai-pkm:latest`. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-02:** As tags `vX.Y.Z` continuam existindo para rastreabilidade da release, mas nao sao a referencia principal no fluxo documentado de deploy. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-03:** A documentacao publica e canonica de subida do container deve usar `docker compose`. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-04:** O `README.md` deve ensinar um `compose.yaml` direto e padrao, sem citar Portainer. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-05:** O deploy real via Portainer no ambiente atual continua dentro do boundary da fase, mas nao deve vazar para a documentacao publica principal. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-06:** Antes de subir o container, o operador precisa garantir que o repositorio `pkm` esteja disponivel no host no path que sera montado. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-07:** Antes de subir o container, o operador precisa garantir que o diretorio `index/` deste repositorio `ai-pkm` esteja disponivel no host no path que sera montado. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-08:** A documentacao deve tratar `pkm` + `index` como pre-requisitos explicitos do runtime, e nao como detalhe secundario ou passo opcional posterior. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-09:** O fluxo documentado nao deve depender de `git pull` dentro do container. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-10:** O `README.md` e os guias operacionais desta fase devem ser mais diretos e objetivos, no estilo de instrucoes padrao de imagem/container. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-11:** A documentacao deve orientar instalacao, configuracao do `compose.yaml`, subida/atualizacao do container e como acessar a aplicacao ate a tela de login. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-12:** A documentacao nao deve incluir smoke test formal, checklist de verificacao pos-deploy nem secao de rollback nesta fase. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **D-13:** A documentacao operacional nao deve mencionar direcoes futuras do projeto que nao ajudem o operador imediato, incluindo referencias a migracao futura para banco. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]

### Claude's Discretion
- Estrutura exata dos docs entre `README.md` e arquivo dedicado em `docs/`, desde que o `README.md` fique direto e a superficie canonica permaneça `docker compose`. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- Forma exata do exemplo de `compose.yaml`, desde que preserve `latest`, mounts externos e env vars obrigatorias. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- Nivel de detalhamento da secao de acesso inicial, desde que termine claramente em "abra a app e chegue na tela de login". [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]

### Deferred Ideas (OUT OF SCOPE)
- Documentar rollback operacional por troca manual para `vX.Y.Z`. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- Adicionar smoke test ou checklist formal pos-deploy. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- Automatizar deploy remoto a partir do CI. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- Expandir a documentacao para multiplos ambientes, canais ou provedores. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEP-01 | Operador consegue atualizar a aplicacao no servidor atual consumindo a nova imagem publicada, sem `git pull` dentro do container. | Usar `ghcr.io/henricos/ai-pkm:latest` no compose documentado, com fluxo de update por `docker compose pull` + `docker compose up -d` no guia canonico. [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: .github/workflows/release-ghcr.yml][CITED: https://docs.docker.com/reference/cli/docker/compose/pull/][CITED: https://docs.docker.com/reference/cli/docker/compose/up/] |
| DEP-02 | Redeploy no Portainer preserva configuracao externa e o mesmo volume montado do `pkm`. | Manter o compose declarativo com env vars interpoladas e binds externos para `pkm` + `index`; documentar Portainer apenas como superficie que reaplica esse mesmo compose. [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: compose.yaml][CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add] |
| DEP-03 | Repositorio documenta o fluxo operacional minimo de release e redeploy para o ambiente atual com Docker + Portainer. | Separar quickstart publico no README, guia detalhado em `docs/` e links de handoff a partir dos docs existentes de release e validacao local. [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: README.md][VERIFIED: docs/docker-validation.md][VERIFIED: docs/release-semver-ghcr.md] |

## Project Constraints (from CLAUDE.md)

- `CLAUDE.md` delega para `AGENTS.md`; portanto, as diretivas operacionais reais desta fase vem de `AGENTS.md`. [VERIFIED: CLAUDE.md][VERIFIED: AGENTS.md]
- Toda comunicacao e documentacao autoral devem ficar em `pt-BR`; nomes tecnicos de arquivos e estrutura continuam em ingles. [VERIFIED: AGENTS.md]
- Antes de qualquer trabalho, o contexto vivo obrigatorio do projeto e `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md` e `.planning/ROADMAP.md`. [VERIFIED: AGENTS.md]
- O repositorio adota SDD/GSD; esta fase deve produzir artefato de planning alinhado ao milestone `v2.1`, nao implementacao ad hoc fora desse fluxo. [VERIFIED: AGENTS.md][VERIFIED: .planning/PROJECT.md]
- Commits nao podem ser feitos automaticamente; qualquer commit precisa de aprovacao explicita e uso da skill `/commit-push`. [VERIFIED: AGENTS.md]
- A web continua read-only e o `pkm` segue como fonte primaria de verdade montada externamente; a documentacao desta fase nao pode sugerir caminhos que embutam o acervo na imagem. [VERIFIED: AGENTS.md][VERIFIED: .planning/PROJECT.md]

## Summary

Esta fase deve ser planejada como um fechamento editorial do fluxo operacional ja existente, nao como nova fundacao tecnica. O repositorio ja possui imagem canonicamente publicada em `ghcr.io/henricos/ai-pkm` com tags `vX.Y.Z` e `latest`, runtime containerizado baseado em env vars externas, e mounts bind para `pkm` e `index`; o gap aberto e que a documentacao principal ainda esta ancorada na validacao local da Phase 7, nao no consumo da imagem publicada no servidor atual. [VERIFIED: .github/workflows/release-ghcr.yml][VERIFIED: compose.yaml][VERIFIED: docs/docker-validation.md][VERIFIED: README.md]

O split mais limpo e manter o `README.md` como quickstart publico de install/start/update com um `compose.yaml` inline usando `ghcr.io/henricos/ai-pkm:latest`, e mover o detalhamento operacional para um guia dedicado em `docs/` sem misturar com o guia de validacao local nem com o checklist de release. Isso satisfaz a decisao de expor `docker compose` como superficie canonica, evita citar Portainer no README e reduz duplicacao com os guias ja existentes. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][VERIFIED: README.md][VERIFIED: docs/docker-validation.md][VERIFIED: docs/release-semver-ghcr.md][CITED: https://docs.docker.com/compose/compose-file/]

O planner deve tratar Portainer como detalhe de execucao do ambiente atual, nao como modelo conceitual dos docs. A documentacao principal deve ensinar um compose declarativo que pode ser rodado por CLI ou reaplicado no Portainer Stack editor/upload; a parte Portainer, se existir, deve ser curta e derivada do mesmo compose para evitar drift entre “doc publica” e “operacao real”. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add]

**Primary recommendation:** Planejar a fase em dois slices editoriais: `README` + novo guia canônico de deploy/update por compose, depois reconciliar docs existentes para remover sobreposição e adicionar a ponte mínima para o uso atual via Portainer. [VERIFIED: .planning/ROADMAP.md][VERIFIED: README.md][VERIFIED: docs/docker-validation.md][VERIFIED: docs/release-semver-ghcr.md]

## Standard Stack

### Core

| Library / Tool | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Docker Compose CLI / Compose Specification | Compose V2 / spec atual | Superficie publica canonica para declarar imagem, env vars, portas e binds do runtime. | O projeto ja trava `docker compose` como fluxo canonico de runtime e a doc oficial trata `compose.yaml` como configuracao declarativa padrao. [VERIFIED: .planning/phases/07-container-packaging-foundation/07-CONTEXT.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][CITED: https://docs.docker.com/compose/compose-file/][CITED: https://docs.docker.com/compose/intro/compose-application-model/] |
| `ghcr.io/henricos/ai-pkm:latest` | ponteiro operacional atual | Imagem oficial consumida no deploy/update do servidor atual. | A pipeline publica `vX.Y.Z` e `latest`, e a decisao da fase trava `latest` como referencia operacional documentada. [VERIFIED: .github/workflows/release-ghcr.yml][VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md] |
| Bind mounts externos para `pkm` e `index` | contrato atual | Preservar dados privados e configuracao externa fora da imagem. | O compose atual e o contexto da fase deixam `pkm` + `index` como pre-requisitos de runtime, nao conteudo embutido. [VERIFIED: compose.yaml][VERIFIED: .env.compose.example][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][VERIFIED: src/lib/env.ts] |

### Supporting

| Library / Tool | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `docs/release-semver-ghcr.md` | doc atual | Upstream do deploy: fechar release e publicar nova imagem. | Linkar apenas como precondicao ou passo anterior, sem repetir checklist de release no guia de deploy. [VERIFIED: docs/release-semver-ghcr.md][VERIFIED: README.md] |
| `docs/docker-validation.md` | doc atual | Validacao local do artefato construido no repo. | Manter restrito a build/validation local; nao reaproveitar como guia de deploy da imagem publicada. [VERIFIED: docs/docker-validation.md][VERIFIED: README.md] |
| Portainer Stacks | doc atual 2.33 LTS | Superficie do ambiente atual para colar/uploadar o mesmo compose e reaplicar env vars. | Usar apenas numa secao curta ou doc secundario, sem virar a documentacao publica principal. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline `compose.yaml` de deploy no README + guia dedicado em `docs/` | Reaproveitar `docs/docker-validation.md` como doc unica | A doc atual e orientada a build local e checkpoint de validacao; reutiliza-la para deploy mistura objetivos e conflita com o escopo sem smoke test da Phase 9. [VERIFIED: docs/docker-validation.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md] |
| `ghcr.io/henricos/ai-pkm:latest` como referencia oficial | Pinning em `vX.Y.Z` no fluxo principal | Melhor rastreabilidade por release, mas conflita com a decisao travada de usar `latest` no procedimento oficial desta fase. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][VERIFIED: .github/workflows/release-ghcr.yml] |
| README sem citar Portainer | README ensinando Stack editor / Upload do Portainer | Acopla a doc principal ao ambiente atual e contradiz a decisao editorial da fase. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md] |

## Architecture Patterns

### Recommended Project Structure

```text
README.md                         # quickstart publico: prerequisitos, compose inline, start/update, acesso inicial
docs/deploy-compose-ghcr.md       # guia canonico detalhado de install/update pela imagem publicada
docs/docker-validation.md         # continua como validacao local da imagem buildada no repo
docs/release-semver-ghcr.md       # continua como guia de release/publicacao, com link para o guia de deploy
```

### Pattern 1: README como Quickstart Declarativo

**What:** O `README.md` deve ensinar apenas o menor caminho para subir e atualizar a aplicacao com `docker compose`, assumindo imagem publicada e pre-requisitos externos de dados. [VERIFIED: README.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]  
**When to use:** Sempre que o leitor estiver chegando ao projeto pela primeira vez ou quiser apenas copiar um `compose.yaml` funcional. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]  
**Example:**  

```yaml
# Source: compose contract in repo + Docker Compose docs
services:
  web:
    image: ghcr.io/henricos/ai-pkm:latest
    environment:
      APP_ROOT_PATH: /app
      PKM_PATH: /data/pkm
      INDEX_PATH: /data/index
      AUTH_USERNAME: ${AUTH_USERNAME}
      AUTH_PASSWORD: ${AUTH_PASSWORD}
      AUTH_TRUST_HOST: ${AUTH_TRUST_HOST:-true}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "${WEB_HOST_PORT:-3000}:3000"
    volumes:
      - type: bind
        source: ${PKM_HOST_PATH}
        target: /data/pkm
        read_only: true
      - type: bind
        source: ${INDEX_HOST_PATH}
        target: /data/index
        read_only: true
```

Fonte do padrao: `compose.yaml` do repo adaptado do fluxo local-build para imagem publicada. [VERIFIED: compose.yaml][CITED: https://docs.docker.com/compose/compose-file/]

### Pattern 2: Guia Dedicado para Deploy/Update, sem Duplicar Release nem Validacao

**What:** Criar um doc novo focado em quatro blocos: pre-requisitos (`pkm` + `index` + env vars), compose file, primeira subida, update por pull/redeploy. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]  
**When to use:** Para o operador do servidor atual e para qualquer pessoa que precise do fluxo operacional completo, nao apenas do snippet rapido. [VERIFIED: .planning/ROADMAP.md]  
**Example:**  

```bash
# Source: Docker Compose CLI docs
docker compose pull
docker compose up -d
```

`docker compose pull` baixa a imagem definida no `compose.yaml`, e `docker compose up -d` recria/atualiza o container quando a imagem ou a configuracao mudam, preservando os mounts externos. [CITED: https://docs.docker.com/reference/cli/docker/compose/pull/][CITED: https://docs.docker.com/reference/cli/docker/compose/up/]

### Pattern 3: Portainer como Adaptador do Mesmo Compose

**What:** Se a fase documentar Portainer explicitamente, isso deve aparecer como nota curta de “como aplicar o mesmo compose no ambiente atual”, nao como fonte de verdade separada. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]  
**When to use:** Apenas para fechar DEP-02 no contexto do servidor atual. [VERIFIED: .planning/REQUIREMENTS.md]  
**Example:** Portainer aceita stacks via Web editor ou Upload e permite definir env vars sem alterar o compose, o que reforca a estrategia de manter um unico compose canonico e configuracao externa. [CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add]

### Anti-Patterns to Avoid

- **Sobrescrever `compose.yaml` raiz para virar doc de deploy:** o arquivo atual faz build local com `image: ai-pkm:local`; trocá-lo para `ghcr.io/...:latest` mistura o contrato da Phase 7 com o da Phase 9 e pode quebrar a validacao local. [VERIFIED: compose.yaml][VERIFIED: docs/docker-validation.md]
- **Reaproveitar `docs/docker-validation.md` como doc de producao:** esse guia existe para build/config/up/login local e contem checkpoints de validacao que a Phase 9 explicitamente nao quer repetir. [VERIFIED: docs/docker-validation.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **Ensinar `git pull` dentro do runtime ou da app:** isso contradiz o requisito DEP-01 e a decisao de operar por imagem publicada. [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- **Esquecer `index` nos pre-requisitos:** em producao `INDEX_PATH` e obrigatorio, entao documentar so `pkm` gera instrucoes quebradas. [VERIFIED: src/lib/env.ts][VERIFIED: compose.yaml]
- **Usar `NEXTAUTH_URL=http://localhost:3000` como exemplo universal de servidor:** isso so serve para local; em ambiente real a URL precisa refletir o host/porta publicados para evitar configuracao incoerente de auth. [VERIFIED: .env.compose.example][VERIFIED: docs/dev-setup.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Update operacional da app | Fluxo de `git pull` no servidor ou dentro do container | Imagem publicada em GHCR + `docker compose pull`/`up -d` | O projeto ja validou release e publish por tag Git, e Compose/Portainer reaplicam a imagem declarada sem reinventar refresh manual do runtime. [VERIFIED: .github/workflows/release-ghcr.yml][VERIFIED: .planning/REQUIREMENTS.md][CITED: https://docs.docker.com/reference/cli/docker/compose/pull/][CITED: https://docs.docker.com/reference/cli/docker/compose/up/] |
| Configuracao do ambiente atual | Duas fontes de verdade, uma “CLI” e outra “Portainer” | Um unico compose declarativo + variaveis externas | Portainer permite aplicar env vars sem mutar o compose, entao a doc deve derivar da mesma configuracao. [CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add] |
| Explicacao de pre-requisitos | Texto abstrato sobre “dados externos” | Lista explicita: `pkm`, `index`, `.env`, porta e URL base | O runtime real falha cedo sem paths absolutos e env vars obrigatorias. [VERIFIED: src/lib/env.ts][VERIFIED: compose.yaml][VERIFIED: .env.compose.example] |

**Key insight:** O planner deve tratar a fase como “alinhar narrativa ao contrato tecnico ja validado”, nao como inventar novo mecanismo de deploy. [VERIFIED: .planning/PROJECT.md][VERIFIED: .planning/STATE.md][VERIFIED: .planning/ROADMAP.md]

## Common Pitfalls

### Pitfall 1: Confundir validacao local com deploy do servidor
**What goes wrong:** O operador recebe instrucoes com `build:` local, `image: ai-pkm:local` e checkpoint de smoke manual quando o objetivo da fase e consumir `ghcr.io/henricos/ai-pkm:latest`. [VERIFIED: compose.yaml][VERIFIED: docs/docker-validation.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]  
**Why it happens:** O README atual aponta para o guia da Phase 7 e ainda nao existe um guia especifico de deploy/update por imagem publicada. [VERIFIED: README.md]  
**How to avoid:** Criar um doc novo de deploy e reduzir o README a um quickstart que ja use `latest`. [VERIFIED: README.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]  
**Warning signs:** Aparecem comandos `docker compose build`, referencias a “validacao do artefato” ou sugestoes de login+navegacao completa como gate do deploy. [VERIFIED: docs/docker-validation.md]

### Pitfall 2: Documentar apenas `pkm` e esquecer `index`
**What goes wrong:** A app sobe em producao com `PKM_PATH` correto, mas falha cedo porque `INDEX_PATH` nao foi configurado ou montado. [VERIFIED: src/lib/env.ts]  
**Why it happens:** Em dev local existe fallback ergonomico para `index/`, mas esse fallback nao vale em producao. [VERIFIED: docs/dev-setup.md][VERIFIED: src/lib/env.ts]  
**How to avoid:** O guia de deploy deve tratar `pkm` e `index` como pre-requisitos pareados antes do primeiro `docker compose up`. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]  
**Warning signs:** O doc menciona so `PKM_HOST_PATH`, ou o exemplo de env file nao inclui `INDEX_HOST_PATH`. [VERIFIED: .env.compose.example]

### Pitfall 3: Criar drift entre compose publico e operacao via Portainer
**What goes wrong:** O README ensina um compose, mas o procedimento real em Portainer pede campos ou variaveis diferentes. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]  
**Why it happens:** Portainer permite editar compose e env vars separadamente, o que facilita divergencia se houver duas narrativas. [CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add]  
**How to avoid:** Portainer deve apenas reaplicar o mesmo compose e as mesmas variaveis documentadas no guia canonico. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add]  
**Warning signs:** O doc de Portainer passa a ter YAML proprio ou lista de env vars diferente do README. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]

## Code Examples

Verified patterns from repo + official docs:

### Compose de deploy minimo

```yaml
# Source: compose.yaml + Phase 9 constraints
services:
  web:
    image: ghcr.io/henricos/ai-pkm:latest
    environment:
      APP_ROOT_PATH: /app
      PKM_PATH: /data/pkm
      INDEX_PATH: /data/index
      AUTH_USERNAME: ${AUTH_USERNAME}
      AUTH_PASSWORD: ${AUTH_PASSWORD}
      AUTH_TRUST_HOST: ${AUTH_TRUST_HOST:-true}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "${WEB_HOST_PORT:-3000}:3000"
    volumes:
      - type: bind
        source: ${PKM_HOST_PATH}
        target: /data/pkm
        read_only: true
      - type: bind
        source: ${INDEX_HOST_PATH}
        target: /data/index
        read_only: true
```

Esse snippet preserva o contrato de runtime existente e troca apenas a origem da imagem de `ai-pkm:local` para `ghcr.io/henricos/ai-pkm:latest`. [VERIFIED: compose.yaml][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][VERIFIED: .github/workflows/release-ghcr.yml]

### Ciclo minimo de update

```bash
# Source: Docker Compose CLI docs
docker compose pull
docker compose up -d
```

Esse e o menor fluxo coerente com DEP-01: baixar a imagem nova e reaplicar o projeto declarativo sem `git pull` no runtime. [VERIFIED: .planning/REQUIREMENTS.md][CITED: https://docs.docker.com/reference/cli/docker/compose/pull/][CITED: https://docs.docker.com/reference/cli/docker/compose/up/]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Validar/buildar imagem local e subir `ai-pkm:local` via compose | Consumir imagem publicada `ghcr.io/henricos/ai-pkm:latest` no guia de deploy | Phase 8 validada em 2026-04-14 | O README de deploy nao deve mais depender do build local do repo. [VERIFIED: compose.yaml][VERIFIED: .planning/PROJECT.md][VERIFIED: .planning/STATE.md][VERIFIED: .github/workflows/release-ghcr.yml] |
| Release e deploy descritos de forma separada mas sem handoff claro | Release doc aponta para deploy doc, e deploy doc assume imagem ja publicada | Phase 9 | Remove repeticao e deixa o operador saber quando parar no release guide e quando entrar no deploy guide. [VERIFIED: docs/release-semver-ghcr.md][VERIFIED: .planning/ROADMAP.md] |
| Portainer como detalhe implícito do ambiente atual | Portainer como adaptador opcional do mesmo compose | Phase 9 | Fecha DEP-02 sem poluir a documentacao publica principal. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add] |

**Deprecated/outdated:**
- Usar o `README.md` atual como unica entrada para deploy de servidor esta desatualizado para a `v2.1`, porque ele ancora o leitor em “validacao do artefato Docker” e nao em “consumo da imagem publicada”. [VERIFIED: README.md][VERIFIED: .planning/PROJECT.md]

## Assumptions Log

Nenhuma. Todas as afirmacoes desta pesquisa foram verificadas no repositório ou citadas de documentacao oficial. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]

## Open Questions (RESOLVED)

1. **RESOLVED: Portainer fica em doc proprio ou apenas uma secao curta no guia de deploy?**
   - What we know: O README nao pode citar Portainer, mas o boundary da fase inclui o redeploy real via Portainer no servidor atual. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
   - Resolution: Portainer fica em um guia curto e secundario, derivado do compose canonico, sem contaminar o `README.md` nem virar a documentacao publica principal. Isso fecha DEP-02 sem criar segunda fonte de verdade. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
   - Planning impact: criar uma ponte operacional curta para Portainer, sempre reaplicando o mesmo compose e as mesmas env vars do guia canônico. [CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add]

2. **RESOLVED: O template `.env.compose.example` deve ser reutilizado ou apenas citado?**
   - What we know: O arquivo atual e funcional, mas usa `NEXTAUTH_URL=http://localhost:3000`, valor adequado para validacao local e potencialmente enganoso para deploy de servidor. [VERIFIED: .env.compose.example][VERIFIED: docs/docker-validation.md]
   - Resolution: `.env.compose.example` permanece como artefato do fluxo de validacao local da Phase 7 e deve ser apenas citado como referencia estrutural, nao copiado como template canonico de deploy do servidor atual. O guia de deploy da Phase 9 deve mostrar os nomes das env vars e instruir o operador a preencher valores reais do seu host/URL. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md][VERIFIED: docs/docker-validation.md]
   - Planning impact: nao editar `.env.compose.example` por padrao; documentar explicitamente no guia novo que os valores de servidor devem ser preenchidos fora do repo, especialmente `NEXTAUTH_URL`. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
   - What's unclear: Se vale normalizar o exemplo para um host generico ou manter o template restrito ao fluxo local da Phase 7. [VERIFIED: README.md][VERIFIED: docs/docker-validation.md]
   - Recommendation: O planner deve decidir explicitamente entre “manter template local e usar bloco inline no novo guia” ou “tornar o template neutro”; nao deixar isso implícito. [VERIFIED: .env.compose.example]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Docker Engine / `docker compose` | Validacao local real do fluxo de deploy | ✗ | — | Planejar a fase como atualizacao documental sem exigir execucao local do runtime neste workspace. [VERIFIED: local command `docker`] |
| Node.js | Leitura do repo e validacao geral do projeto | ✓ | v24.14.1 | — [VERIFIED: local command `node --version`] |
| npm | Scripts de verificacao existentes (`test`, `typecheck`, `build`) | ✓ | 11.11.0 | — [VERIFIED: local command `npm --version`] |
| Portainer server atual | Confirmacao do passo a passo exato do ambiente produtivo | ? | — | Basear o planejamento na documentacao oficial de Stacks e manter a parte Portainer curta e nao prescritiva alem do necessario. [CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add] |

**Missing dependencies with no fallback:**
- Nenhum para produzir a documentacao da fase. [VERIFIED: .planning/ROADMAP.md]

**Missing dependencies with fallback:**
- Docker local ausente; o planner deve evitar prometer smoke test ou validacao runtime nesta fase, o que ja esta alinhado ao escopo travado. [VERIFIED: local command `docker`][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 com `jsdom`. [VERIFIED: package.json][VERIFIED: vitest.config.ts] |
| Config file | `vitest.config.ts`. [VERIFIED: vitest.config.ts] |
| Quick run command | `npm test`. [VERIFIED: package.json] |
| Full suite command | `npm test && npm run typecheck && npm run build`. [VERIFIED: package.json][VERIFIED: docs/release-semver-ghcr.md] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEP-01 | Docs ensinam update por imagem publicada, sem `git pull` no runtime. | manual doc review | — | ❌ Wave 0 docs update. [VERIFIED: .planning/REQUIREMENTS.md] |
| DEP-02 | Docs preservam env vars e mounts externos de `pkm` + `index` no redeploy atual. | manual doc review | — | ❌ Wave 0 docs update. [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: compose.yaml] |
| DEP-03 | Repo passa a ter fluxo minimo claro entre release e redeploy atual. | manual doc review | — | ❌ Wave 0 docs update. [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: README.md] |

### Sampling Rate

- **Per task commit:** `npm test` quando houver toque acidental em arquivos de app; para docs puras, revisar links e snippets. [VERIFIED: package.json]
- **Per wave merge:** `npm test && npm run typecheck` se houver mudanca em arquivos versionados fora de `docs/`; para docs-only, validar coerencia editorial cruzada entre `README.md` e `docs/`. [VERIFIED: package.json]
- **Phase gate:** Revisao manual dos docs contra os requisitos DEP e os arquivos `compose.yaml`, `.env.compose.example` e `src/lib/env.ts`. [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: compose.yaml][VERIFIED: .env.compose.example][VERIFIED: src/lib/env.ts]

### Wave 0 Gaps

- Nenhum gap de framework; a lacuna e documental, nao de infraestrutura de testes. [VERIFIED: package.json][VERIFIED: vitest.config.ts]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Exigir `AUTH_USERNAME`, `AUTH_PASSWORD` e `NEXTAUTH_URL` corretos no compose documentado. [VERIFIED: compose.yaml][VERIFIED: src/lib/env.ts] |
| V3 Session Management | yes | `NEXTAUTH_SECRET` minimo de 32 chars e URL base coerente com o ambiente publicado. [VERIFIED: src/lib/env.ts][VERIFIED: docs/dev-setup.md] |
| V4 Access Control | yes | A app continua single-user autenticada; o guia deve parar na tela de login e nao instruir bypass de auth. [VERIFIED: .planning/PROJECT.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md] |
| V5 Input Validation | yes | `src/lib/env.ts` faz fail-fast para paths absolutos e env vars obrigatorias. [VERIFIED: src/lib/env.ts] |
| V6 Cryptography | yes | `NEXTAUTH_SECRET` aleatorio >= 32 chars; nao documentar valores previsiveis. [VERIFIED: src/lib/env.ts][VERIFIED: docs/dev-setup.md] |

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secret acidentalmente commitado em exemplo ou README | Information Disclosure | Usar placeholders, mandar copiar para arquivo local e manter segredos fora do repo. [VERIFIED: .env.compose.example][VERIFIED: docs/dev-setup.md] |
| `NEXTAUTH_URL` incorreto no ambiente publicado | Spoofing / Session Issues | Exigir no guia que a URL reflita o host/porta reais do servidor. [VERIFIED: src/lib/env.ts][VERIFIED: docs/dev-setup.md] |
| Montagem errada ou ausente de `pkm` / `index` | Availability | Declarar pre-requisitos de paths absolutos e manter binds explicitos no compose. [VERIFIED: compose.yaml][VERIFIED: src/lib/env.ts] |
| Drift entre YAML e env vars no Portainer | Tampering / Misconfiguration | Reusar o mesmo compose e a mesma lista de variaveis, deixando Portainer apenas injetar valores externos. [CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add] |

## Likely Write Targets

- `README.md` para trocar a entrada “validacao do artefato Docker” por quickstart de deploy/update via imagem publicada. [VERIFIED: README.md]
- `docs/deploy-compose-ghcr.md` como novo guia canônico detalhado de install/start/update/access ate a tela de login. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- `docs/docker-validation.md` para reforcar que ele continua sendo apenas validacao local da imagem buildada no repo e linkar para o novo guia de deploy. [VERIFIED: docs/docker-validation.md]
- `docs/release-semver-ghcr.md` para adicionar handoff curto do tipo “apos publicar, siga o guia de deploy/update”. [VERIFIED: docs/release-semver-ghcr.md]
- `.env.compose.example` e possivelmente `compose.yaml` sao alvos condicionais; so devem ser tocados se o planner decidir resolver explicitamente a ambiguidade entre exemplos locais e de deploy. [VERIFIED: .env.compose.example][VERIFIED: compose.yaml]

## Recommended Plan Slices

1. **Slice 1 — Canonicalizar o deploy/update por compose.** Atualizar `README.md` e criar um guia dedicado em `docs/` com pre-requisitos (`pkm` + `index` + env vars), `compose.yaml` inline usando `ghcr.io/henricos/ai-pkm:latest`, comandos de start/update e encerramento na tela de login. Isso cobre o nucleo de DEP-01 e DEP-03. [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
2. **Slice 2 — Reconciliar docs adjacentes e fechar a ponte com o ambiente atual.** Ajustar `docs/docker-validation.md` e `docs/release-semver-ghcr.md` para apontarem ao novo guia e, se necessario, incluir uma secao curta de Portainer derivada do mesmo compose para satisfazer DEP-02 sem duplicar a fonte de verdade. [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: docs/docker-validation.md][VERIFIED: docs/release-semver-ghcr.md][CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add]

## Sources

### Primary (HIGH confidence)
- `.planning/phases/09-portainer-deployment-flow/09-CONTEXT.md` - decisoes travadas, boundary, discretion e deferred items. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- `.planning/PROJECT.md` - estado do milestone `v2.1`, objetivo operacional e decisoes centrais. [VERIFIED: .planning/PROJECT.md]
- `.planning/REQUIREMENTS.md` - DEP-01, DEP-02 e DEP-03. [VERIFIED: .planning/REQUIREMENTS.md]
- `README.md`, `compose.yaml`, `.env.compose.example`, `docs/docker-validation.md`, `docs/release-semver-ghcr.md`, `docs/dev-setup.md` - superficie documental e contrato atual de runtime. [VERIFIED: README.md][VERIFIED: compose.yaml][VERIFIED: .env.compose.example][VERIFIED: docs/docker-validation.md][VERIFIED: docs/release-semver-ghcr.md][VERIFIED: docs/dev-setup.md]
- `.github/workflows/release-ghcr.yml` - nome canônico da imagem e tags publicadas. [VERIFIED: .github/workflows/release-ghcr.yml]
- `src/lib/env.ts` - fail-fast de `INDEX_PATH`, `NEXTAUTH_URL`, segredos e paths absolutos. [VERIFIED: src/lib/env.ts]

### Secondary (MEDIUM confidence)
- Docker Compose file reference - Compose Specification como formato recomendado. [CITED: https://docs.docker.com/compose/compose-file/]
- Docker Compose application model - `compose.yaml` como modelo declarativo do runtime. [CITED: https://docs.docker.com/compose/intro/compose-application-model/]
- `docker compose pull` - fluxo oficial de pull de imagens declaradas no compose. [CITED: https://docs.docker.com/reference/cli/docker/compose/pull/]
- `docker compose up` - recriacao do container quando imagem/config mudam, preservando mounts. [CITED: https://docs.docker.com/reference/cli/docker/compose/up/]
- Portainer Stacks add - Web editor/upload, variaveis externas e reaplicacao de stack. [CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add]

### Tertiary (LOW confidence)
- Nenhuma. [VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - o contrato tecnico principal esta no repo e foi complementado por docs oficiais de Docker/Portainer. [VERIFIED: compose.yaml][VERIFIED: .github/workflows/release-ghcr.yml][CITED: https://docs.docker.com/compose/compose-file/][CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add]
- Architecture: HIGH - a divisao README/doc dedicada emerge diretamente das decisoes travadas e da sobreposicao observada nos docs atuais. [VERIFIED: README.md][VERIFIED: docs/docker-validation.md][VERIFIED: docs/release-semver-ghcr.md][VERIFIED: .planning/phases/09-portainer-deployment-flow/09-CONTEXT.md]
- Pitfalls: MEDIUM - os riscos de drift documental e de configuracao sao bem suportados pelo repo, mas o comportamento exato do servidor atual via Portainer nao foi observado diretamente neste workspace. [VERIFIED: compose.yaml][VERIFIED: src/lib/env.ts][CITED: https://docs.portainer.io/2.33-lts/user/docker/stacks/add]

**Research date:** 2026-04-14  
**Valid until:** 2026-05-14
