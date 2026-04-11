---
phase: "05-presentation-mode"
plan: "01"
subsystem: "viewer/presentation"
tags: [tdd, contracts, red, presentation-mode, laser, themes]
dependency_graph:
  requires: []
  provides:
    - "src/__tests__/viewer-header.test.tsx — contrato do botao de apresentacao e seletor de tema"
    - "src/__tests__/viewer-client-shell.test.tsx — contrato de transicao entre shell normal e presentation mode"
    - "src/__tests__/presentation-mode.test.tsx — contrato do palco puro, hit area e controles auto-ocultaveis"
    - "src/__tests__/laser-pointer-overlay.test.tsx — contrato do laser temporal e transversal ao viewer"
    - "src/__tests__/viewer-theme.test.tsx — contrato dos presets restritos ao viewer root"
  affects:
    - "src/components/viewer/viewer-header.tsx — precisara aceitar onEnterPresentation, activeTheme, onChangeTheme, presentationActive"
    - "src/components/viewer/viewer-client-shell.tsx — precisara gerenciar estado presentationMode"
    - "src/components/viewer/presentation-overlay.tsx — a criar na wave seguinte"
    - "src/components/viewer/laser-pointer-overlay.tsx — a criar na wave seguinte"
    - "src/components/viewer/viewer-theme.ts — a criar na wave seguinte"
tech_stack:
  added: []
  patterns:
    - "TDD RED-GREEN-REFACTOR: contratos escritos antes da implementacao"
    - "Mocks leves de componentes para testar comportamento da shell isoladamente"
    - "vi.useFakeTimers() para controlar tempo no laser pointer (D-15)"
    - "Page Visibility API simulada nos testes de desligamento do laser (T-05-03)"
key_files:
  created:
    - src/__tests__/viewer-client-shell.test.tsx
    - src/__tests__/presentation-mode.test.tsx
    - src/__tests__/laser-pointer-overlay.test.tsx
    - src/__tests__/viewer-theme.test.tsx
  modified:
    - src/__tests__/viewer-header.test.tsx
decisions:
  - "Testes RED escritos antes da implementacao para congelar interpretacao correta de presentation mode, laser e temas"
  - "viewer-client-shell.test.tsx usa mock do ViewerHeader para testar o estado interno da shell sem depender da implementacao do header"
  - "presentation-mode.test.tsx testa PresentationOverlay como componente independente (nao acoplado ao shell)"
  - "laser-pointer-overlay.test.tsx usa trailDurationMs como prop opcional para controlar a janela de dissipacao nos testes"
  - "viewer-theme.test.tsx exporta VIEWER_PRESETS, useViewerTheme, ViewerThemeProvider e ViewerThemeRoot como API publica do modulo"
metrics:
  duration: "~15 min"
  completed_date: "2026-04-11"
  tasks_completed: 3
  tasks_total: 3
  files_created: 4
  files_modified: 1
---

# Phase 5 Plan 1: Contratos TDD do Presentation Mode — Summary

**One-liner:** Contratos RED para presentation mode (palco puro), laser temporal com dissipacao progressiva (referencia Excalidraw) e presets de tema restritos ao viewer root.

## O que foi feito

Este plano (Wave 0) congela os contratos automatizados da fase 5 **antes** da implementacao. Todos os testes foram escritos em estado RED — os componentes-alvo ainda nao existem, garantindo que as waves seguintes implementem exatamente o comportamento especificado.

### Task 1 — viewer-header.test.tsx (commit `2e7dcbe`)

Substituiu o contrato legado de "botao de apresentacao desabilitado" (Phase 3) pelos contratos reais da Phase 5:

- **PRS-01:** `onEnterPresentation` callback obrigatorio; botao nao mais `disabled`
- **PRS-06:** `theme-selector` visivel fora do modo apresentacao; oculto/desabilitado dentro
- **PRS-07:** toggle do `InfoPanel` desabilitado quando `presentationActive=true`
- Contratos legados CTX-01, CTX-02, CTX-03 preservados sem regressao (8 testes GREEN)

**Resultado:** 4 testes RED (Phase 5), 8 testes GREEN (regressao Phase 3)

### Task 2 — 3 arquivos de teste (commit `8c7c3c4`)

**viewer-client-shell.test.tsx:** Contrato do estado interno do shell:
- Entrar no modo apresentacao cria `presentation-stage` no DOM (D-03: palco interno, nao fullscreen)
- `InfoPanel` nao pode ser aberto no modo apresentacao (D-02)
- `Esc` sai do modo e restaura o shell normal (D-08)
- Modo apresentacao funciona para markdown, imagem e PDF (sem ser "markdown-only")

**presentation-mode.test.tsx:** Contrato do `PresentationOverlay`:
- Hit area `bottom-left` com `data-position="bottom-left"` (D-06)
- Movimento global de mouse **nao** revela controles (D-05, T-05-02)
- Hover na hit area revela controles (D-06)
- Controles se ocultam apos 3s de inatividade (D-07)
- Mouse sobre os proprios controles mantem visibilidade (D-09)
- Botao de sair nos controles chama `onExit` (D-08, D-10)

**viewer-theme.test.tsx:** Contrato do modulo de temas:
- `VIEWER_PRESETS` inclui `default`, `chatgpt`, `github`, `excalidraw` (D-20)
- `ViewerThemeRoot` aplica `data-theme` apenas no root do viewer, nao em `body`/`html` (D-17)
- Funciona com markdown, imagem, PDF e fallback (D-17)
- `localStorage` com fallback seguro (sem crash se indisponivel)
- `setTheme` bloqueado quando `presentationActive=true` (D-19)
- Persistencia no `localStorage` quando disponivel

**Resultado:** 7 testes RED (modulos nao existem)

### Task 3 — laser-pointer-overlay.test.tsx (commit `810ea30`)

Contrato do `LaserPointerOverlay` com timers controlados:
- `active=true` renderiza overlay; `active=false` nao captura pointer events (T-05-03)
- Laser funciona dentro e fora do modo apresentacao — camada transversal (D-13)
- Overlay registra pontos de rastro ao mover o mouse (D-15)
- Pontos antigos sao dissipados apos `trailDurationMs` (D-15 — protecao contra cursor estatico)
- Pausa quando `document.hidden=true` (T-05-03)
- Conteudo clicavel com `active=false` — sem bloqueio de interacao (T-05-03)
- Rastro limpo ao desligar o laser

**Resultado:** 1 arquivo RED (modulo nao existe — falha em coleta)

## Deviations from Plan

None — plano executado exatamente como escrito.

## Known Stubs

Nenhum stub. Este plano e de contratos TDD — nenhum componente foi criado/modificado com dados hardcoded. Os testes RED sao intencionalmente "vermelhos" ate que as waves de implementacao criem os componentes.

## Threat Flags

Nenhuma nova superficie de segurança introduzida. Este plano cria apenas arquivos de teste que nao sao carregados em producao.

## Self-Check: PASSED

Arquivos criados/modificados:
- FOUND: src/__tests__/viewer-header.test.tsx
- FOUND: src/__tests__/viewer-client-shell.test.tsx
- FOUND: src/__tests__/presentation-mode.test.tsx
- FOUND: src/__tests__/laser-pointer-overlay.test.tsx
- FOUND: src/__tests__/viewer-theme.test.tsx

Commits:
- FOUND: 2e7dcbe (viewer-header.test.tsx)
- FOUND: 8c7c3c4 (viewer-client-shell, presentation-mode, viewer-theme)
- FOUND: 810ea30 (laser-pointer-overlay)
