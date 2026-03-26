# Metadados (Frontmatter) — Itens do PKM

Este schema vale para todos os itens de conhecimento no repositório `pkm`:

- arquivos Markdown de notas em `pkm/[topico]/`
- arquivos Markdown de URLs em `pkm/[topico]/` (prefixo `url_` no nome)
- sidecars de binários em `pkm/[topico]/`, no formato `nome.extensao.md`

O frontmatter contém apenas campos intrínsecos e estáveis — o que não pode ser inferido da estrutura de pastas ou do nome do arquivo. Campos derivados (tópico, tipo) foram removidos.

```yaml
---
estado: rascunho              # rascunho | finalizado (obrigatório)
url: "https://..."            # obrigatório em arquivos url_; ausente em notas e sidecars
modelo: url-extrato           # opcional; para urls: url-extrato | url-resumo; para notas: nome do modelo
autores: ["Nome"]             # opcional
data_captura: 2026-03-07      # opcional
data_publicacao: 2025-12      # opcional
---
```

## Campo obrigatório

- `estado`: Estágio atual do item. Obrigatório em todos os itens.
  - `rascunho` — item recém-triado ou em construção; URLs aguardam processamento; notas aguardam elaboração
  - `finalizado` — trabalho concluído; URLs processadas com conteúdo elaborado; notas revisadas e maduras

## Campo condicional

- `url`: URL canônica externa. **Obrigatório em arquivos com prefixo `url_`; ausente em todos os outros.** Nunca use este campo para links que aparecem no corpo de texto de uma nota — apenas para a URL que é o sujeito principal do arquivo.

## Campo opcional: `modelo`

Unifica os antigos `formato` (URLs) e `template` (notas) num único campo:

- Para arquivos `url_`:
  - `url-extrato` — conteúdo original transcrito integralmente. **Restrito a `web` e `pdf`.** Nunca usar para vídeos.
  - `url-resumo` — resumo elaborado pela IA (permitido para qualquer tipo de URL)
- Para notas: nome do arquivo de modelo sem extensão (ex: `nota-empresa`, `nota-conceito`). Catálogo em `index/models.json`. **Omitir** quando nenhum modelo for aplicável.
- Para sidecars: campo ausente.

## Campos opcionais

- `autores`: Lista de autores ou criadores da fonte original. **Sempre lista YAML** — mesmo para autor único: `["Nome"]`. Nunca usar string simples. **Omitir** quando desconhecido — não usar `null` nem lista vazia.
- `data_captura`: Data em que o item foi triado ou adicionado ao repositório. Formato `YYYY-MM-DD`.
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

## Exemplo: URL aguardando processamento

```yaml
---
estado: rascunho
url: "https://exemplo.com/produtividade-devs"
modelo: url-extrato
autores: ["Jane Doe"]
data_captura: 2026-03-07
data_publicacao: 2025-11
---
```

## Exemplo: URL processada

```yaml
---
estado: finalizado
url: "https://exemplo.com/produtividade-devs"
modelo: url-extrato
autores: ["Jane Doe"]
data_captura: 2026-03-07
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
data_captura: 2026-03-07
---
```

## Regras de uso

- Em arquivos Markdown, o conteúdo (transcrição, resumo, notas) fica abaixo do frontmatter em Markdown livre.
- Em sidecars `nome.extensao.md`, o arquivo pode terminar logo após o frontmatter.
- Campos opcionais desconhecidos são **omitidos** — nunca use `null`, `[]` ou string vazia.
- O caminho do arquivo é o identificador — não há campo `id`.
- O vínculo entre um sidecar e seu binário é derivado exclusivamente do nome do arquivo. Exemplo: `conceito.svg` ↔ `conceito.svg.md`.
