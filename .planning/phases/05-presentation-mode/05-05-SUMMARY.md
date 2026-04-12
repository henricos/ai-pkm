---
plan: 05-05
phase: 05-presentation-mode
status: completed
completed_at: 2026-04-11
gap_closure: true
gaps_from: 05-UAT.md
---

# Summary — Plan 05-05: Fechar gaps laser (rastro contínuo e duração)

## O que foi entregue

Dois gaps de UAT fechados em `src/components/viewer/laser-pointer-overlay.tsx`:

### Gap 1 — Rastro aparecia como pontos isolados (test 10)
Substituídos os múltiplos elementos `<line>` SVG por um polígono SVG preenchido gerado pela função `buildTaperedRibbonPath`. O polígono é uma "fita" afunilada: tail (ponto mais antigo) = largura zero, head (ponto mais recente) = `MAX_STROKE_WIDTH`. Nenhum artifact de `strokeLinecap` possível pois é `fill`, não `stroke`.

### Gap 2 — Rastro muito curto / comportamento de fade inadequado (test 11)
Durante o ajuste de duração foram identificados e corrigidos três problemas adicionais de comportamento:

- **Efeito de retração**: o RAF continuava prunando pontos enquanto o rastro ainda estava em opacidade total, fazendo a cauda "se recolher" antes de desaparecer. Corrigido congelando os pontos após `pointerup` — o RAF só pruna enquanto o mouse estiver pressionado.
- **Flicker no final do fade**: a opacidade era calculada com base no ponto mais antigo (`points[0].timestamp`), que muda quando o RAF o pruna — causando saltos de opacidade. Corrigido usando `releaseTimeRef` (timestamp estável do momento do `pointerup`) como referência do fade.
- **Fade linear com piso em 0.1**: o `Math.max(0.1, ...)` mantinha o rastro translúcido por muito tempo antes de sumir. Substituído por curva hold-then-linear: opacidade total por ~100ms, depois fade linear para zero em ~300ms (total 400ms).

## Parâmetros finais

| Parâmetro | Valor |
|-----------|-------|
| `trailDurationMs` (padrão) | 400ms |
| Hold (intacto) | ~100ms (25% do total) |
| Fade | ~300ms (75% do total) |

## Critérios de sucesso — todos atendidos

- [x] `renderTrail()` produz único `<path>` SVG fill (não múltiplos `<line>`)
- [x] Rastro afunila: tail = ponto, head = MAX_STROKE_WIDTH
- [x] Fade suave sem flicker e sem retração após `pointerup`
- [x] API pública do componente (`LaserPointerOverlayProps`) inalterada
- [x] `data-testid="laser-trail-point"` preservado
- [x] 9/9 testes passam sem modificação
- [x] Sem erros de TypeScript

## Commit

`8f035e6` — fix: refatorar rastro laser — ribbon afunilado, fade sem retração
