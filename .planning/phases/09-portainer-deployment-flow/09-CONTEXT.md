# Phase 9: Portainer Deployment Flow - Context

**Gathered:** 2026-04-14
**Status:** Amended after runtime validation feedback

<domain>
## Phase Boundary

Fechar o fluxo operacional minimo de atualizacao da aplicacao no servidor atual consumindo a imagem publica do GHCR, preservando configuracao externa e os mounts de `pkm` + `index`, e documentar esse procedimento de forma objetiva para operadores da aplicacao. A fase cobre como instalar/subir o container, como atualizar a imagem e como acessar a app ate a tela de login. Nao cobre automacao remota, rollback formal, testes operacionais guiados nem expansao de escopo para outras superficies de deploy.

</domain>

<decisions>
## Implementation Decisions

### Estrategia de imagem no deploy
- **D-01:** O procedimento oficial de deploy/update no servidor deve apontar para `ghcr.io/henricos/ai-pkm:latest`.
- **D-02:** As tags `vX.Y.Z` continuam existindo para rastreabilidade da release, mas nao sao a referencia principal no fluxo documentado de deploy.

### Superficie operacional documentada
- **D-03:** A documentacao publica e canonica de subida do container deve usar `docker compose`.
- **D-04:** O `README.md` deve ensinar um `compose.yaml` direto e padrao, sem citar Portainer.
- **D-05:** O deploy real via Portainer no ambiente atual continua dentro do boundary da fase, mas nao deve vazar para a documentacao publica principal.

### Pre-requisitos de dados montados
- **D-06:** Antes de subir o container, o operador precisa garantir que o repositorio `pkm` esteja disponivel no host no path que sera montado.
- **D-07:** Antes de subir o container, o operador precisa garantir que o diretorio `index/` deste repositorio `ai-pkm` esteja disponivel no host no path que sera montado.
- **D-08:** A documentacao deve tratar `pkm` + `index` como pre-requisitos explicitos do runtime, e nao como detalhe secundario ou passo opcional posterior.
- **D-09:** O fluxo documentado nao deve depender de `git pull` dentro do container.

### Escopo editorial da documentacao
- **D-10:** O `README.md` e os guias operacionais desta fase devem ser mais diretos e objetivos, no estilo de instrucoes padrao de imagem/container.
- **D-11:** A documentacao deve orientar instalacao, configuracao do `compose.yaml`, subida/atualizacao do container e como acessar a aplicacao ate a tela de login.
- **D-12:** A documentacao nao deve incluir smoke test formal, checklist de verificacao pos-deploy nem secao de rollback nesta fase.
- **D-13:** A documentacao operacional nao deve mencionar direcoes futuras do projeto que nao ajudem o operador imediato, incluindo referencias a migracao futura para banco.

### the agent's Discretion
- Estrutura exata dos docs entre `README.md` e arquivo dedicado em `docs/`, desde que o `README.md` fique direto e a superficie canonica permaneça `docker compose`.
- Forma exata do exemplo de `compose.yaml`, desde que preserve `latest`, mounts externos e env vars obrigatorias.
- Nivel de detalhamento da secao de acesso inicial, desde que termine claramente em "abra a app e chegue na tela de login".

</decisions>

<specifics>
## Specific Ideas

- O usuario quer que a documentacao publica pareca instrucao padrao de distribuicao de container, como em pagina de Docker Hub.
- O usuario quer `docker compose` como superficie principal porque ha varias env vars e montagem de volumes.
- O usuario explicitou que `pkm` e `index` precisam aparecer como pre-requisitos claros antes de subir o container.
- O usuario nao quer orientacao de teste pos-instalacao; basta ensinar a subir a app e chegar na tela de login.
- O usuario nao quer expor na documentacao operacional intencoes futuras do projeto, como eventual uso de banco.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and milestone scope
- `.planning/PROJECT.md` — contexto do milestone `v2.1` e objetivo de atualizar a app por pull de imagem e redeploy preservando configuracao externa.
- `.planning/REQUIREMENTS.md` — requisitos `DEP-01`, `DEP-02` e `DEP-03` mapeados para esta fase.
- `.planning/ROADMAP.md` — boundary e criterios de sucesso da Phase 9.
- `.planning/STATE.md` — estado atual do milestone com foco explicitamente movido para deploy via Docker + Portainer.

### Prior decisions that constrain Phase 9
- `.planning/phases/07-container-packaging-foundation/07-CONTEXT.md` — contrato do container, mounts externos de `pkm` + `index` e uso de `docker compose` como runtime canonico.
- `.planning/phases/08-semver-release-pipeline/08-CONTEXT.md` — imagem canonica `ghcr.io/henricos/ai-pkm`, tags `vX.Y.Z` + `latest` e rastreabilidade da release.

### Current operational surface
- `README.md` — ponto principal a simplificar e tornar mais direto para quem quer subir o container.
- `compose.yaml` — contrato existente de runtime que servira de base para a documentacao publica.
- `docs/docker-validation.md` — doc atual de container que pode precisar ser ajustado para remover linguagem especulativa e alinhar o foco operacional.
- `docs/release-semver-ghcr.md` — fluxo de release anterior que a documentacao de deploy deve complementar sem repetir.
- `docs/dev-setup.md` — separacao entre dev local e runtime empacotado.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `compose.yaml`: ja expressa `PKM_PATH=/data/pkm`, `INDEX_PATH=/data/index`, image/build e binds externos para `pkm` + `index`.
- `Dockerfile`: ja produz o runtime distribuivel que sera consumido como imagem publicada.
- `.github/workflows/release-ghcr.yml`: ja publica `ghcr.io/henricos/ai-pkm` com `latest` e `vX.Y.Z`.

### Established Patterns
- O projeto ja separa dev local (`npm run dev`) de runtime empacotado (`docker compose`).
- O runtime da app depende de configuracao externa explicita e falha cedo sem env vars essenciais.
- `pkm` e `index` sao dependencias externas do runtime e nao devem ser descritos como dados internos da imagem.

### Integration Points
- A implementacao desta fase vai tocar principalmente `README.md` e docs operacionais ligados a container/deploy.
- O exemplo publico de compose deve permanecer coerente com o contrato do `compose.yaml`, mas o quickstart do operador pode ser mais direto e autocontido que o compose versionado do repositorio.
- A narrativa da documentacao precisa conectar imagem publicada no GHCR com a configuracao local do operador sem citar Portainer como interface principal.

### Amendment After Real Validation
- A validacao humana real do quickstart mostrou que um arquivo `.env.compose` obrigatorio nao melhora a operacao do servidor atual e adiciona indirecao desnecessaria.
- O `README.md` foi ajustado para ensinar um `compose.yaml` autocontido com placeholders explicitos.
- `.env.compose.example` deixou de ser parte da superficie ativa do repositorio e foi removido.

</code_context>

<deferred>
## Deferred Ideas

- Documentar rollback operacional por troca manual para `vX.Y.Z`.
- Adicionar smoke test ou checklist formal pos-deploy.
- Automatizar deploy remoto a partir do CI.
- Expandir a documentacao para multiplos ambientes, canais ou provedores.

</deferred>

---

*Phase: 09-portainer-deployment-flow*
*Context gathered: 2026-04-14*
