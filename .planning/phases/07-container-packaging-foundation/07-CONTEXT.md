# Phase 7: Container Packaging Foundation - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Empacotar a aplicacao web como container Docker distribuivel e validavel localmente, preservando configuracao externa e acesso ao `pkm` exclusivamente por path/volume montado. Esta fase fecha o contrato de empacotamento e validacao local da imagem, sem entrar ainda em automacao de release/tag no GitHub Actions nem no fluxo operacional de redeploy via Portainer.

</domain>

<decisions>
## Implementation Decisions

### Estrategia da imagem
- **D-01:** A imagem deve usar `multi-stage build`.
- **D-02:** O runtime final deve ser enxuto e seguro, sem toolchain de build nem sobras de desenvolvimento.
- **D-03:** O alvo preferencial e travado para esta fase e `Next.js standalone output`, em vez de runtime apoiado em `.next` tradicional.

### Contrato de runtime do PKM
- **D-04:** O caminho canonico do `pkm` dentro do container passa a ser `/data/pkm`.
- **D-05:** A aplicacao continua consumindo `PKM_PATH` como configuracao de runtime; o path canonico do container nao deve virar dependencia hard-coded do codigo.
- **D-06:** Nesta fase, a montagem do `pkm` pode ser `read-only`.
- **D-07:** O desenho da fase nao pode assumir `read-only` como verdade permanente da arquitetura; isso deve permanecer uma escolha operacional/configuravel.
- **D-08:** O planejamento e a implementacao devem tratar como ponto de atencao a compatibilidade futura com um milestone em que um agente rodara no mesmo container e precisara criar/editar conteudo nesse mesmo diretorio.
- **D-09:** Como follow-up tecnico dentro da fase, vale verificar se skills/agentes atuais assumem `pkm/` relativo ao workspace ou se ja aceitam path externo configuravel; isso e compatibilidade futura, nao novo escopo funcional desta fase.

### Validacao local do artefato
- **D-10:** A validacao local canonica da imagem deve usar `docker compose`.
- **D-11:** O `docker compose` deve refletir o contrato real de runtime da imagem, nao compensar artificialmente fragilidades do container.
- **D-12:** `docker run` pode aparecer como referencia opcional de baixo nivel, mas nao e o fluxo principal documentado.

### Hardening operacional basico
- **D-13:** O container deve rodar como usuario nao-root por padrao.
- **D-14:** A imagem deve expor uma porta interna fixa e previsivel.
- **D-15:** A fase deve incluir healthcheck basico se houver uma verificacao simples e segura disponivel no runtime final.
- **D-16:** O runtime deve falhar cedo e de forma explicita quando env vars obrigatorias ou a montagem/configuracao do `pkm` estiverem invalidas.

### the agent's Discretion
- Forma exata de estruturar o `Dockerfile` e o `.dockerignore`, desde que respeitem imagem enxuta, segura e `standalone`.
- Estrategia concreta de healthcheck, desde que seja basica, segura e coerente com a aplicacao atual.
- Nivel de detalhamento do fluxo opcional via `docker run`, desde que o caminho canonico continue sendo `docker compose`.

</decisions>

<specifics>
## Specific Ideas

- O usuario explicitou que `/data/pkm` e o endereco canonico preferido dentro do container.
- O usuario quer travar "enxuta e segura" como criterio da imagem final, e nao deixar isso como preferencia maleavel do planner.
- O usuario nao quer que a montagem `read-only` desta fase cristalize uma premissa estrutural que atrapalhe um milestone futuro com agente escritor no mesmo container.
- A leitura do operador sobre validacao local e que, como a aplicacao depende obrigatoriamente de varias env vars e da montagem do `pkm`, `docker compose` representa melhor o contrato real do runtime do que um `docker run` verbose.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and milestone scope
- `.planning/PROJECT.md` — contexto do milestone `v2.1`, separacao entre packaging nesta fase e release/publicacao nas fases seguintes.
- `.planning/REQUIREMENTS.md` — requisitos `PKG-01`, `PKG-02` e `PKG-03` que esta fase precisa cobrir.
- `.planning/ROADMAP.md` — boundary da Phase 7 e criterios de sucesso do empacotamento/validacao local.

### Prior decisions that constrain packaging
- `.planning/STATE.md` — estado atual do milestone e decisoes recentes que ainda valem para runtime/configuracao.
- `.planning/phases/01-secure-read-model-foundation/01-CONTEXT.md` — decisoes sobre auth obrigatoria em todos os ambientes, env vars obrigatorias e `pkm` externo por path/volume.

### Current runtime and configuration
- `.env.example` — contrato minimo atual das env vars obrigatorias.
- `src/lib/env.ts` — validacao e fail-fast das env vars em runtime.
- `next.config.ts` — configuracao atual do Next.js, inclusive o uso de `NEXT_PUBLIC_GIT_HASH` no build.
- `package.json` — versao atual do app e scripts de build/start que o empacotamento precisara respeitar.
- `src/app/(auth)/login/page.tsx` — ponto atual em que a versao do app e exibida no produto.

### Existing operational docs
- `README.md` — posicionamento atual do projeto e mencoes existentes a montagem do `pkm` via volume.
- `docs/dev-setup.md` — setup local atual e contrato operacional minimo das env vars; a documentacao da fase deve complementar isso sem conflitar com o fluxo de dev via `npm run dev`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/env.ts`: ja centraliza a validacao das env vars obrigatorias e o comportamento de fail-fast; o empacotamento deve aproveitar esse contrato em vez de duplicar validacoes no shell.
- `package.json`: ja define scripts claros (`build`, `start`, `test`, `typecheck`) e a versao SemVer atual do app.
- `next.config.ts`: ja injeta `NEXT_PUBLIC_GIT_HASH` no build e tolera ausencia de historico Git; isso importa para builds em container sem `.git`.

### Established Patterns
- O runtime atual ja assume configuracao 100% externa por env vars obrigatorias; a fase 7 nao precisa inventar fallback local ou defaults escondidos.
- O projeto ja separa claramente dev local (`npm run dev`) do runtime empacotado; a validacao Docker deve complementar esse fluxo, nao substitui-lo.
- O acesso ao `pkm` ja e pensado como dependencia externa montada por path, coerente com um container sem acervo embutido.

### Integration Points
- O empacotamento vai se apoiar nos scripts de `package.json` e na configuracao de `next.config.ts`.
- A documentacao da fase deve encostar em `README.md` e/ou `docs/dev-setup.md`, deixando explicito que `docker compose` valida o artefato distribuivel enquanto `npm run dev` continua sendo o fluxo de desenvolvimento.
- O contrato de runtime do compose precisara espelhar as env vars exigidas por `src/lib/env.ts` e a montagem externa do `pkm` em `/data/pkm`.

</code_context>

<deferred>
## Deferred Ideas

- Rodar um agente escritor no mesmo container com permissao de escrita no `pkm` — relevante para milestone futuro, mas fora do escopo funcional da Phase 7.
- Automacao de release/tag e publicacao de imagem no GitHub Actions/GHCR — escopo da Phase 8.
- Fluxo operacional de update/redeploy no Portainer — escopo da Phase 9.

</deferred>

---

*Phase: 07-container-packaging-foundation*
*Context gathered: 2026-04-13*
