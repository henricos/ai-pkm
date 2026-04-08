---
phase: 01-secure-read-model-foundation
plan: "04"
subsystem: documentation
tags: [dev-setup, home-page, read-model, auth, server-component, nextauth]
dependency_graph:
  requires:
    - 01-02 (auth() e env vars com NextAuth v5)
    - 01-03 (FsItemRepository e listTopics())
  provides:
    - dev-setup-guide
    - authenticated-home-page
  affects:
    - Fase 2 (shell de navegação substitui home page desta fase)
tech_stack:
  added: []
  patterns:
    - Server Component com auth() + redirect como dupla proteção (middleware + server-side)
    - docs/ para documentação operacional de setup e onboarding
key_files:
  created:
    - docs/dev-setup.md
  modified:
    - src/app/page.tsx
key_decisions:
  - "Home page usa auth() no Server Component além do middleware — dupla proteção conforme T-1-16"
  - "docs/dev-setup.md cobre todos os 5 env vars obrigatórios com exemplos e instruções de geração do NEXTAUTH_SECRET"
  - "Aviso de segurança explícito sobre string comparison simples e restrições de exposição pública"
requirements-completed:
  - RUN-03
duration: "5 min"
completed: "2026-04-08"
---

# Phase 1 Plan 04: Documentação de Setup Local + Home Autenticada — Summary

**Guia reproduzível `docs/dev-setup.md` com todos os 5 env vars, instrução `openssl rand -base64 32` e aviso de segurança; home page Server Component autenticada que lista tópicos do `FsItemRepository` como smoke test do read model.**

---

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-08T09:47:00Z
- **Completed:** 2026-04-08T09:52:00Z
- **Tasks:** 1 (+ 1 checkpoint humano pendente)
- **Files modified:** 2

---

## Accomplishments

- `docs/dev-setup.md`: guia completo cobrindo pré-requisitos, clone, configuração das 5 vars, execução em dev, verificação do fluxo, aviso de segurança e troubleshooting
- `src/app/page.tsx`: Server Component com `auth()` + `redirect("/login")` se não autenticado + `listTopics()` do `FsItemRepository` como smoke test do read model
- `PKM_PATH` documentado como sempre absoluto com explicação do porquê caminhos relativos falham
- `NEXTAUTH_SECRET` documentado com instrução `openssl rand -base64 32` e aviso sobre entropia mínima

---

## Task Commits

1. **Tarefa 1: Documentação de setup local e home page autenticada** — `b8abbdc` (feat)

---

## Files Created/Modified

- `docs/dev-setup.md` — guia reproduzível de setup local com todos os 5 env vars, exemplos reais, aviso de segurança e troubleshooting
- `src/app/page.tsx` — home page autenticada: Server Component com auth() + redirect + listTopics() smoke test

---

## Decisions Made

- **Home page com auth() além do middleware:** O Server Component verifica a sessão via `auth()` mesmo com o middleware já protegendo a rota. Isso garante dupla proteção (T-1-16): o middleware bloqueia na borda, o Server Component confirma no servidor antes de instanciar o `FsItemRepository`.
- **Nota sobre índices no dev-setup.md:** Documentado que `index/topicos.json` e `index/grupos.json` ficam na raiz do `ai-pkm` (não em `PKM_PATH`), e que o CWD ao rodar `npm run dev` deve ser a raiz do projeto.

---

## Deviations from Plan

Nenhuma. O plano foi executado exatamente como especificado.

---

## Known Stubs

Nenhum. `src/app/page.tsx` lista tópicos reais via `FsItemRepository.listTopics()` — não há dados hardcoded ou placeholders.

---

## Threat Flags

Nenhuma nova superfície de segurança introduzida além do threat model do plano.

Mitigações implementadas:
- **T-1-15** (Information Disclosure — docs/dev-setup.md): Documento inclui aviso explícito de não expor publicamente sem rate limiting e hashing; instrução de gerar `NEXTAUTH_SECRET` com `openssl rand -base64 32`; nota de que `.env.local` nunca deve ser commitado.
- **T-1-16** (Elevation of Privilege — home sem auth check): Home page verifica sessão via `auth()` e redireciona para `/login` se ausente; middleware também bloqueia antes de chegar ao Server Component (dupla proteção).

---

## Checkpoint Pendente

O plano inclui um checkpoint `human-verify` bloqueante para verificação visual do fluxo completo:

1. Acesso anônimo a `/` → redirecionamento para `/login`
2. Tela de login visual (Stitch + tokens DESIGN.md)
3. Credenciais erradas → mensagem genérica sem revelar campo incorreto
4. Credenciais corretas → home autenticada com lista de tópicos
5. Cookie httpOnly confirmado no DevTools
6. `npm run test` passando (exit 0)
7. `npm run build` passando (exit 0)
8. Leitura do `docs/dev-setup.md` confirmando cobertura completa

---

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `docs/dev-setup.md` | FOUND |
| `docs/dev-setup.md` contém PKM_PATH | FOUND (5 ocorrências) |
| `docs/dev-setup.md` contém AUTH_USERNAME | FOUND |
| `docs/dev-setup.md` contém AUTH_PASSWORD | FOUND |
| `docs/dev-setup.md` contém NEXTAUTH_SECRET | FOUND |
| `docs/dev-setup.md` contém NEXTAUTH_URL | FOUND |
| `docs/dev-setup.md` contém aviso de segurança | FOUND |
| `docs/dev-setup.md` contém openssl rand | FOUND |
| `src/app/page.tsx` contém auth() + redirect | FOUND |
| `src/app/page.tsx` contém FsItemRepository | FOUND |
| commit `b8abbdc` | FOUND |
| `npm run typecheck` passa | PASSED |
