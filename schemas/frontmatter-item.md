# Metadados (Frontmatter) — Itens do PKM

Este schema vale para todos os itens de conhecimento no repositório `pkm`:

- arquivos Markdown de notas em `pkm/[topico]/`
- arquivos Markdown de URLs em `pkm/[topico]/` (prefixo `url_` no nome)
- sidecars de binários em `pkm/[topico]/`, no formato `nome.extensao.md`

O frontmatter contém apenas campos intrínsecos e estáveis — o que não pode ser inferido da estrutura de pastas ou do nome do arquivo. Campos derivados (tópico, tipo) foram removidos.

```yaml
---
estado: rascunho              # rascunho | finalizado (obrigatório)
modelo: url-extrato           # obrigatório (veja valores por tipo abaixo)
data_captura: 2026-03-07      # obrigatório
url: "https://..."            # obrigatório em arquivos url_; ausente em notas e sidecars
autores: ["Nome"]             # opcional
data_publicacao: 2025-12      # opcional
---
```

## Campos obrigatórios

- `estado`: Estágio atual do item.
  - `rascunho` — item recém-triado ou em construção; URLs aguardam processamento; notas aguardam elaboração
  - `finalizado` — trabalho concluído; URLs processadas com conteúdo elaborado; notas revisadas e maduras

- `modelo`: Modelo de estrutura aplicado ao item. Valores válidos por tipo de item:
  - **Notas**: qualquer valor listado em `index/models.json`
  - **URLs** (prefixo `url_`): `url-extrato` | `url-resumo`
  - **Sidecars**: `sidecar`

- `data_captura`: Data em que o item foi triado ou adicionado ao repositório. Formato `YYYY-MM-DD`.

## Campo condicional

- `url`: URL canônica externa. **Obrigatório em arquivos com prefixo `url_`; ausente em todos os outros.** Nunca use este campo para links que aparecem no corpo de texto de uma nota — apenas para a URL que é o sujeito principal do arquivo.

## Campos opcionais

- `autores`: Lista de autores ou criadores da fonte original. **Sempre lista YAML** — mesmo para autor único: `["Nome"]`. Nunca usar string simples. **Omitir** quando desconhecido — não usar `null` nem lista vazia.
- `data_publicacao`: Data de publicação original da fonte. String ISO parcial — use o máximo de precisão disponível: `"YYYY-MM-DD"` (completo), `"YYYY-MM"` (mês), `"YYYY"` (ano). **Omitir** quando desconhecido.

## Campos derivados (não pertencem ao frontmatter)

Estes campos são **inferidos** — nunca devem constar no frontmatter:

| Campo | Como inferir |
|---|---|
| Tópico | Pasta onde o arquivo está (`pkm/[topico]/`) |
| Tipo (nota ou url) | Prefixo `url_` no nome do arquivo |
| Âmbito | Removido |

## Convenção de datas

Todos os campos temporais usam o prefixo `data_` (ex: `data_captura`, `data_publicacao`).

O campo `data_publicacao` aceita formatos ISO parciais quando não há precisão maior disponível: somente ano (`"YYYY"`) e somente mês (`"YYYY-MM"`) são válidos. Use sempre o máximo de precisão conhecida.

## Exemplo: URL aguardando processamento

```yaml
---
estado: rascunho
modelo: url-extrato
data_captura: 2026-03-07
url: "https://exemplo.com/produtividade-devs"
autores: ["Jane Doe"]
data_publicacao: 2025-11
---
```

## Exemplo: URL processada

```yaml
---
estado: finalizado
modelo: url-extrato
data_captura: 2026-03-07
url: "https://exemplo.com/produtividade-devs"
autores: ["Jane Doe"]
data_publicacao: 2025-11
---
```

## Exemplo: nota em rascunho

```yaml
---
estado: rascunho
modelo: nota-conceito
data_captura: 2026-03-07
---
```

## Exemplo: nota finalizada

```yaml
---
estado: finalizado
modelo: nota-conceito
data_captura: 2026-03-07
---
```

## Exemplo: sidecar de binário

```yaml
---
estado: rascunho
modelo: sidecar
data_captura: 2026-03-07
---
```

## Regras de uso

- Em arquivos Markdown, o conteúdo (transcrição, resumo, notas) fica abaixo do frontmatter em Markdown livre.
- Em sidecars `nome.extensao.md`, o conteúdo após o frontmatter segue o modelo `sidecar` (seções Descrição e Conteúdo).
- Campos opcionais desconhecidos são **omitidos** — nunca use `null`, `[]` ou string vazia.
- O caminho do arquivo é o identificador — não há campo `id`.
- O vínculo entre um sidecar e seu binário é derivado exclusivamente do nome do arquivo. Exemplo: `conceito.svg` ↔ `conceito.svg.md`.
