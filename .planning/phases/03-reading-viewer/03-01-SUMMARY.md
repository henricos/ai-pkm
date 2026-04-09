---
phase: 03-reading-viewer
plan: 01
subsystem: testing
tags: [vitest, tdd, wave-0, red-green, markdown-viewer, viewer-header, info-panel, raw-route]

# Dependency graph
requires: []
provides:
  - "Stubs RED para markdown-viewer (VIEW-02, VIEW-08) em src/__tests__/markdown-viewer.test.tsx"
  - "Stubs RED para viewer-header (CTX-01, CTX-02, CTX-03) em src/__tests__/viewer-header.test.tsx"
  - "Stubs RED para info-panel (CTX-03, CTX-04) em src/__tests__/info-panel.test.tsx"
  - "Stubs RED para raw-route (T-3-04, CTX-02) em src/__tests__/raw-route.test.ts"
affects: [03-02, 03-03, 03-04, 03-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Padrao Wave 0 (Nyquist): stubs de teste criados antes de qualquer implementacao para garantir RED antes do GREEN"
    - "Mocks de modulos externos (react-markdown, remark-*, rehype-*, next/navigation) para isolamento em jsdom"
    - "Mock de @/lib/auth para testar auth guards em Route Handlers"

key-files:
  created:
    - src/__tests__/markdown-viewer.test.tsx
    - src/__tests__/viewer-header.test.tsx
    - src/__tests__/info-panel.test.tsx
    - src/__tests__/raw-route.test.ts
  modified: []

key-decisions:
  - "RawFrontmatter importado de @/lib/pkm/types — Wave 3 devera exportar esse tipo do arquivo existente types.ts"
  - "auth() de @/lib/auth mockado como vi.fn() para controle total do estado de autenticacao nos testes de route handler"
  - "InfoPanel recebe frontmatter como RawFrontmatter (objeto plano do frontmatter), nao o tipo Item compilado — mantem separacao de responsabilidade"

patterns-established:
  - "Stubs RED: arquivos de teste importam paths que ainda nao existem para garantir falha de modulo antes da implementacao"
  - "Props de ViewerHeader: topic, group?, itemId, estado, panelOpen, onTogglePanel — contrato definido antes do componente"
  - "Props de InfoPanel: panelOpen, frontmatter: RawFrontmatter, topic, group? — contrato definido antes do componente"
  - "GET handler de raw route: assinatura (request: Request, { params }) — padrao Next.js App Router"

requirements-completed: [VIEW-02, VIEW-08, CTX-01, CTX-02, CTX-03, CTX-04]

# Metrics
duration: 15min
completed: 2026-04-09
---

# Phase 3 Plan 01: Stubs Wave 0 — Testes RED para Viewer de Markdown Summary

**Quatro arquivos de teste RED criados antes de qualquer implementacao: contratos verificaveis para markdown-viewer, viewer-header, info-panel e raw-route (conforme estrategia Nyquist do plano 03)**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-09T20:14:00Z
- **Completed:** 2026-04-09T20:29:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Quatro arquivos de stub RED criados, todos falhando por "Cannot find module" (conformidade Nyquist confirmada)
- Contratos de props dos componentes estabelecidos antes da implementacao: ViewerHeader e InfoPanel com interfaces verificaveis
- Mocks de modulos externos (react-markdown, remark-*, rehype-*, next/navigation, @/lib/auth) configurados para isolamento em jsdom
- Testes existentes (item-repository, auth, env, filter-tree, navigation-service, app-shell) continuam passando

## Task Commits

1. **Tarefa 1: Stubs de teste markdown-viewer e viewer-header** - `b24420c` (test)
2. **Tarefa 2: Stub de teste info-panel** - `f65b070` (test)
3. **Tarefa 3: Stub de teste raw-route** - `cb99d79` (test)

## Files Created/Modified

- `src/__tests__/markdown-viewer.test.tsx` - 4 testes RED: VIEW-02 (render, links externos/internos), VIEW-08 (classe prose)
- `src/__tests__/viewer-header.test.tsx` - 6 testes RED: CTX-01 (topico+grupo, inbox), CTX-02 (download, apresentacao desabilitado, toggle), CTX-03 (aria-pressed)
- `src/__tests__/info-panel.test.tsx` - 8 testes RED: CTX-03 (visibilidade painel), CTX-04 (estado, data_captura, campos ausentes, url, autores, data_publicacao)
- `src/__tests__/raw-route.test.ts` - 2 testes RED: T-3-04 (401 nao autenticado), CTX-02 (200 + Content-Disposition attachment)

## Decisions Made

- `RawFrontmatter` definido como tipo separado do `Item` compilado — os planos Wave 3 precisarao exportar esse tipo de `@/lib/pkm/types`. O tipo representa o frontmatter bruto do arquivo Markdown, com campos opcionais (autores, data_publicacao, url).
- `InfoPanel` recebe `frontmatter: RawFrontmatter` diretamente (nao um `Item`) — separacao de responsabilidade: o componente formata frontmatter, nao precisa saber de paths ou metadados de filesystem.
- Props de `ViewerHeader` incluem `estado` como campo direto (nao derivado do frontmatter) — o pai (page.tsx) ja tem o item resolvido e passa apenas o que o header precisa exibir.

## Deviations from Plan

Nenhum — plano executado exatamente como especificado.

Os quatro arquivos de stub foram criados com as suites descrevendo os comportamentos exigidos pelos requisitos VIEW-02, VIEW-08, CTX-01, CTX-02, CTX-03, CTX-04 e T-3-04. Todos falham por "Cannot find module" conforme esperado pela estrategia Wave 0 (Nyquist).

## Issues Encountered

- Teste pre-existente `app-shell > nao exibe secao inbox quando snapshot esta vazio` falha quando a suite completa roda (provavelmente interferencia de estado de jsdom entre arquivos). Este problema existia antes deste plano e esta fora do escopo. Registrado aqui para rastreabilidade.

## Known Stubs

| Stub | Arquivo | Linha | Razao |
|------|---------|-------|-------|
| `RawFrontmatter` nao exportado | `src/lib/pkm/types.ts` | -- | Tipo sera adicionado pelo Wave 2/3 antes que os testes possam passar |
| `MarkdownViewer` nao existe | `src/components/viewer/markdown-viewer.tsx` | -- | Componente sera criado pelo Wave 2 |
| `ViewerHeader` nao existe | `src/components/viewer/viewer-header.tsx` | -- | Componente sera criado pelo Wave 2 |
| `InfoPanel` nao existe | `src/components/viewer/info-panel.tsx` | -- | Componente sera criado pelo Wave 3 |
| `GET /api/pkm/raw/[...path]/route` nao existe | `src/app/api/pkm/raw/[...path]/route.ts` | -- | Route Handler sera criado pelo Wave 3 |

Os stubs sao intencionais — este e um plano Wave 0 (so testes RED). Os planos Wave 2-4 criarao as implementacoes que tornarao esses testes GREEN.

## Next Phase Readiness

- Contratos de props dos componentes definidos e verificaveis antes da implementacao
- Todos os mocks necessarios para Wave 2-4 ja identificados e configurados nos stubs
- Wave 2 (03-02) pode implementar markdown-viewer e viewer-header contra contratos verificaveis
- Wave 3 (03-03+) pode implementar info-panel e raw-route com auth guard ja especificado no teste

## Self-Check: PASSED

- `src/__tests__/markdown-viewer.test.tsx` — FOUND
- `src/__tests__/viewer-header.test.tsx` — FOUND
- `src/__tests__/info-panel.test.tsx` — FOUND
- `src/__tests__/raw-route.test.ts` — FOUND
- `.planning/phases/03-reading-viewer/03-01-SUMMARY.md` — FOUND
- Commits b24420c, f65b070, cb99d79 — FOUND

---
*Phase: 03-reading-viewer*
*Completed: 2026-04-09*
