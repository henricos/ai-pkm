# Phase 7: Container Packaging Foundation - Research

**Researched:** 2026-04-13  
**Domain:** Next.js 16 standalone packaging + Docker runtime contract  
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
> - **D-07:** O desenho da fase nao pode assumir `read-only` como verdade permanente da arquitetura; isso deve permanecer uma escolha operacional/configuravel.
> - **D-08:** O planejamento e a implementacao devem tratar como ponto de atencao a compatibilidade futura com um milestone em que um agente rodara no mesmo container e precisara criar/editar conteudo nesse mesmo diretorio.
> - **D-09:** Como follow-up tecnico dentro da fase, vale verificar se skills/agentes atuais assumem `pkm/` relativo ao workspace ou se ja aceitam path externo configuravel; isso e compatibilidade futura, nao novo escopo funcional desta fase.
> - **D-10:** A validacao local canonica da imagem deve usar `docker compose`.
> - **D-11:** O `docker compose` deve refletir o contrato real de runtime da imagem, nao compensar artificialmente fragilidades do container.
> - **D-12:** `docker run` pode aparecer como referencia opcional de baixo nivel, mas nao e o fluxo principal documentado.
> - **D-13:** O container deve rodar como usuario nao-root por padrao.
> - **D-14:** A imagem deve expor uma porta interna fixa e previsivel.
> - **D-15:** A fase deve incluir healthcheck basico se houver uma verificacao simples e segura disponivel no runtime final.
> - **D-16:** O runtime deve falhar cedo e de forma explicita quando env vars obrigatorias ou a montagem/configuracao do `pkm` estiverem invalidas.

### Claude's Discretion
> [VERIFIED: .planning/phases/07-container-packaging-foundation/07-CONTEXT.md]
> - Forma exata de estruturar o `Dockerfile` e o `.dockerignore`, desde que respeitem imagem enxuta, segura e `standalone`.
> - Estrategia concreta de healthcheck, desde que seja basica, segura e coerente com a aplicacao atual.
> - Nivel de detalhamento do fluxo opcional via `docker run`, desde que o caminho canonico continue sendo `docker compose`.

### Deferred Ideas (OUT OF SCOPE)
> [VERIFIED: .planning/phases/07-container-packaging-foundation/07-CONTEXT.md]
> - Rodar um agente escritor no mesmo container com permissao de escrita no `pkm` — relevante para milestone futuro, mas fora do escopo funcional da Phase 7.
> - Automacao de release/tag e publicacao de imagem no GitHub Actions/GHCR — escopo da Phase 8.
> - Fluxo operacional de update/redeploy no Portainer — escopo da Phase 9.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PKG-01 | Aplicacao pode ser empacotada como imagem Docker distribuivel contendo apenas a web app e seus artefatos de runtime. | `output: "standalone"`, `Dockerfile` multi-stage, runtime sem devDependencies e sem `pkm` embutido. [CITED: https://nextjs.org/docs/app/getting-started/deploying] [CITED: https://docs.docker.com/build/building/best-practices/] |
| PKG-02 | Runtime em container recebe o `pkm` por path ou volume montado externamente, sem copiar o acervo para dentro da imagem. | `PKM_PATH` continua configuravel; compose monta volume em `/data/pkm`; codigo ja resolve path por env em runtime. [VERIFIED: src/lib/env.ts] [VERIFIED: src/lib/pkm/fs-item-repository.ts] |
| PKG-03 | Equipe consegue validar localmente o container da aplicacao com configuracao minima documentada antes de publicar uma release. | Fluxo canonico por `docker compose build` + `docker compose up`; healthcheck simples opcional; docs separadas de `npm run dev`. [VERIFIED: 07-CONTEXT.md] [VERIFIED: docs/dev-setup.md] |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

`CLAUDE.md` apenas delega para `AGENTS.md`, entao as restricoes acionaveis abaixo valem por delegacao explicita. [VERIFIED: CLAUDE.md] [VERIFIED: AGENTS.md]

- Ler `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md` e `.planning/ROADMAP.md` antes de trabalhar. [VERIFIED: AGENTS.md]
- Conteudo autoral e comunicacao em `pt-BR`; estrutura tecnica e nomes de arquivos/configs em ingles. [VERIFIED: AGENTS.md]
- O `pkm` e repositorio separado e privado; a plataforma nunca deve tratá-lo como conteudo embutido da imagem. [VERIFIED: AGENTS.md]
- O `pkm` continua sendo a fonte primaria de verdade; a web nao pode quebrar o modelo file-first. [VERIFIED: AGENTS.md] [VERIFIED: .planning/PROJECT.md]
- Commits nao podem ser automaticos; qualquer commit exige aprovacao e uso da skill apropriada. [VERIFIED: AGENTS.md]
- Antes de implementar feature nova, deve existir spec correspondente; esta fase ja existe no roadmap/requisitos do milestone `v2.1`. [VERIFIED: AGENTS.md] [VERIFIED: .planning/ROADMAP.md] [VERIFIED: .planning/REQUIREMENTS.md]

## Summary

O encaixe mais coerente para a Phase 7 e um empacotamento `Next.js standalone` com `Dockerfile` multi-stage, em que o build usa `npm ci` sobre o `package-lock.json`, executa `next build`, e o runtime final roda somente o `server.js` gerado em `.next/standalone` como usuario nao-root. Isso segue a direcao oficial de deploy Docker do Next.js e as boas praticas do Docker para imagem minima, `.dockerignore`, rebuild frequente e containers efemeros. [CITED: https://nextjs.org/docs/app/getting-started/deploying] [CITED: https://nextjs.org/docs/app/guides/self-hosting] [CITED: https://docs.docker.com/build/building/best-practices/] [VERIFIED: package-lock.json]

Neste repo, o contrato mais importante nao e o processo HTTP em si, mas o runtime externo: `PKM_PATH` obrigatorio, cinco env vars validadas por `src/lib/env.ts`, indices `index/topicos.json` e `index/grupos.json` lidos via `process.cwd()`, autenticacao obrigatoria e `pkm` montado externamente. Isso significa que o container final nao pode copiar o acervo, mas precisa carregar o diretório `index/` do repo e falhar cedo quando `PKM_PATH` ou credenciais estiverem ausentes. [VERIFIED: src/lib/env.ts] [VERIFIED: src/lib/pkm/fs-item-repository.ts] [VERIFIED: src/lib/navigation/navigation-service.ts] [VERIFIED: src/proxy.ts] [VERIFIED: .env.example]

O maior risco tecnico especifico desta fase e o output tracing do standalone nao capturar automaticamente o diretório `index/`, porque a leitura acontece via `path.join(process.cwd(), "index")` e `fs.readFileSync` dinâmico. O segundo risco e operacional: o footer da tela de login depende de `process.env.npm_package_version`, mas no runtime standalone o processo sobe com `node server.js`, nao com `npm start`; portanto esse env nao fica disponivel por padrao. [VERIFIED: src/lib/pkm/fs-item-repository.ts] [VERIFIED: src/lib/navigation/navigation-service.ts] [VERIFIED: src/app/(auth)/login/page.tsx] [CITED: https://docs.npmjs.com/cli/v11/using-npm/scripts/]

**Primary recommendation:** usar `Next.js 16 standalone` + `Dockerfile` multi-stage + `docker compose` como contrato canonico de validacao, adicionando inclusao explicita do diretório `index/` no artefato e um pequeno ajuste de version/hash para o runtime standalone. [CITED: https://nextjs.org/docs/app/getting-started/deploying] [VERIFIED: repo grep]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | `16.2.3` (publicado em 2026-04-08) [VERIFIED: npm registry] | Build da app e `standalone output` para runtime mínimo. [VERIFIED: package.json] | O deploy oficial do Next recomenda Docker e aponta `Docker Standalone Output` como template para imagem mínima de produção. [CITED: https://nextjs.org/docs/app/getting-started/deploying] |
| Node.js | `24.14.1` local, ramo `v24` em Active LTS em 2026-04-13 [VERIFIED: local command] [CITED: https://nodejs.org/en/about/previous-releases] | Base do runtime do container. | Produção deve usar Active LTS ou Maintenance LTS; o repo ja fixa `v24.14.1` em `.nvmrc`, alinhando dev e imagem. [CITED: https://nodejs.org/en/about/previous-releases] [VERIFIED: .nvmrc] |
| Dockerfile multi-stage | `N/A` [CITED: https://docs.docker.com/build/building/best-practices/] | Separar deps/build/runtime e remover toolchain do artefato final. | Docker documenta multi-stage, `.dockerignore` e containers efemeros como baseline de imagem enxuta. [CITED: https://docs.docker.com/build/building/best-practices/] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Docker Compose | v2 CLI contract [VERIFIED: 07-CONTEXT.md] | Validacao local do artefato com env vars e bind mount reais. | Deve ser o fluxo canonico local desta fase, porque o app depende de cinco env vars e de montagem externa do `pkm`. [VERIFIED: 07-CONTEXT.md] [VERIFIED: src/lib/env.ts] |
| NextAuth / Auth.js | `5.0.0-beta.30` no repo; `4.24.13` e o latest estavel no registry [VERIFIED: package.json] [VERIFIED: npm registry] | Sessao e auth obrigatoria no runtime. | A fase nao troca a stack de auth; apenas precisa preservar o contrato atual no container. [VERIFIED: src/lib/auth.ts] |
| Zod | `4.3.6` (publicado em 2026-01-22) [VERIFIED: npm registry] | Validacao fail-fast de env vars obrigatorias. | Reusar `src/lib/env.ts` evita duplicar checagens no entrypoint do container. [VERIFIED: src/lib/env.ts] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `output: "standalone"` [CITED: https://nextjs.org/docs/app/getting-started/deploying] | `next start` sobre checkout completo [ASSUMED] | Carrega mais arquivos, depende mais do workspace completo e piora rastreabilidade do artefato. [CITED: https://nextjs.org/docs/app/guides/self-hosting] |
| `docker compose` como fluxo principal [VERIFIED: 07-CONTEXT.md] | `docker run` documentado como principal [ASSUMED] | `docker run` esconde pior o contrato de env/volume desta app e gera comando mais frágil para o operador. [VERIFIED: src/lib/env.ts] |
| Base Node LTS slim glibc [ASSUMED] | Alpine + ajustes libc [ASSUMED] | Alpine pode funcionar, mas adiciona friccao desnecessaria para uma app Next standalone; nesta fase o objetivo e previsibilidade, nao micro-otimizacao extrema. [CITED: https://docs.docker.com/build/building/best-practices/] |

**Installation:** nenhum pacote npm novo parece necessario para fechar a Phase 7. [VERIFIED: package.json] [VERIFIED: repo grep]

**Version verification:** `next@16.2.3` foi publicado em `2026-04-08`, `next-auth@4.24.13` em `2025-10-29` como latest estavel do registry, e `zod@4.3.6` em `2026-01-22`. [VERIFIED: npm registry]

## Architecture Patterns

### Recommended Project Structure

```text
.
├── Dockerfile                # build multi-stage da imagem distribuivel
├── .dockerignore             # contexto minimo para build reproduzivel
├── compose.yaml              # fluxo canonico de validacao local
├── .env.compose.example      # opcional: template especifico do runtime container
├── index/                    # indices que o runtime standalone precisa ler
├── docs/
│   └── dev-setup.md          # continua sendo o fluxo npm local
└── src/
    ├── app/
    │   └── api/healthz/      # somente se o healthcheck for adotado
    └── lib/
        └── env.ts            # unica fonte de validacao das envs
```

### Pattern 1: Standalone Runtime With Explicit Repo Artifacts

**What:** habilitar `output: "standalone"` e copiar para a imagem final apenas `.next/standalone`, `.next/static` e os artefatos do repo que o runtime realmente acessa em tempo de execucao. [CITED: https://nextjs.org/docs/app/getting-started/deploying] [VERIFIED: src/lib/pkm/fs-item-repository.ts]

**When to use:** sempre que a fase quiser imagem distribuivel minima, sem checkout completo e sem `node_modules` de desenvolvimento. [VERIFIED: 07-CONTEXT.md]

**Example:**

```dockerfile
# Source: synthesized from Next.js standalone deploy docs + Docker best practices
FROM node:24-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/index ./index

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### Pattern 2: Runtime Contract Via Env + Bind Mount

**What:** o compose define `PKM_PATH=/data/pkm`, monta o acervo em `/data/pkm`, e injeta todas as cinco env vars exigidas por `src/lib/env.ts`. [VERIFIED: .env.example] [VERIFIED: src/lib/env.ts] [VERIFIED: 07-CONTEXT.md]

**When to use:** em toda validacao local e em qualquer runtime futuro que consuma a imagem desta fase. [VERIFIED: .planning/PROJECT.md]

**Example:**

```yaml
# Source: synthesized from repo runtime contract
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      PKM_PATH: /data/pkm
      AUTH_USERNAME: ${AUTH_USERNAME}
      AUTH_PASSWORD: ${AUTH_PASSWORD}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    volumes:
      - ${PKM_HOST_PATH}:/data/pkm:ro
```

### Pattern 3: Optional Dedicated Healthcheck Route

**What:** se a fase adotar healthcheck, preferir rota pequena como `/api/healthz` que apenas verifica boot do processo e, opcionalmente, a legibilidade de `index/` e `PKM_PATH`, sem depender de sessao e sem expor dados do acervo. [VERIFIED: src/proxy.ts] [VERIFIED: src/lib/env.ts] [ASSUMED]

**When to use:** somente se a rota puder ser explicitamente excluida do `proxy` atual e mantiver semantica segura para ambiente publicado. [VERIFIED: src/proxy.ts]

**Example:**

```typescript
// Source: synthesized from repo auth/proxy contract
import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  const ok = fs.existsSync("/app/index/topicos.json") && fs.existsSync(process.env.PKM_PATH ?? "");
  return NextResponse.json({ ok }, { status: ok ? 200 : 503 });
}
```

### Anti-Patterns to Avoid

- **Copiar `pkm/` para dentro da imagem:** viola PKG-02 e o modelo file-first do projeto. [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: AGENTS.md]
- **Rodar como root no runtime final:** contradiz decisao fechada da fase e amplia superficie de dano em bind mounts. [VERIFIED: 07-CONTEXT.md]
- **Duplicar validacao de env em shell script custom:** `src/lib/env.ts` ja faz fail-fast com mensagens claras em pt-BR. [VERIFIED: src/lib/env.ts]
- **Assumir que o standalone vai levar `index/` automaticamente:** o repo le isso por `process.cwd()` e `fs`, o que merece inclusao explicita. [VERIFIED: src/lib/pkm/fs-item-repository.ts] [VERIFIED: src/lib/navigation/navigation-service.ts]
- **Usar `docker run` como UX principal:** o proprio contexto da fase ja fixou `docker compose` como contrato canonico. [VERIFIED: 07-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime Next de producao | custom server ad hoc [ASSUMED] | `server.js` do standalone output [CITED: https://nextjs.org/docs/app/getting-started/deploying] | O Next ja gera um runtime minimizado com tracing dos arquivos necessarios. [CITED: https://nextjs.org/docs/app/getting-started/deploying] |
| Validacao de env no entrypoint | shell parser de `.env` [ASSUMED] | `src/lib/env.ts` + Zod [VERIFIED: src/lib/env.ts] | Ja existe fail-fast com mensagens claras e validacao sem duplicacao. [VERIFIED: src/lib/env.ts] |
| Montagem do `pkm` dentro da imagem | `COPY pkm ...` [VERIFIED: AGENTS.md] | bind mount / named volume externo [VERIFIED: 07-CONTEXT.md] | Preserva privacidade, rastreabilidade e separacao entre app publica e acervo privado. [VERIFIED: .planning/PROJECT.md] |
| Health probe de login autenticado | script com cookie/sessao [ASSUMED] | rota dedicada minima ou healthcheck sem auth [ASSUMED] | Healthcheck nao deve depender de credenciais operacionais do usuario nem testar fluxo de login completo. [ASSUMED] |

**Key insight:** o que precisa ser “feito na mao” nesta fase nao e a logica do servidor, e sim o contrato entre standalone, indices locais, env vars obrigatorias e montagem externa do `pkm`. [VERIFIED: repo grep]

## Common Pitfalls

### Pitfall 1: `index/` some do runtime standalone

**What goes wrong:** a imagem sobe, mas as telas autenticadas ou APIs que dependem de `index/topicos.json` e `index/grupos.json` falham com `ENOENT`. [VERIFIED: docs/dev-setup.md] [VERIFIED: src/lib/pkm/fs-item-repository.ts]

**Why it happens:** o codigo le os indices por `process.cwd()` + `fs.readFileSync`, e isso nao garante que o tracing do standalone leve o diretório inteiro automaticamente. [VERIFIED: src/lib/pkm/fs-item-repository.ts] [VERIFIED: src/lib/navigation/navigation-service.ts]

**How to avoid:** copiar `index/` explicitamente para a imagem final ou configurar `outputFileTracingIncludes` para garantir o artefato. [CITED: https://nextjs.org/docs/pages/api-reference/config/next-config-js] [VERIFIED: repo grep]

**Warning signs:** `/login` pode abrir, mas `/` autenticado ou `/api/pkm/topics` retorna `500` ao instanciar `FsItemRepository`. [VERIFIED: src/app/api/pkm/topics/route.ts]

### Pitfall 2: versao do footer fica congelada ou errada

**What goes wrong:** a tela de login mostra fallback estatico `2.0.0` mesmo depois de bump futuro de versao. [VERIFIED: src/app/(auth)/login/page.tsx]

**Why it happens:** `npm_package_version` e exposto por scripts do npm, mas o runtime standalone sobe com `node server.js`, fora desse ambiente. [CITED: https://docs.npmjs.com/cli/v11/using-npm/scripts/] [VERIFIED: src/app/(auth)/login/page.tsx]

**How to avoid:** injetar uma variavel de build/publica para versao do app, ou ler `package.json` em build time e serializar esse valor no bundle. [ASSUMED]

**Warning signs:** release local em compose mostra hash `dev` e versao `2.0.0` independentemente do pacote real. [VERIFIED: next.config.ts] [VERIFIED: src/app/(auth)/login/page.tsx]

### Pitfall 3: hash Git sempre cai para `dev`

**What goes wrong:** a imagem mostra `dev` no footer mesmo quando foi buildada de um commit conhecido. [VERIFIED: next.config.ts] [VERIFIED: src/app/(auth)/login/page.tsx]

**Why it happens:** builds Docker tipicamente nao carregam `.git`, e o `next.config.ts` atual cai silenciosamente no fallback. [VERIFIED: next.config.ts] [VERIFIED: .gitignore]

**How to avoid:** manter o fallback como seguranca, mas preferir `ARG GIT_HASH` ou `ARG NEXT_PUBLIC_GIT_HASH` opcional no build, deixando a ausencia como comportamento aceitavel apenas para validacao local. [VERIFIED: next.config.ts] [ASSUMED]

**Warning signs:** qualquer build em CI ou compose sem `.git` embutido exibe `dev`. [VERIFIED: next.config.ts]

### Pitfall 4: healthcheck fica protegido por auth

**What goes wrong:** o healthcheck responde `302` ou `401`, e o container entra em estado unhealthy apesar de o processo estar vivo. [VERIFIED: src/proxy.ts] [VERIFIED: src/app/(shell)/layout.tsx]

**Why it happens:** o projeto usa `src/proxy.ts` para proteger quase todas as rotas, exceto excecoes explícitas. [VERIFIED: src/proxy.ts]

**How to avoid:** se houver rota `/api/healthz`, exclui-la claramente do `matcher` do proxy ou mantê-la fora do escopo protegido. [VERIFIED: src/proxy.ts]

**Warning signs:** `curl /api/healthz` redireciona para `/login` ou retorna unauthorized. [VERIFIED: src/proxy.ts] [ASSUMED]

### Pitfall 5: `PKM_PATH` e volume divergem

**What goes wrong:** o container sobe mas nao encontra o acervo montado. [VERIFIED: src/lib/env.ts]

**Why it happens:** o compose monta em um caminho, mas a env aponta para outro; o path canonico pedido para esta fase e `/data/pkm`. [VERIFIED: 07-CONTEXT.md]

**How to avoid:** definir `PKM_PATH=/data/pkm` no compose e tratar o host path apenas como detalhe do bind mount. [VERIFIED: 07-CONTEXT.md]

**Warning signs:** dados vazios, `ENOENT`, ou falha imediata em rotas que tocam o repositorio. [VERIFIED: src/lib/pkm/fs-item-repository.ts]

## Code Examples

Verified patterns adapted ao repo:

### Next standalone + copy de artefatos necessarios

```dockerfile
# Source: https://nextjs.org/docs/app/getting-started/deploying
# Source: https://docs.docker.com/build/building/best-practices/
FROM node:24-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/index ./index

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### Compose como contrato de validacao local

```yaml
# Source: repo runtime contract + Docker Compose flow chosen in 07-CONTEXT.md
services:
  web:
    build:
      context: .
    ports:
      - "3000:3000"
    environment:
      PKM_PATH: /data/pkm
      AUTH_USERNAME: ${AUTH_USERNAME}
      AUTH_PASSWORD: ${AUTH_PASSWORD}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    volumes:
      - ${PKM_HOST_PATH}:/data/pkm:ro
    restart: "no"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next start` sobre checkout mais completo [ASSUMED] | `output: "standalone"` para imagem minima [CITED: https://nextjs.org/docs/app/getting-started/deploying] | Docs atuais do Next destacam essa estrategia em 2026. [CITED: https://nextjs.org/docs/app/getting-started/deploying] | Reduz artefato final e simplifica runtime distribuivel. [CITED: https://nextjs.org/docs/app/getting-started/deploying] |
| Container validado com comando manual isolado [ASSUMED] | `docker compose` espelhando env+mount reais do runtime [VERIFIED: 07-CONTEXT.md] | Decisao fechada desta fase em 2026-04-13. [VERIFIED: 07-CONTEXT.md] | Menos drift entre validacao local e deploy futuro. [VERIFIED: 07-CONTEXT.md] |
| Hash obtido so via `git rev-parse` no build [VERIFIED: next.config.ts] | Hash opcional vindo por build arg, com fallback atual preservado [ASSUMED] | Ainda nao implementado; recomendacao desta pesquisa. [ASSUMED] | Evita que imagens Docker mostrem `dev` sem necessidade. [VERIFIED: next.config.ts] |

**Deprecated/outdated:**

- Usar o `README.md` atual como referencia de producao sem ajuste e inadequado para esta fase, porque ele ainda documenta `/app/pkm`, enquanto a fase travou `/data/pkm` como caminho canonico no container. [VERIFIED: README.md] [VERIFIED: 07-CONTEXT.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A base mais pragmatica para esta fase e `node:24-bookworm-slim`, nao Alpine. | Standard Stack / Code Examples | Baixo a medio: a imagem pode ficar um pouco maior, mas mais previsivel; se o time preferir Alpine, o plano precisa acomodar esse desvio. |
| A2 | A melhor forma de expor a versao do app no runtime standalone e injetar um valor de build em vez de depender de `npm_package_version`. | Common Pitfalls | Medio: sem isso o footer pode exibir versao errada quando o runtime mudar para `node server.js`. |
| A3 | Um healthcheck dedicado sem auth e aceitavel para esta fase se ele verificar apenas boot/config minima, sem vazar estado interno. | Architecture Patterns / Common Pitfalls | Medio: se a politica de exposicao exigir auth total, o planner deve cair para healthcheck de processo ou omitir healthcheck. |

## Open Questions (RESOLVED)

1. **Footer de versao no runtime standalone**
   - Decision: corrigir agora na Phase 7, dentro do plano `07-01`, trocando a dependencia de `process.env.npm_package_version` por um contrato explicito de versao publica injetado no build/runtime. [VERIFIED: 07-01-PLAN.md]
   - Why resolved this way: deixar o footer para a Phase 8 criaria um artefato Docker tecnicamente funcional, mas com metadata de versao errada ou ausente exatamente no milestone que inaugura packaging distribuivel. [VERIFIED: src/app/(auth)/login/page.tsx] [VERIFIED: 07-01-PLAN.md]

2. **Politica de healthcheck da Phase 7**
   - Decision: nao adicionar `healthcheck` ao `compose.yaml` nesta fase, a menos que ja exista endpoint dedicado, publico e comprovadamente seguro antes da execucao do plano. O default do planejamento passa a ser omitir healthcheck e documentar explicitamente o racional tecnico. [VERIFIED: 07-02-PLAN.md] [VERIFIED: 07-03-PLAN.md]
   - Why resolved this way: um probe acoplado a auth/proxy ou improvisado no compose mascara o contrato real do container e pode produzir `unhealthy` falso-positivo. Para o primeiro artefato distribuivel, o gate operacional sera `docker compose config/build/up` + login real + leitura do `pkm` montado, formalizados em `07-VALIDATION.md`. [VERIFIED: src/proxy.ts] [VERIFIED: 07-VALIDATION.md]

3. **Follow-up tecnico sobre path externo para skills/agentes (D-09)**
   - Decision: cobrir o follow-up ainda na Phase 7, no plano `07-03`, por uma task curta de auditoria documental dos contratos atuais de skills/agentes e registro do resultado no guia de validacao Docker. [VERIFIED: 07-CONTEXT.md] [VERIFIED: 07-03-PLAN.md]
   - Why resolved this way: D-09 nao pede mudanca funcional nas skills agora, mas exige que a fase deixe claro se o ecossistema atual tolera `PKM_PATH` externo ou ainda assume `pkm/` relativo ao workspace. [VERIFIED: AGENTS.md] [VERIFIED: 07-CONTEXT.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build local, typecheck e scripts | ✓ | `v24.14.1` [VERIFIED: local command] | — |
| npm | install e build local | ✓ | `11.11.0` [VERIFIED: local command] | — |
| Docker Engine | build/execucao local do container | ✗ | — [VERIFIED: local command] | none |
| Docker Compose v2 | fluxo canonico de validacao local | ✗ | — [VERIFIED: local command] | none |

**Missing dependencies with no fallback:**

- `docker` e `docker compose` nao estao instalados neste ambiente, entao a validacao pratica do artefato Docker nao pode ser executada nesta sessao. [VERIFIED: local command]

**Missing dependencies with fallback:**

- Nenhum. O requisito PKG-03 explicitamente pede validacao do container; sem Docker nao ha substituto equivalente. [VERIFIED: .planning/REQUIREMENTS.md]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `vitest` + `jsdom` [VERIFIED: vitest.config.ts] |
| Config file | `vitest.config.ts` [VERIFIED: vitest.config.ts] |
| Quick run command | `npm test` [VERIFIED: package.json] |
| Full suite command | `npm test && npm run typecheck` [VERIFIED: package.json] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PKG-01 | Imagem builda runtime standalone minimo | smoke | `docker compose build web` | ✅ `07-VALIDATION.md` |
| PKG-02 | Container sobe com `PKM_PATH=/data/pkm` e bind mount externo | smoke | `docker compose up -d web` | ✅ `07-VALIDATION.md` |
| PKG-03 | Operador valida localmente com contrato documentado | manual+smoke | `docker compose up -d web && docker compose ps` | ✅ `07-VALIDATION.md` |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test && npm run typecheck`
- **Phase gate:** `npm test && npm run typecheck && docker compose build web && docker compose up -d web`

### Wave 0 Gaps

- [ ] `Dockerfile` ausente. [VERIFIED: repo grep]
- [ ] `.dockerignore` ausente. [VERIFIED: repo grep]
- [ ] `compose.yaml` ou equivalente ausente. [VERIFIED: repo grep]
- [ ] Healthcheck policy ainda nao formalizada. [VERIFIED: 07-CONTEXT.md]
- [ ] Nenhum smoke test/documento automatizado para build do container existe hoje. [VERIFIED: repo grep]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | NextAuth/Auth.js + `src/proxy.ts` e guards `auth()` nas rotas. [VERIFIED: src/lib/auth.ts] [VERIFIED: src/proxy.ts] |
| V3 Session Management | yes | JWT session via Auth.js; cookies assinados por `NEXTAUTH_SECRET`. [VERIFIED: src/lib/auth.ts] [VERIFIED: src/lib/env.ts] |
| V4 Access Control | yes | shell autenticada e APIs sensiveis exigem sessao. [VERIFIED: src/app/(shell)/layout.tsx] [VERIFIED: src/app/api/pkm/topics/route.ts] |
| V5 Input Validation | yes | Zod valida envs e repositorio aplica validacao de path traversal. [VERIFIED: src/lib/env.ts] [VERIFIED: src/lib/pkm/fs-item-repository.ts] |
| V6 Cryptography | no new scope | Nao introduzir crypto manual; reutilizar `NEXTAUTH_SECRET` e stack existente. [VERIFIED: src/lib/auth.ts] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Segredo embutido na imagem | Information Disclosure | Env vars externas apenas; nada sensivel em `Dockerfile` ou compose committed. [VERIFIED: AGENTS.md] [VERIFIED: .env.example] |
| Container root com bind mount do `pkm` | Elevation of Privilege | Usuario nao-root no runtime e mount `:ro` por padrao nesta fase. [VERIFIED: 07-CONTEXT.md] |
| Bypass acidental de auth por rota auxiliar | Spoofing / Elevation | Se criar `/api/healthz`, exclui-la conscientemente do `proxy` e limitar payload. [VERIFIED: src/proxy.ts] [ASSUMED] |
| Path traversal em downloads/preview | Tampering | Reusar `resolveAndValidatePath()` e nao abrir atalhos no healthcheck. [VERIFIED: src/lib/pkm/fs-item-repository.ts] [VERIFIED: src/app/api/pkm/raw/[...path]/route.ts] |
| Drift entre compose e runtime real | Misconfiguration | Compose deve espelhar env vars obrigatorias e path canonico `/data/pkm`. [VERIFIED: 07-CONTEXT.md] [VERIFIED: src/lib/env.ts] |

## Plan Implications

Esta fase se divide naturalmente em **3 planos**, nao 1 plano monolítico. [VERIFIED: .planning/ROADMAP.md]

1. **Plano A — Standalone Build Artifact**
   - Alterar `next.config.ts` para `output: "standalone"` e tratar hash/version de build sem quebrar o fallback atual. [VERIFIED: next.config.ts] [ASSUMED]
   - Criar `Dockerfile` multi-stage e `.dockerignore`. [VERIFIED: repo grep]
   - Garantir inclusao de `index/` no runtime final. [VERIFIED: src/lib/pkm/fs-item-repository.ts]

2. **Plano B — Runtime Contract and Compose Validation**
   - Criar `compose.yaml` com `PKM_PATH=/data/pkm`, bind mount externo e usuario nao-root. [VERIFIED: 07-CONTEXT.md]
   - Definir se o mount default e `:ro` no exemplo local, preservando possibilidade futura de escrita. [VERIFIED: 07-CONTEXT.md]
   - Formalizar comando de validacao local por `docker compose`. [VERIFIED: 07-CONTEXT.md]

3. **Plano C — Operational Hardening and Docs**
   - Decidir e implementar healthcheck basico ou documentar por que ele fica fora. [VERIFIED: 07-CONTEXT.md]
   - Atualizar `README.md` e/ou `docs/dev-setup.md` separando claramente fluxo `npm run dev` vs fluxo container. [VERIFIED: README.md] [VERIFIED: docs/dev-setup.md]
   - Corrigir a referencia de producao antiga `/app/pkm` para o novo canonico `/data/pkm`. [VERIFIED: README.md] [VERIFIED: 07-CONTEXT.md]

## Sources

### Primary (HIGH confidence)

- Repositorio local (`src/lib/env.ts`, `src/lib/pkm/fs-item-repository.ts`, `src/lib/navigation/navigation-service.ts`, `src/proxy.ts`, `src/app/(auth)/login/page.tsx`, `package.json`, `README.md`, `docs/dev-setup.md`) - contrato real do runtime e riscos especificos do repo. [VERIFIED: repo grep]
- Next.js self-hosting guide - runtime env vars, cache, build id e self-hosting considerations. https://nextjs.org/docs/app/guides/self-hosting [CITED: https://nextjs.org/docs/app/guides/self-hosting]
- Next.js deploying guide - recomendacao atual de Docker e template standalone. https://nextjs.org/docs/app/getting-started/deploying [CITED: https://nextjs.org/docs/app/getting-started/deploying]
- Docker best practices - multi-stage, `.dockerignore`, containers efemeros, base image choice. https://docs.docker.com/build/building/best-practices/ [CITED: https://docs.docker.com/build/building/best-practices/]
- Node.js releases - status LTS de `v24` e recomendacao de usar Active/Maintenance LTS em producao. https://nodejs.org/en/about/previous-releases [CITED: https://nodejs.org/en/about/previous-releases]
- npm registry (`npm view next version time`, `npm view next@16.2.3 engines`, `npm view next-auth version time`, `npm view zod version time`) - versoes e datas publicadas. [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)

- npm scripts docs - `npm_package_version` disponivel em scripts npm, nao em qualquer processo Node arbitrario. https://docs.npmjs.com/cli/v11/using-npm/scripts/ [CITED: https://docs.npmjs.com/cli/v11/using-npm/scripts/]

### Tertiary (LOW confidence)

- Nenhuma fonte LOW foi necessaria; as unicas incertezas restantes estao marcadas como `[ASSUMED]`.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Next.js 16, Node LTS, Zod e o contrato do repo foram verificados em fonte oficial e no workspace. [VERIFIED: local command] [VERIFIED: npm registry] [VERIFIED: repo grep]
- Architecture: HIGH - a recomendacao central deriva diretamente do boundary da fase, do estado atual do repo e das docs oficiais de self-hosting/Docker. [VERIFIED: 07-CONTEXT.md] [CITED: https://nextjs.org/docs/app/getting-started/deploying]
- Pitfalls: HIGH - os principais riscos vieram de leitura direta do codigo atual (`index/`, `npm_package_version`, `proxy`). [VERIFIED: repo grep]

**Research date:** 2026-04-13  
**Valid until:** 2026-05-13
