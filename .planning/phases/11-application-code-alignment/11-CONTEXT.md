# Phase 11: Application Code Alignment - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase alinha os consumers da aplicacao a fundacao de `APP_BASE_PATH` entregue na Phase 10. O escopo e corrigir redirects, hrefs, callbacks e URLs absolutas que hoje ainda assumem raiz `/`, para que a app funcione de forma coerente em `/pkm` sem redefinir contratos internos de navegacao nem reabrir a arquitetura de rotas.

</domain>

<decisions>
## Implementation Decisions

### Fronteira do prefixo
- **D-01:** O `APP_BASE_PATH` permanece um concern de fronteira. A aplicacao continua tratando `"/login"`, `"/library/..."`, `"/inbox/..."` e `"/api/pkm/..."` como rotas internas canonicas.
- **D-02:** `withBasePath()` deve ser aplicado apenas nos pontos em que o Next.js nao prefixa automaticamente a URL publica final, como `redirect()`, `pages.signIn`, fallback de callback e composicao manual de URLs absolutas para o browser.
- **D-03:** Helpers de navegacao e camada de dominio nao devem passar a conhecer `APP_BASE_PATH`; evitar que detalhe de deploy/build vaze para `itemToHref()` ou contratos equivalentes.

### Fallback pos-login
- **D-04:** Quando `callbackUrl` estiver ausente, vazio ou for considerado invalido, o destino canonico apos login deve ser a raiz publica da app, isto e, `withBasePath("/")`.
- **D-05:** A implementacao deve ser defensiva contra redirecionamento errado; sanitizacao exata do `callbackUrl` fica como detalhe de implementacao, mas o comportamento observavel precisa impedir fallback para `"/"` sem prefixo ou destinos inadequados.

### Assets do viewer
- **D-06:** As rotas dedicadas `/api/pkm/preview/...` e `/api/pkm/raw/...` permanecem como contratos da app; esta fase nao reinterpreta a semantica dessas rotas.
- **D-07:** URLs de preview e download compostas manualmente para o viewer devem incluir o prefixo configurado na URL publica final, preservando a separacao semantica entre preview inline e download attachment.

### the agent's Discretion
- Estrategia exata para validar se `callbackUrl` e seguro o bastante para reuse no client, desde que o comportamento final respeite D-04 e D-05.
- Forma de centralizar helpers adicionais para reduzir repeticao de `withBasePath()` sem contaminar a camada de navegacao com `APP_BASE_PATH`.
- Cobertura de testes unitarios ou de integracao a ser adicionada depois na Phase 12, desde que a implementacao da fase deixe pontos observaveis claros para essa cobertura.

</decisions>

<specifics>
## Specific Ideas

- A leitura desejada e: a app pensa em rotas internas canonicas, e apenas na borda essas rotas sao traduzidas para a URL publica com prefixo.
- O problema desta fase nao e redesenhar os contratos `preview/raw`, mas garantir que a URL final enviada ao browser respeite o `basePath`.
- A preferencia explicita e por uma solucao estavel e segura, com menor superficie de mudanca e menor risco de `double-prefix`.
- A validacao do `callbackUrl` deve ser tratada como detalhe de implementacao com foco em seguranca, sem transformar esta discussao numa subfase de auth.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone and requirements
- `.planning/ROADMAP.md` §Phase 11: Application Code Alignment — objetivo, dependencias e criterios de sucesso da fase
- `.planning/REQUIREMENTS.md` §APP-01, APP-02, APP-03 — requisitos de redirects, hrefs e rotas de preview/download
- `.planning/PROJECT.md` — decisoes ativas do milestone `v2.2`, especialmente o contrato de `/pkm` como path canonico publicado
- `.planning/STATE.md` — estado atual do milestone e decisao de que a fase 11 consome a fundacao entregue na fase 10

### Base path contract
- `.planning/phases/10-environment-contract-and-build-foundation/10-VERIFICATION.md` — evidencia do contrato entregue na fase 10 e do papel de `withBasePath()`
- `src/lib/base-path.ts` — helper central e comentario normativo sobre uso em redirect/server-side e nao uso por padrao em `next/link`
- `src/lib/env.ts` — validacao de sincronia entre `APP_BASE_PATH` e `NEXTAUTH_URL`
- `next.config.ts` — `basePath` do Next.js ligado a `APP_BASE_PATH`

### Existing route and viewer contracts
- `.planning/phases/03-reading-viewer/03-CONTEXT.md` — contratos de header, links internos e composicao geral do viewer
- `.planning/phases/04-asset-viewer-and-item-context/04-CONTEXT.md` — separacao semantica entre preview inline e download raw
- `src/lib/navigation/route-helpers.ts` — rotas internas canonicas de library/inbox
- `src/lib/auth.ts` — configuracao atual de `pages.signIn`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/base-path.ts`: ja oferece `withBasePath()` e a regra de uso correta para bordas onde o Next nao auto-prefixa
- `src/lib/navigation/route-helpers.ts`: encapsula as rotas internas canonicas de `library` e `inbox`, sem depender de deploy
- `src/components/login-form.tsx`: concentra o fallback de `callbackUrl` no client e e um ponto natural para endurecer o pos-login
- `src/app/(auth)/login/page.tsx` e `src/app/(shell)/layout.tsx`: concentram os redirects server-side mais sensiveis desta fase
- `src/components/viewer/viewer-page.tsx` e `src/components/viewer/viewer-header.tsx`: concentram a composicao manual das URLs de preview/download

### Established Patterns
- O projeto prefere mecanismos simples, auditaveis e localizados, evitando espalhar detalhe de infraestrutura por contratos internos.
- `basePath` do Next.js ja esta definido no framework; a fase 11 corrige apenas os pontos onde essa automacao nao cobre a URL final.
- O viewer ja tem um contrato funcional de preview inline separado de download attachment; esta fase deve preserva-lo.

### Integration Points
- Redirects server-side precisam ser revisados em `layout.tsx`, `login/page.tsx` e configuracao de auth para garantir `/pkm/login` e `/pkm`.
- Fallback e reaproveitamento de `callbackUrl` precisam ser reconciliados entre `signIn()` e `router.push()` no `LoginForm`.
- URLs absolutas manuais dos viewers precisam convergir para o helper central sem mudar o contrato das rotas API.

</code_context>

<deferred>
## Deferred Ideas

- Tornar a camada de navegacao inteira base-aware, com `itemToHref()` emitindo URLs publicas ja prefixadas
- Redesenhar o contrato das rotas de asset preview/download ou unifica-las sob outro helper conceitual
- Expandir a discussao de seguranca de auth para alem do fallback de callback desta fase

</deferred>

---

*Phase: 11-application-code-alignment*
*Context gathered: 2026-04-17*
