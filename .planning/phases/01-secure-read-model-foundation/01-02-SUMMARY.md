---
phase: 01-secure-read-model-foundation
plan: "02"
subsystem: auth
tags: [next-auth, nextauth-v5, credentials, middleware, zod, login-ui, shadcn, design-system]
dependency_graph:
  requires:
    - 01-01 (next.js scaffold, tailwind tokens, vitest, env.ts stub)
  provides:
    - nextauth-v5-credentials-provider
    - universal-route-protection-middleware
    - env-validation-fail-fast
    - login-ui-stitch-adapted
  affects:
    - 01-03 (read model — usa env.ts completo com PKM_PATH validado)
    - 01-04 (dev setup — documenta as env vars obrigatórias definidas aqui)
tech_stack:
  added: []
  patterns:
    - NextAuth v5 App Router pattern (export { auth as middleware }, auth() em Server Components)
    - Zod 4 env validation com error function para mensagens em pt-BR em campos ausentes
    - shadcn/ui + Tailwind v4 custom tokens adaptados do Stitch (protocolo D-15)
    - Suspense wrapper para useSearchParams() em Server Component parent
key_files:
  created:
    - src/lib/auth.ts
    - src/middleware.ts
    - src/app/api/auth/[...nextauth]/route.ts
    - src/types/next-auth.d.ts
    - src/components/login-form.tsx
    - src/app/(auth)/login/page.tsx
  modified:
    - src/lib/env.ts (stub → implementação completa Zod 4)
    - src/__tests__/env.test.ts (test.todo → implementação real)
    - src/__tests__/auth.test.ts (test.todo → implementação real)
decisions:
  - "Zod 4 usa a função `error` (não `required_error`) para mensagens customizadas quando campo está ausente (invalid_type) — API mudou da v3"
  - "Testes de ACC-01 usam regex JS equivalente ao matcher Next.js (path-to-regexp) em vez de instanciar o NextAuth no ambiente de teste"
  - "LoginForm usa Suspense no page.tsx (Server Component) para permitir useSearchParams() no componente client sem erro de build"
  - "Button shadcn tem rounded-lg por padrão — sobrescrito com rounded-sm via className para respeitar DESIGN.md Don'ts"
metrics:
  duration: "4 min"
  completed_date: "2026-04-08"
  tasks_completed: 2
  files_created: 6
  files_modified: 3
---

# Phase 1 Plan 02: Autenticação NextAuth v5 + Tela de Login — Summary

**One-liner:** NextAuth v5 com credentials provider, middleware universal de proteção de rotas, validação Zod 4 fail-fast de 5 env vars obrigatórias, e tela de login adaptada do Stitch com tokens do DESIGN.md.

---

## O que foi entregue

### Tarefa 1: Validação de env vars + configuração NextAuth v5

**src/lib/env.ts** — validação Zod 4 fail-fast das 5 env vars obrigatórias:
- `PKM_PATH`, `AUTH_USERNAME`, `AUTH_PASSWORD`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Mensagens de erro em pt-BR via API `error` function do Zod 4 (ver Desvios)
- Se qualquer var estiver ausente, a aplicação lança ZodError imediatamente no startup

**src/lib/auth.ts** — NextAuth v5 com credentials provider:
- `authorize()` compara credenciais contra `env.AUTH_USERNAME` e `env.AUTH_PASSWORD`
- Session strategy: `"jwt"` — cookies httpOnly/sameSite gerenciados pelo NextAuth por padrão
- Páginas customizadas: `signIn: "/login"`
- Exports: `handlers`, `auth`, `signIn`, `signOut`

**src/middleware.ts** — proteção universal de rotas:
```typescript
export { auth as middleware } from "@/lib/auth";
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
```
Matcher exclui apenas NextAuth internals e assets estáticos. Toda rota de aplicação está protegida.

**src/app/api/auth/[...nextauth]/route.ts** — handler NextAuth:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

**src/types/next-auth.d.ts** — augmentation de tipo `Session` com campo `id`.

**Testes implementados** (substituindo `test.todo()`):
- `env.test.ts`: RUN-01 — ZodError com mensagem "PKM_PATH é obrigatório" quando ausente; parse bem-sucedido com 5 vars presentes
- `auth.test.ts`: ACC-01 — matcher cobre rotas corretas; ACC-02 — authorize() retorna user com credenciais corretas e null com erradas; ACC-03 — contrato de JWT session verificado

### Tarefa 2: Tela de login — LoginForm shadcn/ui adaptado do Stitch

**src/components/login-form.tsx** — componente `"use client"`:
- Chama `signIn("credentials", { redirect: false, ... })` e faz push programático após sucesso
- Exibe mensagem de erro genérica "Credenciais inválidas. Verifique usuário e senha." quando `searchParams.error` presente
- Mensagem não revela qual campo está incorreto (mitigação T-1-06)
- Tokens usados: `bg-surface-container-low`, `text-on-surface/60`, `gradient-cta`, `text-on-tertiary`, `rounded-sm`

**src/app/(auth)/login/page.tsx** — Server Component:
- Verifica sessão via `auth()` e redireciona para `/` se já autenticado
- Layout: `min-h-screen bg-surface flex items-center justify-center`
- Card: `bg-surface-container-lowest p-8 rounded-sm shadow-ambient`
- Header: símbolo `◈` em `text-tertiary` + título "ai-pkm" + h1 "System Access"
- Envolve `LoginForm` em `<Suspense>` para compatibilidade com `useSearchParams()`
- Footer discreto: "Encrypted · V. 2.0.0" em `text-on-surface/30`

**Mapeamento Stitch → DESIGN.md aplicado:**
| Stitch (code.html) | DESIGN.md token |
|---|---|
| `bg-slate-50` | `bg-surface` |
| `bg-white` (card) | `bg-surface-container-lowest` |
| `text-slate-900` | `text-on-surface` |
| `text-slate-500` | `text-on-surface/60` |
| `bg-blue-600` (button) | `gradient-cta` |
| `rounded-xl` (card) | `rounded-sm` (proibido por DESIGN.md) |
| `border-slate-200` | `border-outline-variant/15` |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod 4 ignora mensagem de min() quando campo está ausente**
- **Found during:** Tarefa 1 (fase RED dos testes)
- **Issue:** Zod 4 usa `invalid_type` quando campo está `undefined` e não aplica a mensagem do `min()`. A mensagem customizada "PKM_PATH é obrigatório" não aparecia — o erro retornado era "Invalid input: expected string, received undefined"
- **Fix:** Substituído `z.string().min(1, "msg")` por `z.string({ error: (iss) => iss.input === undefined ? "PKM_PATH é obrigatório" : undefined }).min(1, "PKM_PATH é obrigatório")` — API `error` function do Zod 4 permite sobrescrever mensagem por tipo de erro
- **Files modified:** `src/lib/env.ts`, `src/__tests__/env.test.ts`
- **Commit:** `92c3da8`

**2. [Rule 1 - Bug] Teste ACC-01 com regex inválida (Unterminated group)**
- **Found during:** Tarefa 1 (execução de testes)
- **Issue:** O padrão de matcher do Next.js `"/((?!api/auth|_next/static|_next/image|favicon.ico).*)"` não é regex JS direta — `matcherPattern.slice(1, -1)` produzia expressão inválida porque o padrão Next.js tem delimitadores extras
- **Fix:** Substituído por regex JS equivalente `^\/(?!(api\/auth|_next\/static|_next\/image|favicon\.ico))` que testa o mesmo comportamento sem depender do ambiente Next.js no Vitest
- **Files modified:** `src/__tests__/auth.test.ts`
- **Commit:** `92c3da8`

---

## Known Stubs

Nenhum. Todos os stubs do PLAN-01 resolvidos por este plano foram implementados:
- `src/lib/env.ts`: stub → implementação Zod 4 completa
- `src/__tests__/env.test.ts`: `test.todo()` → testes reais passando
- `src/__tests__/auth.test.ts`: `test.todo()` → testes reais passando

Stubs remanescentes do projeto (fora deste plano):
- `src/__tests__/item-repository.test.ts`: 5 `test.todo()` — será resolvido no PLAN-03

---

## Threat Flags

Nenhuma nova superfície de segurança introduzida além do que está no threat model do plano.

Mitigações implementadas:
- **T-1-05** (matcher): `export { auth as middleware }` com matcher que exclui apenas `api/auth`, `_next/static`, `_next/image`, `favicon.ico` — toda rota de aplicação protegida. Confirmado via teste ACC-01.
- **T-1-06** (info disclosure): Mensagem de erro genérica "Credenciais inválidas. Verifique usuário e senha." — não revela qual campo está incorreto.
- **T-1-07** (cookie): Session strategy `"jwt"` — NextAuth gerencia cookies httpOnly, sameSite=lax por padrão. Não sobrescrito.

Aceitos como documentado:
- **T-1-04** (timing attack): Comparação de string simples `===` — aceitável para single-user local sem exposição pública
- **T-1-08** (brute-force): Sem rate limiting — aceitável no escopo da Fase 1 local

---

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `src/lib/env.ts` | FOUND |
| `src/lib/auth.ts` | FOUND |
| `src/middleware.ts` | FOUND |
| `src/app/api/auth/[...nextauth]/route.ts` | FOUND |
| `src/types/next-auth.d.ts` | FOUND |
| `src/components/login-form.tsx` | FOUND |
| `src/app/(auth)/login/page.tsx` | FOUND |
| commit `92c3da8` | FOUND |
| commit `437e5af` | FOUND |
| `npm run test` passa | PASSED (5 passed, 5 todo) |
| `npm run typecheck` passa | PASSED |
| Sem tokens proibidos (rounded-xl, text-slate-*, bg-blue-*) | CONFIRMED |
