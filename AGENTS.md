# Instruções para Agentes de IA

Regras obrigatórias para qualquer IA (IDEs como Cursor ou Antigravity, CLIs como Claude Code ou Codex CLI, ou qualquer orquestrador) operando neste repositório. Siga sem exceção.

## Leitura obrigatória de contexto

Antes de executar qualquer tarefa, leia estes arquivos:

1. **`.planning/PROJECT.md`** — visão atual e contexto do produto.
2. **`.planning/REQUIREMENTS.md`** — requisitos ativos.
3. **`.planning/ROADMAP.md`** — direção atual de execução.

Referências normativas adicionais:
- `reference/pkm/` — contratos e convenções estáveis do domínio PKM.
- `reference/schemas/` — contratos formais de frontmatter e manifests.
- `.agents/skills/` — fonte de verdade operacional das skills do projeto.

## Idioma

Este repositório adota uma política de idioma híbrida:

- **Estrutura do projeto** (nomes de pastas, arquivos de código, configs, nomes de documentos técnicos): **inglês**.
- **Conteúdo escrito** (textos, commits, mensagens ao usuário, frontmatter do pkm, nomes de skills, nomes de fluxos, comunicação no chat): **português do Brasil (`pt-BR`)**.

A única exceção admissível são jargões tecnológicos globais enraizados que soem puramente artificiais em português, como `frontmatter`, `inbox`, `pipeline` ou trechos de código exatos. Referências externas podem ser capturadas no idioma original; metadados, títulos criados pela IA e textos autorais do sistema continuam em `pt-BR`.

## Repositório pkm

O conteúdo do PKM vive no repositório separado e privado `pkm`, montado como pasta `pkm/` na raiz deste projeto. Skills que operam sobre conteúdo usam `pkm/` como raiz.

O banco de dados da aplicação é um índice derivado e reconstruível a partir do repositório `pkm`. O `pkm` é a fonte primária de verdade do conteúdo.

## Estratégia de IA agnóstica

Este repositório adota uma estratégia agnóstica de ferramenta para suportar múltiplas IAs sem duplicar instruções.

**Fontes de verdade editáveis:**
- `AGENTS.md` — regras operacionais comuns a qualquer agente.
- `.agents/skills/` — implementações padronizadas dos fluxos operacionais.

Arquivos de compatibilidade como `CLAUDE.md` e diretórios de ferramenta são apenas apontamentos para essas fontes de verdade. Nunca edite os apontamentos diretamente.

**Como cada ferramenta carrega as instruções e as skills:**
- **Claude Code** — carrega as regras por meio de `CLAUDE.md`, que inclui `@AGENTS.md`; skills via `.claude/skills/`, que aponta para `.agents/skills/`.
- **Cursor** — lê `AGENTS.md` como arquivo nativo de instruções; skills via `.cursor/skills/`, que aponta para `.agents/skills/`.
- **Antigravity / Codex CLI** — leem `AGENTS.md` diretamente; skills lidas de `.agents/skills/` diretamente.
- **Outras ferramentas** — devem ser configuradas para carregar regras de `AGENTS.md` e skills de `.agents/skills/`, de preferência por apontamento em vez de duplicação.

## IA como escritora exclusiva

A IA é a única escritora de arquivos no repositório `pkm`: toda movimentação, criação, edição de frontmatter, atualização de índices e organização de pastas acontece exclusivamente via skills. O humano deposita itens em `pkm/__inbox/` e toma decisões (aprovações, direção intelectual).

No repositório `ai-pkm` (este), a IA e o humano podem colaborar livremente no código e na documentação.

## Arquitetura documental

A informação do projeto está separada por papel:

- **`.planning/`** — contexto vivo do produto `ai-pkm` sob GSD: visão atual, requisitos, roadmap e artefatos de planejamento.
- **`reference/pkm/`** — referência normativa do domínio PKM: estrutura, convenções e nomenclatura.
- **`reference/schemas/`** — contratos formais de frontmatter e manifests.
- **`.agents/skills/`** — fonte de verdade operacional do comportamento das skills.
- **`models/`** — templates operacionais de conteúdo.
- **`index/`** — índices e catálogos operacionais usados pelas skills.

## Desenvolvimento guiado por especificação (SDD)

Este projeto adota Spec-Driven Development como prática de desenvolvimento: qualquer feature da plataforma começa com uma especificação escrita antes do código. O desenvolvimento de features usa o **GSD** como sistema de operação: as fases de especificação, planejamento e execução acontecem via slash commands (`/gsd-discuss-phase`, `/gsd-plan-phase`, `/gsd-execute-phase`, `/gsd-verify-work`).

**Regras para o agente:**
- Antes de implementar qualquer feature, verifique se existe uma spec correspondente. Se não existir, sinalize ao operador antes de prosseguir.
- Se uma mudança alterar o comportamento descrito numa spec existente, atualize a spec como parte da mesma entrega.
- Para iniciar o desenvolvimento de uma feature nova, use `/gsd-discuss-phase` antes de planejar ou implementar.

**Separação de specs por camada:**
- Specs da plataforma web (features da aplicação) são gerenciadas pelo ciclo GSD: discussão em `/gsd-discuss-phase`, plano atômico em `PLAN.md`, execução em `/gsd-execute-phase`.
- O comportamento operacional das skills do PKM vive em `.agents/skills/`; ao alterar uma skill, atualize a própria skill e qualquer contrato normativo em `reference/` que tenha sido afetado.

## Regras universais

### Nomenclatura de arquivos

Todos os arquivos do repositório seguem kebab-case. Regras completas em `reference/pkm/pkm-conventions.md`.

### Frontmatter

Arquivos de conhecimento no repositório `pkm` exigem frontmatter conforme contratos em `reference/schemas/`. Detalhes em `reference/pkm/pkm-conventions.md`.

### Modelos de nota

Modelos operacionais de nota e URL vivem em `models/` (raiz do projeto), análogos aos índices JSON em `index/`. Ao criar ou readequar notas, consulte o modelo em `models/<nome>.md` — o campo `modelo` no frontmatter aponta para o nome do arquivo sem extensão (ex: `nota-ferramenta`, `url-resumo`). Para descobrir os modelos disponíveis, consulte `index/models.json`.

### Busca de conteúdo

Ao buscar grupos existentes, consulte `index/grupos.json`. Para tópicos válidos, consulte `index/topicos.json`. Esses índices evitam varredura recursiva de pastas.

### Taxonomia

Nunca invente tópicos. Consulte `index/topicos.json` antes de classificar qualquer item.

### Índices

**Nunca edite índices JSON em `index/` diretamente.** Use a skill `/recriar-indices` ou skills que já os atualizam (ex: `/criar-grupo`).

### Validação estrutural

Para checagem não mutante de coerência, use a skill `/validar-estrutura`.

### Commits

**Nunca faça commits automáticos.** Antes de qualquer commit, avise o operador e aguarde aprovação explícita. Use sempre a skill `/commit-push` para criar commits neste repositório — ela aplica o estilo, o idioma e o processo corretos definidos pelo projeto.

Isso se aplica a qualquer agente, incluindo fluxos GSD (`/gsd-discuss-phase`, `/gsd-plan-phase`, `/gsd-execute-phase` e similares): mesmo que o workflow instrua a fazer commit de artefatos de planejamento, o agente deve propor o commit e aguardar aprovação, usando `/commit-push`.

### Rastreabilidade

Sem arquivos de log de IA; auditoria exclusivamente via mensagem de commit Git.

### Versionamento

Ao criar ou atualizar artefatos de planning, respeite a convencao de versionamento definida em `.planning/PROJECT.md`: milestones usam `vMAJOR.MINOR` e a versao do aplicativo usa SemVer completo `MAJOR.MINOR.PATCH`.

## Referência de UI (Stitch output)

Antes de implementar qualquer tela, leia:
- `DESIGN.md` (raiz do projeto) — sistema de design: tokens de cor, tipografia, espaçamento e componentes gerados pelo Google Stitch
- `reference/ui/screens/` — referências visuais geradas no Stitch para inspirar layout, hierarquia e composição

**Regras de uso do Stitch output:**
- Os arquivos em `reference/ui/screens/` são referências de layout e composição visual — não código de produção
- O material atual em `reference/ui/screens/` deve ser tratado como `html` e imagem exportados apenas para inspiração visual
- Preservar a intenção de layout: posicionamento, hierarquia, proporções
- Componentizar: quebrar em componentes reutilizáveis em `src/components/`
- Adaptar tokens: substituir valores literais por tokens do `tailwind.config` derivados do `DESIGN.md`
- Integrar com shadcn/ui: substituir elementos HTML brutos pelos componentes shadcn equivalentes
- Nunca copiar um arquivo de `reference/ui/screens/` diretamente para `src/` sem refatoração
