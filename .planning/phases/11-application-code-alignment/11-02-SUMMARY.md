---
phase: 11-application-code-alignment
plan: "02"
subsystem: auth
tags: [nextauth, base-path, login, security, open-redirect]
dependency_graph:
  requires: [11-01-PLAN.md]
  provides: [pages.signIn com prefixo, fallbackUrl defensivo no LoginForm]
  affects: [src/lib/auth.ts, src/components/login-form.tsx, src/app/(auth)/login/page.tsx]
tech_stack:
  added: []
  patterns:
    - withBasePath em pages.signIn do NextAuth
    - prop server-side para Client Component (evitar process.env no browser)
    - isValidCallback para bloquear open redirect
key_files:
  modified:
    - src/lib/auth.ts
    - src/components/login-form.tsx
    - src/app/(auth)/login/page.tsx
decisions:
  - "withBasePath() chamado em auth.ts no startup onde APP_BASE_PATH está disponível (D-02)"
  - "fallbackUrl calculado no Server Component login/page.tsx e passado como prop (D-04)"
  - "isValidCallback rejeita URLs com :// (open redirect) e sem o basePath (D-05)"
metrics:
  duration: "~15 minutos"
  completed_date: "2026-04-17"
  tasks_completed: 2
  files_modified: 3
requirements:
  - APP-02
---

# Phase 11 Plan 02: Auth SignIn Page e CallbackUrl Defensivo — Summary

**One-liner:** pages.signIn do NextAuth com withBasePath("/login") e isValidCallback bloqueando open redirect via prop fallbackUrl server-side.

## O que foi feito

Dois problemas de base path foram corrigidos no fluxo de autenticação:

1. **auth.ts — pages.signIn sem prefixo:** O campo `pages.signIn: "/login"` fazia o NextAuth redirecionar para `/login` em vez de `/pkm/login`. Corrigido para `withBasePath("/login")` — o valor é avaliado no startup do servidor onde `APP_BASE_PATH` está disponível e validado.

2. **login-form.tsx — fallback inseguro e sem prefixo:** O fallback `callbackUrl ?? "/"` enviava o usuário para a raiz sem prefixo após login bem-sucedido. Além disso, `login-form.tsx` é um Client Component e não tem acesso a `process.env.APP_BASE_PATH`. A solução foi:
   - Calcular `withBasePath("/")` no Server Component `login/page.tsx` e passar como prop `fallbackUrl`
   - Implementar `isValidCallback()` que rejeita URLs absolutas (com `://`) e paths sem o basePath
   - Substituir o fallback inseguro pela validação defensiva

## Tasks Executadas

| Task | Nome | Commit | Arquivos |
|------|------|--------|----------|
| 1 | Corrigir pages.signIn em auth.ts | 0693031 | src/lib/auth.ts |
| 2 | Passar fallbackUrl como prop server-side e sanitizar callbackUrl | 2b4606e | src/components/login-form.tsx, src/app/(auth)/login/page.tsx |

## Deviations from Plan

None - plano executado exatamente como escrito.

## Threat Mitigations Implementadas

| Threat ID | Componente | Mitigação |
|-----------|-----------|-----------|
| T-11-03 | login-form.tsx callbackUrl | isValidCallback rejeita URLs com :// e sem basePath |
| T-11-04 | auth.ts pages.signIn | withBasePath("/login") garante /pkm/login server-side |
| T-11-05 | login-form.tsx router.push | callbackUrl validado antes de router.push() |

## Known Stubs

Nenhum stub identificado — os valores são calculados dinamicamente via `withBasePath()` com `APP_BASE_PATH` do ambiente.

## Self-Check: PASSED

- src/lib/auth.ts existe e contém `withBasePath("/login")`
- src/components/login-form.tsx existe e contém `isValidCallback`, `fallbackUrl`
- src/app/(auth)/login/page.tsx existe e contém `withBasePath("/")` e `<LoginForm fallbackUrl={fallbackUrl} />`
- Commits 0693031 e 2b4606e existem no repositório
- `npx tsc --noEmit` retorna exit 0
