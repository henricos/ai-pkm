# Milestones: ai-pkm

## v2.2 — Base Path Configurado com Sincronia App/Auth

**Shipped:** 2026-04-18
**Phases:** 10-12 | **Plans:** 8 | **Duration:** 3 dias (2026-04-16 → 2026-04-18)
**Archive:** `.planning/milestones/v2.2-ROADMAP.md`

### What Was Built

- Módulo central `withBasePath()` + contrato fail-fast `APP_BASE_PATH`/`NEXTAUTH_URL` com mensagem explícita de configuração correta
- Cadeia workflow → Dockerfile → Next.js bakeando `APP_BASE_PATH=/pkm` no build oficial
- Redirects server-side de `ShellLayout` e `LoginPage` corrigidos; `pages.signIn` do NextAuth com prefixo; proteção contra open redirect no `LoginForm`
- URLs de preview/download no viewer com prefixo `/pkm` via prop drilling server → client
- Suite de 218 testes passando (23 arquivos) cobrindo TST-01 (contrato de env) e TST-02 (rotas com prefixo)
- Documentação operacional em `dev-setup.md`, `README.md` e `compose.yaml` — contrato dos 3 lugares sem conhecimento implícito
- Fix de `library/page.tsx` e `inbox/page.tsx` garantindo auth check em rotas índice

### Key Decisions

| Decision | Outcome |
|----------|---------|
| `basePath` baked no build via `--build-arg` hardcoded no workflow (Opção B) | ✓ Good |
| `withBasePath()` usada apenas em fronteiras server-side; `next/link` prefixa via framework | ✓ Good |
| `isValidCallback()` bloqueando open redirect no `LoginForm` sem `process.env` no cliente | ✓ Good |

---

## v2.1 — Release e Publicação Operacional

**Shipped:** 2026-04-16
**Phases:** 7-9
**Archive:** `.planning/milestones/v2.1-ROADMAP.md`

---

## v2.0 — Web Viewer Read-Only

**Shipped:** 2026-04-13
**Phases:** 1-6
**Archive:** `.planning/milestones/v2.0-ROADMAP.md`
