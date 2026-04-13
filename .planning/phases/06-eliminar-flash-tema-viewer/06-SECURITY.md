---
phase: "06"
slug: eliminar-flash-tema-viewer
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-13
---

# Phase 06 — Security

> Contrato de seguranca da fase de bootstrap pre-paint do tema do viewer.

---

## Trust Boundaries

| Boundary | Descricao | Dado que atravessa |
|----------|-----------|--------------------|
| `layout.tsx` -> `document.documentElement` | Script inline ajusta apenas um atributo de bootstrap | Nome do preset salvo |
| `documentElement` -> subtree do viewer | O root global sinaliza o preset, mas o CSS nao pode vazar para fora do viewer | `data-viewer-theme-preload` |
| `localStorage` -> bootstrap script | Valor externo nao confiavel | String arbitraria persistida pelo navegador |
| hidratação React -> viewer root | Estado inicial do cliente nao pode divergir do SSR nem reler storage durante render | `DEFAULT_THEME`, `data-theme`, `data-viewer-scope` |

---

## Threat Register

| Threat ID | Sev | Categoria | Componente | Disposicao | Mitigacao | Status |
|-----------|-----|-----------|------------|------------|-----------|--------|
| T-06-01 | high | Tampering | layout/bootstrap | mitigate-blocking | Atributo de bootstrap dedicado (`data-viewer-theme-preload`) separado do tema efetivo do viewer | closed |
| T-06-02 | high | Tampering | hydration | mitigate-blocking | React continua inicializando com `DEFAULT_THEME`; storage so e lido fora do render inicial | closed |
| T-06-03 | medium | Denial of Service | localStorage access | mitigate | Leitura protegida por `try/catch` e sanitizacao de preset valido | closed |
| T-06-04 | medium | Spoofing | CSS scope | mitigate | Seletores de preload ancorados em `[data-viewer-scope]`, sem impacto em shell ou login | closed |

*Status: open · closed*

---

## Accepted Risks Log

Nenhum risco residual aberto.

---

## Evidencia de Verificacao

Checks executados em 2026-04-13:

```text
✓ src/__tests__/viewer-theme.test.tsx                (27 tests)
✓ src/__tests__/viewer-client-shell.test.tsx         (11 tests)
✓ src/__tests__/viewer-theme.test.tsx                (27 tests)
✓ npm run typecheck
✓ npm run build
```

O checkpoint visual em browser real foi dispensado e registrado em `06-UAT.md`; nao ha threat aberto dependente desse passo.

---

## Sign-Off

- [x] Todos os threats possuem disposicao
- [x] `threats_open: 0` confirmado
- [x] Escopo do tema segue local ao viewer
- [x] Fallbacks de storage invalido ou indisponivel permanecem benignos

**Aprovacao:** verified 2026-04-13
