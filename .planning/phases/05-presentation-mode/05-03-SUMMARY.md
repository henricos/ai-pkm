---
phase: 05-presentation-mode
plan: "03"
subsystem: viewer/laser
tags: [laser-pointer, overlay, presentation-mode, svg, raf]
dependency_graph:
  requires: [05-01, 05-02]
  provides: [laser-pointer-overlay, laser-integration]
  affects: [viewer-client-shell, presentation-overlay, presentation-controls]
tech_stack:
  added: []
  patterns:
    - SVG overlay com requestAnimationFrame para rastro temporal
    - PointerEvents + timestamps para dissipação progressiva
    - Page Visibility API para pausa do loop de animação
key_files:
  created:
    - src/components/viewer/laser-pointer-overlay.tsx
  modified:
    - src/components/viewer/viewer-client-shell.tsx
    - src/components/viewer/presentation-overlay.tsx
decisions:
  - Implementação local com SVG em vez de @excalidraw/laser-pointer — garante testabilidade com jsdom e evita dependência nova
  - data-testid=laser-trail-point em cada circle SVG para rastreabilidade nos testes
  - pointer-events: none quando active=false — não bloqueia conteúdo (T-05-09)
  - Rastro limpo ao mudar active para false e ao desmontar (T-05-10)
metrics:
  duration: ~15min
  completed: 2026-04-11
  tasks_completed: 2
  tasks_total: 3
  files_created: 1
  files_modified: 2
---

# Phase 5 Plan 03: Laser Pointer Overlay Summary

**One-liner:** Ponteiro laser com rastro SVG temporal e dissipação progressiva, integrado como camada transversal ao viewer dentro e fora do modo apresentação.

## Tasks Completed

| # | Nome | Commit | Arquivos |
|---|------|--------|---------|
| 1 | Construir overlay temporal do laser | `720311e` | `laser-pointer-overlay.tsx` (criado) |
| 2 | Integrar o laser ao shell e aos controles | `a8fcc31` | `viewer-client-shell.tsx`, `presentation-overlay.tsx` |

## What Was Built

### Task 1: LaserPointerOverlay

Componente `src/components/viewer/laser-pointer-overlay.tsx` que:

- Renderiza um overlay SVG absolutamente posicionado sobre o conteúdo do viewer
- Registra amostras de posição com timestamp via `onMouseMove`
- Descarta amostras antigas via `requestAnimationFrame` (janela configurável via `trailDurationMs`, padrão 700ms)
- Pausa o loop quando o documento fica oculto (Page Visibility API — T-05-08)
- Não captura eventos quando `active=false` (`pointer-events: none` — T-05-09)
- Limpa a trilha ao desligar (`active` muda para `false`) e ao desmontar (T-05-10)
- Cada ponto do rastro tem `data-testid="laser-trail-point"` para testabilidade
- Ponto de cursor ativo com glow via `drop-shadow` CSS filter

### Task 2: Integração ao shell e controles

- `ViewerClientShell`: envolveu `children` com `LaserPointerOverlay` fora do modo apresentação — laser funciona em markdown, imagem, PDF e fallback sem código por tipo
- `PresentationOverlay`: envolveu `children` com `LaserPointerOverlay` dentro do modo apresentação — laser funciona no palco com `presentationMode=true`
- `laserEnabled` já estava no estado do shell (05-02); a integração apenas conectou o overlay

## Deviations from Plan

### Auto-selected Technical Approach

**1. [Rule 1 - Approach] Implementação local com SVG em vez de @excalidraw/laser-pointer**
- **Found during:** Task 1 — avaliação da integrabilidade do pacote
- **Issue:** `@excalidraw/laser-pointer` 1.3.2 funciona com canvas mas não é testável via jsdom de forma simples; os testes da fase 05-01 usam `data-testid="laser-trail-point"` e `querySelectorAll`, que pressupõem elementos DOM
- **Decision:** Implementação local com SVG conforme plano estabelecia como fallback válido
- **Benefit:** Testabilidade plena, sem nova dependência, mesmos comportamentos de rastro e dissipação
- **Files modified:** `laser-pointer-overlay.tsx`
- **Commit:** `720311e`

## Known Stubs

Nenhum stub identificado. O laser está funcional com dados reais de posição.

## Threat Flags

Nenhuma superfície nova além do escopo do plano.

## Verification Results

```
npx vitest run src/__tests__/laser-pointer-overlay.test.tsx src/__tests__/presentation-mode.test.tsx

 ✓ src/__tests__/laser-pointer-overlay.test.tsx (8 tests)
 ✓ src/__tests__/presentation-mode.test.tsx (8 tests)

 Test Files  2 passed (2)
 Tests  16 passed (16)
```

TypeScript: sem novos erros (os 6 erros pré-existentes são de planos futuros: `viewer-theme.test.tsx` e `viewer-client-shell.test.tsx`).

## Checkpoint Pending

Task 3 (`checkpoint:human-verify`) aguarda validação manual do comportamento real do laser no browser: persistência curta, dissipação progressiva e ausência de linha dura ou cursor estático.

## Self-Check: PASSED

- [x] `src/components/viewer/laser-pointer-overlay.tsx` — existe
- [x] `src/components/viewer/viewer-client-shell.tsx` — modificado
- [x] `src/components/viewer/presentation-overlay.tsx` — modificado
- [x] Commit `720311e` — existe
- [x] Commit `a8fcc31` — existe
- [x] 16 testes passando
