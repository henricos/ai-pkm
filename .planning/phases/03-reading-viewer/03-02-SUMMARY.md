---
plan: 03-02
phase: 03-reading-viewer
status: complete
wave: 1
completed_at: 2026-04-09
---

# SUMMARY — 03-02: Dependências e globals.css

## O que foi construído

Ambiente de renderização Markdown completamente configurado — sem componentes criados, apenas infraestrutura de dependências e CSS.

## Tarefas executadas

| # | Tarefa | Status | Commit |
|---|--------|--------|--------|
| 1 | Instalar dependências do pipeline de renderização | ✓ | 2bdc1c7 |
| 2 | Configurar globals.css com typography plugin, KaTeX CSS e prose overrides | ✓ | 7b5fa49 |

## Artefatos modificados

### package.json
- **runtime dependencies adicionadas:** `react-markdown@^10.1.0`, `remark-gfm@^4.0.1`, `remark-math@^6.0.0`, `rehype-katex@^7.0.1`, `@shikijs/rehype@^4.0.2`, `shiki@^4.0.2`
- **devDependencies adicionada:** `@tailwindcss/typography@^0.5.19`

### src/app/globals.css
- `@import "katex/dist/katex.min.css"` — CSS global para renderização de fórmulas KaTeX
- `@plugin "@tailwindcss/typography"` — método CSS-first do Tailwind v4
- `@layer utilities { .prose { ... } }` — 15 variáveis `--tw-prose-*` mapeadas aos tokens do DESIGN.md:
  - Texto/headings/bold: `var(--color-on-surface)` (#2b3437)
  - Links: `var(--color-tertiary)` (#0055d7)
  - Bordas: `var(--color-outline-variant)` (#c8cfd1)
  - Pre/code bg: `var(--color-surface-container-low)` (#f1f4f6)

## Verificação

```
OK: react-markdown ^10.1.0
OK: remark-gfm ^4.0.1
OK: remark-math ^6.0.0
OK: rehype-katex ^7.0.1
OK: @shikijs/rehype ^4.0.2
OK: shiki ^4.0.2
OK: @tailwindcss/typography ^0.5.19
```

globals.css: @import katex ✓ | @plugin typography ✓ | --tw-prose-body ✓ | --tw-prose-links ✓ | --tw-prose-pre-bg ✓

## Desvios

Nenhum. Executado inline pelo orchestrator (agente de worktree bloqueado por permissão de Bash no ambiente).

## Habilita para Wave 2+

- `MarkdownViewer` pode agora `import ReactMarkdown from 'react-markdown'` e usar `remarkGfm`, `remarkMath`, `rehypeKatex`, `rehypeShiki`
- Classe `prose` aplicada ao `<article>` renderizará com os tokens corretos do design system
- Fórmulas KaTeX terão o CSS de renderização carregado globalmente
