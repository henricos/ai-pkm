---
phase: "05"
slug: presentation-mode
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-12
---

# Phase 05 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Descrição | Dado que atravessa |
|----------|-----------|--------------------|
| Header/UI controls → shell state | Gatilho de apresentação não pode deixar o shell em estado incoerente | Estado booleano interno (presentationMode) |
| Presentation hit area → controls | Mecanismo de revelação restrito ao canto inferior esquerdo | Evento de pointer (hover) |
| Laser overlay → viewer content | Overlay não bloqueia leitura nem simula funcionalidade sem rastro | Eventos de pointer (drag) |
| Theme selector → viewer root | Troca de tema não afeta shell global | Classe CSS + localStorage |
| Pointer events → SVG path | Volume de eventos não pode produzir strings `d` mal formadas ou NaN | Coordenadas de pointer |

---

## Threat Register

| Threat ID | Sev | Categoria | Componente | Disposição | Mitigação | Status |
|-----------|-----|-----------|------------|------------|-----------|--------|
| T-05-01 | high | Spoofing | presentation mode | mitigate-blocking | Testes RED exigem modo interno real, não fullscreen-only | closed |
| T-05-02 | high | Tampering | controls reveal | mitigate-blocking | Hit area dedicada no canto inferior esquerdo; reveal rejeitado por movimento global | closed |
| T-05-03 | medium | Denial of Service | laser overlay | mitigate | Desligamento limpo + trilha limpa ao desmontar; RAF pausado quando oculto | closed |
| T-05-04 | medium | Tampering | theme presets | mitigate | Tema aplicado apenas ao root do viewer via data-attribute | closed |
| T-05-05 | high | Tampering | viewer-client-shell | mitigate-blocking | InfoPanel bloqueado e fechado ao entrar no modo apresentação | closed |
| T-05-06 | high | Spoofing | controls UX | mitigate-blocking | Hit area dedicada + auto-hide por contrato de componente | closed |
| T-05-07 | medium | Denial of Service | presentation overlay | mitigate | Sem duplicação de viewers nem troca de rota; children reaproveitados | closed |
| T-05-08 | high | Denial of Service | laser overlay RAF | accept | RAF isolado ao overlay; path único reduz nós DOM vs. múltiplos `<line>` | closed |
| T-05-09 | medium | Tampering | user interaction | mitigate | `pointer-events: none` no overlay quando laser desligado | closed |
| T-05-10 | medium | Information Disclosure | laser persistence | mitigate | Trilha limpa ao desligar e ao desmontar overlay | closed |
| T-05-11 | high | Tampering | theme scope | mitigate-blocking | Tema limitado ao root do viewer, nunca ao layout global | closed |
| T-05-12 | medium | Denial of Service | localStorage | mitigate | Fallback resiliente: falha de storage não quebra leitura | closed |
| T-05-13 | medium | Spoofing | preset identity | mitigate | 4 presets visualmente distintos (default, chatgpt, github, excalidraw) | closed |

*Status: open · closed*
*Disposição: mitigate (implementação obrigatória) · accept (risco documentado) · transfer (terceiro)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-05-01 | T-05-08 | RAF path único reduz overhead de nós DOM; isolamento do overlay já contém o risco | gsd-security-auditor | 2026-04-12 |

---

## Evidência de Verificação

Todos os testes da fase 5 executados em 2026-04-12:

```
✓ src/__tests__/viewer-header.test.tsx       (12 tests)
✓ src/__tests__/viewer-client-shell.test.tsx (11 tests)
✓ src/__tests__/presentation-mode.test.tsx   ( 8 tests)
✓ src/__tests__/laser-pointer-overlay.test.tsx ( 9 tests)
✓ src/__tests__/viewer-theme.test.tsx        (24 tests)

Test Files  5 passed (5)
      Tests  64 passed (64)
```

---

## Security Audit Trail

| Data | Threats Total | Fechados | Abertos | Executado por |
|------|---------------|----------|---------|---------------|
| 2026-04-12 | 13 | 13 | 0 | gsd-secure-phase (Claude Code) |

---

## Sign-Off

- [x] Todos os threats têm disposição (mitigate / accept / transfer)
- [x] Riscos aceitos documentados no Accepted Risks Log
- [x] `threats_open: 0` confirmado
- [x] `status: verified` definido no frontmatter

**Aprovação:** verified 2026-04-12
