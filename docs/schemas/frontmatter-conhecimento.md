# Metadados (Frontmatter) — Arquivos de Conhecimento

Este schema vale para dois casos:

- arquivos Markdown de conhecimento em pastas `_[topico]/`
- sidecars de binários de conhecimento em `_[topico]/`, no formato `nome.extensao.md`

Cada arquivo de conhecimento ou sidecar deve conter o seguinte cabeçalho formatado em *YAML Frontmatter*:

```yaml
---
# === OBRIGATÓRIOS ===
descricao: "texto otimizado para busca"
topico: tecnologia                    # deve existir em topicos.json
tipo: url                             # url | nota

# === SOMENTE QUANDO tipo: url ===
url: "https://..."
formato: extrato                      # extrato | resumo
processado: false                     # false | true

# === SOMENTE QUANDO tipo: nota ===
maturidade: rascunho                  # rascunho | maduro
template: nota-empresa                # nome do template sem extensão; omitir se não aplicável

# === OPCIONAIS ===
ambito: pessoal                       # pessoal | trabalho | ambos
autores: ["Nome"]
data_captura: 2026-03-07
data_publicacao: 2025-12
---
```

## Campos obrigatórios

- `descricao`: Descrição curta do conteúdo, otimizada para busca. Deve ser informativa o suficiente para que a triagem consiga inferir correspondência. Em sidecars de binários, é o campo fundamental para explicar resumidamente o conteúdo do arquivo principal.
- `topico`: Tópico da taxonomia ao qual o conteúdo pertence. Obrigatório. Deve coincidir com um `id` em `sistema/indices/topicos.json`. Valor simples para tópico raiz (`tecnologia`), com barra para subtópico (`saude/corrida`).
- `tipo`: Natureza do arquivo. Campo universal e obrigatório.
  - `url` — arquivo representa uma fonte externa a ser ou já processada
  - `nota` — arquivo é conteúdo próprio, elaborado ou em rascunho

## Campos de URL

Os campos abaixo **só existem** quando `tipo: url`. Quando `tipo: nota`, nenhum deles deve constar no frontmatter.

- `url`: URL canônica externa. Obrigatório para itens com `tipo: url`. Nunca use este campo para apontar para binários locais pareados com sidecar. Nunca use este campo para links que aparecem no corpo de texto de uma nota — apenas para a URL que é o sujeito principal do arquivo.
- `formato`: Forma de armazenamento desejada e, após processamento, realizada. Obrigatório para itens com `tipo: url`. Deve ser escolhido na triagem e permanece estável ao longo do ciclo de vida.
  - `extrato` — conteúdo original integralmente transcrito. **Restrito a `web` e `pdf`.** Nunca usar para vídeos (YouTube, Instagram, TikTok) — vídeos exigem `resumo`.
  - `resumo` — resumo elaborado pela IA (permitido para qualquer tipo de URL)
- `processado`: Indica se o processamento já foi executado.
  - `false` — estado inicial após triagem; o arquivo contém apenas a URL com contexto mínimo
  - `true` — processamento concluído; o arquivo contém conteúdo conforme o `formato` definido

## Campos de nota

Os campos abaixo **só existem** quando `tipo: nota`. Quando `tipo: url`, nenhum deles deve constar no frontmatter.

- `maturidade`: Estágio de desenvolvimento da nota. Obrigatório para `tipo: nota`. Deve ser definido pela triagem e atualizado ao longo do refinamento.
  - `rascunho` — nota recém-triada ou em construção; ainda não passou por sessões completas de refinamento
  - `maduro` — nota finalizada; conteúdo elaborado e revisado em sessão(ões) de refinamento
- `template`: Nome do arquivo de template usado para estruturar a nota (sem extensão). Definido por `/criar-nota` ao selecionar o template adequado. **Omitir** quando nenhum template for aplicável. Exemplo: `nota-empresa`. O catálogo de templates disponíveis está em `sistema/indices/templates.json`.

## Campos opcionais

- `ambito`: Domínio de vida ao qual o conteúdo pertence. `pessoal`, `trabalho` ou `ambos`. **Omitir** quando não relevante.
- `autores`: Lista de autores ou criadores da fonte original. **Sempre lista YAML** — mesmo para autor único: `["Nome"]`. Nunca usar string simples. **Omitir** quando desconhecido — não usar `null` nem lista vazia.
- `data_captura`: Data em que o item foi triado ou adicionado ao repositório. Formato `YYYY-MM-DD`.
- `data_publicacao`: Data de publicação original da fonte. String ISO parcial — use o máximo de precisão disponível: `"YYYY-MM-DD"` (completo), `"YYYY-MM"` (mês), `"YYYY"` (ano). **Omitir** quando desconhecido.

## Convenção de datas

Todos os campos temporais usam o prefixo `data_` (ex: `data_captura`, `data_publicacao`).

## Exemplo: item baseado em URL

```yaml
---
descricao: "Guia prático de produtividade para desenvolvedores de software"
topico: tecnologia
tipo: url
url: "https://exemplo.com/produtividade-devs"
formato: extrato
processado: false
autores: ["Jane Doe"]
data_captura: 2026-03-07
data_publicacao: 2025-11
---
```

## Exemplo: conteúdo próprio

```yaml
---
descricao: "Reflexões sobre jejum intermitente e metabolismo baseado em evidências"
topico: saude
tipo: nota
maturidade: rascunho
data_captura: 2026-03-07
---
```

## Regras de uso

- Em arquivos Markdown, o conteúdo (transcrição, resumo, notas) fica abaixo do frontmatter em Markdown livre.
- Em sidecars `nome.extensao.md`, o arquivo pode terminar logo após o frontmatter.
- Campos opcionais desconhecidos são **omitidos** — nunca use `null`, `[]` ou string vazia.
- O caminho do arquivo é o identificador — não há campo `id`.
- O vínculo entre um sidecar e seu binário correspondente é derivado exclusivamente do nome do arquivo. Exemplo: `conceito.svg` ↔ `conceito.svg.md`.
- `processado` inicial na triagem é sempre `false`. Após `/processar-url` concluir, passa para `true`. O `formato` não muda ao longo do ciclo de vida.
- `formato` e `processado` só existem quando `tipo: url`. Para `tipo: nota`, nenhum deles deve constar no frontmatter.
- `maturidade` só existe quando `tipo: nota`. Para `tipo: url`, não deve constar no frontmatter. Ausência do campo em `tipo: nota` é violação de schema — o validador reporta como erro.
