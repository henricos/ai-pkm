# Relatório de Consolidação Taxonômica — `pkm/tecnologia/`

**Data:** 2026-06-15
**Escopo:** Tópico raiz `tecnologia/` e seus derivados
**Objetivo:** Subsidiar decisões de reorganização dos 89 arquivos acumulados na raiz

---

## 1. Resumo Executivo

O tópico `tecnologia/` contém **156 arquivos** distribuídos em: 89 na raiz sem subtópico, 35 em `conceito/`, 14 em `empresas/`, 9 em `_lyceum-x/` (grupo) e 9 entre `_superapp/` (4 arquivos) e outros agrupamentos. A raiz está sobrecarregada: 66 desses 89 arquivos são `nota-ferramenta` e 16 são `url-resumo`, o que indica acúmulo de ferramentas sem categorização temática. A concentração de tags em três clusters dominantes — **coding-agent / ferramentas de IA**, **design/frontend** e **search/RAG** — aponta claramente para ao menos três subtópicos novos com alta homogeneidade interna. Três arquivos de personalidades e dois de devtools utilitários têm destino menos óbvio e recebem tratamento específico abaixo.

---

## 2. Grupos de Sinônimos Identificados

Antes de mapear subtópicos, estes clusters de tags representam o mesmo conceito e devem ser normalizados para uma tag canônica:

| Tag canônica proposta | Sinônimos encontrados | Total combinado |
|---|---|---|
| `coding-agent` | `agente-de-ia`, `agente-ia`, `agente-autonomo` (no contexto ferramentas de coding) | ~55 |
| `desenvolvimento-assistido-por-ia` | `desenvolvimento-com-ia`, `desenvolvimento-guiado-por-especificacao`, `automacao-desenvolvimento` | ~15 |
| `biblioteca-de-componentes` | `biblioteca-componentes`, `componentes-ui` | ~8 |
| `microservicos` | `micro-servicos`, `microsservicos`, `arquitetura-microsservicos` | ~6 |
| `agente-conversacional` | `chatbot`, `bot-telegram` (quando referência ao produto, não ao conceito) | ~4 |
| `busca-agêntica` | `busca-agentica` (grafia inconsistente com e sem acento) | ~4 |

> **Nota operacional:** A normalização das tags deve ser feita pela skill `/readequar-nota` individualmente em cada arquivo afetado — não é necessária para a reorganização de pastas, mas melhora a coerência futura das buscas.

---

## 3. Subtópicos Candidatos para `tecnologia/`

### Subtópicos já existentes (manter sem alteração)

| Subtópico | Arquivos atuais | Descrição |
|---|---|---|
| `conceito/` | 35 | Notas de conceito técnico (RAG, harness, SDD, design system, etc.) |
| `empresas/` | 14 | Perfis de empresas de tecnologia e laboratórios de IA |

### Novos subtópicos candidatos

| Slug proposto | Descrição | Arquivos estimados | Tags representativas |
|---|---|---|---|
| `coding-agent/` | Ferramentas de coding assistido por IA: editores, CLIs, extensões e orchestradores que aumentam o desenvolvedor | 29 | `coding-agent`, `claude-code`, `spec-driven-development`, `desenvolvimento-assistido-por-ia` |
| `agentes-ia/` | Frameworks, SDKs, plataformas e ferramentas de agentes de IA que vão além do coding (automação, workflows, bots, agentes pessoais) | 17 | `agente-ia`, `framework-agentes`, `llm`, `automacao-de-workflows`, `mcp` |
| `design-frontend/` | Bibliotecas de componentes, design systems, ferramentas de design-to-code, animação e apresentação visual | 22 | `design-system`, `frontend`, `biblioteca-de-componentes`, `apresentacao-markdown` |
| `search-rag/` | Ferramentas e APIs de busca semântica, web scraping e pipelines RAG | 6 | `rag`, `busca-semantica`, `busca-agêntica`, `web-scraping` |
| `personalidades/` | Notas de personalidade sobre figuras históricas ou influentes da tecnologia | 3 | `referencia-historica`, `cultura-de-engenharia`, `open-source` |

### Arquivos sem subtópico claro (candidatos a permanecer na raiz ou receber tratamento pontual)

| Arquivo | Modelo | Justificativa |
|---|---|---|
| `amazon-aws` | nota-ferramenta | Plataforma de cloud; único arquivo de infraestrutura cloud — não justifica subtópico sozinho |
| `cuda` | nota-ferramenta | GPU/computação paralela — nicho sem cluster |
| `connectbot` | nota-ferramenta | Cliente SSH para Android — utilitário isolado |
| `tmux` | nota-ferramenta | Multiplexador de terminal — utilitário isolado |
| `chezmoi` | nota-ferramenta | Gerenciamento de dotfiles — isolado |
| `playwright` | nota-ferramenta | Testes e2e — isolado |
| `zod` | nota-ferramenta | Validação de schema TypeScript — isolado |
| `benchmark-markdown` | nota-livre | Análise pontual de renderers Markdown |
| `steve-yegge` | nota-livre | Análise pessoal sobre cultura de engenharia — poderia ir para `personalidades/` |
| `tim-oreilly` | nota-livre | `nota-livre` sobre figura histórica — poderia ir para `personalidades/` ou permanecer na raiz |

> **Recomendação:** Os 7 arquivos de utilitários isolados (aws, cuda, connectbot, tmux, chezmoi, playwright, zod) podem permanecer na raiz por ora. Criam subtópicos com poucos arquivos. Se o volume crescer, `devtools/` seria um agrupador natural.

---

## 4. Candidatos a Grupos

Ferramentas e produtos com 2+ documentos relacionados que justificam um `_grupo.md`:

| Grupo candidato | Arquivos identificados | Justificativa |
|---|---|---|
| `_claude-code/` | `claude-code`, `claudebox`, `claude-code-channels`, `claude-code-remote-control`, `claude-code-telegram-bot`, `claude-code-web`, `claude-dispatch`, `gstack`, `huashu-design` + 9 urls sobre claude-code | Alta coesão — todos documentam o produto Claude Code ou extensões diretas; o grupo já está implícito nos dados |
| `_gsd/` | `gsd`, `github-spec-kit`, `openspec`, `skills-sh`, `officialskills-sh`, `vercel-labs-skills` | Ecossistema GSD e spec-driven-development com ferramentas de suporte |
| `_getdesign/` | `getdesign-app`, `getdesign-md` | Duas notas do mesmo produto GetDesign em variantes distintas |

> **Grupos já existentes:** `_lyceum-x/` (9 arquivos) e `_superapp/` (4 arquivos) — manter sem alteração.

> **Nota sobre `_claude-code/`:** Este seria o maior grupo do PKM. Considerar se todos os `url_*` com tag `claude-code` devem entrar no grupo ou apenas as notas de ferramenta. URLs editoriais (artigos de terceiros sobre Claude Code) podem ficar em `coding-agent/` ao invés de no grupo.

---

## 5. Mapeamento Arquivo → Subtópico

Tabela completa dos 89 arquivos da raiz de `tecnologia/`. Confiança: **A** = alta, **M** = média, **B** = baixa.

| Arquivo | Modelo | Subtópico proposto | Grupo? | Confiança |
|---|---|---|---|---|
| `claude-code` | nota-ferramenta | `coding-agent/` | `_claude-code/` | A |
| `claudebox` | nota-ferramenta | `coding-agent/` | `_claude-code/` | A |
| `claude-code-channels` | nota-ferramenta | `coding-agent/` | `_claude-code/` | A |
| `claude-code-remote-control` | nota-ferramenta | `coding-agent/` | `_claude-code/` | A |
| `claude-code-telegram-bot` | nota-ferramenta | `coding-agent/` | `_claude-code/` | A |
| `claude-code-web` | nota-ferramenta | `coding-agent/` | `_claude-code/` | A |
| `claude-dispatch` | nota-ferramenta | `coding-agent/` | `_claude-code/` | A |
| `cursor` | nota-ferramenta | `coding-agent/` | — | A |
| `antigravity` | nota-ferramenta | `coding-agent/` | — | A |
| `codex` | nota-ferramenta | `coding-agent/` | — | A |
| `gsd` | nota-ferramenta | `coding-agent/` | `_gsd/` | A |
| `github-spec-kit` | nota-ferramenta | `coding-agent/` | `_gsd/` | A |
| `openspec` | nota-ferramenta | `coding-agent/` | `_gsd/` | A |
| `skills-sh` | nota-ferramenta | `coding-agent/` | `_gsd/` | A |
| `officialskills-sh` | nota-ferramenta | `coding-agent/` | `_gsd/` | A |
| `vercel-labs-skills` | nota-ferramenta | `coding-agent/` | `_gsd/` | A |
| `gstack` | nota-ferramenta | `coding-agent/` | `_claude-code/` | A |
| `huashu-design` | nota-ferramenta | `coding-agent/` | `_claude-code/` | M |
| `impeccable` | nota-ferramenta | `coding-agent/` | — | M |
| `superpowers` | nota-ferramenta | `coding-agent/` | — | A |
| `vibe-kanban` | nota-ferramenta | `coding-agent/` | — | A |
| `auto-research` | nota-ferramenta | `coding-agent/` | — | M |
| `agente-browser-dev` | nota-ferramenta | `coding-agent/` | — | M |
| `getdesign-app` | nota-ferramenta | `coding-agent/` | `_getdesign/` | M |
| `getdesign-md` | nota-ferramenta | `coding-agent/` | `_getdesign/` | M |
| `url_ai-coding-daily-spec-driven-dev-agentes-ia` | url-resumo | `coding-agent/` | — | A |
| `url_ai-labs-anthropic-killed-agent-harnesses` | url-resumo | `coding-agent/` | — | A |
| `url_better-stack-claude-code-mcp-context-mode` | url-resumo | `coding-agent/` | `_claude-code/` | A |
| `url_better-stack-claude-code-superpowers` | url-resumo | `coding-agent/` | `_claude-code/` | A |
| `url_better-stack-toolkit-yc-ceo-claude-code` | url-resumo | `coding-agent/` | `_claude-code/` | A |
| `url_ibm-technology-spec-driven-development` | url-resumo | `coding-agent/` | — | A |
| `url_jens-heitmann-tres-sistemas-design-claude-code` | url-resumo | `coding-agent/` | `_claude-code/` | A |
| `url_mike-means-business-repos-claude-code` | url-resumo | `coding-agent/` | `_claude-code/` | A |
| `url_quantum-jump-club-yc-ceo-claude-code-gstack` | url-resumo | `coding-agent/` | `_claude-code/` | A |
| `url_tina-huang-favorite-ai-workflow` | url-resumo | `coding-agent/` | — | M |
| `adk` | nota-ferramenta | `agentes-ia/` | — | A |
| `agent-sdk-anthropic` | nota-ferramenta | `agentes-ia/` | — | A |
| `anthropic-agent-sdk` | nota-ferramenta | `agentes-ia/` | — | A |
| `botpress` | nota-ferramenta | `agentes-ia/` | — | A |
| `nanoclaw-agente-ia-pessoal` | nota-ferramenta | `agentes-ia/` | — | A |
| `openclaw` | nota-ferramenta | `agentes-ia/` | — | A |
| `chatgpt-telegram-bot` | nota-ferramenta | `agentes-ia/` | — | A |
| `n8n` | nota-ferramenta | `agentes-ia/` | — | A |
| `handy` | nota-ferramenta | `agentes-ia/` | — | M |
| `comfy-ui` | nota-ferramenta | `agentes-ia/` | — | M |
| `liteparse` | nota-ferramenta | `agentes-ia/` | — | M |
| `agentic-search-benchmark` | nota-ferramenta | `agentes-ia/` | — | M |
| `url_addy-osmani-patterns-coordinating-agents` | url-resumo | `agentes-ia/` | — | A |
| `url_ian-beacraft-design-company-ai-cant-outpace` | url-resumo | `agentes-ia/` | — | M |
| `url_ian-beacraft-redesigning-work-ai-era` | url-resumo | `agentes-ia/` | — | M |
| `url_ibm-technology-o-que-sao-agentes-de-ia` | url-resumo | `agentes-ia/` | — | A |
| `url_rajasekaran-harness-design-long-running-apps` | url-extrato | `agentes-ia/` | — | A |
| `url_vivek-trivedy-agente-harness` | url-resumo | `agentes-ia/` | — | A |
| `shadcn-ui` | nota-ferramenta | `design-frontend/` | — | A |
| `chakra-ui` | nota-ferramenta | `design-frontend/` | — | A |
| `ant-design` | nota-ferramenta | `design-frontend/` | — | A |
| `mui-material-ui` | nota-ferramenta | `design-frontend/` | — | A |
| `gsap` | nota-ferramenta | `design-frontend/` | — | A |
| `threejs` | nota-ferramenta | `design-frontend/` | — | A |
| `remotion` | nota-ferramenta | `design-frontend/` | — | A |
| `manim` | nota-ferramenta | `design-frontend/` | — | A |
| `handanim` | nota-ferramenta | `design-frontend/` | — | A |
| `instadoodle` | nota-ferramenta | `design-frontend/` | — | M |
| `pomelli` | nota-ferramenta | `design-frontend/` | — | M |
| `open-design` | nota-ferramenta | `design-frontend/` | — | M |
| `paper-design` | nota-ferramenta | `design-frontend/` | — | A |
| `pencil-dev` | nota-ferramenta | `design-frontend/` | — | A |
| `marp` | nota-ferramenta | `design-frontend/` | — | A |
| `slidev` | nota-ferramenta | `design-frontend/` | — | A |
| `reveal-js` | nota-ferramenta | `design-frontend/` | — | A |
| `mdx-slide-frameworks` | nota-conceito | `design-frontend/` | — | A |
| `brave-search` | nota-ferramenta | `search-rag/` | — | A |
| `exa` | nota-ferramenta | `search-rag/` | — | A |
| `tavily` | nota-ferramenta | `search-rag/` | — | A |
| `firecrawl` | nota-ferramenta | `search-rag/` | — | A |
| `url_ibm-technology-rag-vs-long-context` | url-resumo | `search-rag/` | — | A |
| `analise-frameworks-sdd-modelos-recentes` | nota-livre | `coding-agent/` | — | M |
| `bill-inmon` | nota-personalidade | `personalidades/` | — | A |
| `steve-yegge` | nota-livre | `personalidades/` | — | M |
| `tim-oreilly` | nota-livre | `personalidades/` | — | M |
| `amazon-aws` | nota-ferramenta | raiz (ou futuro `infraestrutura/`) | — | B |
| `cuda` | nota-ferramenta | raiz (ou futuro `infraestrutura/`) | — | B |
| `connectbot` | nota-ferramenta | raiz (ou futuro `devtools/`) | — | B |
| `tmux` | nota-ferramenta | raiz (ou futuro `devtools/`) | — | B |
| `chezmoi` | nota-ferramenta | raiz (ou futuro `devtools/`) | — | B |
| `playwright` | nota-ferramenta | raiz (ou futuro `devtools/`) | — | B |
| `zod` | nota-ferramenta | raiz (ou futuro `devtools/`) | — | B |
| `benchmark-markdown` | nota-livre | raiz | — | B |
| `vibe` | nota-ferramenta | `agentes-ia/` | — | M |

### Resumo da distribuição proposta

| Subtópico | Arquivos movidos | Observação |
|---|---|---|
| `coding-agent/` | 35 | Inclui urls sobre claude-code e ferramentas de SDD |
| `agentes-ia/` | 19 | Frameworks, SDKs, bots, automação |
| `design-frontend/` | 19 | UI libs, animação, apresentações |
| `search-rag/` | 5 | Ferramentas de busca e RAG |
| `personalidades/` | 3 | bill-inmon + steve-yegge + tim-oreilly |
| Permanecem na raiz | 8 | Utilitários isolados sem cluster suficiente |
| **Total** | **89** | |

---

## 6. Anotações sobre `desenvolvimento-pessoal/`

Os 6 arquivos em `desenvolvimento-pessoal/` **não requerem reorganização no momento**. O tópico é pequeno e coeso: 4 notas sobre métodos de gestão do conhecimento (Zettelkasten, GTD, PARA/Forte, anotações inteligentes de Ahrens) e 2 URLs sobre second brain (Tiago Forte, Nate Jones). Tags dominantes: `gestao-do-conhecimento`, `produtividade`, `pkm`, `metodo-pessoal`. O tópico é estável e não tem pressão de crescimento imediata. Monitorar quando ultrapassar ~15 arquivos para avaliar subtópicos como `metodologia/` e `referencias-pessoais/`.

---

## 7. Próximos Passos Recomendados

1. **Aprovar ou ajustar** os slugs dos subtópicos candidatos (especialmente: `agentes-ia/` vs `agentes/` vs `ia-agentes/`).
2. **Decidir escopo do grupo `_claude-code/`**: incluir apenas nota-ferramenta ou também URLs editoriais sobre o produto.
3. **Executar** a reorganização usando `/triar` ou skill de movimentação batch, tópico por tópico, começando pelos de alta confiança.
4. **Criar `_grupo.md`** para `_claude-code/` e `_gsd/` antes de mover os arquivos.
5. **Normalizar sinônimos de tags** em paralelo ou em passo posterior com `/readequar-nota`.
