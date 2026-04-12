# Phase 6: Eliminar Flash de Tema no Viewer - Research

**Researched:** 2026-04-12
**Domain:** bootstrap pre-paint do tema do viewer, escopo local de CSS e compatibilidade SSR/hidratação
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| Goal | Research Support |
|------|------------------|
| Aplicar o tema salvo antes do primeiro paint | O problema atual está concentrado no `useEffect` tardio de `viewer-client-shell.tsx`, portanto um bootstrap anterior à hidratação é o seam correto. |
| Não reintroduzir mismatch SSR/cliente | A correção da Phase 5 removeu a leitura de `localStorage` do render inicial; a solução nova precisa preservar isso e mover apenas o efeito visual para antes do paint. |
| Manter o escopo do tema restrito ao viewer | Os seletores atuais de `globals.css` dependem de `[data-theme]`; aplicar esse mesmo atributo em `<html>` causaria vazamento visual. |
| Preservar fallback seguro | `viewer-theme.ts` já tem `isValidTheme`, `readSavedTheme` e `saveTheme`; a nova solução deve reaproveitar a mesma semântica de tolerância a falhas. |

</phase_requirements>

## Summary

O problema é real e bem delimitado. Hoje o viewer faz a coisa certa para SSR, mas tarde demais para UX: o servidor entrega `DEFAULT_THEME`, o cliente hidrata com `DEFAULT_THEME` e só depois do mount aplica o valor salvo. Isso elimina mismatch, mas cria o flash visível.

Há duas restrições arquiteturais importantes:

1. Um script pre-paint só consegue agir no DOM raiz antes da montagem do React.
2. O tema não pode virar uma concern global da aplicação.

Portanto, a abordagem recomendada é separar **atributo de bootstrap** de **atributo efetivo do viewer**:

- o `layout.tsx` injeta um script inline mínimo que lê o valor salvo e grava algo como `data-initial-viewer-theme` em `<html>`
- o viewer declara explicitamente um escopo estável, por exemplo `data-viewer-theme-scope`
- o CSS dos presets ganha seletores que entendem tanto o estado hidratado normal quanto o estado pre-paint vindo do atributo raiz, mas sempre ancorados ao escopo do viewer

Isso evita vazamento visual para a shell e permite que o browser já pinte o subtree do viewer com o preset correto quando ele aparecer no DOM.

## Current Code Findings

### `src/components/viewer/viewer-client-shell.tsx`
- Lê o tema salvo apenas em `useEffect`
- Aplica `data-theme={activeTheme}` em `#viewer-scroll`
- Usa `ViewerThemeRoot` para preservar o tema no conteúdo e no presentation mode

### `src/components/viewer/viewer-theme.ts`
- Já contém os elementos certos para centralizar o contrato do tema:
  - `ViewerTheme`
  - `DEFAULT_THEME`
  - `VIEWER_THEMES`
  - `isValidTheme()`
  - `readSavedTheme()` e `saveTheme()`
- O storage key atual é `"viewer-theme"` e deve continuar único

### `src/app/layout.tsx`
- É o lugar natural para injetar o script pre-paint
- Hoje não existe nenhuma inicialização de tema no `head`

### `src/app/globals.css`
- Os presets já existem e estão todos baseados em `[data-theme="chatgpt|github|excalidraw"]`
- Se esse mesmo atributo for para `<html>`, o tema vazará além do viewer

## Recommended Architecture

### Pattern 1: Bootstrap raiz + escopo local

Usar dois conceitos distintos:

- `html[data-initial-viewer-theme="github"]` para o bootstrap pre-paint
- `[data-viewer-theme-scope]` para delimitar onde o CSS realmente pode atuar

Exemplo conceitual:

```css
html[data-initial-viewer-theme="github"] [data-viewer-theme-scope] {
  /* superfície do viewer */
}

[data-theme="github"][data-viewer-theme-scope] {
  /* estado hidratado normal */
}
```

### Pattern 2: Script inline mínimo e determinístico

O script deve:

- ler `localStorage.getItem("viewer-theme")`
- validar contra a lista conhecida de temas
- gravar o atributo raiz apenas se o valor for válido
- falhar silenciosamente

Não deve:

- tocar em React state
- depender de nós do viewer já existentes
- aplicar `data-theme` global em `<html>` ou `<body>`

### Pattern 3: Estado cliente continua SSR-safe

`ViewerClientShell` ainda deve iniciar com `DEFAULT_THEME` no React state.
O ganho visual vem do bootstrap no DOM/CSS, não de voltar a ler `localStorage` durante render.

## Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Vazamento do tema para shell/login | high | Separar atributo de bootstrap do atributo efetivo do viewer e ancorar todos os seletores ao escopo do viewer |
| Reintroduzir mismatch de hidratação | high | Manter `DEFAULT_THEME` como estado inicial do React e tratar o bootstrap como camada visual/CSS |
| Divergência entre script inline e validação do módulo client | medium | Centralizar storage key e temas permitidos em utilitário compartilhável ou gerar o script a partir de constantes únicas |
| Fallback quebrar em modo sem JS ou storage bloqueado | low | Script com `try/catch` e comportamento no-op quando o valor não existir ou for inválido |

## Planning Implications

- A fase pode caber em **1 plano**.
- O plano precisa combinar teste automatizado de utilitários/markup com **verificação manual real** de reload visual.
- Vale tratar o script inline como artefato pequeno e bem isolado, não como novo sistema de theming.

## Recommended Plan Breakdown

1. Extrair contrato compartilhado do tema e criar bootstrap pre-paint testável.
2. Integrar o bootstrap ao `layout.tsx`, ao escopo do viewer e aos seletores de `globals.css`.
3. Verificar reload, fallback e não-vazamento visual.

---
*Phase: 06-eliminar-flash-tema-viewer*
*Research completed: 2026-04-12*
