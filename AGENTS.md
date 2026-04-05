# Instruções para Agentes de IA

Regras obrigatórias para qualquer IA (IDEs como Cursor ou Antigravity, CLIs como Claude Code ou Codex CLI, ou qualquer orquestrador) operando neste repositório. Siga sem exceção.

## Leitura obrigatória de contexto

Antes de executar qualquer tarefa, leia estes arquivos:

1. **`docs/overview.md`** — visão e propósito do sistema.

Referência adicional disponível: `flows/` — especificações autoritativas dos fluxos operacionais (um arquivo por fluxo). As skills em `.agents/skills/` são implementações dessas especificações.

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

## Documentação técnica

A documentação deste projeto vive em `docs/`:

- **`docs/overview.md`** — visão e propósito.
- **`docs/prd.md`** — requisitos de produto.
- **`docs/architecture.md`** — stack, ADRs e decisões técnicas.
- **`docs/pkm-structure.md`** — estrutura de diretórios do repositório e taxonomia de tópicos.
- **`docs/pkm-conventions.md`** — contratos estruturais do pkm: tipos de item, frontmatter, nomenclatura, índices JSON.
- **`docs/pkm-naming.md`** — fonte de verdade para nomenclatura de arquivos (slugs, prefixos, autores).
- **`flows/`** — especificação autoritativa de cada fluxo operacional (um arquivo por fluxo).

**Regra de atualização:** ao alterar o comportamento de qualquer fluxo, atualize primeiro a spec em `flows/` e depois propague a mudança para a skill correspondente em `.agents/skills/`.

## Desenvolvimento guiado por especificação (SDD)

Este projeto adota Spec-Driven Development como prática de desenvolvimento: qualquer feature da plataforma começa com uma especificação escrita antes do código. A ferramenta adotada é o OpenSpec, cuja configuração é trabalho futuro.

**Regras para o agente:**
- Antes de implementar qualquer feature, verifique se existe uma spec correspondente. Se não existir, sinalize ao operador antes de prosseguir.
- Se uma mudança alterar o comportamento descrito numa spec existente, atualize a spec como parte da mesma entrega.

**Separação de specs por camada:**
- `flows/` — especificações das skills operacionais (comportamento do agente PKM). Regra de atualização já descrita na seção "Documentação técnica".
- Specs da plataforma web (features da aplicação) serão mantidas em pasta própria a definir quando o OpenSpec for configurado.

## Regras universais

### Nomenclatura de arquivos

Todos os arquivos do repositório seguem kebab-case. Regras completas em `docs/pkm-conventions.md`.

### Frontmatter

Arquivos de conhecimento no repositório `pkm` exigem frontmatter conforme contratos em `schemas/` (raiz do projeto). Detalhes em `docs/pkm-conventions.md`.

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

### Rastreabilidade

Sem arquivos de log de IA; auditoria exclusivamente via mensagem de commit Git.

