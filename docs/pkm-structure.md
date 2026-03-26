# Estrutura de Pastas

Mapa arquitetônico do repositório. Agentes de IA e humanos devem seguir esta convenção sem exceção.

## Convenção de prefixos

- **`__`** (duplo sublinhado) — bandeja de entrada. Apenas `__inbox/`.
- **`_`** (sublinhado simples) — nó da taxonomia. Tópicos e subtópicos são pastas com prefixo `_` na raiz do repositório.
- **Sem prefixo** — infraestrutura (`sistema/`) e grupos (pastas sem `_` dentro de tópicos).

```
ai-pkm/
├── __inbox/                          # bandeja de entrada dos fluxos de entrada
├── _carreira/                        # tópico raiz
├── _cultura/                         # tópico raiz
├── _desenvolvimento-pessoal/         # tópico raiz
│   ├── nate-jones-second-brain.md    # item baseado em URL (tem campo url)
│   └── tiago-forte-metodo-para.md    # item baseado em URL (tem campo url)
├── _saude/                           # tópico raiz
├── _tecnologia/                      # tópico raiz
│   ├── _llms/                        # subtópico (nó da taxonomia, tem _)
│   ├── meu-framework/                # grupo (sem _, tem _grupo.md)
│   │   ├── _grupo.md
│   │   └── ...
│   ├── artigo-solto.md               # arquivo solto
│   ├── arquitetura-agentes.svg       # binário de conhecimento
│   └── arquitetura-agentes.svg.md    # sidecar com frontmatter
├── sistema/                          # infraestrutura (sem prefixo)
│   ├── convencoes/
│   ├── esquemas/
│   ├── indices/
│   └── logs/
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

### `_[topico]/`

Cada tópico da taxonomia é uma pasta `_[topico]/` na raiz do repositório. Dentro de um tópico, o conteúdo pode ser:

- **Arquivos soltos** — conhecimento (próprio ou baseado em URL) diretamente na pasta do tópico.
- **Subtópicos** — pastas `_[subtopico]/` (com prefixo `_`) para subdivisões do tópico.
- **Grupos** — pastas sem prefixo `_` que agrupam conteúdo por objetivo. Cada grupo contém um `_grupo.md` com frontmatter descritivo.

A distinção entre conteúdo próprio e itens baseados em URL é feita pelo campo `url` no frontmatter e pelo prefixo `url_` no nome do arquivo: se presente, o arquivo representa uma URL externa; se ausente, é conteúdo próprio. O campo `url` nunca aponta para binários locais pareados com sidecar. As regras completas de nomenclatura estão em [`nomenclatura-de-arquivos.md`](nomenclatura-de-arquivos.md).

Grupos não são tarefas nem projetos com prazo — são agrupadores persistentes de conhecimento. Não carregam status, vencimento ou noção de "ativo/inativo"; permanecem enquanto fizer sentido como unidade de organização.

### `sistema/`

Infraestrutura do repositório: manuais, esquemas e dados derivados.

- **`convencoes/`** — regras de comportamento e processos (ex: estrutura de pastas, taxonomia, logs).
- **`esquemas/`** — contratos técnicos (ex: YAML Frontmatter de [frontmatter-conhecimento.md](../esquemas/frontmatter-conhecimento.md) e [frontmatter-grupo.md](../esquemas/frontmatter-grupo.md)).
- **`indices/`** — índices JSON do sistema (`grupos.json` derivado do frontmatter; `topicos.json` curado via `/reorganizar-topicos`). Consulte a convenção [Índices](../convencoes/indices.md) para detalhes.
- **`logs/`** — logs de auditoria para ações automatizadas (Fase 2). Consulte a [Política de Logs](../convencoes/politica-de-logs.md) para o status atual.

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
- Tópicos na raiz (`_carreira/`, `_cultura/`, etc.) quando vazios
- `__inbox/`
