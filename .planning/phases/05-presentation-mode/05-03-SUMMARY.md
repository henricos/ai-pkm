---
phase: 05-presentation-mode
plan: "03"
subsystem: viewer/laser
tags: [laser-pointer, overlay, presentation-mode, svg, raf, comet-tail]
dependency_graph:
  requires: [05-01, 05-02]
  provides: [laser-pointer-overlay, laser-integration]
  affects: [viewer-client-shell, presentation-overlay, presentation-controls, viewer-header]
tech_stack:
  added: []
  patterns:
    - SVG overlay com requestAnimationFrame para rastro temporal
    - PointerEvents (pointerdown/pointerup) para click-drag exclusivo
    - Espessura variável por posição relativa (efeito cauda de cometa)
    - Segmentos <line> SVG com stroke-linecap/linejoin round para continuidade
    - Page Visibility API para pausa do loop de animação
key_files:
  created:
    - src/components/viewer/laser-pointer-overlay.tsx
  modified:
    - src/components/viewer/viewer-client-shell.tsx
    - src/components/viewer/presentation-overlay.tsx
    - src/components/viewer/presentation-controls.tsx
    - src/components/viewer/viewer-header.tsx
    - src/__tests__/laser-pointer-overlay.test.tsx
decisions:
  - Implementação local com SVG em vez de @excalidraw/laser-pointer — garante testabilidade com jsdom e evita dependência nova
  - Rastro apenas com pointerdown ativo — hover não gera rastro (pós-validação manual)
  - Segmentos <line> SVG em vez de <circle> por ponto — garante continuidade em movimentos rápidos
  - Espessura variável por posição relativa no rastro — efeito cauda de cometa (ponta grossa, cauda fina)
  - Ícone de caneta (pen SVG) nos dois pontos de entrada do laser (header e controls)
  - Toggle do laser no ViewerHeader — acessível fora do presentation mode
  - Guarda opcional para setPointerCapture (não disponível no jsdom)
metrics:
  duration: ~30min (inclui validação manual e correções)
  completed: 2026-04-11
  tasks_completed: 3
  tasks_total: 3
  files_created: 1
  files_modified: 5
---

# Phase 5 Plan 03: Laser Pointer Overlay Summary

**One-liner:** Ponteiro laser com rastro SVG de cauda de cometa (espessura variável), ativado por click-drag, integrado como camada transversal ao viewer com toggle no header e nos controles de apresentação.

## Tasks Completed

| # | Nome | Commit | Arquivos |
|---|------|--------|---------|
| 1 | Construir overlay temporal do laser | `720311e` | `laser-pointer-overlay.tsx` (criado) |
| 2 | Integrar o laser ao shell e aos controles | `a8fcc31` | `viewer-client-shell.tsx`, `presentation-overlay.tsx` |
| 3 | Correções pós-validação manual | `5927e02` | `laser-pointer-overlay.tsx`, `presentation-controls.tsx`, `viewer-header.tsx`, `viewer-client-shell.tsx`, `laser-pointer-overlay.test.tsx` |

## What Was Built

### Task 1–2: LaserPointerOverlay (implementação inicial)

- Overlay SVG absolutamente posicionado sobre o conteúdo do viewer
- Registro de amostras de posição com timestamp e dissipação por `requestAnimationFrame`
- Pausa do loop com Page Visibility API (T-05-08)
- `pointer-events: none` quando `active=false` (T-05-09)
- Limpeza da trilha ao desligar e ao desmontar (T-05-10)

### Task 3: Correções pós-validação manual

Cinco problemas identificados na validação no browser e corrigidos:

**1. Ícone de caneta nos dois pontos de entrada**
- `PresentationControls`: substituído ícone de alvo/cruz pelo ícone de caneta (pen SVG)
- `ViewerHeader`: adicionado botão com ícone de caneta para toggle do laser fora do presentation mode
- `ViewerClientShell`: passa `laserEnabled` e `onToggleLaser` ao `ViewerHeader`

**2. Rastro ativo apenas com mouse pressionado (click-drag)**
- Substituiu `onMouseMove` por `onPointerDown` + `onPointerMove` + `onPointerUp`
- Rastro só é registrado quando `isPressedRef.current === true`
- Hover sem pressionar não gera nenhum ponto

**3. Efeito cauda de cometa (espessura variável)**
- Cada segmento tem espessura proporcional à sua posição relativa no rastro
- Posição 0 (cauda mais antiga) = `MIN_STROKE_WIDTH` (0.5px)
- Posição 1 (ponta mais nova) = `MAX_STROKE_WIDTH` (5px)
- Fórmula: `strokeWidth = MIN + (MAX - MIN) * relativePos`

**4. Linha contínua em movimentos rápidos**
- Substituiu `<circle>` por `<line>` SVG conectando pontos consecutivos
- `stroke-linecap: round` e `stroke-linejoin: round` para suavidade
- Sem pontos desconectados mesmo em movimentos rápidos

**5. Espessura geral reduzida**
- Espessura máxima de 5px (era 8–10px no cursor ativo)
- Ponto de cursor ativo com raio `MAX_STROKE_WIDTH / 2 + 1 = 3.5px`

## Deviations from Plan

### Implementação inicial (Tasks 1–2)

**1. [Rule 1 - Approach] Implementação local com SVG em vez de @excalidraw/laser-pointer**
- **Found during:** Task 1 — avaliação da integrabilidade do pacote
- **Issue:** `@excalidraw/laser-pointer` 1.3.2 usa canvas e não é testável via jsdom com `data-testid`
- **Fix:** Implementação local com SVG — testabilidade plena, sem nova dependência
- **Commit:** `720311e`

### Correções pós-validação (Task 3)

**2. [Rule 1 - Bug] Rastro aparecia em hover sem click**
- **Found during:** Validação manual no browser
- **Issue:** `onMouseMove` registrava pontos independentemente de o botão estar pressionado
- **Fix:** Migrado para `onPointerDown/Move/Up` com flag `isPressedRef`
- **Commit:** `5927e02`

**3. [Rule 2 - UX] Ícone ausente no header**
- **Found during:** Validação manual no browser
- **Issue:** Toggle do laser acessível apenas nos controles do presentation mode
- **Fix:** Botão com ícone de caneta adicionado ao `ViewerHeader`; props `laserEnabled`/`onToggleLaser` propagadas pelo shell
- **Commit:** `5927e02`

**4. [Rule 1 - Bug] Pontos desconectados em movimentos rápidos**
- **Found during:** Validação manual no browser
- **Issue:** `<circle>` por ponto deixava lacunas em movimentos rápidos
- **Fix:** Substituído por `<line>` SVG conectando pontos consecutivos
- **Commit:** `5927e02`

**5. [Rule 2 - UX] Sem variação de espessura (rastro plano)**
- **Found during:** Validação manual no browser
- **Issue:** Todos os pontos do rastro tinham a mesma espessura — sem efeito de profundidade
- **Fix:** Espessura proporcional à posição relativa no rastro (cauda de cometa)
- **Commit:** `5927e02`

**6. [Rule 1 - Compat] setPointerCapture ausente no jsdom**
- **Found during:** Execução dos testes após as correções
- **Issue:** `setPointerCapture` não está implementado no jsdom → TypeError nos testes
- **Fix:** Guarda opcional `if (typeof el.setPointerCapture === "function")`
- **Commit:** `5927e02`

## Known Stubs

Nenhum stub identificado. O laser está funcional com dados reais de posição.

## Threat Flags

Nenhuma superfície nova além do escopo do plano.

## Verification Results

```
npx vitest run src/__tests__/laser-pointer-overlay.test.tsx src/__tests__/presentation-mode.test.tsx

 ✓ src/__tests__/laser-pointer-overlay.test.tsx (9 tests)
 ✓ src/__tests__/presentation-mode.test.tsx (8 tests)

 Test Files  2 passed (2)
       Tests  17 passed (17)
```

TypeScript: sem novos erros. Os 5 erros pré-existentes são de planos futuros (`viewer-theme.test.tsx`, `viewer-client-shell.test.tsx`).

## Self-Check: PASSED

- [x] `src/components/viewer/laser-pointer-overlay.tsx` — existe e corrigido
- [x] `src/components/viewer/viewer-client-shell.tsx` — modificado (laser no header)
- [x] `src/components/viewer/presentation-overlay.tsx` — modificado
- [x] `src/components/viewer/presentation-controls.tsx` — modificado (ícone de caneta)
- [x] `src/components/viewer/viewer-header.tsx` — modificado (botão laser + ícone)
- [x] `src/__tests__/laser-pointer-overlay.test.tsx` — atualizado (9 testes, click-drag)
- [x] Commit `720311e` — existe (Task 1)
- [x] Commit `a8fcc31` — existe (Task 2)
- [x] Commit `5927e02` — existe (Task 3 — correções pós-validação)
- [x] 17 testes passando
