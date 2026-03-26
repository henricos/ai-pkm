# Convenção: Taxonomia de Tópicos

A taxonomia define os tópicos que organizam o conhecimento no repositório. A fonte da verdade é `index/topicos.json`.

## Propósito

Tópicos agrupam conhecimento por área temática, servindo como eixo organizacional central. Toda classificação — na triagem ou em grupos — deve usar exclusivamente tópicos presentes no JSON.

## Estrutura do JSON

Cada tópico é um objeto com:

- **`id`** (obrigatório) — identificador em kebab-case, usado como nome de pasta (sem prefixo) e valor no frontmatter.
- **`descricao`** (obrigatório) — texto descritivo do escopo do tópico, otimizado para orientar a classificação.
- **`subtopicos`** (opcional) — array de objetos com `id` e `descricao`, representando subdivisões do tópico raiz.

## Mapeamento para pastas

- Tópico raiz → `pkm/[topico]/`
- Subtópico → `pkm/[topico]/[subtopico]/` (sem prefixo `_`)
- Grupo dentro de tópico → `pkm/[topico]/_[grupo]/` (com prefixo `_`)

## Hierarquia: máximo 2 níveis

A taxonomia suporta no máximo 2 níveis hierárquicos:

1. **Tópico raiz** — entrada de nível zero no JSON. Pasta `pkm/[topico]/`.
2. **Subtópico** — entrada dentro do array `subtopicos` de um tópico raiz. Pasta `pkm/[topico]/[subtopico]/` (sem prefixo `_`).

Não há terceiro nível. Se um subtópico crescer a ponto de precisar de subdivisões, a resposta padrão é quebrá-lo em subtópicos irmãos dentro do tópico pai. Só avalie promovê-lo a tópico raiz durante uma revisão explícita da taxonomia de nível 1.

Na prática operacional do sistema, a primeira resposta para um subtópico que cresceu demais é quebrá-lo em subtópicos irmãos dentro do tópico pai. A promoção para tópico raiz só deve ser considerada na revisão da taxonomia de nível 1, quando houver evidência suficiente de autonomia conceitual e recorrência real.

## Arquivos soltos

Arquivos podem existir diretamente na pasta do tópico raiz, sem necessidade de subtópico. Subtópicos só são criados quando o volume ou a autonomia conceitual justificar.

## Referência cruzada no frontmatter

O campo `topico` no frontmatter usa:
- Valor simples para tópico raiz: `topico: saude`
- Valor com barra para subtópico: `topico: saude/corrida`

## Critérios para criar subtópico

- O volume de arquivos no tópico raiz dificulta a navegação.
- O subtema tem autonomia conceitual suficiente para justificar separação.

A criação de subtópicos é feita via `/reorganizar-topicos`.

## Critérios para quebrar um subtópico existente

- O subtópico concentrou volume ou variedade suficiente para perder nitidez.
- A quebra pode ser resolvida dentro do tópico pai, sem criar terceiro nível.
- Os novos ramos propostos devem nascer como subtópicos irmãos.

## Critérios para criar tópico raiz

- A triagem recorrentemente sinaliza itens sem casa adequada nos tópicos existentes.
- O tema é suficientemente amplo e distinto dos tópicos atuais.
- A recorrência observada no conteúdo existente sustenta a mudança.

A criação de tópicos raiz é feita via `/reorganizar-topicos`.

## Exemplo de JSON com subtópicos (referência futura)

```json
{
  "id": "saude",
  "descricao": "Nutrição, alimentação, condições médicas, exames, saúde mental, sono, bem-estar, esportes, corrida, neurodivergência e autismo.",
  "subtopicos": [
    { "id": "corrida", "descricao": "Treinos, provas, equipamentos, métricas de performance e nutrição esportiva." }
  ]
}
```
