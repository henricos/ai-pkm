---
phase: 11-application-code-alignment
verified: 2026-04-17T23:55:00Z
status: human_needed
score: 7/7 must-haves verified
overrides_applied: 1
overrides:
  - must_have: "APP-02 cobre geracao de hrefs em route-helpers.ts com prefixo configurado"
    reason: "Decisao D-03 do CONTEXT.md estabelece explicitamente que itemToHref() emite rotas internas canonicas sem prefixo — o Next.js basePath prefixa automaticamente via next/link. Adicionar withBasePath() ali causaria double-prefix. O comportamento observavel esta correto; o texto do requisito APP-02 nao reflete essa decisao de escopo. A parte de login-form.tsx do APP-02 esta verificada e completa."
    accepted_by: "henrico"
    accepted_at: "2026-04-17T23:55:00Z"
re_verification:
  previous_status: gaps_found
  previous_score: 4/7
  gaps_closed:
    - "Acesso nao autenticado ao shell redireciona para /pkm/login (layout.tsx restaurado pelo commit 62dc544)"
    - "Acesso autenticado a rota /login redireciona para /pkm (login/page.tsx restaurado pelo commit 62dc544)"
    - "APP-02 route-helpers.ts — aceito como override via decisao D-03 intencional"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Com APP_BASE_PATH=/pkm configurado, acessar localhost:3000/pkm — deve exibir o shell autenticado. Acessar localhost:3000/ — deve retornar 404."
    expected: "Shell renderiza em /pkm; raiz retorna 404."
    why_human: "Requer servidor rodando com env real; nao verificavel via grep ou analise estatica de codigo."
  - test: "Acessar localhost:3000/pkm/library/... sem sessao; verificar se o browser redireciona para /pkm/login (com prefixo correto, nao /login)."
    expected: "Browser redireciona para /pkm/login."
    why_human: "Requer servidor e browser reais para verificar o redirect HTTP efetivo."
---

# Phase 11: Application Code Alignment — Verification Report (Re-verificacao)

**Phase Goal:** Todos os pontos do codigo que referenciam rotas absolutas usam o prefixo configurado.
**Verified:** 2026-04-17T23:55:00Z
**Status:** human_needed
**Re-verification:** Sim — apos fechamento dos 3 gaps da verificacao inicial (2026-04-17T23:30:00Z)

## Resumo da Re-verificacao

Os 2 gaps de regressao (Gap 1 e Gap 2) foram corrigidos pelo commit `62dc544`. O Gap 3 (`route-helpers.ts`) foi aceito como override com base na decisao D-03 documentada em `11-CONTEXT.md`. Todos os 7 must-haves agora passam. Restam 2 itens que requerem verificacao humana (servidor rodando), mantendo status `human_needed`.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Acesso nao autenticado ao shell redireciona para /pkm/login, nao para /login | VERIFIED | `layout.tsx` linha 27: `redirect(withBasePath("/login"))`; import presente na linha 2. Commit 62dc544. |
| 2 | Acesso autenticado a rota /login redireciona para /pkm, nao para / | VERIFIED | `login/page.tsx` linha 14: `if (session) redirect(withBasePath("/"))`; import presente na linha 6. Commit 62dc544. |
| 3 | O NextAuth redireciona para /pkm/login quando nao autenticado (pages.signIn com prefixo) | VERIFIED | `src/lib/auth.ts` linha 34: `signIn: withBasePath("/login")` |
| 4 | Apos login bem-sucedido, router.push() usa /pkm como destino quando callbackUrl esta ausente | VERIFIED | `login-form.tsx`: prop `fallbackUrl: string`, `callbackUrl` calculado defensivamente via `isValidCallback`; sem `?? "/"` |
| 5 | callbackUrl de origem externa (dominio diferente ou sem basePath) e rejeitado e substituido pelo fallback /pkm | VERIFIED | `isValidCallback` em `login-form.tsx`: rejeita `://` e paths sem basePath; fallback para `fallbackUrl` prop |
| 6 | URLs de preview inline (PDF, imagem) e download attachment no viewer contêm o prefixo /pkm | VERIFIED | `viewer-page.tsx` linhas 52-53: `withBasePath('/api/pkm/preview/${encodedId}')` e `withBasePath('/api/pkm/raw/${encodedId}')` |
| 7 | viewer-header.tsx nao chama process.env.APP_BASE_PATH (recebe href como prop) | VERIFIED | `viewer-header.tsx` linha 223: `href={downloadHref}`; nenhuma chamada a process.env no arquivo |

**Score:** 7/7 truths verified (1 via override)

### Roadmap Success Criteria

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| SC-1 | Acessar localhost:3000/pkm em dev exibe o shell autenticado corretamente | HUMAN NEEDED | Requer servidor rodando com env real |
| SC-2 | Tentativa de acesso nao autenticado redireciona para /pkm/login, nao para /login | VERIFIED | `layout.tsx` usa `redirect(withBasePath("/login"))` — commit 62dc544 |
| SC-3 | Apos login, usuario redirecionado para /pkm, nao para / | VERIFIED | `login/page.tsx` usa `redirect(withBasePath("/"))` — commit 62dc544 |
| SC-4 | Links de preview e download de arquivos no viewer funcionam com o prefixo correto | VERIFIED | `viewer-page.tsx` e `viewer-header.tsx` corretos e verificados |

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/app/(shell)/layout.tsx` | VERIFIED | `redirect(withBasePath("/login"))` na linha 27; import na linha 2. Gap 1 fechado. |
| `src/app/(auth)/login/page.tsx` | VERIFIED | `redirect(withBasePath("/"))` na linha 14; `fallbackUrl` calculado na linha 16; `<LoginForm fallbackUrl={fallbackUrl} />` na linha 42. Gap 2 fechado. |
| `src/lib/auth.ts` | VERIFIED | `signIn: withBasePath("/login")` na linha 34; import na linha 4 |
| `src/components/login-form.tsx` | VERIFIED | `isValidCallback`, prop `{ fallbackUrl: string }`, `callbackUrl` defensivo; sem `?? "/"` |
| `src/components/viewer/viewer-page.tsx` | VERIFIED | `withBasePath` em `previewHref` (linha 52) e `downloadHref` (linha 53); `downloadHref` passado em todos os branches |
| `src/components/viewer/viewer-header.tsx` | VERIFIED | `downloadHref: string` na interface; `href={downloadHref}` no link de download |
| `src/lib/navigation/route-helpers.ts` | PASSED (override) | Intencionalmente sem withBasePath — D-03: Next.js basePath prefixa automaticamente via next/link; double-prefix seria bug. Override aceito. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/(shell)/layout.tsx` | `src/lib/base-path.ts` | `import { withBasePath }` | VERIFIED | Linha 2: import presente; linha 27: `redirect(withBasePath("/login"))` |
| `src/app/(auth)/login/page.tsx` | `src/lib/base-path.ts` | `import { withBasePath }` | VERIFIED | Linha 6: import presente; linha 14: `redirect(withBasePath("/"))`; linha 16: `withBasePath("/")` |
| `src/lib/auth.ts` | `src/lib/base-path.ts` | `import { withBasePath }` | VERIFIED | Linha 4: import; linha 34: `signIn: withBasePath("/login")` |
| `src/app/(auth)/login/page.tsx` | `src/components/login-form.tsx` | prop fallbackUrl | VERIFIED | Linha 42: `<LoginForm fallbackUrl={fallbackUrl} />` |
| `src/components/login-form.tsx` | prop fallbackUrl | aceita `{ fallbackUrl: string }` | VERIFIED | Linha 18: interface correta; uso em `isValidCallback` e `router.push` |
| `src/components/viewer/viewer-page.tsx` | `src/lib/base-path.ts` | `import { withBasePath }` | VERIFIED | Linha 22: import; linhas 52-53: `withBasePath` em ambas as URLs |
| `src/components/viewer/viewer-page.tsx` | `src/components/viewer/viewer-header.tsx` | prop downloadHref | VERIFIED | `downloadHref={downloadHref}` em todos os 4 branches (markdown, image, pdf, binary) |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `layout.tsx` | redirect target | `withBasePath("/login")` — prefixo aplicado server-side | Sim — `APP_BASE_PATH` disponivel no startup | FLOWING |
| `login/page.tsx` | redirect pos-auth | `withBasePath("/")` — prefixo aplicado server-side | Sim — `APP_BASE_PATH` disponivel no startup | FLOWING |
| `login/page.tsx` | fallbackUrl prop | `withBasePath("/")` calculado server-side, passado para LoginForm | Sim — calculado no Server Component | FLOWING |
| `login-form.tsx` | callbackUrl | fallbackUrl prop (calculada server-side) ou callbackUrl validado | Sim — sem fallback sem prefixo | FLOWING |
| `viewer-page.tsx` | previewHref/downloadHref | `withBasePath()` server-side | Sim — APP_BASE_PATH no Server Component | FLOWING |

### Behavioral Spot-Checks

| Behavior | Verificacao | Resultado | Status |
|----------|-------------|-----------|--------|
| layout.tsx nao contem redirect sem prefixo | `grep 'redirect("/login")' layout.tsx` | Sem resultado | PASS |
| login/page.tsx nao contem redirect sem prefixo | `grep 'redirect("/")' login/page.tsx` | Sem resultado | PASS |
| layout.tsx usa withBasePath no redirect | `grep 'withBasePath.*login' layout.tsx` | Linha 27: `redirect(withBasePath("/login"))` | PASS |
| login/page.tsx usa withBasePath nos dois usos | `grep 'withBasePath' login/page.tsx` | Linhas 14 e 16 confirmadas | PASS |
| auth.ts usa withBasePath em signIn | `grep 'signIn: withBasePath' auth.ts` | Linha 34 confirmada | PASS |
| viewer-header.tsx usa prop downloadHref | `grep 'href={downloadHref}' viewer-header.tsx` | Linha 223 confirmada | PASS |
| login-form.tsx nao usa fallback sem prefixo | `grep '?? "/"' login-form.tsx` | Sem resultado | PASS |
| viewer-page.tsx usa withBasePath nas URLs de asset | `grep 'withBasePath.*api/pkm' viewer-page.tsx` | Linhas 52-53 confirmadas | PASS |

### Requirements Coverage

| Requirement | Plano | Descricao | Status | Evidencia |
|-------------|-------|-----------|--------|-----------|
| APP-01 | 11-01 | Redirects em layout.tsx e login/page.tsx usam prefixo configurado | SATISFIED | `redirect(withBasePath("/login"))` em layout.tsx; `redirect(withBasePath("/"))` em login/page.tsx — ambos restaurados no commit 62dc544 |
| APP-02 | 11-02 | hrefs em route-helpers.ts e fallback em login-form.tsx usam prefixo | SATISFIED (override em route-helpers.ts) | login-form.tsx: VERIFIED (isValidCallback + fallbackUrl prop); route-helpers.ts: PASSED (override) — D-03 exclui intencionalmente do escopo |
| APP-03 | 11-03 | Rotas de preview e download no viewer usam prefixo | SATISFIED | viewer-page.tsx linhas 52-53: withBasePath em previewHref e downloadHref; viewer-header.tsx usa prop downloadHref |

### Anti-Patterns Found

Nenhum anti-pattern bloqueador encontrado.

| Arquivo | Linha | Padrao | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| — | — | Nenhum anti-pattern de redirect sem prefixo detectado | — | — |

### Human Verification Required

#### 1. Shell autenticado em /pkm (SC-1)

**Teste:** Com `APP_BASE_PATH=/pkm` configurado no `.env`, iniciar o servidor dev (`npm run dev`) e acessar `localhost:3000/pkm`. Acessar tambem `localhost:3000/`.
**Esperado:** `localhost:3000/pkm` exibe o shell autenticado (ou redireciona para `/pkm/login` se sem sessao). `localhost:3000/` retorna 404.
**Por que humano:** Requer servidor rodando com variavel de ambiente real; analise estatica confirma que o codigo esta correto, mas o comportamento HTTP efetivo precisa de teste em runtime.

#### 2. Fluxo de redirect nao autenticado completo

**Teste:** Sem sessao ativa, acessar `localhost:3000/pkm/library/` (ou qualquer rota protegida). Observar o redirect no browser.
**Esperado:** Browser redireciona para `localhost:3000/pkm/login` (URL publica com prefixo correto, nao `/login`).
**Por que humano:** O redirect HTTP final depende de `APP_BASE_PATH` no ambiente de runtime — o codigo estatico esta correto (verificado), mas o redirect efetivo depende do valor real da variavel.

### Gaps Summary

Nenhum gap bloqueador. Todos os 7 must-haves verificados:

- **Gap 1 (fechado):** `layout.tsx` redirect restaurado para `redirect(withBasePath("/login"))` — commit 62dc544.
- **Gap 2 (fechado):** `login/page.tsx` redirect restaurado para `redirect(withBasePath("/"))` — commit 62dc544.
- **Gap 3 (override aceito):** `route-helpers.ts` intencionalmente sem `withBasePath` per decisao D-03 — o Next.js `basePath` prefixa automaticamente via `next/link`; adicionar `withBasePath()` ali causaria double-prefix. O texto do requisito APP-02 menciona este arquivo mas a decisao de design exclui explicitamente esse escopo.

Status final: `human_needed` — codigo verificado estaticamente como correto; 2 itens de comportamento runtime aguardam confirmacao humana.

---

_Verificado: 2026-04-17T23:55:00Z_
_Verificador: Claude (gsd-verifier)_
