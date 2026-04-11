---
phase: 05-presentation-mode
plan: "02"
subsystem: viewer
status: partial-checkpoint
tags: [presentation-mode, viewer, ui, phase5]
dependency_graph:
  requires: [05-01]
  provides: [presentation-mode-shell, presentation-overlay, presentation-controls]
  affects: [viewer-client-shell, viewer-header]
tech_stack:
  added: []
  patterns:
    - presentation-mode como estado client-side no ViewerClientShell
    - PresentationOverlay como camada fixa sobre o viewer (z-50)
    - hit area dedicada para revelar controles (sem movimento global)
    - auto-hide com timeout após saída da hit area
key_files:
  created:
    - src/components/viewer/presentation-overlay.tsx
    - src/components/viewer/presentation-controls.tsx
  modified:
    - src/components/viewer/viewer-header.tsx
    - src/components/viewer/viewer-client-shell.tsx
decisions:
  - ViewerClientShell é o único detentor de isPresentationMode — mantém arquitetura sem bifurcar rotas
  - children não são duplicados: quando modo ativo, o background suprime os children e o overlay os exibe
  - auto-hide controlado por mouseOverControlsRef para evitar hide acidental enquanto o mouse está nos controles
metrics:
  duration: "~25 min"
  completed_date: "2026-04-11"
  tasks_completed: 2
  tasks_total: 3
  files_modified: 4
---

# Phase 05 Plan 02: Presentation Mode Shell Summary

**Status:** PARCIAL — parado em checkpoint:human-verify (Task 3)

**One-liner:** Infraestrutura visível do modo apresentação: header com gatilho real, palco puro com hit area inferior esquerda e controles discretos auto-ocultáveis.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Transformar o header em ponto real de entrada de presentation mode | 7d1d847 | viewer-header.tsx |
| 2 | Orquestrar o presentation mode no ViewerClientShell | ababc78 | viewer-client-shell.tsx, presentation-overlay.tsx, presentation-controls.tsx |

## Task Pending (Checkpoint)

| Task | Name | Status |
|------|------|--------|
| 3 | Validacao manual da experiencia de palco puro | Aguardando checkpoint:human-verify |

## What Was Built

### Task 1 — ViewerHeader (GREEN)

O `ViewerHeader` passou de placeholder com botão desabilitado para ponto canônico de entrada no modo apresentação:

- Novas props: `onEnterPresentation`, `activeTheme`, `onChangeTheme`, `presentationActive`
- Botão de apresentação habilitado com `data-testid="presentation-button"` e callback real
- Seletor de tema (`data-testid="theme-selector"`) com menu dropdown para 4 presets (default, chatgpt, github, excalidraw) — visível apenas fora do modo apresentação (D-19)
- Toggle do InfoPanel desabilitado (`disabled`, `aria-disabled="true"`) quando `presentationActive=true` (PRS-07, D-02)
- Todos os 12 testes passam, incluindo regressão Phase 3

### Task 2 — ViewerClientShell + PresentationOverlay + PresentationControls (GREEN)

**ViewerClientShell** centraliza todo o estado cliente:
- `isPresentationMode`: entra via `onEnterPresentation` (fecha InfoPanel), sai via `exitPresentationMode`
- `activeTheme`: preset de tema passado ao header
- `laserEnabled`: toggle do laser para fase futura (05-03)
- Quando `isPresentationMode=true`, os `children` são suprimidos do background e exibidos apenas no overlay (T-05-07: sem duplicar viewers)

**PresentationOverlay** — palco puro:
- Renderizado como `fixed inset-0 z-50` quando ativo
- Saída por `Esc` via `keydown` no `document` (D-08)
- Hit area `data-position="bottom-left"` no canto inferior esquerdo — única zona que revela controles (D-05, D-06)
- Auto-hide por `setTimeout(3000)` após `mouseLeave` da hit area (D-07)
- `mouseOverControlsRef` impede auto-hide enquanto cursor está nos controles (D-09)

**PresentationControls** — cluster discreto:
- Background semi-transparente com glassmorphism (`bg-surface/80 backdrop-blur-sm`)
- Botão de sair (`data-testid="exit-presentation-button"`)
- Toggle de laser (`data-testid="toggle-laser-button"`) com estado `aria-pressed`

**Testes:** 27/27 passam (viewer-header + viewer-client-shell + presentation-mode)

## Deviations from Plan

**1. [Rule 1 - Bug] Filtragem de children para evitar duplicação no DOM**

- **Found during:** Task 2 — primeira execução dos testes após implementação
- **Issue:** `children` passados tanto para o background quanto para o `PresentationOverlay` causavam `getByTestId` falhar com "multiple elements found"
- **Fix:** Condicional `{!isPresentationMode && children}` no background; overlay exibe os children quando ativo
- **Files modified:** viewer-client-shell.tsx
- **Commit:** ababc78

## Known Stubs

Nenhum stub que impeça o objetivo do plano. O toggle de laser está conectado ao estado (`laserEnabled`/`onToggleLaser`) mas a overlay de desenho do laser é implementada no plano 05-03.

## Threat Surface Scan

Nenhuma superfície nova introduzida além do planejado no threat model do plano.

| Threat ID | Status |
|-----------|--------|
| T-05-05 | Mitigado — InfoPanel fechado e bloqueado ao entrar no modo |
| T-05-06 | Mitigado — hit area dedicada e auto-hide por contrato implementados |
| T-05-07 | Mitigado — children não duplicados, sem troca de rota |

## Self-Check: PASSED

- [x] `src/components/viewer/viewer-header.tsx` — FOUND
- [x] `src/components/viewer/viewer-client-shell.tsx` — FOUND
- [x] `src/components/viewer/presentation-overlay.tsx` — FOUND
- [x] `src/components/viewer/presentation-controls.tsx` — FOUND
- [x] Commit `7d1d847` — FOUND
- [x] Commit `ababc78` — FOUND
