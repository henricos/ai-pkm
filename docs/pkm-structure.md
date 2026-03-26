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
- **`models.json`** — catálogo de modelos de nota disponíveis em `docs/schemas/`.

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

### Limite da taxonomia

A taxonomia admite no máximo 2 níveis. Quando um tópico raiz fica amplo demais, cria-se um subtópico. Quando um subtópico fica amplo demais, ele deve ser quebrado em subtópicos irmãos dentro do tópico pai — nunca em um terceiro nível.

### `.gitkeep`

Pastas que podem ficar vazias devem conter `.gitkeep` para preservar a estrutura no Git. Pastas que exigem `.gitkeep`:
- Tópicos em `pkm/` (`pkm/carreira/`, `pkm/cultura/`, etc.) quando vazios
- `pkm/__inbox/`
