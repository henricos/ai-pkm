---
name: triar
description: Lê os arquivos da `pkm/__inbox/`, determina tópico e destino de cada item, propõe nome final do arquivo e aguarda aprovação humana antes de qualquer movimentação. Use esta skill sempre que o usuário quiser organizar a inbox, classificar itens pendentes, rotear notas ou URLs para seus destinos, ou mencionar que tem coisas acumuladas na inbox — mesmo que não diga explicitamente "triar".
command: /triar
---

# SKILL: Triagem da Inbox

## Instruções de Execução do Agente

Esta skill implementa o **Fluxo 2 — Triagem Interativa** descrito em `flows/triagem.md`. Ela analisa todos os itens da inbox, classifica cada um, propõe destinos e apresenta tudo em tabela para aprovação em lote. **NUNCA mova, renomeie ou crie sidecar sem aprovação explícita do usuário.**

---

### Passo 1: Leitura da Inbox

1. Liste todos os arquivos em `pkm/__inbox/`, **excluindo** `.gitkeep`.
2. Se a inbox estiver vazia, informe o usuário e encerre.

---

### Passo 2: Análise de Cada Arquivo

Para cada arquivo, determine primeiro se ele é Markdown ou binário.

- **Markdown:** leia o conteúdo e determine se é um arquivo de URL ou de nota.
- **Binário:** use nome do arquivo, extensão, contexto fornecido pelo usuário e quaisquer sinais externos disponíveis. Se isso não bastar, pergunte ao usuário antes de classificar.

Para arquivos Markdown, a classificação é **estrutural, não semântica**. Observe a estrutura bruta do conteúdo — não o assunto, tema ou intenção do arquivo.

| Estrutura do conteúdo | Classificação |
|---|---|
| Apenas uma URL, sem nenhum texto | URL |
| Uma URL + no máximo uma frase curta como rótulo/título (ex: `"Artigo sobre X"`, `"Fonte: Y"`) | URL |
| Qualquer coisa além disso: frases de contexto, parágrafos, citações, listas, notas pessoais | Nota |

Exemplos concretos:

```
# URL — apenas URL + rótulo curto
https://exemplo.com/artigo

# URL — URL com título de uma linha
Guia de fine-tuning de LLMs
https://exemplo.com/fine-tuning

# Nota — tem frases de contexto, mesmo que o assunto seja "uma referência"
Contexto: artigo do autor X sobre Y.
Fonte com citação direta: https://exemplo.com
Nota: priorizei esta fonte pois é a mais completa.
```

Regras de classificação:
- **Não tente inferir a intenção do autor** (ex: "esse arquivo existe para capturar uma URL"). Observe apenas o que está escrito.
- O assunto do arquivo (mesmo que seja "sobre uma URL" ou "sobre uma referência") **não é critério**.
- Se o arquivo tiver mais de uma frase, ou qualquer texto que vá além de um rótulo de link, é nota.
- A presença de atribuição bibliográfica, cabeçalho, seções ou notas pessoais transforma automaticamente o item em nota.

**Sempre apresente justificativa** baseada na estrutura encontrada. Se a estrutura for ambígua, pergunte ao usuário antes de classificar.

---

### Passo 2.5: Determinação do Modelo (somente para notas)

Para cada item classificado como nota, determine o modelo adequado consultando `index/models.json`.

**Lógica de resolução por item:**

1. **Encaixe claro** — o conteúdo ou o nome do arquivo sinaliza claramente um único modelo. Defina automaticamente, sem perguntar ao usuário.
   - Exemplos de sinais diretos: "ferramenta" no texto → `nota-ferramenta`; "empresa" → `nota-empresa`; "conceito", "método" ou "técnica" → `nota-conceito`; "guia", "passo a passo", "how-to" → `nota-procedimento`.

2. **Ambiguidade** — o item poderia encaixar em dois ou mais modelos. Antes de prosseguir, questione o usuário usando `AskUserQuestion` com as opções candidatas (inclua "Nenhum — omitir campo" como última opção).

3. **Sem encaixe aparente** — nenhum modelo disponível parece se aplicar ao conteúdo. Questione o usuário via `AskUserQuestion` listando os modelos disponíveis e incluindo "Nenhum — omitir campo" como opção. Somente se o usuário confirmar "Nenhum" o campo `modelo` é omitido no frontmatter.

**Regras:**
- Agrupe as perguntas de ambiguidade e sem-encaixe de todos os itens em uma única chamada a `AskUserQuestion` (máximo 4 por chamada) para evitar múltiplas interrupções.
- Se houver mais de 4 itens a perguntar, faça chamadas sequenciais de até 4 por vez.
- Para URLs e sidecars de binários: o campo `modelo` nunca é usado nesta etapa (URLs têm `modelo` definido automaticamente no Passo 5.4).

---

### Passo 3: Determinação do Destino

Aplique a hierarquia de classificação:

1. Determine o **tópico** — consulte `index/topicos.json`. Nunca invente tópicos que não constem no mapa.
2. Determine se pertence a um **grupo** existente — consulte `index/grupos.json` filtrado pelo tópico escolhido.
3. Destino final: `pkm/[topico]/` (solto), `pkm/[topico]/_[grupo]/` (dentro de grupo), ou `pkm/[topico]/[subtopico]/` (subtópico, sem prefixo `_`).

Regras:
- Se nenhum tópico existente acomodar bem o item, marque-o na tabela com destino **"sem tópico adequado"**, proponha um nome e descrição para o novo tópico, e sugira ao usuário o uso de `/reorganizar-topicos`. O item permanece na inbox.
- Se houver múltiplos grupos candidatos, liste-os e pergunte.

---

### Passo 4: Geração do Nome Final (universal)

Todo item que sai da inbox recebe um nome final proposto, independente do tipo (Markdown ou binário).

A convenção completa de nomenclatura está em `docs/pkm-naming.md`. **Siga-a obrigatoriamente.** Regras essenciais:

- **URLs:** prefixo `url_` obrigatório + padrão autor-título (ex: `url_ibm-technology-rag-vs-long-context.md`)
- **Notas e artigos:** sem prefixo, em português do Brasil, kebab-case (ex: `guia-fine-tuning-llms.md`)
- **Binários:** sem prefixo, preservar extensão original (ex: `arquitetura-de-agentes.svg`)
- Apenas letras minúsculas, números e hífens (nenhum acento, cedilha ou caractere especial)
- Descritivo e conciso (3 a 6 palavras no título)

---

### Passo 5: Etapas Adicionais para Itens de URL

Quando o tipo for `url`, execute estas etapas antes de montar a proposta:

#### 5.1 Estado inicial

Todo arquivo URL recebe `estado: rascunho` na triagem, sinalizando que ainda não foi processado.

#### 5.2 Autores e data de publicação

Para cada URL, siga esta hierarquia até obter título, autor e/ou data:

1. Tente `WebFetch` na URL — funciona para a maioria das páginas web e PDFs.
2. Se a URL for do YouTube e o `WebFetch` falhar ou retornar conteúdo pobre, use via Bash:
   ```bash
   curl -s "https://www.youtube.com/oembed?url=URL&format=json"
   ```
   Retorna `title` (use para melhorar o nome do arquivo se necessário) e `author_name` (use como `autores`).
3. Se nenhum funcionar, derive nome e autoria apenas dos sinais da própria URL (domínio, canal, caminho).

Inclua `autores` e/ou `data_publicacao` no frontmatter somente se identificados — nunca use `null` ou lista vazia.

#### 5.3 Autoria e data

Inclua `autores` e/ou `data_publicacao` no frontmatter somente se identificados — nunca use `null` ou lista vazia.

#### 5.4 Modelo de armazenamento

O `modelo` é preenchido automaticamente por regra, sem perguntar ao usuário por item:

- `url-resumo` — para vídeos: YouTube, Instagram, TikTok
- `url-extrato` — para web e PDF

O valor preenchido aparece como coluna editável na tabela de aprovação (Passo 7). O usuário pode alterá-lo antes de confirmar.

#### 5.5 Nome final para URL

O nome final de todo arquivo de URL deve seguir obrigatoriamente a convenção em `docs/pkm-naming.md`: prefixo `url_` + autor-título. Ao propor o nome final, siga esta ordem de prioridade:

1. **Use o nome do arquivo inbox existente** como primeiro candidato — se foi gerado pelo `/anotar` com contexto do usuário e já tem o prefixo `url_` e o padrão correto, preserve-o
2. Se o nome for genérico demais (ex: `url-capturada.md`, `link.md`) ou não seguir a convenção, derive o nome correto a partir do contexto ou título do arquivo
3. Se isso não bastar, use sinais da própria URL (domínio/canal e caminho)
4. Se ainda ficar fraco, pergunte ao usuário um título curto

Em todo caso, **o prefixo `url_` é obrigatório** no nome final do destino. Mesmo após a triagem, o fluxo `/processar-url` pode melhorar o nome quando a extração ou o resumo revelarem opção melhor.

---

### Passo 6: Etapas Adicionais para Binários

Quando o item for um binário, execute estas etapas antes de montar a proposta:

#### 6.1 Sidecar proposto

Monte um sidecar no formato `nome.extensao.md` com frontmatter conforme `schemas/frontmatter-item.md`.

Regras:
- `estado: rascunho` é obrigatório.
- `url` só entra se houver uma URL externa real associada ao binário.
- O sidecar não deve ter corpo Markdown nesta versão.

---

### Passo 7: Apresentação em Tabela para Aprovação em Lote

Após analisar todos os itens, apresente uma tabela resumo com TODOS de uma vez:

```
| # | Arquivo original | Tipo | Destino proposto | Nome final | Modelo |
|---|---|---|---|---|---|
| 1 | nota-xyz.md | nota | saude/ | reflexoes-sobre-jejum.md | — |
| 2 | link-abc.md | url | tecnologia/ | url_autor-titulo.md | url-extrato |
| 3 | diagrama-bruto.svg | binário | tecnologia/ | arquitetura-de-agentes.svg | — |
```

A coluna `Modelo` é preenchida automaticamente: para notas, quando há encaixe claro no catálogo (`index/models.json`); para URLs, por regra (`url-resumo` para vídeos, `url-extrato` para web/PDF). Quando não se aplica ou não há encaixe, fica `—` (campo omitido no frontmatter). O usuário pode alterar qualquer valor antes de confirmar.

**Para cada item que terminará com frontmatter ou sidecar**, mostre também a proposta logo abaixo da tabela:

```yaml
# Item 2 — url_autor-titulo.md
---
estado: rascunho
url: "https://exemplo.com/fine-tuning"
modelo: url-extrato
autores: ["Autor Nome"]        # omitir se não identificado
data_captura: YYYY-MM-DD       # data de hoje
data_publicacao: 2025-03       # omitir se não identificado
---
```

```yaml
# Item 1 — reflexoes-sobre-jejum.md
---
estado: rascunho
modelo: nota-conceito          # omitir se nenhum modelo se aplicar
data_captura: YYYY-MM-DD
---
```

```yaml
# Item 3 — arquitetura-de-agentes.svg.md
---
estado: rascunho
data_captura: YYYY-MM-DD
---
```

Nunca use `null` ou lista vazia para campos opcionais — simplesmente omita-os.

**Opções de aprovação em lote:**

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o. Caso contrário, apresente as opções numeradas.

1. **Aprovar tudo** *(recomendado)*
2. **Ajustar item específico**
3. **Rejeitar tudo** *(manter tudo na inbox)*

Se o usuário escolher ajustar, permita as mudanças e reapresente a tabela atualizada.

---

### Passo 8: Execução (Somente após aprovação)

Use o helper `.agents/skills/triar/scripts/mover_inbox.py` para mover todos os itens aprovados em **uma única chamada Bash**. O script lê os arquivos de origem, monta o conteúdo final com frontmatter e remove os originais.

#### Formato do payload JSON

Monte uma lista JSON com um objeto por item aprovado.

**Para Markdown (url ou nota):**

```json
{
  "tipo": "markdown",
  "origem": "pkm/__inbox/nome-original.md",
  "destino": "pkm/topico/nome-final.md",
  "frontmatter": "estado: rascunho\nmodelo: nota-conceito\ndata_captura: 2026-03-22"
}
```

Para URLs, inclua `url` e `modelo` no frontmatter:

```json
{
  "tipo": "markdown",
  "origem": "pkm/__inbox/link-abc.md",
  "destino": "pkm/tecnologia/url_autor-titulo.md",
  "frontmatter": "estado: rascunho\nurl: \"https://exemplo.com\"\nmodelo: url-extrato\ndata_captura: 2026-03-22"
}
```

**Para binários:**

```json
{
  "tipo": "binario",
  "origem": "pkm/__inbox/arquivo.svg",
  "destino": "pkm/topico/arquivo.svg",
  "sidecar_destino": "pkm/topico/arquivo.svg.md",
  "sidecar_frontmatter": "estado: rascunho\ndata_captura: 2026-03-22"
}
```

O campo `frontmatter` (e `sidecar_frontmatter`) contém apenas as linhas YAML internas — **sem os delimitadores `---`**. O script os adiciona.

#### Chamada

```bash
python3 .agents/skills/triar/scripts/mover_inbox.py '<json>'
```

#### Interpretação do resultado

O script imprime JSON com `"status": "ok"` ou `"status": "erro"` por item. Em caso de erro em algum item, investigue a mensagem e corrija antes de continuar.

---

### Passo 9: Resumo e Próximos Passos

Ao final, apresente o resumo:

> **Triagem concluída.** X item(ns) movido(s), Y mantido(s) na inbox.

Sugira ao usuário:

> *"Use `/commit-push` para registrar a triagem no histórico Git."*

---

## Regras de Comportamento

- **Aprovação em lote obrigatória.** Todos os itens são apresentados juntos em tabela.
- **Nunca mova arquivos sem aprovação.**
- **Binários em `pkm/[topico]/...` sempre exigem sidecar após a triagem.**
- **Hierarquia de classificação:** tópico primeiro, depois grupo dentro do tópico.
- **Nunca invente tópicos.** Consulte `index/topicos.json`.
- **Pastas de destino sempre existem.** Os tópicos em `topicos.json` já têm pastas no repositório. Não crie pastas nem `.gitkeep` na triagem.
- **Frontmatter** segue rigorosamente `schemas/frontmatter-item.md`. Campos opcionais desconhecidos são omitidos.
- **`url` é obrigatório em arquivos com prefixo `url_` e nunca aparece em notas ou sidecars.**
- **`modelo` e `estado: rascunho` são os campos-chave de URLs; notas recebem `estado: rascunho` e opcionalmente `modelo`.**
- **Sem logs** — auditoria exclusivamente via histórico Git com `/commit-push`.

## Arquivos de Referência

- `flows/triagem.md` — especificação do fluxo de triagem
- `docs/pkm-naming.md` — **fonte de verdade para nomenclatura** (prefixo `url_`, padrão autor-título, palavras banidas)
- `index/grupos.json` — grupos existentes
- `index/topicos.json` — tópicos para classificação
- `index/models.json` — catálogo de modelos disponíveis para notas
- `docs/pkm-structure.md` — estrutura de destinos
- `schemas/frontmatter-item.md` — esquema de frontmatter de itens de conhecimento
