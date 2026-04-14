# Phase 8: SemVer Release Pipeline - Research

**Researched:** 2026-04-14
**Domain:** release SemVer do app Node/web + publicação automatizada de imagem Docker no GHCR por tag Git
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Politica de origem da release
- **D-01:** Release oficial so pode nascer de `main`.
- **D-02:** O fluxo de release parte de working tree limpa; isso deve aparecer como precondicao operacional explicita.
- **D-03:** O mecanismo oficial de bump e release e `npm version patch|minor|major`.
- **D-04:** A publicacao deve ser disparada pelo push do commit e da tag de release correspondente, mantendo o Git como fonte auditavel da versao.

### Identidade canonica da imagem
- **D-05:** O nome canonico da imagem publicada no GHCR sera `ghcr.io/henricos/ai-pkm`.
- **D-06:** A estrategia de tags obrigatoria para a fase e publicar pelo menos `vX.Y.Z` e `latest`.

### Contrato de rastreabilidade
- **D-07:** Cada release deve permanecer rastreavel entre versao do `package.json`, tag Git `vX.Y.Z` e imagem publicada no GHCR.
- **D-08:** A imagem publicada deve carregar metadados OCI obrigatorios, no minimo `org.opencontainers.image.version`, `org.opencontainers.image.revision` e `org.opencontainers.image.source`.
- **D-09:** O produto deve continuar exibindo versao da app e hash curto do build/commit para conferencia operacional.

### Superficie operacional da release
- **D-10:** O fluxo canonicamente documentado continua sendo nativo e curto: validar precondicoes, executar `npm version ...` e publicar com push da tag correspondente.
- **D-11:** O repositorio deve registrar um checklist operacional curto e explicito para reduzir erro humano na hora de fechar a release.
- **D-12:** Se houver automacao guiada para esse fluxo, a preferencia arquitetural do projeto e por uma skill, nao por wrapper script proprietario.
- **D-13:** Qualquer skill futura de release deve orquestrar os comandos canonicos, nao substitui-los como mecanismo de verdade.

### Claude's Discretion
- Forma exata de validar que a tag publicada aponta para commit pertencente a `main`, desde que a politica de release continue bloqueando releases fora da linha oficial.
- Estrutura exata do workflow no GitHub Actions, desde que ele seja disparado por tag de release e publique a imagem canonica no GHCR.
- Forma exata de injetar e propagar o hash de commit para labels OCI e para o build da app, desde que a rastreabilidade final continue verificavel.
- Local e formato do checklist operacional, desde que ele fique claro e coerente com a politica IA-agnostica do repositorio.

### Deferred Ideas (OUT OF SCOPE)
- Automatizar deploy remoto ou redeploy no Portainer a partir do CI — escopo da Phase 9 ou futuro.
- Criar canais adicionais de release alem de `latest` e `vX.Y.Z`, como `stable`, `beta` ou tags por ambiente — fora do escopo da fase.
- Introduzir wrapper script proprietario para release — explicitamente nao preferido; se houver camada guiada, ela deve ser skill.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VER-01 | Projeto expõe versao de aplicativo em SemVer completo no ecossistema Node/web. | `package.json` ja carrega `2.0.0` e a UI ja exibe `npm_package_version`; a fase precisa preservar isso e amarrar a versao ao tag `vX.Y.Z`. [VERIFIED: package.json] [VERIFIED: src/app/(auth)/login/page.tsx] |
| VER-02 | Operador consegue fechar uma release com `npm version patch|minor|major`, gerando o bump de versao do projeto, o commit de release e a tag Git correspondente. | O comando oficial continua sendo `npm version`; a pesquisa confirma working tree limpa, commit e tag Git como comportamento nativo. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] |
| VER-03 | Cada release publicada permanece rastreavel entre versao do app, tag Git e tag imutavel da imagem. | A recomendacao liga `package.json`, tag `vX.Y.Z`, labels OCI obrigatorios e o hash exibido na UI. [VERIFIED: package.json] [VERIFIED: next.config.ts] [VERIFIED: src/app/(auth)/login/page.tsx] [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md] |
| PUB-01 | Push de tag Git de release dispara automaticamente um workflow de publicacao no GitHub Actions. | O gatilho padrao e `on.push.tags` com filtro SemVer. [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows] |
| PUB-02 | Workflow de publicacao executa o build da imagem Docker em GitHub-hosted runner Ubuntu. | O padrao oficial usa job em `ubuntu-latest` com `docker/setup-buildx-action` e `docker/build-push-action`. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] [CITED: https://github.com/marketplace/actions/docker-setup-buildx] |
| PUB-03 | Workflow publica a imagem da aplicacao no GitHub Container Registry como imagem publica. | O GHCR aceita publicacao via `GITHUB_TOKEN` para pacote associado ao repositorio, mas o primeiro publish nasce privado e precisa de ajuste de visibilidade. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] |
| PUB-04 | Cada release publicada recebe pelo menos as tags de imagem `vX.Y.Z` e `latest`. | `docker/metadata-action` suporta tags derivadas de SemVer e gera `latest` em modo automatico para eventos de tag/semver. [CITED: https://github.com/docker/metadata-action] |
</phase_requirements>

## Summary

Esta fase nao precisa introduzir um sistema de release novo; ela precisa fechar o circuito entre artefatos que ja existem: `package.json` em `2.0.0`, `Dockerfile` distribuivel, exibicao de versao/hash na UI e contrato Docker validado na Phase 7. [VERIFIED: package.json] [VERIFIED: Dockerfile] [VERIFIED: src/app/(auth)/login/page.tsx] [VERIFIED: docs/docker-validation.md]

O stack padrao para planejar bem a fase e: `npm version` como mecanismo canonico de bump/commit/tag, um workflow de GitHub Actions disparado apenas por push de tag `v*.*.*`, publicacao no GHCR com `GITHUB_TOKEN`, e geracao de tags/labels via `docker/metadata-action` + `docker/build-push-action`. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows] [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] [CITED: https://github.com/docker/metadata-action]

O principal risco de planejamento nao e tecnico de build; e operacional de rastreabilidade. O plano precisa tratar explicitamente: precondicao de working tree limpa, bloqueio de release fora de `main`, correspondencia exata entre `package.json` e tag `vX.Y.Z`, labels OCI obrigatorios, visibilidade publica do pacote no GHCR, e checklist curto para o operador nao esquecer o push da tag. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md] [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]

**Primary recommendation:** Planejar a fase como um workflow enxuto em `.github/workflows/` mais um checklist operacional documentado, sem wrapper script; se houver camada guiada futura, ela deve ser skill que orquestra `npm version` + `git push --follow-tags`. [VERIFIED: AGENTS.md] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]

## User Constraints

As decisoes travadas exigem que o planner trate `npm version` como mecanismo de verdade, `main` como unica origem valida, `ghcr.io/henricos/ai-pkm` como nome canonico da imagem, e `vX.Y.Z` + `latest` como conjunto minimo de tags. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]

## Project Constraints (from AGENTS.md)

- O repositório usa SDD/GSD; a fase deve continuar alinhada a spec e não pode inventar um fluxo fora desse ciclo. [VERIFIED: AGENTS.md]
- Conteúdo escrito e comunicação devem permanecer em `pt-BR`, enquanto nomes de arquivos técnicos e estrutura continuam em inglês. [VERIFIED: AGENTS.md]
- Commits nunca são automáticos; qualquer commit futuro de execução precisará de aprovação explícita e uso da skill `/commit-push`. [VERIFIED: AGENTS.md]
- A estratégia do projeto é IA-agnóstica; se a fase ganhar superfície guiada de release, a preferência arquitetural é por skill, não por wrapper script proprietário. [VERIFIED: AGENTS.md] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]
- O `pkm` continua externo e não pode entrar na imagem; a pipeline desta fase deve buildar o `Dockerfile` já validado sem reabrir o contrato de empacotamento da Phase 7. [VERIFIED: AGENTS.md] [VERIFIED: Dockerfile] [VERIFIED: docs/docker-validation.md]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| npm CLI | `npm version` documentado em CLI v11; ambiente local auditado com `11.11.0`. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | Bump SemVer, commit de release e tag Git. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] | Ja e a decisao travada do projeto e elimina necessidade de toolchain adicional. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] |
| GitHub Actions `push.tags` | Sintaxe atual de workflow do GitHub Actions. [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows] | Disparar a publicação apenas quando uma tag de release SemVer for enviada. [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows] | Atende diretamente `PUB-01` e preserva Git como fonte auditável da release. [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows] [VERIFIED: .planning/REQUIREMENTS.md] |
| GHCR (`ghcr.io/henricos/ai-pkm`) | Registry atual do GitHub Packages. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] | Hospedar a imagem pública da aplicação. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] | O contexto da fase já travou o nome canônico e o roadmap da `v2.1` assume GHCR como canal inicial. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] [VERIFIED: .planning/ROADMAP.md] |
| Dockerfile existente | Multi-stage Node 22 Alpine já presente no repo. [VERIFIED: Dockerfile] | Artefato a ser buildado e publicado pelo CI. [VERIFIED: Dockerfile] | Reusar o `Dockerfile` atual evita redesenhar packaging numa fase de release. [VERIFIED: Dockerfile] [VERIFIED: docs/docker-validation.md] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `actions/checkout` | `v6.0.1` (latest release em 2025-12-02). [CITED: https://github.com/actions/checkout/releases] | Fazer checkout do commit/tag que disparou a release. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] | Sempre no job de publicação; usar `fetch-depth: 0` se o plano incluir guarda de ancestralidade em `main`. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] [ASSUMED] |
| `docker/login-action` | `3.6.0` (latest visível no package page). [CITED: https://github.com/orgs/docker/packages/container/package/login-action] | Login no `ghcr.io` usando `GITHUB_TOKEN`. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] | Sempre antes do push da imagem. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] |
| `docker/setup-buildx-action` | `v3.11.1` no marketplace observado. [CITED: https://github.com/marketplace/actions/docker-setup-buildx] | Habilitar Buildx/BuildKit no runner Ubuntu. [CITED: https://github.com/marketplace/actions/docker-setup-buildx] | Use em qualquer workflow que faça build/push via `docker/build-push-action`. [CITED: https://github.com/marketplace/actions/docker-setup-buildx] |
| `docker/metadata-action` | `v5.9.0` (release de 2025-11-04). [CITED: https://github.com/docker/metadata-action/releases] | Gerar tags e labels OCI consistentes a partir da tag Git. [CITED: https://github.com/docker/metadata-action] | Use para derivar `vX.Y.Z`, `latest` e labels OCI sem shell ad hoc. [CITED: https://github.com/docker/metadata-action] |
| `docker/build-push-action` | Linha estável `v6`. [CITED: https://github.com/marketplace/actions/docker-compose-build-a-service-push-action] | Buildar e publicar a imagem no GHCR. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] | Sempre no passo final do workflow de release. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `npm version` | `semantic-release` ou `release-it` | Reintroduz heurística e automação extra onde o projeto já travou `npm version` como mecanismo canônico. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] |
| `docker/metadata-action` | Shell próprio para calcular tags/labels | Piora manutenção e aumenta chance de drift entre tag Git, labels OCI e tags do registry. [CITED: https://github.com/docker/metadata-action] [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md] |
| Workflow por tag Git | Workflow por push em `main` | Quebra o requisito de publication by release tag e reduz auditabilidade da versão publicada. [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] |
| Skill futura de release | Wrapper script proprietário | O projeto explicitamente prefere skill orquestradora se houver camada guiada. [VERIFIED: AGENTS.md] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] |

**Installation:**

```bash
# Nenhuma dependência npm nova é obrigatória nesta fase.
# A implementação padrão é um workflow em .github/workflows/ + documentação operacional.
```

**Version verification:** Não há pacote npm novo obrigatório para recomendar nesta fase; o stack padrão reaproveita `npm version`, `GitHub Actions`, `Dockerfile` existente e actions oficiais. [VERIFIED: package.json] [VERIFIED: Dockerfile] [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images]

## Architecture Patterns

### Recommended Project Structure

```text
.github/
└── workflows/
    └── release-ghcr.yml      # workflow por tag Git para build/push no GHCR

docs/
└── release-checklist.md      # checklist operacional curto da release

src/__tests__/
├── release-workflow.test.ts  # contrato do workflow
└── release-traceability.test.ts
                           # contrato entre tag, labels OCI e exibicao de versao/hash
```

Essa estrutura separa claramente a automação do CI, o procedimento do operador e os testes de contrato da fase. [VERIFIED: .planning/ROADMAP.md] [VERIFIED: docs/docker-validation.md] [VERIFIED: vitest.config.ts]

### Pattern 1: Workflow dirigido por tag de release

**What:** Publicar apenas em `push` de tag `v*.*.*`, em vez de reagir a qualquer push em branch. [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows]

**When to use:** Sempre para a release oficial desta fase, porque `PUB-01` e `D-04` exigem push da tag correspondente como gatilho. [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]

**Example:**

```yaml
# Source: GitHub Docs + constraints da fase
on:
  push:
    tags:
      - "v*.*.*"

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
```

Esse formato deriva diretamente do padrão documentado pelo GitHub para `push.tags` e do exemplo oficial de publicação de imagem com `packages: write`. [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows] [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images]

### Pattern 2: Metadata-first para tags e labels OCI

**What:** Centralizar a derivação de tags (`vX.Y.Z`, `latest`) e labels (`org.opencontainers.image.*`) em `docker/metadata-action`. [CITED: https://github.com/docker/metadata-action] [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md]

**When to use:** Sempre que a imagem precisar sair do workflow já com rastreabilidade verificável. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]

**Example:**

```yaml
# Source: docker/metadata-action + OCI annotations
- id: meta
  uses: docker/metadata-action@v5
  with:
    images: ghcr.io/henricos/ai-pkm
    tags: |
      type=semver,pattern={{version}}
    flavor: |
      latest=auto
```

O `type=semver` produz a tag de versão e o `latest=auto` cobre o ponteiro `latest` para eventos de tag/semver. [CITED: https://github.com/docker/metadata-action]

### Pattern 3: Verificação explícita de rastreabilidade antes do push

**What:** Falhar cedo se a tag Git e a versão do `package.json` divergirem, e propagar o SHA curto do commit para labels OCI e para a UI já existente. [VERIFIED: package.json] [VERIFIED: next.config.ts] [VERIFIED: src/app/(auth)/login/page.tsx] [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md]

**When to use:** No mesmo job de publicação, antes do `docker/build-push-action`. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images]

**Example:**

```yaml
# Source: package.json local + OCI labels
- name: Assert tag matches package version
  run: test "v$(node -p "require('./package.json').version")" = "${GITHUB_REF_NAME}"
```

Esse guard reduz a chance de publicar imagem cuja tag Git não corresponde à versão do app exibida na aplicação. [VERIFIED: package.json] [VERIFIED: src/app/(auth)/login/page.tsx] [ASSUMED]

### Anti-Patterns to Avoid

- **Tag manual solta fora de `npm version`:** cria drift entre `package.json`, commit e tag Git. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]
- **Publicar por push em branch:** atende mal `PUB-01` e dificulta auditar qual tag gerou a imagem. [VERIFIED: .planning/REQUIREMENTS.md]
- **Usar PAT clássico quando `GITHUB_TOKEN` basta:** amplia a superfície de segredo sem necessidade para pacote ligado ao próprio repositório. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]
- **Criar wrapper shell como mecanismo oficial da release:** contraria a preferência do projeto por comandos nativos e, se houver camada guiada, por skill. [VERIFIED: AGENTS.md] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cálculo de tags e labels | Shell script com parsing de SemVer | `docker/metadata-action` | A action já sabe derivar tags e labels a partir do ref Git e reduz lógica manual sujeita a drift. [CITED: https://github.com/docker/metadata-action] |
| Login no registry | `echo $TOKEN | docker login ...` espalhado em shell | `docker/login-action` + `GITHUB_TOKEN` | O padrão oficial do GitHub usa a action de login com token do workflow. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] |
| Build/push da imagem | Bash chamando `docker build` e `docker push` sem integração de outputs | `docker/build-push-action` | A action integra tags/labels vindos do metadata step e é o caminho mostrado na documentação oficial. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] |
| Automação canônica de release | Script proprietário `scripts/release.sh` | `npm version` + checklist documentado; skill opcional futura | O projeto quer comandos auditáveis como fonte de verdade e só aceita camada guiada como orquestração, não substituição. [VERIFIED: AGENTS.md] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] |

**Key insight:** O que parece “simples” nesta fase não é o build Docker, e sim manter coerência entre Git, UI, OCI labels e GHCR; usar as actions oficiais elimina boa parte desse risco sem aumentar a superfície operacional. [VERIFIED: Dockerfile] [VERIFIED: next.config.ts] [VERIFIED: src/app/(auth)/login/page.tsx] [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md]

## Common Pitfalls

### Pitfall 1: Working tree suja no `npm version`

**What goes wrong:** O release falha antes do bump ou gera artefatos inesperados se o operador tentar versionar com mudanças locais pendentes. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/]

**Why it happens:** O `npm version` exige working directory limpa antes de começar. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/]

**How to avoid:** Colocar “working tree limpa” como precondição explícita no checklist e, se a fase incluir skill futura, validar isso antes de chamar `npm version`. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]

**Warning signs:** `git status --short` com saída não vazia ou operador tentando fechar release em cima de mudanças não commitadas. [VERIFIED: git status --short]

### Pitfall 2: Workflow publica imagem mas o pacote nasce privado

**What goes wrong:** A publicação tecnicamente funciona, mas a imagem não fica consumível anonimamente porque o primeiro publish no GHCR nasce privado. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]

**Why it happens:** O GHCR define visibilidade inicial privada no primeiro publish. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]

**How to avoid:** Incluir no plano um passo explícito de validação/ajuste da visibilidade do pacote após o primeiro publish, ou verificar se ele já existe como público antes de encerrar a fase. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]

**Warning signs:** `docker pull ghcr.io/henricos/ai-pkm:latest` exige autenticação mesmo após publish “bem-sucedido”. [CITED: https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages]

### Pitfall 3: `GITHUB_TOKEN` não consegue publicar em pacote GHCR já existente

**What goes wrong:** O workflow falha no push mesmo com `packages: write`. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]

**Why it happens:** Se o pacote no namespace já foi publicado antes e não está ligado ao repositório, o `GITHUB_TOKEN` pode não ter permissão de push. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]

**How to avoid:** Verificar antes do rollout se `ghcr.io/henricos/ai-pkm` já existe e está conectado ao repositório; se não estiver, conectar ou recriar o pacote de forma controlada. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]

**Warning signs:** Erros de autorização no passo `docker/build-push-action` apesar de `docker/login-action` ter autenticado com sucesso. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images]

### Pitfall 4: Drift entre `package.json`, tag Git e imagem publicada

**What goes wrong:** A UI mostra uma versão, a tag Git aponta outra, e a imagem no GHCR recebe nome correto mas sem prova robusta de origem. [VERIFIED: package.json] [VERIFIED: src/app/(auth)/login/page.tsx]

**Why it happens:** Falta de guarda explícita no workflow e ausência de labels OCI mínimos. [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md]

**How to avoid:** Fazer assertion `package.json == GITHUB_REF_NAME sem prefixo v`, publicar `org.opencontainers.image.version`, `org.opencontainers.image.revision` e `org.opencontainers.image.source`, e preservar o SHA curto já exposto pela UI. [VERIFIED: next.config.ts] [VERIFIED: src/app/(auth)/login/page.tsx] [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md] [ASSUMED]

**Warning signs:** Falta de labels na página do pacote, UI exibindo hash `dev`, ou tag de release que não acompanha a versão do app. [VERIFIED: next.config.ts] [VERIFIED: src/app/(auth)/login/page.tsx]

## Code Examples

Verified patterns from official sources:

### Trigger e permissões mínimas

```yaml
# Source: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images
permissions:
  contents: read
  packages: write
```

```yaml
# Source: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows
on:
  push:
    tags:
      - "v*.*.*"
```

### Login e publicação no GHCR

```yaml
# Source: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

```yaml
# Source: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images
- uses: docker/build-push-action@v6
  with:
    context: .
    file: ./Dockerfile
    push: true
```

### Checklist operacional do operador

```bash
git switch main
git pull --ff-only
git status --short
npm version patch
git push --follow-tags
```

Esse fluxo e coerente com `D-01`, `D-02`, `D-03` e `D-04`; o plano so precisa decidir onde documenta o checklist e como guarda a release fora de `main`. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] [ASSUMED]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Publicar por comando manual com PAT | Publicar no GHCR com `GITHUB_TOKEN` a partir do próprio workflow do repositório. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] | Atual nos docs do GitHub Packages. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] | Menos segredo manual e melhor vínculo pacote↔repositório. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] |
| Calcular tags e labels em shell | Derivar tags/labels por `docker/metadata-action`. [CITED: https://github.com/docker/metadata-action] | Linha atual da action `v5.9.0`. [CITED: https://github.com/docker/metadata-action/releases] | Menos lógica ad hoc e melhor suporte a SemVer/OCI. [CITED: https://github.com/docker/metadata-action] |
| Distribuir runtime por checkout Git no servidor | Distribuir por imagem Docker versionada e rastreável. [VERIFIED: .planning/PROJECT.md] | Direção consolidada no milestone `v2.1`. [VERIFIED: .planning/PROJECT.md] [VERIFIED: .planning/ROADMAP.md] | Prepara o Phase 9 para redeploy por pull de imagem em vez de `git pull` no runtime. [VERIFIED: .planning/REQUIREMENTS.md] |

**Deprecated/outdated:**

- Usar branch push como gatilho da release desta fase: fica abaixo do contrato atual e nao atende `PUB-01`. [VERIFIED: .planning/REQUIREMENTS.md]
- Tratar `latest` como unica tag confiavel: o contrato da fase exige tambem tag imutavel `vX.Y.Z`. [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Usar `fetch-depth: 0` + uma checagem Git de ancestralidade/contencao em `main` e a forma mais simples de implementar `D-01` no CI. [ASSUMED] | Architecture Patterns | Baixo: o requisito continua atendível por outro guard equivalente. |
| A2 | Um teste estático que compare `v$(package.json.version)` com a tag do workflow cobre a maior parte de `VER-03` antes da verificação manual no GHCR. [ASSUMED] | Validation Architecture | Médio: o plano pode precisar complementar com smoke manual pós-publish. |

## Open Questions (RESOLVED)

1. **O pacote `ghcr.io/henricos/ai-pkm` já existe e está ligado a este repositório?**
   - What we know: o nome canônico foi travado, mas não há workflow em `.github/workflows/` hoje e não há evidência local sobre estado do pacote no GHCR. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] [VERIFIED: ls -la .github/workflows 2>/dev/null || true]
   - What's unclear: se o primeiro publish será “greenfield” ou se haverá conflito de permissão/herança com pacote já existente. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]
   - Resolution: tratar o estado do pacote como pré-condição operacional explícita da fase, não como detalhe implícito. O plano passa a exigir um checkpoint humano bloqueante para confirmar existência, vínculo com o repositório e visibilidade pública do pacote após o primeiro publish, ajustando a visibilidade se necessário antes de encerrar `PUB-03`. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]

2. **Onde o checklist curto de release deve viver?**
   - What we know: a fase exige um checklist curto e explícito, mas a localização ficou em aberto. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]
   - What's unclear: se o melhor encaixe é `README.md`, `docs/release-checklist.md` ou ambos. [ASSUMED]
   - Resolution: o checklist canônico desta fase fica em `docs/release-semver-ghcr.md`, com link curto a partir do `README.md`. Isso mantém o procedimento operacional editável sem inflar a narrativa principal do repositório. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-03-PLAN.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `npm version` local e checagens de versão no workflow/testes | ✓ [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | `v24.14.1` [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | — |
| npm | `npm version`, `npm test`, `npm run typecheck` | ✓ [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | `11.11.0` [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | — |
| Git | commit/tag local e guards de release | ✓ [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | `2.43.0` [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | — |
| Docker Engine | build local e paridade com publish | ✓ [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | `29.4.0` [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | — |
| Docker Compose | smoke local já documentado na Phase 7 | ✓ [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | `v5.1.1` [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] | — |
| GitHub Actions hosted runner | `PUB-02` | Não auditável localmente. [ASSUMED] | `ubuntu-latest` no plano recomendado. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] | Sem fallback real para cumprir `PUB-02`. [VERIFIED: .planning/REQUIREMENTS.md] |
| GHCR package permissions/visibility | `PUB-03`/`PUB-04` | Não auditável localmente. [ASSUMED] | — | Exige checagem manual no GitHub após o primeiro publish. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] |

**Missing dependencies with no fallback:**

- Nenhuma ferramenta local bloqueante foi encontrada; o ponto potencialmente bloqueante está fora da máquina local e é o estado do pacote/permissões no GHCR. [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version] [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry]

**Missing dependencies with fallback:**

- Nenhuma. [VERIFIED: command -v node && node --version && command -v npm && npm --version && command -v git && git --version && command -v docker && docker --version && command -v docker && docker compose version]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4` em `jsdom`. [VERIFIED: package.json] [VERIFIED: vitest.config.ts] |
| Config file | `vitest.config.ts`. [VERIFIED: vitest.config.ts] |
| Quick run command | `npm test -- src/__tests__/release-workflow.test.ts`. [ASSUMED] |
| Full suite command | `npm test && npm run typecheck`. [VERIFIED: package.json] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VER-01 | `package.json` segue SemVer completo e a UI continua expondo versão/hash. [VERIFIED: package.json] [VERIFIED: src/app/(auth)/login/page.tsx] | unit/static | `npm test -- src/__tests__/release-traceability.test.ts` [ASSUMED] | ❌ Wave 0 |
| VER-02 | O fluxo canônico continua sendo `npm version patch|minor|major` com commit/tag. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] | manual smoke | `npm version patch` em clone/branch descartável com working tree limpa. [ASSUMED] | ❌ Wave 0 |
| VER-03 | Tag Git, versão do app e metadata OCI permanecem coerentes. [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md] [VERIFIED: next.config.ts] | unit/static + manual smoke | `npm test -- src/__tests__/release-traceability.test.ts` [ASSUMED] | ❌ Wave 0 |
| PUB-01 | Push de tag `vX.Y.Z` dispara o workflow. [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows] | unit/static | `npm test -- src/__tests__/release-workflow.test.ts` [ASSUMED] | ❌ Wave 0 |
| PUB-02 | Workflow usa runner Ubuntu e builda via actions oficiais. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] | unit/static | `npm test -- src/__tests__/release-workflow.test.ts` [ASSUMED] | ❌ Wave 0 |
| PUB-03 | Workflow autentica e publica no GHCR como imagem pública. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] | unit/static + manual smoke | `npm test -- src/__tests__/release-workflow.test.ts` [ASSUMED] | ❌ Wave 0 |
| PUB-04 | Imagem publicada recebe `vX.Y.Z` e `latest`. [CITED: https://github.com/docker/metadata-action] | unit/static + manual smoke | `npm test -- src/__tests__/release-workflow.test.ts` [ASSUMED] | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- src/__tests__/release-workflow.test.ts` depois `npm test -- src/__tests__/release-traceability.test.ts` quando existirem. [ASSUMED]
- **Per wave merge:** `npm test && npm run typecheck`. [VERIFIED: package.json]
- **Phase gate:** teste estático do workflow verde + smoke manual de release em tag real/descartável + verificação do pacote no GHCR. [ASSUMED]

### Wave 0 Gaps

- [ ] `src/__tests__/release-workflow.test.ts` — validar gatilho `push.tags`, runner Ubuntu, `packages: write`, imagem `ghcr.io/henricos/ai-pkm`, `docker/login-action`, `docker/metadata-action` e `docker/build-push-action`. [ASSUMED]
- [ ] `src/__tests__/release-traceability.test.ts` — validar coerência entre `package.json`, tags/labels esperados e exibição de versão/hash na UI. [ASSUMED]
- [ ] `docs/release-checklist.md` ou seção equivalente — necessária para fechar `D-10` e `D-11`. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]
- [ ] Smoke procedure documentado para `VER-02`/`PUB-03` — provavelmente em branch/tag descartável ou primeiro patch release real. [ASSUMED]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] | Autenticar no GHCR com `GITHUB_TOKEN` do workflow em vez de credencial fixa. [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] |
| V3 Session Management | no. [ASSUMED] | Não é fase de sessão web; o risco aqui é de token do CI, não de sessão do usuário. [ASSUMED] |
| V4 Access Control | yes. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] | Restringir origem oficial a `main`, workflow por tag e permissões mínimas `contents: read` + `packages: write`. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] |
| V5 Input Validation | yes. [ASSUMED] | Validar padrão da tag `v*.*.*` e correspondência com `package.json.version`. [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows] [ASSUMED] |
| V6 Cryptography | yes. [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md] | Confiar em hash Git, digest de imagem e tokens da plataforma; nunca inventar esquema de assinatura próprio. [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md] [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Push de tag maliciosa ou acidental fora da linha oficial | Tampering | Guard explícito de release a partir de `main` + checklist operacional obrigatório. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] [ASSUMED] |
| Token de CI com permissão excessiva | Elevation of Privilege | Usar somente `contents: read` e `packages: write`; evitar PAT quando `GITHUB_TOKEN` cobre o caso. [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images] [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] |
| Drift entre `latest` e release imutável | Repudiation | Publicar sempre `vX.Y.Z` e `latest`, tratando `vX.Y.Z` como referência auditável. [VERIFIED: .planning/REQUIREMENTS.md] |
| Imagem publicada sem prova de origem | Repudiation | Incluir `org.opencontainers.image.version`, `revision` e `source`. [CITED: https://github.com/opencontainers/image-spec/blob/main/annotations.md] |

## Sources

### Primary (HIGH confidence)

- `https://docs.npmjs.com/cli/v11/commands/npm-version/` - comportamento atual de `npm version`, pré-condição de working tree limpa e criação de commit/tag Git.
- `https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images` - padrão oficial de workflow para publicar imagem Docker com `packages: write`, `docker/login-action` e `docker/build-push-action`.
- `https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows` - sintaxe oficial para disparo por `push.tags`.
- `https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry` - autenticação no GHCR com `GITHUB_TOKEN`, visibilidade inicial privada, vínculo pacote↔repositório e labels suportados.
- `https://github.com/opencontainers/image-spec/blob/main/annotations.md` - chaves OCI predefinidas, incluindo `version`, `revision` e `source`.
- `package.json` - versão atual `2.0.0`, scripts de teste e typecheck.
- `Dockerfile` - artefato de imagem existente e contrato Node 22 Alpine / standalone / non-root.
- `next.config.ts` - injeção atual de `NEXT_PUBLIC_GIT_HASH`.
- `src/app/(auth)/login/page.tsx` - exibição atual de versão SemVer e hash curto.
- `docs/docker-validation.md` - contrato Docker validado na Phase 7.
- `vitest.config.ts` e `src/__tests__/container-packaging.test.ts` - base atual da arquitetura de testes.

### Secondary (MEDIUM confidence)

- `https://github.com/actions/checkout/releases` - release atual observada de `actions/checkout`.
- `https://github.com/docker/metadata-action/releases` - release atual observada de `docker/metadata-action`.
- `https://github.com/orgs/docker/packages/container/package/login-action` - versão atual observada de `docker/login-action`.
- `https://github.com/marketplace/actions/docker-setup-buildx` - versão atual observada de `docker/setup-buildx-action`.
- `https://github.com/marketplace/actions/docker-compose-build-a-service-push-action` - observação de que a linha estável do `docker/build-push-action` é `v6`.

### Tertiary (LOW confidence)

- Nenhuma fonte terciária foi necessária; os pontos de incerteza restantes são de estado externo do repositório/pacote e foram marcados em `Assumptions Log` ou `Open Questions`. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - o stack recomendado está fortemente ancorado em decisões já travadas e em docs oficiais do npm/GitHub/GHCR. [VERIFIED: .planning/phases/08-semver-release-pipeline/08-CONTEXT.md] [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] [CITED: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images]
- Architecture: MEDIUM-HIGH - a estrutura geral do workflow é bem suportada por docs oficiais; a guarda exata de “tag pertence a `main`” ainda é uma decisão de implementação. [CITED: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows] [ASSUMED]
- Pitfalls: HIGH - os principais riscos foram confirmados por docs do npm/GHCR e pelo estado real do repositório. [CITED: https://docs.npmjs.com/cli/v11/commands/npm-version/] [CITED: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry] [VERIFIED: package.json] [VERIFIED: Dockerfile]

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 para código local; 2026-04-21 para versões de actions e docs operacionais mais mutáveis.
