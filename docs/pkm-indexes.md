# Convenção: Índices JSON

Os índices são arquivos JSON centralizados em `sistema/indices/`. Eles permitem que skills e agentes façam consultas rápidas sem varrer pastas ou arquivos.

## Localização

Todos os índices vivem em `sistema/indices/`.

## Índice derivado: `grupos.json`

Gerado a partir do frontmatter dos arquivos `_grupo.md`. Array JSON de objetos:

| Campo | Tipo | Origem |
|---|---|---|
| `caminho` | string | Caminho relativo da pasta do grupo |
| `descricao` | string | `_grupo.md` frontmatter |
| `topico` | string | `_grupo.md` frontmatter |
| `ambito` | string | `_grupo.md` frontmatter (opcional) |

**Regra fundamental:** o frontmatter é a fonte da verdade. Em caso de divergência, o frontmatter prevalece. A skill `/recriar-indices` regenera o índice do zero a partir do frontmatter.

## Índice curado: `topicos.json`

Mantido exclusivamente via `/reorganizar-topicos`. Não é derivado de frontmatter — é a própria fonte da verdade para tópicos válidos. Array JSON de objetos:

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador em kebab-case; usado como nome de pasta (com prefixo `_`) e valor no frontmatter |
| `descricao` | string | Escopo do tópico, otimizado para orientar a classificação |
| `subtopicos` | array | Objetos com `id` e `descricao` (opcional) |

## URLs com ação pendente

Não há índice dedicado para URLs. A localização de URLs com ação pendente é feita via grep programático:

```bash
grep -rl "acao_pendente:" _*/ --include="*.md" | xargs grep -L "acao_pendente: nenhuma"
```

## Quando atualizar

Cada skill que cria, modifica ou remove entradas deve atualizar o índice correspondente na mesma operação:

- `/triar` → `grupos.json` (se criar grupo novo durante triagem)
- `/criar-grupo` → `grupos.json` (ao criar grupo)
- `/reorganizar-topicos` → `topicos.json` e `grupos.json` (quando a reorganização mover, renomear ou reclassificar tópicos/grupos)
- `/recriar-indices` → `grupos.json` (regeneração completa)

Para checagem não mutante de coerência entre `_grupo.md` e `grupos.json`, use a skill `/validar-estrutura`.
