# Phase 7: Container Packaging Foundation - Research

**Researched:** 2026-04-14  
**Domain:** Docker packaging + runtime path contract for dynamic PKM data  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
> [VERIFIED: .planning/phases/07-container-packaging-foundation/07-CONTEXT.md]
> - **D-01:** A imagem deve usar `multi-stage build`.
> - **D-02:** O runtime final deve ser enxuto e seguro, sem toolchain de build nem sobras de desenvolvimento.
> - **D-03:** O alvo preferencial e travado para esta fase e `Next.js standalone output`, em vez de runtime apoiado em `.next` tradicional.
> - **D-04:** O caminho canonico do `pkm` dentro do container passa a ser `/data/pkm`.
> - **D-05:** A aplicacao continua consumindo `PKM_PATH` como configuracao de runtime; o path canonico do container nao deve virar dependencia hard-coded do codigo.
> - **D-06:** Nesta fase, a montagem do `pkm` pode ser `read-only`.
> - **D-07:** O desenho da fase nao pode assumir `read-only` como verdade permanente da arquitetura.
> - **D-10:** Apenas o `pkm` deve ser mount/volume externo entre os artefatos de conteudo do projeto.
> - **D-11:** `models/`, `.agents/skills/`, `reference/`, `AGENTS.md` e referencias fixas devem ser empacotados junto da versao.
> - **D-12:** `index/` nao deve ser tratado como conteudo estatico embutido da imagem enquanto continuar dinamico; deve seguir a mesma logica operacional de refresh externo do `pkm`.
> - **D-13:** A fase deve verificar como app e futuros agentes encontram `pkm`, `index`, `models`, `.agents/skills/` e referencias normativas em dev e em producao.
> - **D-14:** A fase deve tratar como risco tecnico qualquer dependencia implicita de `process.cwd()` ou do layout atual do workspace que funcione em apenas um dos cenarios.
> - **D-15:** O refresh do `pkm` em producao nao deve nascer como responsabilidade da UI web nem como `git pull` dentro do processo principal da app.
> - **D-16:** O caminho preferido para o primeiro ciclo operacional e um refresh externo ao container da app, executado no servidor por script facilitador que atualiza os repositorios montados.
> - **D-17:** Enquanto `index/` permanecer dinamico e fora do banco, o modelo de refresh deve considerar `pkm` e `index` juntos.
> - **D-18:** Nesta fase, basta registrar o contrato e preparar a verificacao tecnica; o refresh operacional em si nao precisa ser implementado agora.
> - **D-19:** A validacao local canonica da imagem deve usar `docker compose`.
> - **D-22:** O container deve rodar como usuario nao-root por padrao.
> - **D-23:** A imagem deve expor uma porta interna fixa e previsivel.
> - **D-25:** O runtime deve falhar cedo e de forma explicita quando env vars obrigatorias ou a montagem/configuracao do `pkm` estiverem invalidas.

### Claude's Discretion
> [VERIFIED: .planning/phases/07-container-packaging-foundation/07-CONTEXT.md]
> - Forma exata de estruturar o `Dockerfile` e o `.dockerignore`, desde que respeitem imagem enxuta, segura e `standalone`.
> - Estrategia concreta para resolver paths dinamicos e versionados entre dev e container.
> - Nivel de detalhamento do fluxo de refresh futuro, desde que permaneça externo ao processo principal da web app.

### Deferred Ideas (OUT OF SCOPE)
> [VERIFIED: .planning/phases/07-container-packaging-foundation/07-CONTEXT.md]
> - Implementar agora o refresh operacional do acervo.
> - Rodar um agente escritor no mesmo container com permissao de escrita no `pkm`.
> - Automacao de release/tag e publicacao de imagem no GitHub Actions/GHCR.
> - Fluxo operacional completo de update/redeploy no Portainer.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PKG-01 | Aplicacao pode ser empacotada como imagem Docker distribuivel contendo apenas a web app e seus artefatos de runtime. | `output: "standalone"`, `Dockerfile` multi-stage, runtime nao-root e inclusao dos artefatos versionados do repo que precisam existir no runtime. |
| PKG-02 | Runtime em container recebe o `pkm` por path ou volume montado externamente, sem copiar o acervo para dentro da imagem. | `PKM_PATH` continua externo; `index/` tambem precisa seguir contrato dinamico separado da imagem enquanto continuar derivado/editavel. |
| PKG-03 | Equipe consegue validar localmente o container da aplicacao com configuracao minima documentada antes de publicar uma release. | `docker compose` precisa refletir mounts reais, paths explicitos e um smoke que prove leitura do `pkm` e do `index` externo. |
</phase_requirements>

## Summary

O replanejamento muda a pergunta central da Phase 7. Antes, bastava empacotar a app web num container standalone e garantir que o runtime ainda enxergasse `index/`. Agora, isso nao e mais suficiente: o milestone precisa separar claramente o que e versionado por release (`models/`, `.agents/skills/`, `reference/`, `AGENTS.md` e o proprio codigo da app) do que continua sendo dado dinamico de runtime (`pkm/` e `index/`). O container distribuivel nao deve cristalizar `index/` dentro da imagem, porque isso quebraria o contrato novo de refresh externo conjunto entre acervo e indices. [VERIFIED: 07-CONTEXT.md] [VERIFIED: AGENTS.md] [VERIFIED: reference/pkm/pkm-structure.md]

O maior risco tecnico do estado atual e que a app le `index/` a partir de `process.cwd()`, enquanto o `pkm` vem por `PKM_PATH`. Isso funciona no workspace de desenvolvimento, mas nao define um contrato robusto para producao em container nem para um milestone futuro com agentes no mesmo runtime. O ajuste correto nao e “copiar `index/` para dentro da imagem”; e introduzir uma camada explicita de resolucao de paths para separar: (1) dados dinamicos montados externamente, (2) artefatos versionados embutidos na release e (3) defaults ergonomicos para dev. [VERIFIED: src/lib/pkm/fs-item-repository.ts] [VERIFIED: src/lib/navigation/navigation-service.ts] [VERIFIED: AGENTS.md]

Com isso, a forma mais coerente de executar a Phase 7 passa a ser:

1. criar um contrato central de runtime paths para app e futuras integrações agenticas;
2. empacotar a imagem standalone copiando apenas codigo e artefatos versionados;
3. validar localmente via `docker compose` montando `pkm` e `index` externamente, deixando documentado que o refresh futuro sera externo ao container.

**Primary recommendation:** replanejar a fase em torno de um módulo de resolucao de paths + Docker/Compose com mounts externos para `pkm` e `index`, em vez de manter o plano antigo que copiava `index/` para a imagem final. [VERIFIED: 07-CONTEXT.md] [VERIFIED: src/lib/pkm/fs-item-repository.ts] [VERIFIED: src/lib/navigation/navigation-service.ts]

## Architecture Patterns

### Pattern 1: Runtime Paths as Explicit Contract

**What:** criar um modulo unico para resolver caminhos de runtime, distinguindo artefatos dinamicos (`PKM_PATH`, `INDEX_PATH`) de artefatos versionados do repo (ex: `reference/`, `models/`, `.agents/skills/`). [VERIFIED: 07-CONTEXT.md]

**When to use:** sempre que a aplicacao ou scripts precisarem acessar arquivos fora do bundle puro do Next e o resultado nao puder depender de `process.cwd()` de forma implicita. [VERIFIED: src/lib/pkm/fs-item-repository.ts]

**Why:** hoje o repo mistura as duas categorias: `pkm` ja e configuravel por env, mas `index` ainda depende da raiz do workspace. Isso cria assimetria entre dev e container e impede um contrato claro para refresh externo. [VERIFIED: src/lib/pkm/fs-item-repository.ts] [VERIFIED: src/lib/navigation/navigation-service.ts]

### Pattern 2: Standalone Image With Versioned Repo Assets Only

**What:** usar `Next.js standalone` com `Dockerfile` multi-stage, copiando apenas o runtime traced do app e os artefatos versionados que precisam existir dentro da release. [VERIFIED: next.config.ts] [VERIFIED: package.json]

**Must include in image:** codigo da app, `public/` se existir, `models/`, `.agents/skills/`, `reference/`, `AGENTS.md` e quaisquer referencias normativas que o runtime precise consultar. [VERIFIED: 07-CONTEXT.md]

**Must stay external:** `pkm/` e `index/` enquanto ambos continuarem dinamicos/refreshaveis fora da imagem. [VERIFIED: 07-CONTEXT.md]

### Pattern 3: Compose as Truthful Runtime Simulation

**What:** `docker compose` deve subir a imagem ja pronta e montar externamente tudo o que for dinamico, sem scripts compensatorios nem copies ad hoc. [VERIFIED: 07-CONTEXT.md]

**Expected mounts:** `${PKM_HOST_PATH}:/data/pkm` e `${INDEX_HOST_PATH}:/data/index`, com a app recebendo envs explicitas para ambos. [INFERRED from D-04, D-12, D-17]

**Why:** se a validacao local usar compose mas esconder o path real de `index/`, a equipe valida um runtime diferente daquele que sera necessario para o servidor. [VERIFIED: 07-CONTEXT.md]

## Current Code Insights

### Verified Runtime Dependencies

- `src/lib/env.ts` ja faz fail-fast das env vars obrigatorias; a fase deve reaproveitar isso e ampliar apenas o que for necessario para novos paths de runtime. [VERIFIED: src/lib/env.ts]
- `FsItemRepository` resolve `pkm` por `env.PKM_PATH`, mas fixa `index/` em `path.join(process.cwd(), "index")`. [VERIFIED: src/lib/pkm/fs-item-repository.ts]
- `NavigationService` tambem le `index/` relativo ao `cwd`. [VERIFIED: src/lib/navigation/navigation-service.ts]
- `README.md` ainda documenta producao como se bastasse montar `pkm/` em `/app/pkm`, o que ja nao representa o contrato novo da fase. [VERIFIED: README.md]
- `docs/dev-setup.md` explicita que `index/` fica na raiz do repo e que o `cwd` precisa apontar para ela; isso confirma que o contrato atual ainda e acoplado ao workspace local. [VERIFIED: docs/dev-setup.md]

### Consequence of the Replan

O plano anterior estava tecnicamente coerente com o contexto antigo, mas agora ficou desalinhado em dois pontos centrais:

- ele tratava `index/` como artefato que deveria entrar no standalone runtime;
- ele nao transformava a dependencia de `process.cwd()` em um contrato explicito de runtime.

Reaproveitar esse plano sem ajuste faria a implementacao convergir para um container que aparenta funcionar, mas fixa dentro da imagem um dado que o novo contexto declarou dinamico. [VERIFIED: 07-01-PLAN.md antigo] [VERIFIED: 07-CONTEXT.md]

## Recommended Plan Shape

### Plan 07-01

Criar a fundacao de runtime paths e ajustar a app para ler `pkm` e `index` por contrato explicito, com defaults seguros para dev e sem depender implicitamente do layout do workspace.

### Plan 07-02

Empacotar a imagem standalone copiando apenas artefatos versionados e definir `compose.yaml` para mounts externos de `pkm` e `index`.

### Plan 07-03

Documentar o fluxo de validacao local, registrar o contrato de refresh externo futuro e fechar o checkpoint manual que prova login + leitura coerente do acervo montado.

## Anti-Patterns to Avoid

- **Copiar `index/` para dentro da imagem final:** conflita diretamente com D-12 e D-17.
- **Deixar `process.cwd()` como unica fonte de verdade para paths do runtime:** fragiliza dev/prod e adia um risco que o contexto atual mandou tratar agora.
- **Resolver refresh do acervo dentro da UI web:** conflita com D-15 e empurra para a app um papel operacional que o contexto explicitamente adiou.
- **Documentar somente `pkm` como mount externo:** deixa o operador sem modelo coerente para `index` e valida um runtime incompleto.

## Gaps Closed by This Research

- O replanejamento deve substituir, nao apenas complementar, a suposicao antiga de `index` embutido.
- A fase agora precisa de uma abstração de paths como peça de arquitetura, nao apenas de Dockerfiles e docs.
- O refresh externo futuro deve aparecer como contrato documentado e risco rastreado, mesmo sem implementacao nesta fase.

---
*Research refreshed: 2026-04-14 after CONTEXT.md replan update*
