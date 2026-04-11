---
phase: 05-presentation-mode
plan: "04"
subsystem: viewer/theme
tags: [theme-presets, ssr-hydration, localStorage, viewer-header]
dependency_graph:
  requires: [05-01, 05-02, 05-03]
  provides: [viewer-theme-module, theme-selector-button, ssr-safe-theme-init]
  affects: [viewer-client-shell, viewer-header]
tech_stack:
  added: []
  patterns:
    - Estado de tema inicializado com DEFAULT_THEME (SSR safe)
    - localStorage lido somente em useEffect após montagem
    - Fallback silencioso para falhas de storage (T-05-12)
    - Botão de ciclo de tema no header com data-theme attribute
key_files:
  created:
    - src/components/viewer/viewer-theme.ts
    - src/__tests__/viewer-theme.test.tsx
    - src/__tests__/viewer-client-shell.test.tsx
  modified:
    - src/components/viewer/viewer-client-shell.tsx
    - src/components/viewer/viewer-header.tsx
decisions:
  - Inicializar estado de tema com DEFAULT_THEME em vez de lazy initializer com localStorage — evita mismatch SSR/cliente
  - readSavedTheme() e saveTheme() apenas em useEffect e event handlers — nunca durante render
  - Props activeTheme/onThemeChange opcionais no ViewerHeader — compatibilidade retroativa com testes existentes
metrics:
  duration: ~20min
  completed: 2026-04-11
  tasks_completed: 1
  tasks_total: 3
  files_created: 3
  files_modified: 2
---

# Phase 5 Plan 04: Presets de Tema do Viewer — Summary (parcial)

**One-liner:** Sistema de presets de tema (default/chatgpt/github/excalidraw) com inicialização SSR segura — localStorage lido somente em useEffect para evitar erro de hidratação React.

## Tasks Completed

| # | Nome | Commit | Arquivos |
|---|------|--------|---------|
| 1 | Definir presets e corrigir hidratação SSR | `3fa5e93` | `viewer-theme.ts` (criado), `viewer-client-shell.tsx`, `viewer-header.tsx` |

## O que foi construído

### Task 1: viewer-theme.ts + correção SSR

**Módulo `viewer-theme.ts`:**
- Tipo `ViewerTheme` com os quatro presets: `default`, `chatgpt`, `github`, `excalidraw`
- `isValidTheme(value)` — type guard para validar valores do localStorage
- `readSavedTheme()` — lê o localStorage com try/catch, retorna `null` em falha
- `saveTheme(theme)` — persiste com fallback silencioso (T-05-12)
- `themeRootClass(theme)` — classes Tailwind de superfície por preset
- `themeProseClass(theme)` — classes de prosa por preset

**Correção SSR em `viewer-client-shell.tsx`:**

Antes (causava erro de hidratação):
```typescript
const [activeTheme, setActiveTheme] = useState<ViewerTheme>(
  () => (typeof window !== 'undefined'
    ? (localStorage.getItem('viewer-theme') as ViewerTheme)
    : null) ?? 'default'
);
```

Depois (correto):
```typescript
const [activeTheme, setActiveTheme] = useState<ViewerTheme>(DEFAULT_THEME);

useEffect(() => {
  const saved = readSavedTheme();
  if (saved) setActiveTheme(saved);
}, []);
```

O servidor renderiza com `"default"` e o cliente também inicia com `"default"`. Após a montagem, o `useEffect` aplica o tema salvo — sem mismatch de atributos `data-theme` e `aria-label`.

**Botão de tema em `viewer-header.tsx`:**
- Substituiu o slot placeholder `data-slot="theme-button-phase5"` pelo botão real
- Ícone de sol SVG, `aria-label="Tema: {label}"`, `data-theme={activeTheme}`
- Cicla entre presets na ordem da lista ao clicar

## Deviations from Plan

### Correção SSR (motivo desta entrega)

**[Rule 1 - Bug] Erro de hidratação React ao ler localStorage no render inicial**
- **Found during:** Validação em browser (erro reportado externamente)
- **Issue:** O `useState` lazy initializer lia o `localStorage` durante o render, gerando mismatch entre servidor (`data-theme="default"`) e cliente (`data-theme="github"`)
- **Fix:** Inicializar com `DEFAULT_THEME`; mover leitura do storage para `useEffect`
- **Commit:** `3fa5e93`

## Status

Este summary cobre a Task 1 do plano 05-04. As Tasks 2 (adaptar markdown/imagem/PDF/fallback para os presets) e 3 (verificação visual final) permanecem pendentes.

## Known Stubs

- `themeProseClass` e `themeRootClass` definem classes por preset, mas `MarkdownViewer`, `ImageViewer`, `PdfViewer` e `UnsupportedViewer` ainda não consomem essas classes — isso é escopo da Task 2.

## Threat Flags

Nenhuma superfície nova além do escopo do plano.

## Verification Results

```
npx vitest run src/__tests__/viewer-theme.test.tsx src/__tests__/viewer-client-shell.test.tsx

 ✓ src/__tests__/viewer-theme.test.tsx (16 tests)
 ✓ src/__tests__/viewer-client-shell.test.tsx (5 tests)

 Test Files  2 passed (2)
       Tests  21 passed (21)
```

TypeCheck: sem erros (`tsc --noEmit` saída limpa).

## Self-Check: PASSED

- [x] `src/components/viewer/viewer-theme.ts` — criado
- [x] `src/components/viewer/viewer-client-shell.tsx` — modificado (SSR fix)
- [x] `src/components/viewer/viewer-header.tsx` — modificado (botão de tema)
- [x] `src/__tests__/viewer-theme.test.tsx` — criado (16 testes)
- [x] `src/__tests__/viewer-client-shell.test.tsx` — criado (5 testes)
- [x] Commit `3fa5e93` — existe
