# Formato de Cabeçalho para Arquivos `url_`

Contrato compartilhado do cabeçalho de proveniência usado em arquivos `url_` processados no PKM.

Este arquivo define apenas a estrutura e as regras do cabeçalho. Ele não define a estrutura do corpo, o tom editorial nem as regras específicas de cada variante de conteúdo.

---

## Escopo

Aplica-se a arquivos com prefixo `url_` já processados a partir de uma URL externa.

---

## Estrutura

O cabeçalho antecede sempre o corpo do documento e usa o seguinte formato:

```md
# [Título]

> **Autores:** [autor 1, autor 2]
> **Plataforma:** [plataforma]
> **Publicado em:** [data]
> **Original:** [https://url-limpa.com](https://url-limpa.com)
```

---

## Regras

- O `# [Título]` usa o título original da fonte quando disponível; se ausente, pode ser gerado a partir do conteúdo.
- O bloco de proveniência aparece imediatamente abaixo do H1.
- A ordem dos campos no blockquote é fixa:
  - `Autores`
  - `Plataforma`
  - `Publicado em`
  - `Original`
- `Autores` e `Publicado em` são omitidos silenciosamente quando ausentes.
- `Original` é obrigatório e usa sempre o formato `[url](url)`.
- `Plataforma` é inferida a partir da URL; quando não houver classificação melhor, usar `Web`.
