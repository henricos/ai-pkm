# Template — Resumo de URL

Este template define a estrutura e as regras de escrita para o corpo de arquivos `url_` com `modelo: url-resumo` após o processamento pela skill `/processar-url`.

**Escopo:** somente arquivos com prefixo `url_`, `modelo: url-resumo`, `estado: finalizado`.

O cabeçalho de proveniência (H1 + blockquote com Autores/Plataforma/Publicado em/Original) é definido em `docs/flows/processar-url.md` e antecede sempre o corpo descrito aqui — é compartilhado com `modelo: url-extrato` e não faz parte deste template.

---

## Estrutura de seções

```
## Síntese
## Narrativa
## O que fica   ← CONDICIONAL
## Recursos
```

---

## Seções

### `## Síntese` — obrigatória

Tese central + tensão ou argumento principal, em 2-3 frases. Voz interpretativa — não reprodução literal do criador. Escrita para o leitor humano que quer entender do que se trata antes de ler a Narrativa.

- Agnóstica à autoria (que já vive no cabeçalho), mas pode citar o autor se o fluxo narrativo pedir
- Distinta do campo `descricao` do frontmatter (otimizado para busca): esta seção captura o valor editorial do conteúdo para releitura

---

### `## Narrativa` — obrigatória

O fio do raciocínio do criador, em sequência, preservando a voz e o ritmo do original.

Proporcional à profundidade do conteúdo:
- **conteúdo curto ou de lista** (reel, post, artigo breve): parágrafos curtos ou lista numerada
- **conteúdo médio / educativo** (artigo longo, vídeo de 5–20 min): 5–12 parágrafos
- **conteúdo denso / longo** (palestra, paper, ensaio extenso): pode usar subseções H3

Use lista numerada apenas quando o conteúdo for genuinamente uma lista (ex: "5 ferramentas", "3 passos"). Para conteúdos argumentativos ou narrativos, prefira parágrafos em prosa que preservem a progressão do raciocínio, não apenas os pontos finais isolados.

---

### `## O que fica` — CONDICIONAL

Incluir apenas quando há síntese interpretativa distinta da Narrativa.

Voz do leitor/IA interpretando, não reproduzindo. O que muda na prática, insights duráveis, o que se faria diferente.

**Não incluir** para:
- listas simples
- notícias factuais
- entretenimento onde não há síntese interpretativa genuína

---

### `## Recursos` — obrigatória quando há itens identificados; omitir quando vazia

Referências, links relevantes, ferramentas, projetos ou perfis mencionados — apenas itens com valor isolado fora do contexto do texto. Para conteúdos com muitas referências (ex: papers), incluir apenas as mais centrais.

**Processo de curadoria obrigatório por item:**
1. Detectar menção no conteúdo-fonte
2. Buscar link oficial proativamente
3. Confirmar que o link existe e aponta para o recurso correto
4. Registrar

Formato:
```
- **Nome do recurso** — descrição de uma linha + link validado
```

Se link não confirmado com certeza após busca: `(link não confirmado)`.

A curadoria de links é obrigatória — não basta listar o que foi mencionado.

---

## Regras gerais de escrita

- Idioma: português brasileiro — a transcrição preserva o idioma original, mas o resumo é sempre em `pt-BR`
- Tom: interpretativo e autoral; não é transcrição nem paráfrase mecânica
- **Negrito** para termos-chave na primeira menção quando relevante
- Parágrafos de 3-5 frases (exceto Síntese, que é mais curta por definição)

### Proibido

- Reprodução literal de trechos longos do original (isso seria `modelo: url-extrato`, não `url-resumo`)
- Introduções genéricas ("Neste vídeo...", "O autor explica que...")
- Seções vazias — omitir `## O que fica` e `## Recursos` quando não há conteúdo genuíno
- Listas em `## Narrativa` para conteúdo argumentativo — usar prosa
