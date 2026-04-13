# Phase 6: Eliminar Flash de Tema no Viewer - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Source:** Promovido do backlog 999.1

<domain>
## Phase Boundary

Eliminar o flash visual do tema do viewer durante reload e navegação direta, preservando a segurança de SSR/hidratação e o escopo local dos presets.

Esta fase cobre:
- aplicação do preset salvo antes do primeiro paint perceptível
- alinhamento entre script pre-paint, SSR e hidratação do React
- preservação do escopo do tema apenas no viewer
- fallback seguro quando `localStorage` estiver indisponível ou contiver valor inválido

Esta fase não cobre:
- novos presets de tema
- theming global da shell, login ou layout inteiro
- preferências em backend/banco
- refactor amplo do design system

</domain>

<decisions>
## Implementation Decisions

### Requisitos travados
- **D-01:** O flash visual entre `DEFAULT_THEME` e o preset salvo deve deixar de ser perceptível no carregamento.
- **D-02:** A solução não pode reintroduzir mismatch de hidratação entre servidor e cliente.
- **D-03:** O tema continua sendo uma concern local do viewer; não deve vazar para shell, auth ou layout global.
- **D-04:** Ausência de `localStorage`, valor inválido ou execução sem JavaScript continuam sendo fallbacks benignos.
- **D-05:** A fase pode introduzir um script inline pre-paint no `layout.tsx`, desde que o escopo visual permaneça restrito ao viewer.

### the agent's Discretion
- Estrutura exata do atributo de bootstrap (`data-*`) no DOM raiz.
- Estratégia exata para conectar o atributo raiz ao escopo local do viewer no CSS.
- Extração ou não da lógica de tema para utilitários compartilhados entre client/server.
- Forma dos testes automatizados e do checkpoint manual para comprovar ausência de flash.

</decisions>

<specifics>
## Specific Ideas

- O problema atual nasce porque `viewer-client-shell.tsx` inicializa com `DEFAULT_THEME` e só aplica o preset salvo em `useEffect`.
- Hoje o viewer já usa `data-theme` e classes locais; o problema não é falta de presets, mas o momento em que o preset é aplicado.
- A solução de referência registrada no backlog é um script inline pre-paint no `head`, em linha com a técnica popularizada por bibliotecas como `next-themes`.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap
- `.planning/ROADMAP.md` — nova definição da Phase 6 e seus critérios de sucesso
- `.planning/PROJECT.md` — estado atual da `v2.0` após o fechamento da Phase 5
- `.planning/STATE.md` — posição corrente do projeto

### Prior phase artifacts
- `.planning/phases/05-presentation-mode/05-CONTEXT.md` — decisões de escopo dos presets e do presentation mode
- `.planning/phases/05-presentation-mode/05-04-SUMMARY.md` — correção SSR anterior e limitação atual do `useEffect`
- `.planning/phases/05-presentation-mode/05-VALIDATION.md` — cobertura atual de PRS-06/PRS-07

### Existing code
- `src/components/viewer/viewer-client-shell.tsx` — leitura do tema salvo e aplicação atual em `data-theme`
- `src/components/viewer/viewer-theme.ts` — tipos, storage key, validação e root do tema
- `src/app/layout.tsx` — ponto candidato para script pre-paint
- `src/app/globals.css` — seletores atuais baseados em `[data-theme]`

</canonical_refs>

<code_context>
## Existing Code Insights

### Current behavior
- `ViewerClientShell` renderiza no servidor com `DEFAULT_THEME`.
- Após a hidratação, um `useEffect` chama `readSavedTheme()` e atualiza o estado cliente.
- O CSS dos presets depende de seletores `[data-theme="..."]`, o que hoje funciona bem depois da montagem, mas tarde demais para evitar o flash.

### Architectural implication
- Um script no `head` só consegue tocar com segurança o DOM raiz (`html`/`body`) antes do primeiro paint.
- Se o atributo usado pelo bootstrap for o mesmo `data-theme` aplicado no raiz do documento, o risco é tematizar áreas fora do viewer.
- O plano precisa criar uma ponte entre o DOM raiz e um escopo explícito do viewer, em vez de promover o tema a concern global.

</code_context>

<deferred>
## Deferred Ideas

- Persistência de preferências fora do `localStorage`
- Sistema geral de preferências da app
- Mais presets ou editor de temas
- Refactor maior do módulo `viewer-theme` além do necessário para eliminar o flash

</deferred>

---

*Phase: 06-eliminar-flash-tema-viewer*
*Context gathered: 2026-04-12*
