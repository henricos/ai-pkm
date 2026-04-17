---
phase: 11-application-code-alignment
plan: "01"
subsystem: auth-redirects
tags:
  - base-path
  - redirect
  - auth
  - server-component
dependency_graph:
  requires:
    - "Phase 10: src/lib/base-path.ts (withBasePath helper)"
  provides:
    - "ShellLayout redirect para /pkm/login quando sem sessão"
    - "LoginPage redirect para /pkm quando já autenticado"
  affects:
    - "Fluxo de autenticação completo (entrada e saída)"
tech_stack:
  added: []
  patterns:
    - "withBasePath() aplicado em redirects server-side de Server Components"
key_files:
  created: []
  modified:
    - src/app/(shell)/layout.tsx
    - src/app/(auth)/login/page.tsx
decisions:
  - "withBasePath() aplicado na fronteira do redirect, onde Next.js não prefixa automaticamente"
  - "Sem outras linhas alteradas nos arquivos — mudança cirúrgica e mínima"
metrics:
  duration: "~5min"
  completed: "2026-04-17T22:40:07Z"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 2
---

# Phase 11 Plan 01: Auth Redirects com withBasePath — Summary

## O que foi feito

Aplicação de `withBasePath()` nos dois redirects server-side críticos do fluxo de autenticação, corrigindo o problema onde `redirect("/login")` e `redirect("/")` ignoravam o `basePath=/pkm` configurado no Next.js.

## Tasks Executadas

| Task | Arquivo | Mudança | Commit |
|------|---------|---------|--------|
| 1 | `src/app/(shell)/layout.tsx` | `redirect("/login")` → `redirect(withBasePath("/login"))` + import | 38644ab |
| 2 | `src/app/(auth)/login/page.tsx` | `redirect("/")` → `redirect(withBasePath("/"))` + import | 2df79fd |

## Verificações

- `grep -rn 'redirect("/login")\|redirect("/")' src/app/` — nenhum redirect nu encontrado
- `npx tsc --noEmit` — exit 0, sem erros
- Import `withBasePath` presente em ambos os arquivos
- Número de redirects em cada arquivo permanece igual (nenhum redirect novo adicionado)

## Deviations from Plan

Nenhum — plano executado exatamente como escrito.

## Known Stubs

Nenhum stub identificado.

## Threat Flags

Nenhuma nova superfície de segurança introduzida. As ameaças T-11-01 e T-11-02 foram mitigadas conforme planejado.

## Self-Check: PASSED

- `src/app/(shell)/layout.tsx` — modificado e commitado (38644ab)
- `src/app/(auth)/login/page.tsx` — modificado e commitado (2df79fd)
- Commits verificados via `git log`
