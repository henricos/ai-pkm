# Instruções para Agentes de IA

Regras obrigatórias para qualquer IA (IDEs como Cursor ou Antigravity, CLIs como Claude Code ou Codex CLI, ou qualquer orquestrador) operando neste repositório. Siga sem exceção.

## Leitura obrigatória de contexto

Antes de executar qualquer tarefa, leia estes arquivos:

1. **`docs/overview.md`** — visão e propósito do sistema.
2. **`docs/prd.md`** — requisitos de produto e decisões já tomadas.
3. **`docs/architecture.md`** — stack, ADRs e decisões técnicas.
4. **`docs/pkm-conventions.md`** — contratos estruturais do repositório pkm.

Referência adicional disponível: `docs/flows/` — especificações autoritativas dos fluxos operacionais (um arquivo por fluxo). As skills em `.agents/skills/` são implementações dessas especificações.

## Idioma

Este repositório adota uma política de idioma híbrida:

- **Estrutura do projeto** (nomes de pastas, arquivos de código, configs, nomes de documentos técnicos): **inglês**.
- **Conteúdo escrito** (textos, commits, mensagens ao usuário, frontmatter do pkm, nomes de skills, nomes de fluxos, comunicação no chat): **português do Brasil (`pt-BR`)**.

A única exceção admissível são jargões tecnológicos globais enraizados que soem puramente artificiais em português, como `frontmatter`, `inbox`, `pipeline` ou trechos de código exatos. Referências externas podem ser capturadas no idioma original; metadados, títulos criados pela IA e textos autorais do sistema continuam em `pt-BR`.

## Repositório pkm

O conteúdo do PKM vive no repositório separado e privado `pkm`, montado como pasta `pkm/` na raiz deste projeto. Skills que operam sobre conteúdo usam `pkm/` como raiz.

- Inbox de captura: `pkm/__inbox/`
- Tópicos: `pkm/_[topico]/`
- Índices: `pkm/sistema/indices/`
- Esquemas de frontmatter: `docs/schemas/`

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

## Documentação técnica

A documentação deste projeto vive em `docs/`:

- **`docs/overview.md`** — visão e propósito.
- **`docs/prd.md`** — requisitos de produto.
- **`docs/architecture.md`** — stack, ADRs e decisões técnicas.
- **`docs/pkm-conventions.md`** — contratos estruturais do pkm.
- **`docs/flows/`** — especificação autoritativa de cada fluxo operacional (um arquivo por fluxo).

**Regra de atualização:** ao alterar o comportamento de qualquer fluxo, atualize primeiro a spec em `docs/flows/` e depois propague a mudança para a skill correspondente em `.agents/skills/`.

## Regras universais

### `.gitkeep`

Pastas que podem ficar vazias devem conter `.gitkeep` para preservar a estrutura no Git. Ao criar uma nova pasta vazia, o primeiro ato obrigatório é depositar um `.gitkeep` dentro dela.

### Nomenclatura de arquivos

Todos os arquivos do repositório seguem kebab-case. Regras completas em `docs/pkm-conventions.md`.

### Frontmatter

Arquivos de conhecimento no repositório `pkm` exigem frontmatter conforme esquemas em `docs/schemas/`. Detalhes em `docs/pkm-conventions.md`.

### Busca de conteúdo

Ao buscar grupos existentes, consulte `pkm/sistema/indices/grupos.json`. Para tópicos válidos, consulte `pkm/sistema/indices/topicos.json`. Esses índices evitam varredura recursiva de pastas.

### Taxonomia

Nunca invente tópicos. Consulte `pkm/sistema/indices/topicos.json` antes de classificar qualquer item.

### Índices

**Nunca edite índices JSON em `pkm/sistema/indices/` diretamente.** Use a skill `/recriar-indices` ou skills que já os atualizam (ex: `/triar`, `/criar-grupo`).

### Validação estrutural

Para checagem não mutante de coerência, use a skill `/validar-estrutura`.

### Rastreabilidade

Sem arquivos de log de IA; auditoria exclusivamente via mensagem de commit Git.

### Pendência de scripts

Os scripts Python em `.agents/skills/*/scripts/` foram portados com caminhos originais do repositório legado. Esses caminhos precisam ser adaptados para usar o prefixo `pkm/` em sessão futura de desenvolvimento.
