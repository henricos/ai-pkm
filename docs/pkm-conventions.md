# Convenções do PKM

Este documento descreve os contratos estruturais do repositório `pkm` — o acervo de conteúdo privado que o sistema ai-pkm opera. Qualquer agente que interaja com o conteúdo deve ler este arquivo antes de tomar decisões sobre classificação, nomenclatura ou estrutura.

## Estrutura de pastas

O repositório `pkm` usa prefixos com significado arquitetural:

- `__inbox/` — ponto único de entrada; aceita Markdown provisório e binários; nenhuma decisão estrutural definitiva acontece aqui
- `[topico]/` — nós da taxonomia (ex: `tecnologia/`, `saude/`); sem prefixo
- `_[grupo]/` dentro de tópicos — grupos, identificados pela presença de `_grupo.md`; prefixo `_`

A taxonomia admite no máximo dois níveis: tópico raiz e subtópico. Não existe terceiro nível. Se um subtópico crescer demais, a resposta é quebrá-lo em subtópicos irmãos dentro do tópico pai.

## Tipos de item

O sistema distingue dois tipos de arquivo de conhecimento:

**Nota** — qualquer material com elaboração mínima além de um rótulo. Identificada pela ausência do prefixo `url_`. O campo `modelo` é obrigatório.

**URL** — URL isolada com no máximo um rótulo curto. Identificada pelo prefixo `url_` no nome do arquivo. O tipo não é decidido pelo assunto, mas pela estrutura do material: se há elaboração, é nota.

## Convenções de nomenclatura

Todo o repositório usa kebab-case. O caractere `_` aparece apenas como prefixo estrutural (`__inbox/`, `_[grupo]/`, `url_`).

- Arquivos de URL usam prefixo `url_` e seguem o padrão `url_autor-titulo.md`
- Notas não usam prefixo e são nomeadas em português do Brasil
- Sidecars preservam o nome completo do binário principal (ex: `fluxo.excalidraw.md`)

## Binários e sidecars

Arquivos não-Markdown com valor de conhecimento precisam de um sidecar adjacente no formato `nome.extensao.md`. O sidecar não é apenas metadado técnico — é a representação textual do conhecimento contido no artefato visual ou binário. Um binário não sai da inbox sem sidecar.

## Frontmatter

Todo arquivo Markdown de conhecimento usa YAML frontmatter. Campos obrigatórios:

- `estado` — `rascunho` ou `finalizado`
- `modelo` — modelo de estrutura aplicado; valores válidos em `index/models.json`
- `data_captura` — data em que o item foi registrado; formato `YYYY-MM-DD`

Campo condicional:

- `url` — obrigatório em arquivos de URL (prefixo `url_`), proibido em notas e sidecars

Campos opcionais (incluir somente quando aplicável, nunca `null`):

- `autores` — quando identificável
- `data_publicacao` — data de publicação da fonte original

Campos derivados **não entram no frontmatter**: `topico` (derivado da pasta), `tipo` (deduzível pelo padrão do arquivo), `ambito`, `descricao`. Campos vazios e valores `null` são proibidos.

## Grupos

Grupos são agrupadores persistentes de conhecimento — não representam tarefas, projetos com prazo ou ciclo de vida temporal. Cada grupo tem um `_grupo.md` com frontmatter próprio (`descricao`) que funciona como manifest do grupo. O tópico é derivado do caminho da pasta.

## Modelos

O sistema possui modelos de estrutura para notas (conceito, empresa, ferramenta, procedimento, livre), URLs (extrato, resumo) e sidecars. Os arquivos de modelo são artefatos operacionais lidos e aplicados diretamente pelo agente — sua localização no repositório é definida nas instruções operacionais (`AGENTS.md`). O catálogo completo está em `index/models.json`.

---

## Índices JSON

Os índices são arquivos JSON centralizados em `index/`. Permitem que skills e agentes façam consultas rápidas sem varrer pastas.

### Índice derivado: `grupos.json`

Gerado a partir do frontmatter dos arquivos `_grupo.md`. Array JSON de objetos:

| Campo | Tipo | Origem |
|---|---|---|
| `caminho` | string | Caminho relativo da pasta do grupo |
| `descricao` | string | `_grupo.md` frontmatter |
| `topico` | string | Derivado do `caminho` |

**Regra fundamental:** o frontmatter é a fonte da verdade. Em caso de divergência, o frontmatter prevalece. A skill `/recriar-indices` regenera o índice do zero a partir do frontmatter.

### Índice curado: `topicos.json`

Mantido exclusivamente via `/reorganizar-topicos`. Não é derivado de frontmatter — é a própria fonte da verdade para tópicos válidos. Estrutura descrita em `docs/pkm-structure.md` (seção Taxonomia).

### URLs com processamento pendente

Não há índice dedicado para URLs. A localização de URLs não processadas é feita via grep:

```bash
grep -rl "estado: rascunho" pkm/*/ --include="url_*.md"
```

### Quando atualizar

Cada skill que cria, modifica ou remove entradas deve atualizar o índice correspondente na mesma operação:

- `/triar` → `grupos.json` (se criar grupo novo durante triagem)
- `/criar-grupo` → `grupos.json` (ao criar grupo)
- `/reorganizar-topicos` → `topicos.json` e `grupos.json`
- `/recriar-indices` → `grupos.json` (regeneração completa)

Para checagem não mutante de coerência entre `_grupo.md` e `index/grupos.json`, use a skill `/validar-estrutura`.
