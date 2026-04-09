# Phase 3: Reading Viewer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-09
**Phase:** 03-reading-viewer
**Mode:** discuss (interactive)
**Areas discussed:** Pipeline de Renderização, Composição de Leitura, Cabeçalho e Ações, Painel de Informações

---

## Areas Discussed

### Pipeline de Renderização

| Decisão | Escolha | Notas |
|---------|---------|-------|
| Base de renderização | `react-markdown` + `remark-gfm` | Usuário pediu pesquisa antes de decidir. Validado que é a mesma base do ChatGPT (rehype-react + remark). |
| Syntax highlighting | Shiki | Motor do VS Code, output estático, padrão Vercel/Next.js. Confirmado após pesquisa. |
| Fórmulas matemáticas | KaTeX (remark-math + rehype-katex) | Usuário confirma uso frequente de fórmulas no corpus real. |
| Links externos | Nova aba (target=_blank + rel=noopener) | Links internos navegam dentro da shell. |
| Callouts/admonitions | Sem tratamento especial | Usuário não tem certeza se usa; blockquote padrão por ora. |

**Pesquisa realizada:** Usuário solicitou pesquisa comparativa de bibliotecas de Markdown em produtos famosos (ChatGPT, Claude, GitHub, Azure DevOps, Notion, Obsidian). Resultado: `react-markdown` (ecossistema remark/rehype) é o padrão React/Next.js, backed by Vercel; ChatGPT usa rehype-react + remark (mesma base).

**Esclarecimento solicitado:** Usuário perguntou o que é VIEW-03 e se `marked` seria melhor sem ela. Resposta: VIEW-03 proíbe HTML cru como estratégia principal; `marked` gera HTML string requerendo `dangerouslySetInnerHTML`. Para as necessidades do projeto (KaTeX + Shiki + componentes customizáveis futuros), `react-markdown` teria sido a escolha mesmo sem VIEW-03.

---

### Composição de Leitura

| Decisão | Escolha | Notas |
|---------|---------|-------|
| Base de estilo Markdown | @tailwindcss/typography (prose-sm) | Padrão de mercado; prose-sm usa 14px = body-md do DESIGN.md |
| Largura máxima | max-w-prose (~65ch) | Alinhado à esquerda, não centralizado. Technical Journal rhythm do DESIGN.md. |
| Scroll behavior | Só a área direita rola | Painel esquerdo fixo. Padrão shell única. |
| Tipografia base | 14px (body-md do DESIGN.md via prose-sm) | Usuário preferiu 14px ao invés do recomendado 16px |
| Fundo da área | surface_container_lowest (#fff) | Maximum focus (DESIGN.md). |

**Nota:** Usuário expressou preocupação com não desperdiçar espaço nas bordas. Esclarecido que max-w-prose é alinhado à esquerda (não centralizado no viewport), deixando o espaço à direita disponível para o painel de info.

---

### Cabeçalho e Ações

| Decisão | Escolha | Notas |
|---------|---------|-------|
| Header sticky | Sim | Glassmorphism discreto ao rolar (70% opacity + blur). |
| CTX-01 — conteúdo do header | Tópico › Grupo + estado (não título) | **Revisão de requisito:** filename é feio (kebab-case), H1 não garantido em todo Markdown. Usuário propôs e confirmou a mudança. |
| Ações (CTX-02) | Download + Modo apresentação (disabled) + ℹ️ info | Botão de apresentação aparece desabilitado (Phase 5 implementa). |
| Slot para tema | Reservado no header | Phase 5 / PRS-06, PRS-07. Usuário identificou que o botão de tema pertence ao header. |

---

### Painel de Informações

| Decisão | Escolha | Notas |
|---------|---------|-------|
| Comportamento de abertura | Lateral direito fixo ~280px empurrando conteúdo | Não overlay. Padrão de painel persistente. |
| Toggle/fechar | Ícone ℹ️ toggle + Escape | Clicar no conteúdo Markdown não fecha. |
| Campos visíveis | Todos disponíveis | tipo/estado como chips, modelo como chip neutro, datas formatadas, tópico›grupo texto, url como link, autores como chips. |
| Campos ausentes | Ocultar completamente | Sem "N/A" ou placeholders. |
| Slot para sidecar | Reservado vazio em Phase 3 | Phase 4 preenche para binários+sidecar (CTX-05). |

**Pesquisa realizada para campos:** Usuário pediu análise completa dos frontmatters possíveis (nota, url, sidecar). Campos identificados: estado, modelo, data_captura (obrigatórios), url (condicional, só url_), autores e data_publicacao (opcionais). Campos derivados: tipo, tópico, grupo.

**Pesquisa realizada para fechar:** Usuário perguntou sobre padrão de fechar ao clicar fora. Explicado: overlays/drawers = fechar ao clicar fora; painéis persistentes que empurram conteúdo (GitHub, VS Code, Linear) = não fecham ao clicar fora. Confirmado toggle + Escape.

---

## Revisões de Requisito

### CTX-01 — Título no cabeçalho
**Original:** "Cabeçalho da área direita exibe o título do item atual."
**Revisão:** Cabeçalho exibe o caminho estrutural `tópico › grupo` + indicador de estado.
**Motivo:** Itens do PKM não têm campo `title` — apenas filename em kebab-case. H1 do Markdown não é garantido em todos os arquivos. O caminho estrutural é mais informativo e editorial.

---

## Ideias Adiadas (Deferred)

- **Troca de tema no viewer** — Phase 5 (PRS-06, PRS-07). Header da Phase 3 reserva posição.
- **Callouts visuais** — Corpus real não confirma uso; tratamento especial adiado para avaliação futura.

