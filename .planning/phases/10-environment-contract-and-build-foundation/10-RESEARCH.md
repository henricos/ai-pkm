# Phase 10: Environment Contract and Build Foundation - Research

**Researched:** 2026-04-17 [VERIFIED: local file inspection]  
**Domain:** Contrato de ambiente, `basePath` do Next.js, Auth.js/NextAuth e cadeia de build Docker/GitHub Actions [VERIFIED: local file inspection]  
**Confidence:** MEDIUM [VERIFIED: local file inspection]

## User Constraints

Nenhum `*-CONTEXT.md` existe em `.planning/phases/10-environment-contract-and-build-foundation/` no momento da pesquisa. [VERIFIED: init phase-op]

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENV-01 | App falha no startup se `APP_BASE_PATH` estiver ausente | Centralizar validação fail-fast em `src/lib/env.ts` com mensagem orientada a exemplo. [VERIFIED: REQUIREMENTS.md + local file inspection] |
| ENV-02 | App falha no startup se `NEXTAUTH_URL` estiver ausente | Estender o schema Zod já existente em `src/lib/env.ts`, preservando `process.exit(1)` e formato de erro consolidado. [VERIFIED: local file inspection] |
| ENV-03 | Pathname de `NEXTAUTH_URL` coincide com `APP_BASE_PATH` | Validar via `new URL(env.NEXTAUTH_URL).pathname` em `superRefine`, com mensagem mostrando o par correto. [VERIFIED: REQUIREMENTS.md] |
| CFG-01 | `next.config.ts` usa `APP_BASE_PATH` como fonte de `basePath` | Inserir leitura explícita de `process.env.APP_BASE_PATH` no `next.config.ts`; `basePath` em Next.js é build-time. [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath] |
| CFG-02 | Workflow passa `--build-arg APP_BASE_PATH=/pkm` | Ajustar `.github/workflows/release-ghcr.yml` e propagar o arg para o `Dockerfile`. [VERIFIED: local file inspection] |
| CFG-03 | Existe `withBasePath(path)` central | Criar helper único para composição server-side de paths absolutos/redirects e deixar a adoção em app routes para a Phase 11. [VERIFIED: ROADMAP.md + repo grep] |

## Project Constraints (from CLAUDE.md)

`CLAUDE.md` existe como apontamento para `AGENTS.md`, então as diretivas abaixo são normativas para esta fase. [VERIFIED: local file inspection]

- Ler `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md` e `.planning/ROADMAP.md` antes de agir. [VERIFIED: AGENTS.md]
- Conteúdo autoral e comunicação devem ficar em `pt-BR`; estrutura técnica e nomes de arquivo seguem inglês. [VERIFIED: AGENTS.md]
- Este repositório usa SDD/GSD; a fase deve respeitar a spec ativa em vez de improvisar comportamento novo fora do roadmap. [VERIFIED: AGENTS.md]
- Não fazer commit automático; qualquer commit exige aprovação explícita e uso da skill `/commit-push`. [VERIFIED: AGENTS.md]
- `AGENTS.md` e `.agents/skills/` são as fontes de verdade; não editar arquivos-apontadores como `CLAUDE.md` diretamente. [VERIFIED: AGENTS.md]
- Artefatos de planning devem respeitar versionamento de milestone `vMAJOR.MINOR` e app `MAJOR.MINOR.PATCH`. [VERIFIED: AGENTS.md]

## Summary

O repositório já tem uma base útil para esta fase: `src/lib/env.ts` usa `zod` e falha cedo com `process.exit(1)`, `next.config.ts` já centraliza config de build do framework, o workflow de release já faz `docker/build-push-action`, e existem contract tests para env e workflow. [VERIFIED: local file inspection] O problema é que hoje não existe `APP_BASE_PATH` em lugar nenhum, `next.config.ts` não define `basePath`, o `Dockerfile` não recebe esse valor no build, e ainda há hardcodes de `"/"` e `"/login"` espalhados pelo código. [VERIFIED: repo grep + local file inspection]

Para planejar bem a Phase 10, trate-a como uma fase de fundação com três entregas acopladas e não como refactor superficial: `1)` contrato de ambiente em `src/lib/env.ts`, `2)` cadeia de propagação build-time `release-ghcr.yml -> Dockerfile -> next.config.ts`, `3)` módulo central de base path com `withBasePath()`. [VERIFIED: ROADMAP.md + local file inspection] Isso permite que a Phase 11 fique estritamente focada em consumir a fundação nos redirects, hrefs e callbacks da aplicação. [VERIFIED: ROADMAP.md]

Há uma tensão técnica a explicitar no plano: a spec do projeto exige que o pathname de `NEXTAUTH_URL` coincida com `APP_BASE_PATH` e dá o exemplo `https://host/pkm`, enquanto a documentação legada do NextAuth para custom base path fala em URL completa até o endpoint de auth, como `https://host/custom-route/api/auth`. [VERIFIED: REQUIREMENTS.md] [CITED: https://next-auth.js.org/configuration/options] Isso não bloqueia a fase, mas reduz a confiança global para MEDIUM e pede teste de contrato explícito na sequência do milestone. [VERIFIED: local file inspection]

**Primary recommendation:** Planejar a Phase 10 em três slices: contrato/env, cadeia de build, helper central, sem misturar correção de todos os consumers de rota nesta mesma fase. [VERIFIED: ROADMAP.md]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `16.2.3` no repo; `16.2.4` latest em 2026-04-15 [VERIFIED: package.json + npm registry] | Fonte do `basePath` e comportamento de rotas do App Router [VERIFIED: local file inspection] | A documentação oficial afirma que `basePath` é a forma padrão de publicar a app sob subpath e que o valor é build-time. [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath] |
| `next-auth` | `5.0.0-beta.30` no repo; `beta.31` publicado em 2026-04-14 [VERIFIED: package.json + npm registry] | Auth single-user, custom page de login e handlers `/api/auth` [VERIFIED: local file inspection] | O projeto já usa a API `NextAuth({...})` com `pages.signIn` e `auth` exportado; mudar de stack aqui seria churn desnecessário. [VERIFIED: local file inspection] |
| `zod` | `4.3.6` no repo e latest [VERIFIED: package.json + npm registry] | Schema e fail-fast de env [VERIFIED: local file inspection] | O contrato de ambiente já está implementado em Zod; expandir no mesmo ponto reduz risco e mantém formato de erro consistente. [VERIFIED: local file inspection] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | `3.2.4` no repo; `4.1.4` latest em 2026-04-09 [VERIFIED: package.json + npm registry] | Contract tests de env/workflow/helper [VERIFIED: local file inspection] | Usar para testes de arquivo e módulos puros desta fase; não introduzir outro runner. [VERIFIED: local file inspection] |
| `docker/build-push-action` | `v6` no workflow [VERIFIED: local file inspection] | Publicação da imagem no GHCR [VERIFIED: local file inspection] | O workflow já está padronizado nessa action; a fase só precisa completar os `build-args`. [VERIFIED: local file inspection] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `APP_BASE_PATH` baked no build [VERIFIED: PROJECT.md] | Base path mutável em runtime com proxy strip [VERIFIED: REQUIREMENTS.md] | Está explicitamente fora de escopo deste milestone. [VERIFIED: REQUIREMENTS.md] |
| Validar env em `src/lib/env.ts` [VERIFIED: local file inspection] | Checks espalhados em `next.config.ts`, auth e componentes [ASSUMED] | Espalhar validação fragmenta mensagens de erro e dificulta teste isolado. [ASSUMED] |
| Helper `withBasePath()` único [VERIFIED: ROADMAP.md] | Concatenação manual de strings em cada redirect/href [VERIFIED: repo grep] | A base atual já mostra esse problema com `"/"` e `"/login"` hardcoded; repetir o padrão aumenta regressão. [VERIFIED: repo grep] |

**Installation:**

```bash
npm ci
```

Nenhuma nova dependência é necessária para a Phase 10; a lacuna atual é instalação local do workspace, não biblioteca faltante. [VERIFIED: package.json + npm test failure]

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── lib/
│   ├── env.ts               # contrato fail-fast do ambiente
│   ├── auth.ts              # config Auth.js/NextAuth
│   └── base-path.ts         # recomendado para basePath, normalizeBasePath e withBasePath
└── __tests__/
    ├── env.test.ts          # contrato ENV-01/02/03
    ├── release-workflow.test.ts
    └── with-base-path.test.ts
```

O módulo `src/lib/base-path.ts` é uma recomendação de organização, não um arquivo já existente. [ASSUMED]

### Pattern 1: Contrato Único de Ambiente

**What:** Manter `APP_BASE_PATH`, `NEXTAUTH_URL` e a sincronia entre ambos em um único schema Zod dentro de `src/lib/env.ts`. [VERIFIED: local file inspection]  
**When to use:** Sempre que uma regra puder bloquear startup ou build server-side. [VERIFIED: REQUIREMENTS.md]  
**Example:**

```ts
// Source: src/lib/env.ts + adaptação desta fase
const envSchema = z.object({
  APP_BASE_PATH: z.string().min(1, "APP_BASE_PATH é obrigatório"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL deve ser uma URL válida"),
}).superRefine((data, ctx) => {
  const pathname = new URL(data.NEXTAUTH_URL).pathname
  if (pathname !== data.APP_BASE_PATH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["NEXTAUTH_URL"],
      message: "NEXTAUTH_URL deve usar o mesmo pathname de APP_BASE_PATH"
    })
  }
})
```

Usar `new URL()` para extrair pathname é preferível a parsing manual de string. [ASSUMED]

### Pattern 2: Cadeia Explícita de Build-Time

**What:** Passar `APP_BASE_PATH` no workflow, recebê-lo como `ARG` no `Dockerfile`, promovê-lo a `ENV` no estágio `builder` e consumi-lo em `next.config.ts`. [VERIFIED: local file inspection]  
**When to use:** Sempre que o valor precisar ser inlined no bundle cliente pelo Next.js. [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath]  
**Example:**

```yaml
# Source: .github/workflows/release-ghcr.yml + Dockerfile
build-args: |
  APP_VERSION=${{ env.RELEASE_VERSION }}
  NEXT_PUBLIC_GIT_HASH=${{ env.SHORT_SHA }}
  APP_BASE_PATH=/pkm
```

```dockerfile
ARG APP_BASE_PATH
ENV APP_BASE_PATH=${APP_BASE_PATH}
```

```ts
const nextConfig: NextConfig = {
  basePath: process.env.APP_BASE_PATH,
}
```

### Pattern 3: Helper Server-Side de Prefixo

**What:** Criar `withBasePath(path)` como única porta para compor paths absolutos usados fora do auto-prefixo de `next/link`. [VERIFIED: ROADMAP.md]  
**When to use:** `redirect()`, `router.push()` com fallback calculado, callback URLs e URLs absolutas server-side. [VERIFIED: repo grep]  
**Example:**

```ts
// Source: padrão recomendado para esta fase
export function withBasePath(pathname: string) {
  if (!pathname.startsWith("/")) throw new Error("pathname deve iniciar com /")
  return pathname === "/" ? env.APP_BASE_PATH : `${env.APP_BASE_PATH}${pathname}`
}
```

Esta assinatura é recomendada, mas a implementação exata ainda não existe no repo. [ASSUMED]

### Anti-Patterns to Avoid

- **Misturar fundação com consumo:** corrigir todos os redirects/hrefs nesta fase embaralha a fronteira com a Phase 11. [VERIFIED: ROADMAP.md]
- **Validar `APP_BASE_PATH` só no `next.config.ts`:** isso perde a mensagem de erro amigável já padronizada em `src/lib/env.ts`. [VERIFIED: local file inspection]
- **Passar `APP_BASE_PATH` só no workflow sem alterar o `Dockerfile`:** o valor não chega ao `next build` do estágio `builder`. [VERIFIED: local file inspection]
- **Criar múltiplos helpers de rota:** o repositório já tem `route-helpers.ts` para IDs de navegação; duplicar responsabilidade aumenta confusão. [VERIFIED: local file inspection]

## Likely File Touch Points

| File | Why it matters |
|------|----------------|
| `src/lib/env.ts` | Já concentra schema Zod, mensagens em pt-BR e `process.exit(1)`; é o ponto natural para ENV-01/02/03. [VERIFIED: local file inspection] |
| `next.config.ts` | Hoje não define `basePath`; precisa ler `APP_BASE_PATH` para CFG-01. [VERIFIED: local file inspection] |
| `.github/workflows/release-ghcr.yml` | Já usa `docker/build-push-action@v6`; falta explicitar `APP_BASE_PATH=/pkm` nos `build-args`. [VERIFIED: local file inspection] |
| `Dockerfile` | Hoje o estágio `builder` não recebe `APP_BASE_PATH`; sem isso o `next build` não consegue inlinear o valor. [VERIFIED: local file inspection] |
| `src/lib/auth.ts` | Contém `pages.signIn: "/login"` e é o ponto mais sensível à interação entre basePath do app e Auth.js. [VERIFIED: local file inspection] |
| `src/components/login-form.tsx` | Já tem fallback `callbackUrl ?? "/"`; o helper da fase deve nascer pensando nesse consumer, mesmo que a troca fique para a Phase 11. [VERIFIED: local file inspection] |
| `src/app/(shell)/layout.tsx` e `src/app/(auth)/login/page.tsx` | Têm `redirect("/login")` e `redirect("/")`; são consumers diretos da fundação nova. [VERIFIED: repo grep] |
| `src/__tests__/env.test.ts` e `src/__tests__/release-workflow.test.ts` | Já existem e devem absorver boa parte da cobertura da fase sem criar suíte paralela. [VERIFIED: local file inspection] |

## Recommended Plan Slices

1. **Slice A — Contrato de ambiente**
   Atualizar `src/lib/env.ts` para incluir `APP_BASE_PATH`, ausência de `NEXTAUTH_URL` e verificação de sincronia de pathname com mensagem de exemplo. [VERIFIED: REQUIREMENTS.md + local file inspection]
2. **Slice B — Propagação build-time**
   Encadear `.github/workflows/release-ghcr.yml`, `Dockerfile` e `next.config.ts` para que `APP_BASE_PATH` exista no build e vire `basePath` do Next.js. [VERIFIED: local file inspection] [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath]
3. **Slice C — Módulo central de prefixo**
   Introduzir `withBasePath()` e, no máximo, plugar os testes/unit contracts do helper nesta fase; deixar a troca dos consumers para a Phase 11. [VERIFIED: ROADMAP.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Parsing de URL do `NEXTAUTH_URL` | Regex manual de hostname/path [ASSUMED] | `new URL(...).pathname` [ASSUMED] | Reduz edge cases com barra final, origem e URL inválida. [ASSUMED] |
| Prefixo de subpath | Concatenação ad hoc em cada componente [VERIFIED: repo grep] | `basePath` do Next.js + `withBasePath()` [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath] | `next/link` já recebe auto-prefixo do framework; só os casos fora disso precisam helper central. [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath] |
| Validação de env | `if` espalhado por módulo [ASSUMED] | Schema Zod existente [VERIFIED: local file inspection] | Preserva mensagem única, teste unitário simples e falha cedo. [VERIFIED: local file inspection] |

**Key insight:** O risco maior desta fase não é técnica complexa de framework; é inconsistência entre três superfícies diferentes do mesmo valor (`env`, `build`, `consumo server-side`). [VERIFIED: PROJECT.md + local file inspection]

## Common Pitfalls

### Pitfall 1: Atualizar o workflow sem atualizar o `Dockerfile`

**What goes wrong:** O workflow exibe `APP_BASE_PATH=/pkm`, mas o `next build` continua sem a variável no estágio `builder`. [VERIFIED: local file inspection]  
**Why it happens:** `docker/build-push-action` só injeta `build-arg`; o `Dockerfile` precisa declarar `ARG` e promover para `ENV` onde o build roda. [ASSUMED]  
**How to avoid:** Planejar a mudança como cadeia completa e testar por inspeção de arquivo nos dois lados. [VERIFIED: local file inspection]  
**Warning signs:** `next.config.ts` correto, workflow correto, mas bundle/rotas continuam sem prefixo. [ASSUMED]

### Pitfall 2: Espalhar `APP_BASE_PATH` como string por todo o app

**What goes wrong:** A fundação nasce, mas a app continua com vários pontos de concatenação manual e regressões futuras. [VERIFIED: repo grep]  
**Why it happens:** É tentador corrigir o primeiro redirect hardcoded encontrado sem criar helper central. [ASSUMED]  
**How to avoid:** Introduzir `withBasePath()` antes de tocar consumers. [VERIFIED: ROADMAP.md]  
**Warning signs:** Novos `"/login"` e `"/"` continuam aparecendo em grep depois da fase. [VERIFIED: repo grep]

### Pitfall 3: Colisão entre contrato do projeto e docs do NextAuth

**What goes wrong:** O time assume que `NEXTAUTH_URL` deve apontar para `/pkm/api/auth` porque a doc v4 fala nisso, enquanto a spec do milestone exige pathname igual a `/pkm`. [VERIFIED: REQUIREMENTS.md] [CITED: https://next-auth.js.org/configuration/options]  
**Why it happens:** O projeto usa `next-auth@5.0.0-beta.30`, mas a referência mais explícita para `NEXTAUTH_URL` custom path encontrada nesta pesquisa está na doc v4. [VERIFIED: package.json + npm registry] [CITED: https://next-auth.js.org/configuration/options]  
**How to avoid:** Tratar a spec do milestone como decisão travada e garantir teste de contrato/auth flow na Phase 12. [VERIFIED: REQUIREMENTS.md + ROADMAP.md]  
**Warning signs:** Dúvidas recorrentes sobre se o sync check deve comparar `/pkm` ou `/pkm/api/auth`. [VERIFIED: REQUIREMENTS.md] [CITED: https://next-auth.js.org/configuration/options]

## Code Examples

Verified patterns from official sources:

### `basePath` do Next.js

```ts
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
const nextConfig = {
  basePath: "/docs",
}
```

A doc também afirma que `basePath` é aplicado automaticamente em `next/link` e `next/router`. [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath]

### `pages.signIn` em Auth.js

```ts
// Source: https://authjs.dev/getting-started/session-management/custom-pages
pages: {
  signIn: "/login",
}
```

### `basePath` da API do Auth.js

```ts
// Source: https://authjs.dev/reference/nextjs
basePath?: string // default "/api/auth" in "next-auth"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcodes `"/"` e `"/login"` em app/auth/navigation [VERIFIED: repo grep] | Base path central + helper único [VERIFIED: ROADMAP.md] | Milestone `v2.2` definido em 2026-04-16 [VERIFIED: ROADMAP.md] | Reduz regressão quando a app roda sob `/pkm`. [VERIFIED: PROJECT.md] |
| Subpath tratado implicitamente fora do framework [VERIFIED: local file inspection] | `next.config.ts` com `basePath` explícito [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath] | Recomendação atual do Next.js [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath] | O valor passa a ser build-time e exige nova release para mudar. [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath] |
| Env sem `APP_BASE_PATH` [VERIFIED: local file inspection] | Contrato explícito de sincronia app/auth [VERIFIED: REQUIREMENTS.md] | Milestone `v2.2` [VERIFIED: PROJECT.md] | Startup inválido falha cedo em vez de quebrar só em runtime. [VERIFIED: REQUIREMENTS.md] |

**Deprecated/outdated:**

- Tratar a raiz `/` como ponto de entrada funcional em dev está fora do contrato atual; o milestone define `localhost:3000/pkm` como acesso correto e raiz 404. [VERIFIED: PROJECT.md]
- Assumir que só o runtime precisa conhecer o subpath está desatualizado; `basePath` do Next.js é build-time. [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `new URL(...).pathname` é a melhor implementação prática para o sync check | Don't Hand-Roll / Pattern 1 | Baixo; muda a implementação, não o contrato |
| A2 | O helper recomendado deve morar em `src/lib/base-path.ts` | Architecture Patterns | Baixo; afeta organização e naming, não comportamento |
| A3 | O `Dockerfile` precisa promover `ARG APP_BASE_PATH` para `ENV` no estágio builder para o `next build` enxergar a variável | Common Pitfalls | Médio; se errado, o planner pode superestimar um passo de implementação |

## Open Questions (RESOLVED)

1. **RESOLVED: Qual pathname o projeto quer travar em `NEXTAUTH_URL`?**
   - What we know: a spec ativa exige pathname igual a `APP_BASE_PATH` e usa o exemplo `https://host/pkm`. [VERIFIED: REQUIREMENTS.md]
   - Tension: a doc do NextAuth para custom base path mostra a URL completa até `/api/auth`. [CITED: https://next-auth.js.org/configuration/options]
   - Resolution: para esta milestone, a decisão travada do projeto prevalece. O pathname aceito em `NEXTAUTH_URL` é exatamente o `APP_BASE_PATH` do app, por exemplo `https://host/pkm`. A Phase 10 não muda `basePath` do Auth.js nem valida `/api/auth`; isso fica fora do boundary atual. [VERIFIED: REQUIREMENTS.md + ROADMAP.md]
   - Planning impact: `env.ts` deve comparar `new URL(NEXTAUTH_URL).pathname` com o `APP_BASE_PATH` normalizado e os testes devem cobrir o caso válido `https://host/pkm`. [VERIFIED: REQUIREMENTS.md]

2. **RESOLVED: Normalizar ou rejeitar barra final em `APP_BASE_PATH`?**
   - What we know: a spec fala em `/pkm`, não em `/pkm/`. [VERIFIED: REQUIREMENTS.md]
   - Resolution: a fundação da fase deve aceitar input com barra final apenas como conveniência de configuração e normalizá-lo deterministicamente para `/pkm` no módulo central de base path. O contrato persistido e comparado pelo restante da aplicação passa a ser sempre sem barra final, exceto o caso raiz `/`. [ASSUMED]
   - Planning impact: `normalizeBasePath()` deve cobrir `/pkm/ -> /pkm`, e o teste unitário do helper deve provar esse comportamento. [ASSUMED]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build/config/tests | ✓ [VERIFIED: command output] | `v24.14.1` [VERIFIED: command output] | — |
| npm | install/test scripts | ✓ [VERIFIED: command output] | `11.11.0` [VERIFIED: command output] | — |
| git | workflow metadata / repo ops | ✓ [VERIFIED: command output] | `2.43.0` [VERIFIED: command output] | — |
| Docker CLI | validação local de imagem/container | ✗ [VERIFIED: command output] | — | Validar workflow/Dockerfile por contract tests e inspeção de arquivo nesta fase. [VERIFIED: local file inspection] |
| `node_modules` / `vitest` bin | execução local da suíte | ✗ [VERIFIED: npm test failure] | — | Rodar `npm ci` antes da execução dos testes. [VERIFIED: package.json + npm test failure] |

**Missing dependencies with no fallback:**

- Nenhuma para planejamento da fase. [VERIFIED: local file inspection]

**Missing dependencies with fallback:**

- Docker local ausente; a fase ainda pode ser planejada e parcialmente executada com testes de contrato de arquivo. [VERIFIED: command output]
- Dependências JS não instaladas; o fallback é instalar com `npm ci` antes de validar. [VERIFIED: npm test failure]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4` no repo; config dedicada existe em `vitest.config.ts`. [VERIFIED: package.json + local file inspection] |
| Config file | `vitest.config.ts`. [VERIFIED: local file inspection] |
| Quick run command | `npm test -- src/__tests__/env.test.ts src/__tests__/release-workflow.test.ts` [VERIFIED: package.json + existing tests] |
| Full suite command | `npm test` [VERIFIED: package.json] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ENV-01 | Falha se `APP_BASE_PATH` ausente | unit | `npm test -- src/__tests__/env.test.ts` | ✅ `env.test.ts` existe; caso novo a adicionar. [VERIFIED: local file inspection] |
| ENV-02 | Falha se `NEXTAUTH_URL` ausente | unit | `npm test -- src/__tests__/env.test.ts` | ✅ `env.test.ts` existe; caso novo a adicionar. [VERIFIED: local file inspection] |
| ENV-03 | Falha se pathname diverge | unit | `npm test -- src/__tests__/env.test.ts` | ✅ `env.test.ts` existe; caso novo a adicionar. [VERIFIED: local file inspection] |
| CFG-01 | `next.config.ts` usa `APP_BASE_PATH` | contract | `npm test -- src/__tests__/next-config.test.ts` | ❌ Wave 0. [ASSUMED] |
| CFG-02 | Workflow passa `APP_BASE_PATH=/pkm` | contract | `npm test -- src/__tests__/release-workflow.test.ts` | ✅ `release-workflow.test.ts` existe. [VERIFIED: local file inspection] |
| CFG-03 | `withBasePath()` funciona | unit | `npm test -- src/__tests__/with-base-path.test.ts` | ❌ Wave 0. [ASSUMED] |

### Sampling Rate

- **Per task commit:** `npm test -- src/__tests__/env.test.ts src/__tests__/release-workflow.test.ts` [VERIFIED: package.json + existing tests]
- **Per wave merge:** `npm test` [VERIFIED: package.json]
- **Phase gate:** suíte relevante verde após `npm ci`; hoje a execução falha porque `vitest` não está instalado no workspace. [VERIFIED: npm test failure]

### Wave 0 Gaps

- [ ] `npm ci` — dependências não estão instaladas no workspace atual. [VERIFIED: npm test failure]
- [ ] `src/__tests__/next-config.test.ts` — contrato de `basePath` em `next.config.ts`. [ASSUMED]
- [ ] `src/__tests__/with-base-path.test.ts` — contrato de `withBasePath()`. [ASSUMED]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes [VERIFIED: local file inspection] | Auth.js/NextAuth com custom page e credenciais single-user. [VERIFIED: local file inspection] |
| V3 Session Management | yes [VERIFIED: local file inspection] | Sessão JWT gerida por Auth.js/NextAuth. [VERIFIED: local file inspection] |
| V4 Access Control | yes [VERIFIED: local file inspection] | `auth()` em layout protegido e route handlers. [VERIFIED: local file inspection] |
| V5 Input Validation | yes [VERIFIED: local file inspection] | `zod` em `src/lib/env.ts`. [VERIFIED: local file inspection] |
| V6 Cryptography | yes [VERIFIED: local file inspection] | `NEXTAUTH_SECRET` obrigatório; não hand-roll de segredo/sessão. [VERIFIED: local file inspection] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Misconfiguração de canonical URL/base path | Tampering | Fail-fast em `src/lib/env.ts` antes da app subir. [VERIFIED: REQUIREMENTS.md + local file inspection] |
| Redirect incorreto para rota sem prefixo | Spoofing | `withBasePath()` único para redirects server-side. [VERIFIED: ROADMAP.md] |
| Divergência entre build e runtime | Tampering | Fixar `APP_BASE_PATH` no workflow e refletir no build do Next.js. [VERIFIED: PROJECT.md + local file inspection] |

## Sources

### Primary (HIGH confidence)

- Repositório local: `src/lib/env.ts`, `next.config.ts`, `src/lib/auth.ts`, `Dockerfile`, `compose.yaml`, `.github/workflows/release-ghcr.yml`, `src/__tests__/env.test.ts`, `src/__tests__/release-workflow.test.ts`, `vitest.config.ts`. [VERIFIED: local file inspection]
- Next.js `basePath` docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
- Auth.js reference for Next.js: https://authjs.dev/reference/nextjs
- Auth.js custom pages: https://authjs.dev/getting-started/session-management/custom-pages
- npm registry checks via `npm view` for `next`, `next-auth`, `zod`, `vitest`. [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)

- NextAuth options docs for `NEXTAUTH_URL` custom base path: https://next-auth.js.org/configuration/options

### Tertiary (LOW confidence)

- Nenhuma. [VERIFIED: local file inspection]

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - versões do repo e latests foram confirmados via `package.json` e `npm view`. [VERIFIED: package.json + npm registry]
- Architecture: MEDIUM - a cadeia `workflow -> Dockerfile -> next.config` está clara, mas há tensão documental sobre o pathname exato de `NEXTAUTH_URL`. [VERIFIED: REQUIREMENTS.md + local file inspection] [CITED: https://next-auth.js.org/configuration/options]
- Pitfalls: HIGH - os hardcodes e lacunas de build estão visíveis no repo atual. [VERIFIED: repo grep + local file inspection]

**Research date:** 2026-04-17 [VERIFIED: local file inspection]  
**Valid until:** 2026-04-24 para Auth.js/Next.js e npm latests; 30 dias para achados puramente do repositório. [ASSUMED]
