# Phase 11: Application Code Alignment - Research

**Researched:** 2026-04-17
**Domain:** Next.js basePath, NextAuth redirects, server-side navigation, URL composition
**Confidence:** HIGH

## Summary

A Phase 11 consome a fundacao entregue na Phase 10. O `withBasePath()` ja existe em `src/lib/base-path.ts` e o Next.js ja tem `basePath` configurado globalmente. O que falta e aplicar `withBasePath()` nos pontos especificos onde o framework **nao** prefixa automaticamente: `redirect()` server-side, `pages.signIn` do NextAuth, fallback de `callbackUrl` no `LoginForm`, e composicao manual de URLs de preview/download no viewer.

A analise do codigo atual revela exatamente quatro sitios de corracao, todos de escopo cirurgico: nenhum novo helper e necessario alem do que a Phase 10 entregou. O risco principal e `double-prefix` — aplicar `withBasePath()` em URLs que o framework ja prefixa automaticamente via `next/link` ou `<a>` dentro do contexto de `basePath`. Os pontos identificados usam `redirect()` server-side, `<a href=...>` com string literal e `router.push()` client-side com valor vindo de `searchParams` — todos fora da automacao do `basePath` do Next.js.

**Recomendacao primaria:** corrigir os quatro sitios em ondas separadas e atomicas (redirects server-side → auth config → LoginForm client → viewer URLs), com rollback simples possivel em cada onda.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** O `APP_BASE_PATH` permanece um concern de fronteira. A aplicacao continua tratando `"/login"`, `"/library/..."`, `"/inbox/..."` e `"/api/pkm/..."` como rotas internas canonicas.
- **D-02:** `withBasePath()` deve ser aplicado apenas nos pontos em que o Next.js nao prefixa automaticamente a URL publica final, como `redirect()`, `pages.signIn`, fallback de callback e composicao manual de URLs absolutas para o browser.
- **D-03:** Helpers de navegacao e camada de dominio nao devem passar a conhecer `APP_BASE_PATH`; evitar que detalhe de deploy/build vaze para `itemToHref()` ou contratos equivalentes.
- **D-04:** Quando `callbackUrl` estiver ausente, vazio ou for considerado invalido, o destino canonico apos login deve ser a raiz publica da app, isto e, `withBasePath("/")`.
- **D-05:** A implementacao deve ser defensiva contra redirecionamento errado; sanitizacao exata do `callbackUrl` fica como detalhe de implementacao, mas o comportamento observavel precisa impedir fallback para `"/"` sem prefixo ou destinos inadequados.
- **D-06:** As rotas dedicadas `/api/pkm/preview/...` e `/api/pkm/raw/...` permanecem como contratos da app; esta fase nao reinterpreta a semantica dessas rotas.
- **D-07:** URLs de preview e download compostas manualmente para o viewer devem incluir o prefixo configurado na URL publica final, preservando a separacao semantica entre preview inline e download attachment.

### Claude's Discretion
- Estrategia exata para validar se `callbackUrl` e seguro o bastante para reuse no client, desde que o comportamento final respeite D-04 e D-05.
- Forma de centralizar helpers adicionais para reduzir repeticao de `withBasePath()` sem contaminar a camada de navegacao com `APP_BASE_PATH`.
- Cobertura de testes unitarios ou de integracao a ser adicionada depois na Phase 12, desde que a implementacao da fase deixe pontos observaveis claros para essa cobertura.

### Deferred Ideas (OUT OF SCOPE)
- Tornar a camada de navegacao inteira base-aware, com `itemToHref()` emitindo URLs publicas ja prefixadas.
- Redesenhar o contrato das rotas de asset preview/download ou unifica-las sob outro helper conceitual.
- Expandir a discussao de seguranca de auth para alem do fallback de callback desta fase.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| APP-01 | Redirects em `src/app/(shell)/layout.tsx` e `src/app/(auth)/login/page.tsx` usam o prefixo configurado em vez de strings absolutas cruas. | Confirmado: `layout.tsx` usa `redirect("/login")` e `login/page.tsx` usa `redirect("/")` — ambos precisam de `withBasePath()`. |
| APP-02 | Geracao de hrefs em `src/lib/navigation/route-helpers.ts` e callback fallback em `src/components/login-form.tsx` usam o prefixo configurado. | Confirmado: `LoginForm` tem `callbackUrl ?? "/"` sem prefixo. `route-helpers.ts` retorna rotas internas canonicas — conforme D-03, NAO deve receber `withBasePath()`; o ajuste e apenas no `pages.signIn` do auth.ts. |
| APP-03 | Rotas de preview e download em `src/components/viewer/viewer-page.tsx` e `src/components/viewer/viewer-header.tsx` usam o prefixo configurado. | Confirmado: `viewer-page.tsx` compoem `/api/pkm/preview/${encodedId}` e `/api/pkm/raw/${encodedId}` sem prefixo; `viewer-header.tsx` compoem `/api/pkm/raw/${encodeURIComponent(itemId)}` sem prefixo. |
</phase_requirements>

---

## Standard Stack

### Core
| Biblioteca | Versao | Papel | Por que padrao |
|-----------|--------|-------|----------------|
| `withBasePath()` | ja existe (`src/lib/base-path.ts`) | composicao de URLs publicas prefixadas | helper central entregue na Phase 10; nao criar alternativa |
| `next/navigation` `redirect()` | Next.js 15 (ja instalado) | redirect server-side | unico mecanismo de redirect em Server Components no App Router |
| `next-auth` `pages.signIn` | next-auth v5 (ja instalado) | configuracao da pagina de sign-in do NextAuth | campo string aceito pelo NextAuth que precisa de URL publica |

### Sem dependencias novas
Esta fase nao adiciona nenhum pacote. Toda a infraestrutura necessaria ja existe. [VERIFIED: inspeção do codebase]

---

## Architecture Patterns

### Mapa de sitios de correcao

| Sitio | Arquivo | Problema atual | Corracao | Decisao aplicada |
|-------|---------|----------------|----------|-----------------|
| Redirect nao autenticado | `src/app/(shell)/layout.tsx:26` | `redirect("/login")` | `redirect(withBasePath("/login"))` | D-01, D-02 |
| Redirect pos-auth | `src/app/(auth)/login/page.tsx:13` | `redirect("/")` | `redirect(withBasePath("/"))` | D-01, D-02 |
| pages.signIn do NextAuth | `src/lib/auth.ts:32` | `pages: { signIn: "/login" }` | `pages: { signIn: withBasePath("/login") }` | D-02, APP-02 |
| Fallback de callbackUrl | `src/components/login-form.tsx:13` | `searchParams.get("callbackUrl") ?? "/"` | `searchParams.get("callbackUrl") ?? withBasePath("/")` + sanitizacao defensiva (D-04, D-05) |
| previewHref no viewer | `src/components/viewer/viewer-page.tsx:82` | `` `/api/pkm/preview/${encodedId}` `` | `withBasePath(\`/api/pkm/preview/${encodedId}\`)` | D-06, D-07 |
| downloadHref no viewer | `src/components/viewer/viewer-page.tsx:83` | `` `/api/pkm/raw/${encodedId}` `` | `withBasePath(\`/api/pkm/raw/${encodedId}\`)` | D-06, D-07 |
| Download link no header | `src/components/viewer/viewer-header.tsx:220` | `` `/api/pkm/raw/${encodeURIComponent(itemId)}` `` | `withBasePath(\`/api/pkm/raw/${encodeURIComponent(itemId)}\`)` | D-06, D-07 |

### O que NAO muda

- `src/lib/navigation/route-helpers.ts` (`itemToHref`, etc.) — retorna rotas internas canonicas sem prefixo; consumers ja sao `next/link` que o Next.js prefixa automaticamente. Mudar violaria D-03. [VERIFIED: inspeção do codebase]
- Qualquer `<Link href=...>` de `next/link` — o `basePath` do Next.js ja e aplicado automaticamente pelo framework nesses casos. Adicionar `withBasePath()` causaria double-prefix. [VERIFIED: inspeção do codebase + contrato documentado em `src/lib/base-path.ts:57`]
- Chamadas a `router.push()` com rotas internas (ex: navegacao entre paginas) — o App Router aplica `basePath` automaticamente em `router.push()` quando a string e um path relativo interno. A excecao e quando o valor vem de uma source externa como `searchParams.get("callbackUrl")`.

### Pattern: redirect() server-side com withBasePath

```typescript
// [VERIFIED: src/lib/base-path.ts]
// Correto: withBasePath() e chamado no redirect server-side
import { redirect } from "next/navigation";
import { withBasePath } from "@/lib/base-path";

// Em ShellLayout:
if (!session) {
  redirect(withBasePath("/login"));
}

// Em LoginPage:
if (session) redirect(withBasePath("/"));
```

### Pattern: pages.signIn no NextAuth

```typescript
// [VERIFIED: src/lib/auth.ts + src/lib/base-path.ts]
// O campo pages.signIn recebe a URL publica; NextAuth nao aplica basePath automaticamente
import { withBasePath } from "@/lib/base-path";

pages: {
  signIn: withBasePath("/login"),
},
```

**Atencao:** `withBasePath()` e chamado em tempo de execucao do modulo `auth.ts`, que roda server-side. A variavel `APP_BASE_PATH` esta disponivel no ambiente no momento em que o modulo e carregado (garantido pela Phase 10). [ASSUMED — comportamento de avaliacao de modulo Node.js; risco baixo dado o padrao well-known]

### Pattern: callbackUrl defensivo no LoginForm

```typescript
// [VERIFIED: src/components/login-form.tsx]
// Problema: callbackUrl sem prefixo como fallback
const rawCallback = searchParams.get("callbackUrl");

// Solucao: fallback para withBasePath("/"), validacao opcional de origem
import { withBasePath } from "@/lib/base-path";

const callbackUrl = rawCallback && isValidCallback(rawCallback)
  ? rawCallback
  : withBasePath("/");
```

**Nota sobre `withBasePath` no client component:** `withBasePath()` usa `process.env.APP_BASE_PATH` em seu default. No contexto do browser, variaveis `process.env.*` que nao sao `NEXT_PUBLIC_*` **nao estao disponiveis**. O helper `getConfiguredBasePath()` usa `process.env.APP_BASE_PATH ?? "/"` — em build com `basePath` baked, o valor correto precisa ser acessivel no client.

Investigar: `withBasePath` importado em Client Component funciona porque o Next.js faz tree-shake e o valor de `APP_BASE_PATH` e injetado no bundle durante o build via `basePath` do `next.config.ts`? Ou e necessario usar `NEXT_PUBLIC_APP_BASE_PATH`? Ver secao **Open Questions** abaixo.

### Pattern: viewer URLs com prefixo

```typescript
// [VERIFIED: src/components/viewer/viewer-page.tsx — Server Component]
// withBasePath() chamado server-side; sem problema de acesso a process.env
import { withBasePath } from "@/lib/base-path";

const previewHref = withBasePath(`/api/pkm/preview/${encodedId}`);
const downloadHref = withBasePath(`/api/pkm/raw/${encodedId}`);
```

```typescript
// [VERIFIED: src/components/viewer/viewer-header.tsx — Client Component]
// ATENCAO: viewer-header.tsx e "use client"; mesma questao de process.env que LoginForm
// href passado como prop de viewer-page.tsx (Server Component) seria alternativa segura
```

---

## Don't Hand-Roll

| Problema | Nao construir | Usar em vez disso | Por que |
|----------|---------------|-------------------|---------|
| Composicao de URL publica com prefixo | concatenacao manual de strings | `withBasePath()` de `src/lib/base-path.ts` | ja trata normalizacao, barras duplas, basePath raiz `/` |
| Redirect server-side | qualquer outro mecanismo | `redirect()` de `next/navigation` + `withBasePath()` | unico padrao App Router; throwable |
| Validacao de `callbackUrl` | parser de URL completo | verificacao simples de origem ou prefixo | escopo desta fase e apenas o fallback (D-05); validacao completa esta fora do escopo |

---

## Common Pitfalls

### Pitfall 1: Double-prefix em next/link ou router.push interno
**O que acontece:** Developer aplica `withBasePath()` em um href passado para `<Link>` ou em `router.push()` com rota interna. O Next.js ja adiciona o `basePath` automaticamente nesses casos, resultando em `/pkm/pkm/login`.
**Por que acontece:** Confusao entre "onde o framework prefixa automaticamente" e "onde nao prefixa".
**Como evitar:** Regra do `src/lib/base-path.ts:57` e clara — usar `withBasePath()` apenas em `redirect()`, `pages.signIn`, fallback de callback e composicao manual de URLs para o browser. `<Link href="/login">` nao precisa de `withBasePath()`.
**Sinais de alerta:** URL resultante contem `/pkm/pkm/`; testes de navegacao quebram com 404.

### Pitfall 2: withBasePath() em Client Component sem acesso a process.env
**O que acontece:** `withBasePath()` importado em `"use client"` chama `process.env.APP_BASE_PATH` que retorna `undefined` no browser, causando fallback para `"/"` e ausencia do prefixo.
**Por que acontece:** Variaveis de ambiente sem prefixo `NEXT_PUBLIC_` nao sao incluidas no bundle do browser pelo Next.js.
**Como evitar:** Duas estrategias validas:
  1. Passar o `href` ja calculado como prop de um Server Component pai (estrategia mais segura).
  2. Verificar se o Next.js bake o valor de `APP_BASE_PATH` no bundle client via `basePath` do `next.config.ts` (requer investigacao — ver Open Questions).
**Sinais de alerta:** Em dev com `APP_BASE_PATH=/pkm`, o viewer mostra URL de download sem `/pkm`; inspecao do href no browser mostra `/api/pkm/raw/...` em vez de `/pkm/api/pkm/raw/...`.

### Pitfall 3: pages.signIn avaliado antes de APP_BASE_PATH estar disponivel
**O que acontece:** `auth.ts` e um modulo singleton; se `withBasePath()` for chamado na definicao do objeto de configuracao e `APP_BASE_PATH` nao estiver disponivel no momento, o valor baked sera incorreto.
**Por que acontece:** Modulos Node.js sao avaliados uma vez no startup.
**Como evitar:** Na Phase 10, `APP_BASE_PATH` e obrigatorio e validado antes do startup; o modulo auth so e carregado apos essa validacao. Risco real e baixo. [ASSUMED — sequencia de carregamento do Next.js]

### Pitfall 4: callbackUrl apontando para dominio externo (open redirect)
**O que acontece:** Um atacante forja `?callbackUrl=https://evil.com` e o `LoginForm` redireciona para esse dominio apos o login.
**Por que acontece:** O valor de `callbackUrl` vem de `searchParams` sem validacao.
**Como evitar:** Sanitizar `callbackUrl` para aceitar apenas paths que comecam com `withBasePath("/")` ou que sao paths relativos conhecidos. O escopo minimo aceitavel (D-05): rejeitar qualquer valor que nao comece com o `basePath` configurado ou que contenha `://`.
**Sinais de alerta:** Redirect apos login vai para origem diferente de `localhost:3000`.

---

## Code Examples

### Verificacao rapida do problema atual
[VERIFIED: inspeção direta dos arquivos]

`layout.tsx` linha 26:
```typescript
redirect("/login");  // BUG: falta withBasePath()
```

`login/page.tsx` linha 13:
```typescript
if (session) redirect("/");  // BUG: falta withBasePath()
```

`auth.ts` linha 32:
```typescript
pages: { signIn: "/login" },  // BUG: falta withBasePath()
```

`login-form.tsx` linha 13:
```typescript
const callbackUrl = searchParams.get("callbackUrl") ?? "/";  // BUG: fallback sem prefixo
```

`viewer-page.tsx` linhas 82-83:
```typescript
const previewHref = `/api/pkm/preview/${encodedId}`;   // BUG: falta withBasePath()
const downloadHref = `/api/pkm/raw/${encodedId}`;      // BUG: falta withBasePath()
```

`viewer-header.tsx` linha 220:
```typescript
href={`/api/pkm/raw/${encodeURIComponent(itemId)}`}  // BUG: falta withBasePath()
```

---

## Runtime State Inventory

> Fase de ajuste de codigo — nao e rename/refactor de string no repositorio. Nenhum estado runtime precisa de migracao de dados.

| Categoria | Itens encontrados | Acao necessaria |
|-----------|-------------------|-----------------|
| Dados armazenados | Nenhum — verificado. Nenhum banco armazena o prefixo como chave. | Nenhuma |
| Configuracao de servico externo | Nenhum — verificado. Cloudflare Tunnel preserva o path; nenhuma config de servico externo hardcoda `/login` ou `/` sem prefixo. | Nenhuma |
| Estado registrado no OS | Nenhum — verificado. | Nenhuma |
| Secrets/env vars | `APP_BASE_PATH` existe e e obrigatorio (Phase 10); nenhum rename de key. | Nenhuma |
| Artefatos de build | Build baked com `APP_BASE_PATH=/pkm`; apos esta fase o bundle gerado ja refletira o prefixo correto nos redirects e hrefs. | Re-build natural da fase |

---

## Validation Architecture

### Test Framework
| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest (jsdom) |
| Config | `vitest.config.ts` (raiz) |
| Comando rapido | `npm test` |
| Suite completa | `npm test` |

### Mapa de Requisitos para Testes

| Req ID | Comportamento | Tipo de teste | Comando automatico | Arquivo existe? |
|--------|--------------|--------------|-------------------|----------------|
| APP-01 | redirect nao autenticado vai para `/pkm/login` | unit (contrato) | `npm test -- auth` | Existe: `auth.test.ts` — precisara de novo caso de teste |
| APP-01 | redirect pos-login vai para `/pkm` | unit (contrato) | `npm test -- auth` | Existe: `auth.test.ts` — precisara de novo caso de teste |
| APP-02 | `pages.signIn` do NextAuth tem `/pkm/login` | unit | `npm test -- auth` | Existe: `auth.test.ts` — precisara de novo caso |
| APP-02 | callbackUrl fallback resulta em `/pkm` | unit | `npm test -- login-form` ou novo arquivo | Nao existe: `login-form.test.ts` |
| APP-03 | previewHref e downloadHref no viewer contem `/pkm` | unit | `npm test -- viewer-page` | Existe: `viewer-page.test.tsx` — precisara de novo caso |
| APP-03 | download link no viewer-header contem `/pkm` | unit | `npm test -- viewer-header` | Existe: `viewer-header.test.tsx` — precisara de novo caso |

**Nota:** A Phase 11 deve deixar os pontos observaveis claros (comportamentos verificaveis). Testes formais de TST-01 e TST-02 sao responsabilidade da Phase 12, conforme REQUIREMENTS.md. Os casos de teste acima sao incrementos nos arquivos existentes que a Phase 11 pode ou nao incluir — fica a criterio do planejador conforme D (Claude's Discretion).

### Wave 0 Gaps
- `src/__tests__/login-form.test.tsx` — cobre APP-02 (callbackUrl fallback). Arquivo nao existe; sera necessario na Phase 12 mas pode ser criado aqui como parte da correcao se o planejador decidir.

---

## Open Questions (RESOLVED)

1. **withBasePath() em Client Component (LoginForm e ViewerHeader)** — RESOLVED
   - O que sabemos: `getConfiguredBasePath()` le `process.env.APP_BASE_PATH ?? "/"`. No browser, `process.env.APP_BASE_PATH` nao esta disponivel como variavel de runtime a menos que seja `NEXT_PUBLIC_*`.
   - O que nao e claro: O Next.js, ao processar o bundle do client, substitui estaticamente os `process.env` references durante o build? Se `APP_BASE_PATH` esta no `basePath` do next.config.ts, o transpilador inclui isso no bundle client?
   - Recomendacao: Para `viewer-header.tsx`, a estrategia mais segura e mover a composicao das URLs para `viewer-page.tsx` (Server Component) e passar como props. Para `login-form.tsx`, a estrategia mais segura e igualmente passar o `basePath` como prop do `LoginPage` (Server Component).
   - Alternativa verificavel: inspecionar o bundle client compilado em dev para ver se `process.env.APP_BASE_PATH` resolve para `/pkm` ou `undefined`. [LOW confidence sem verificacao em tempo de execucao]
   - **Estrategia adotada:** passar hrefs ja calculados como props de Server Components pai (`viewer-page.tsx` → `viewer-header.tsx`; `login/page.tsx` → `login-form.tsx`). Evita completamente a questao de disponibilidade de `process.env` no client. Ver Plans 11-02 e 11-03.

2. **Sanitizacao minima de callbackUrl (D-05)** — RESOLVED
   - O que sabemos: D-05 diz que o comportamento observavel deve impedir fallback para `"/"` sem prefixo; a sanitizacao exata e detalhe de implementacao.
   - O que nao e claro: o nivel minimo aceitavel — rejeitar tudo que nao comece com `APP_BASE_PATH` e suficiente, ou tambem e preciso rejeitar valores com `://`?
   - Recomendacao: Uma verificacao `startsWith(withBasePath("/"))` e suficiente para prevenir open redirect para dominios externos e tambem para o caso de callback sem prefixo. Qualquer valor que nao passe na verificacao cai no fallback `withBasePath("/")`.
   - **Estrategia adotada:** funcao `isValidCallback(url, baseFallback)` em `login-form.tsx` rejeita URLs com `://` (open redirect) e paths que nao comecem com `baseFallback` (= `withBasePath("/")`). Ambas as verificacoes aplicadas. Ver Plan 11-02, Task 2.

---

## Environment Availability

> Fase puramente de alteracoes de codigo. Todas as dependencias ja estao instaladas e operacionais. Step 2.6: SKIPPED (sem dependencias externas alem das ja verificadas na Phase 10).

---

## Security Domain

### Categorias ASVS aplicaveis

| Categoria ASVS | Aplica | Controle padrao |
|----------------|--------|-----------------|
| V2 Authentication | sim — pages.signIn e callbackUrl | `withBasePath()` no campo `pages.signIn`; sanitizacao de `callbackUrl` |
| V3 Session Management | nao — sem mudanca na estrategia de sessao | — |
| V4 Access Control | sim — redirect nao autenticado | `redirect(withBasePath("/login"))` em ShellLayout |
| V5 Input Validation | sim — `callbackUrl` vem de searchParams | validacao `startsWith(withBasePath("/"))` ou equivalente |
| V6 Cryptography | nao — sem mudanca em crypto | — |

### Padroes de ameaca conhecidos para este stack

| Padrao | STRIDE | Mitigacao padrao |
|--------|--------|-----------------|
| Open redirect via callbackUrl | Spoofing | Validar que `callbackUrl` comeca com o `basePath` configurado antes de usar |
| Redirect para raiz sem prefixo apos login | Tampering (quebra de contrato) | Fallback explicioto para `withBasePath("/")` quando callbackUrl ausente/invalido |

---

## Assumptions Log

| # | Afirmacao | Secao | Risco se errado |
|---|-----------|-------|-----------------|
| A1 | `process.env.APP_BASE_PATH` nao esta disponivel em bundles client-side (sem `NEXT_PUBLIC_` prefix) | Architecture Patterns (Pattern callbackUrl), Common Pitfalls 2 | Se o Next.js bake o valor durante o build (via `define` do webpack), a estrategia de passar como prop seria desnecessaria — mas nao causaria regressao, apenas seria mais verbose |
| A2 | `auth.ts` e avaliado apos a validacao de env do Phase 10; `withBasePath()` chamado na definicao de `pages.signIn` tera `APP_BASE_PATH` disponivel | Architecture Patterns (Pattern pages.signIn), Common Pitfalls 3 | Risco baixo; startup falharia antes de chegar a `auth.ts` se `APP_BASE_PATH` estivesse ausente |

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: inspeção direta] `src/lib/base-path.ts` — contrato de `withBasePath()`, regra de uso server-side documentada na linha 57
- [VERIFIED: inspeção direta] `src/app/(shell)/layout.tsx` — `redirect("/login")` sem prefixo, linha 26
- [VERIFIED: inspeção direta] `src/app/(auth)/login/page.tsx` — `redirect("/")` sem prefixo, linha 13
- [VERIFIED: inspeção direta] `src/lib/auth.ts` — `pages: { signIn: "/login" }` sem prefixo, linha 32
- [VERIFIED: inspeção direta] `src/components/login-form.tsx` — `callbackUrl ?? "/"` sem prefixo, linha 13
- [VERIFIED: inspeção direta] `src/components/viewer/viewer-page.tsx` — URLs de preview/download sem prefixo, linhas 82-83
- [VERIFIED: inspeção direta] `src/components/viewer/viewer-header.tsx` — download href sem prefixo, linha 220
- [VERIFIED: inspeção direta] `.planning/phases/10-environment-contract-and-build-foundation/10-VERIFICATION.md` — estado entregue pela Phase 10

### Secondary (MEDIUM confidence)
- [CITED: next.js docs pattern] `redirect()` de `next/navigation` nao aplica `basePath` automaticamente — requer path publico completo
- [CITED: next-auth v5 docs pattern] `pages.signIn` aceita URL publica; NextAuth nao aplica `basePath` automaticamente nesse campo

---

## Metadata

**Confianca por area:**
- Sitios de correcao identificados: HIGH — verificados por inspeção direta do codigo
- Estrategia de aplicacao de `withBasePath()`: HIGH — padrao estabelecido na Phase 10
- Comportamento de `process.env` em bundles client: LOW — requer verificacao em build real (A1)
- Sequencia de carregamento do auth.ts: MEDIUM — padrao Next.js well-known (A2)

**Data da pesquisa:** 2026-04-17
**Validade estimada:** 60 dias (dependencias estaveis; nenhuma biblioteca em movimento rapido)
