# Modelo — Extrato de URL

Este modelo define o comportamento de extração para arquivos `url_` com `modelo: url-extrato`.

**Escopo:** somente arquivos com prefixo `url_`, `modelo: url-extrato`, `estado: rascunho`. Válido apenas para `web` e `pdf` — nunca usar para vídeos (YouTube, Instagram, TikTok).

O cabeçalho de proveniência (H1 + blockquote com Autores/Plataforma/Publicado em/Original) é definido em `docs/flows/processar-url.md` e antecede sempre o conteúdo extraído — é compartilhado com `modelo: url-resumo` e não faz parte deste modelo.

---

## O que este modelo produz

Uma transcrição limpa e fiel do conteúdo editorial da fonte, em Markdown, sem nenhuma interpretação ou síntese da IA.

O extrato é a fonte completa em formato legível — não um resumo, não uma paráfrase, não uma curadoria. O valor está na integridade do conteúdo original.

---

## O que preservar

- Todo o texto do corpo editorial na ordem original
- Estrutura de títulos e subtítulos da fonte (convertida para Markdown)
- Listas, tabelas e blocos de código presentes no original
- Notas de rodapé com conteúdo informativo
- Imagens referenciadas por texto alternativo quando relevante

---

## O que remover

- Menus de navegação, cabeçalhos e rodapés do site
- Anúncios, banners e qualquer elemento publicitário
- Calls-to-action ("Assine agora", "Leia mais", "Compartilhe")
- Barras laterais de conteúdo relacionado ou sugerido
- Boilerplate de paywall ou avisos de assinatura
- Metadados de publicação que já constam no frontmatter ou cabeçalho

---

## Regras

- Preservar o idioma original — sem tradução, sem adaptação
- Sem introdução, resumo ou comentário da IA antes ou depois do conteúdo
- Sem omissão de partes do corpo por julgamento editorial — o extrato é integral
- Markdown limpo: sem HTML residual, sem escape desnecessário
