# Estrutura de Pastas

Mapa arquitetônico do repositório. Agentes de IA e humanos devem seguir esta convenção sem exceção.

## Convenção de prefixos

- **`__`** (duplo sublinhado) — bandeja de entrada. Apenas `pkm/__inbox/`.
- **Sem prefixo** — tópicos da taxonomia (ex: `pkm/tecnologia/`, `pkm/saude/`).
- **`_`** (sublinhado simples) — grupos (ex: `pkm/tecnologia/_meu-framework/`) e subtópicos (ex: `pkm/tecnologia/_llms/`).

```
ai-pkm/
├── index/                            # índices JSON (fonte de verdade derivada)
│   ├── grupos.json
│   ├── models.json
│   └── topicos.json
├── pkm/                              # repositório de conteúdo (montado separadamente)
│   ├── __inbox/                      # bandeja de entrada dos fluxos de entrada
│   ├── carreira/                     # tópico raiz (sem prefixo)
│   ├── cultura/                      # tópico raiz (sem prefixo)
│   ├── desenvolvimento-pessoal/      # tópico raiz (sem prefixo)
│   │   ├── nate-jones-second-brain.md
│   │   └── tiago-forte-metodo-para.md
│   ├── saude/                        # tópico raiz (sem prefixo)
│   └── tecnologia/                   # tópico raiz (sem prefixo)
│       ├── _llms/                    # subtópico (nó da taxonomia, tem _)
│       ├── _meu-framework/           # grupo (tem _, tem _grupo.md)
│       │   ├── _grupo.md
│       │   └── ...
│       ├── artigo-solto.md           # arquivo solto
│       ├── arquitetura-agentes.svg   # binário de conhecimento
│       └── arquitetura-agentes.svg.md # sidecar com frontmatter
├── .agents/
│   └── skills/
├── .claude/
│   └── skills -> ../.agents/skills
├── .cursor/
│   └── skills -> ../.agents/skills
├── AGENTS.md
├── CLAUDE.md                        ← aponta para AGENTS.md
└── README.md
```

---

### `__inbox/`

Ponto único de entrada. Arquivos podem chegar aqui por conversa com a IA (`/anotar`) ou por cópia direta para a pasta. Tudo é temporário até a triagem.

- Zero subpastas — nenhuma decisão de organização na hora de registrar ou copiar algo.
- Aceita Markdown e binários puros sem sidecar. Frontmatter e sidecars são criados apenas na triagem.

### `pkm/[topico]/`

Cada tópico da taxonomia é uma pasta `[topico]/` dentro de `pkm/` (sem prefixo). Dentro de um tópico, o conteúdo pode ser:

- **Arquivos soltos** — conhecimento (próprio ou baseado em URL) diretamente na pasta do tópico.
- **Subtópicos** — pastas `_[subtopico]/` (com prefixo `_`) para subdivisões taxonômicas do tópico.
- **Grupos** — pastas `_[grupo]/` (com prefixo `_`) que agrupam conteúdo por objetivo. Cada grupo contém um `_grupo.md` com frontmatter descritivo. Distinção de subtópicos: grupos têm `_grupo.md`, subtópicos não.

A distinção entre conteúdo próprio e itens baseados em URL é feita pelo campo `url` no frontmatter e pelo prefixo `url_` no nome do arquivo: se presente, o arquivo representa uma URL externa; se ausente, é conteúdo próprio. O campo `url` nunca aponta para binários locais pareados com sidecar. As regras completas de nomenclatura estão em [`nomenclatura-de-arquivos.md`](nomenclatura-de-arquivos.md).

Grupos não são tarefas nem projetos com prazo — são agrupadores persistentes de conhecimento. Não carregam status, vencimento ou noção de "ativo/inativo"; permanecem enquanto fizer sentido como unidade de organização.

### `index/`

Índices JSON derivados do conteúdo do `pkm/`, armazenados na raiz do `ai-pkm`:

- **`grupos.json`** — catálogo de grupos derivado do frontmatter dos arquivos `_grupo.md`.
- **`topicos.json`** — taxonomia de tópicos válidos, curada via `/reorganizar-topicos`.
- **`models.json`** — catálogo de modelos de nota disponíveis em `models/`.

> [!NOTE]
> **Backup:** o repositório Git é o único meio homologado de persistência e backup. Arquivos de mídia pesados não fazem parte do escopo duradouro, prevenindo o inchaço da pasta `.git`.

### `.agents/`

Raiz de agenciamento de inteligência. Contém as `skills/` (automações padronizadas). O padrão segue o [Agent Skills](https://agentskills.io). Ferramentas que não leem `.agents/` diretamente criam links simbólicos apontando para cá, garantindo compatibilidade cruzada.

Skills que possuam automação própria podem conter uma pasta `scripts/` com ambiente Python local (`pyproject.toml`, `uv.lock`, `.venv/`) e temporários internos (`temp/`). Esses artefatos pertencem à skill e não devem ser espalhados pela raiz do repositório.

---

## Regras gerais

### Binários e sidecars

Arquivos não-Markdown com valor de conhecimento (`.svg`, `.png`, `.pdf`, `.excalidraw`, etc.) vivem ao lado dos demais conteúdos do tópico, subtópico ou grupo ao qual pertencem. Fora da `__inbox/`, todo binário de conhecimento exige um sidecar adjacente no formato `nome.extensao.md`, contendo o frontmatter padrão.

### Sem embeddings em Markdown

Arquivos Markdown do sistema podem conter links internos e externos, mas não embutem imagens, diagramas ou outros binários.

### `.gitkeep`

Pastas que podem ficar vazias devem conter `.gitkeep` para preservar a estrutura no Git. Pastas que exigem `.gitkeep`:
- Tópicos em `pkm/` (`pkm/carreira/`, `pkm/cultura/`, etc.) quando vazios
- `pkm/__inbox/`

---

## Taxonomia

A fonte da verdade é `index/topicos.json`. Toda classificação — na triagem ou em grupos — deve usar exclusivamente tópicos presentes no JSON.

### Estrutura do JSON

Cada tópico é um objeto com:

- **`id`** (obrigatório) — identificador em kebab-case, usado como nome de pasta (sem prefixo) e valor no frontmatter.
- **`descricao`** (obrigatório) — texto descritivo do escopo do tópico, otimizado para orientar a classificação.
- **`subtopicos`** (opcional) — array de objetos com `id` e `descricao`, representando subdivisões do tópico raiz.

Exemplo:

```json
{
  "id": "saude",
  "descricao": "Nutrição, alimentação, condições médicas, exames, saúde mental, sono, bem-estar, esportes, corrida, neurodivergência e autismo.",
  "subtopicos": [
    { "id": "corrida", "descricao": "Treinos, provas, equipamentos, métricas de performance e nutrição esportiva." }
  ]
}
```

### Mapeamento para pastas

- Tópico raiz → `pkm/[topico]/`
- Subtópico → `pkm/[topico]/[subtopico]/` (sem prefixo `_`)
- Grupo dentro de tópico → `pkm/[topico]/_[grupo]/` (com prefixo `_`)

### Hierarquia: máximo 2 níveis

A taxonomia suporta no máximo 2 níveis hierárquicos:

1. **Tópico raiz** — entrada de nível zero no JSON. Pasta `pkm/[topico]/`.
2. **Subtópico** — entrada dentro do array `subtopicos` de um tópico raiz. Pasta `pkm/[topico]/[subtopico]/` (sem prefixo `_`).

Não há terceiro nível. Se um subtópico crescer a ponto de precisar de subdivisões, a resposta padrão é quebrá-lo em subtópicos irmãos dentro do tópico pai. A promoção para tópico raiz só deve ser considerada em revisão explícita da taxonomia de nível 1, quando houver evidência suficiente de autonomia conceitual e recorrência real.

Arquivos podem existir diretamente na pasta do tópico raiz sem necessidade de subtópico. Subtópicos só são criados quando o volume ou a autonomia conceitual justificar.

### Critérios para criar subtópico

- O volume de arquivos no tópico raiz dificulta a navegação.
- O subtema tem autonomia conceitual suficiente para justificar separação.

A criação de subtópicos é feita via `/reorganizar-topicos`.

### Critérios para quebrar um subtópico existente

- O subtópico concentrou volume ou variedade suficiente para perder nitidez.
- A quebra pode ser resolvida dentro do tópico pai, sem criar terceiro nível.
- Os novos ramos propostos devem nascer como subtópicos irmãos.

### Critérios para criar tópico raiz

- A triagem recorrentemente sinaliza itens sem casa adequada nos tópicos existentes.
- O tema é suficientemente amplo e distinto dos tópicos atuais.
- A recorrência observada no conteúdo existente sustenta a mudança.

A criação de tópicos raiz é feita via `/reorganizar-topicos`.
