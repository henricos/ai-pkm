---
gsd_state_version: 1.0
milestone: v2.2
milestone_name: "Base Path Configurado com Sincronia App/Auth"
status: planning
stopped_at: Roadmap v2.2 definido; pronto para planejar Phase 10
last_updated: "2026-04-16T00:00:00.000Z"
last_activity: 2026-04-16 -- Roadmap v2.2 criado com fases 10-12
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-16)

**Core value:** Permitir operar o PKM com auxilio de IA, alternando entre uma experiencia visual na web e a operacao local via CLI, sem perder compatibilidade com o modelo file-first.
**Current focus:** Milestone v2.2 — roadmap definido; proxima acao e planejar Phase 10

## Current Position

Phase: Not started (roadmap defined)
Plan: —
Next: /gsd-plan-phase 10
Status: Ready to plan
Last activity: 2026-04-16 — Roadmap v2.2 criado (fases 10-12, 13 requisitos mapeados)

Progress: [----------] 0%

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.1 / Phase 8]: Cadeia de release validada com `v2.0.2`; workflow `Release GHCR` e skill `/fechar-versao` operacionais.
- [v2.1 / Phase 9]: Runtime por compose documentado no README como superficie publica unica; `.env.compose` removido.
- [v2.2 / Arquitetura]: `basePath` do Next.js e baked no build via `--build-arg` hardcoded no workflow (Opcao B). Mudar path exige nova release.
- [v2.2 / Arquitetura]: Cloudflare Tunnel preserva o path → app precisa ser genuinamente consciente do prefixo `/pkm`.
- [v2.2 / Arquitetura]: `APP_BASE_PATH` e `NEXTAUTH_URL` serao ambos obrigatorios e validados em sincronia no startup.
- [v2.2 / Dev]: Em dev, `localhost:3000/pkm` e o acesso correto; raiz retorna 404.
- [v2.2 / Roadmap]: Phase 10 cobre contrato de ambiente + next.config + helper + build arg (fundacao); Phase 11 cobre ajustes de codigo que consomem essa fundacao; Phase 12 cobre testes e documentacao operacional.

### Pending Todos

- Nenhum.

### Blockers/Concerns

- A documentacao do contrato dos 3 lugares (`.env`, workflow CI, compose) e critica para operacao futura e deve ser tratada como requisito, nao como opcional.
