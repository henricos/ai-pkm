# Phase 8: SemVer Release Pipeline - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Fechar o fluxo operacional de release SemVer da aplicacao web ja empacotada, de modo que o operador consiga gerar uma versao oficial com `npm version`, produzir commit e tag Git rastreaveis e disparar automaticamente a publicacao da imagem Docker no GHCR via GitHub Actions. Esta fase cobre versionamento, gatilho de publicacao, naming canonico da imagem e contrato de rastreabilidade. Nao cobre o fluxo de redeploy no servidor e no Portainer, que permanece na Phase 9.

</domain>

<decisions>
## Implementation Decisions

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

### the agent's Discretion
- Forma exata de validar que a tag publicada aponta para commit pertencente a `main`, desde que a politica de release continue bloqueando releases fora da linha oficial.
- Estrutura exata do workflow no GitHub Actions, desde que ele seja disparado por tag de release e publique a imagem canonica no GHCR.
- Forma exata de injetar e propagar o hash de commit para labels OCI e para o build da app, desde que a rastreabilidade final continue verificavel.
- Local e formato do checklist operacional, desde que ele fique claro e coerente com a politica IA-agnostica do repositorio.

</decisions>

<specifics>
## Specific Ideas

- O usuario quer evitar tag de release solta ou acidental fora de `main`.
- O usuario quer manter o mecanismo real da release simples e auditavel, em cima de `npm version`, em vez de esconder o fluxo atras de automacao opaca.
- O usuario considera importante que a estrategia IA-agnostica do repositorio influencie tambem a superficie operacional de release; por isso, uma skill e preferivel a um wrapper script se houver camada guiada.
- O nome `ghcr.io/henricos/ai-pkm` foi aceito por aderir diretamente ao repositorio atual e reduzir ambiguidade operacional.
- A rastreabilidade desejada nao fica restrita ao registry: ela tambem deve aparecer no proprio produto, preservando a exibicao de versao e hash curto na UI.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and milestone scope
- `.planning/PROJECT.md` — contexto do milestone `v2.1`, incluindo a decisao de tratar `npm version` como mecanismo oficial de release e GHCR como canal inicial de distribuicao.
- `.planning/REQUIREMENTS.md` — requisitos `VER-01`, `VER-02`, `VER-03`, `PUB-01`, `PUB-02`, `PUB-03` e `PUB-04` mapeados para esta fase.
- `.planning/ROADMAP.md` — boundary e criterios de sucesso da Phase 8.
- `.planning/STATE.md` — estado atual do milestone e o fato de a Phase 7 ja estar concluida.

### Prior context that constrains this phase
- `.planning/phases/07-container-packaging-foundation/07-CONTEXT.md` — contrato do artefato Docker ja validado, naming de mounts e separacao entre artefatos versionados e dados dinamicos.
- `.planning/phases/01-secure-read-model-foundation/01-CONTEXT.md` — decisoes estruturais sobre env vars obrigatorias, `pkm` externo e contrato de runtime que o build/release nao pode quebrar.

### Current release and runtime surface
- `package.json` — versao SemVer atual do app e scripts oficiais (`build`, `start`, `test`, `typecheck`).
- `Dockerfile` — artefato de empacotamento que a pipeline vai buildar e publicar.
- `compose.yaml` — contrato atual de runtime containerizado validado na fase anterior.
- `README.md` — narrativa operacional atual do projeto e ponte para a validacao Docker.
- `docs/docker-validation.md` — fluxo canonico de validacao local do artefato ja empacotado.
- `docs/dev-setup.md` — separacao entre fluxo de desenvolvimento e runtime empacotado, incluindo a observacao sobre `NEXTAUTH_URL`, `INDEX_PATH` e producao.

### Existing code paths for traceability
- `src/app/(auth)/login/page.tsx` — ponto atual em que a UI ja exibe versao da app e hash de build.
- `next.config.ts` — configuracao de build relevante para propagar `NEXT_PUBLIC_GIT_HASH`.
- `src/__tests__/container-packaging.test.ts` — testes que protegem o contrato do artefato Docker que sera publicado.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `package.json`: ja traz a versao SemVer oficial do app e os scripts que o fluxo de release deve respeitar.
- `Dockerfile`: ja entrega a imagem standalone e nao-root que a pipeline precisa buildar e publicar, sem redesenhar packaging na Phase 8.
- `src/app/(auth)/login/page.tsx`: ja consome `npm_package_version` e `NEXT_PUBLIC_GIT_HASH`, o que reduz trabalho para cumprir a parte visivel da rastreabilidade.
- `next.config.ts`: ja participa da injecao de metadata de build e precisa ser considerado se a pipeline passar a padronizar hash ou labels.

### Established Patterns
- O projeto prefere mecanismos nativos e auditaveis em vez de wrappers opacos; isso favorece `npm version` como verdade da release.
- A estrategia do repositorio e IA-agnostica; quando houver camada guiada, ela deve preferir skill a script proprietario.
- A separacao entre artefato versionado da app e dados dinamicos de runtime ja foi fechada na Phase 7 e nao deve ser reaberta aqui.

### Integration Points
- O workflow de GitHub Actions precisara usar o `Dockerfile` e o nome canonico `ghcr.io/henricos/ai-pkm`.
- O fluxo de release precisara conectar Git tag, versao do `package.json` e metadata da imagem sem quebrar a exibicao atual de versao/hash na UI.
- A documentacao operacional desta fase deve encostar em `README.md` e/ou em um doc dedicado de release, sem conflitar com `docs/docker-validation.md` nem com `docs/dev-setup.md`.

</code_context>

<deferred>
## Deferred Ideas

- Automatizar deploy remoto ou redeploy no Portainer a partir do CI — escopo da Phase 9 ou futuro.
- Criar canais adicionais de release alem de `latest` e `vX.Y.Z`, como `stable`, `beta` ou tags por ambiente — fora do escopo da fase.
- Introduzir wrapper script proprietario para release — explicitamente nao preferido; se houver camada guiada, ela deve ser skill.

</deferred>

---

*Phase: 08-semver-release-pipeline*
*Context gathered: 2026-04-14*
