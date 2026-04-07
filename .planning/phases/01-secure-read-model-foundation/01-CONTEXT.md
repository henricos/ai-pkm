# Phase 1: Secure Read Model Foundation - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Autenticação single-user + modelo canônico read-only sobre o `pkm` montado externamente + setup de runtime. A camada web passa a ler o pkm por um `ItemRepository` com identidade estável por item. A UI da Fase 1 se limita à tela de login (minimalista); a shell principal de navegação é Fase 2.

**Pré-requisito de workflow:** `DESIGN.md` e as telas de referência do Stitch devem existir antes da implementação da Fase 1. O brief para o Stitch está em `.planning/STITCH-BRIEF.md`. Após a sessão no Stitch, os exports ficam em `reference/ui/screens/` e o `DESIGN.md` na raiz do projeto — ambos commitados antes de iniciar o plano.

</domain>

<decisions>
## Implementation Decisions

### Stack
- **D-01:** Next.js App Router como framework (SSR, file-based routing, middleware de auth nativo)
- **D-02:** React + Tailwind CSS como stack UI — compatível com output nativo do Stitch 2

### Autenticação (ACC-01, ACC-02, ACC-03)
- **D-03:** NextAuth.js (Auth.js) com credentials provider — session management via cookies httpOnly
- **D-04:** Credenciais (usuário + senha) fixas configuradas exclusivamente por variáveis de ambiente; nada sensível no repositório
- **D-05:** Middleware de auth protege todas as rotas da aplicação, inclusive em local/dev — sem exceção para conveniência

### Read Model (ARC-01, ARC-02, ARC-03, ARC-04)
- **D-06:** `ItemRepository` interface abstrai o acesso ao pkm — v2 implementa sobre filesystem + index JSONs; v3 troca a implementação sem alterar o contrato (ARC-04)
- **D-07:** Fast path: lê `pkm/index/grupos.json` e `pkm/index/topicos.json` como índice estrutural; enriquece com frontmatter dos arquivos quando necessário para contexto adicional
- **D-08:** Item ID = path relativo ao pkm root (ex: `topico/grupo/nome-arquivo.md`), URL-encoded para uso em rotas Next.js — estável enquanto o arquivo não for renomeado (aceitável para modelo read-only)

### Runtime (RUN-01, RUN-02, RUN-03)
- **D-09:** Variáveis de ambiente obrigatórias: `PKM_PATH`, `AUTH_USERNAME`, `AUTH_PASSWORD`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **D-10:** `pkm` acessado exclusivamente por path externo montado — a aplicação nunca assume conteúdo embutido no repositório da plataforma
- **D-11:** Documentação de setup local (README ou `docs/dev-setup.md`) cobre como subir a aplicação apontando para um pkm por path/volume

### Workflow Stitch 2 + DESIGN.md (pré-implementação)
- **D-12:** `DESIGN.md` existe na raiz do projeto (gerado no Stitch a partir de `.planning/STITCH-BRIEF.md`, commitado antes da Fase 1) — âncora de estilo para todas as fases
- **D-13:** Referências visuais do Stitch existem em `reference/ui/screens/` — o agente usa como base de layout, não como código final
- **D-14:** Regras de uso do Stitch output estão em `AGENTS.md` §Referência de UI: preservar intenção de layout, componentizar, adaptar tokens para shadcn/ui + `tailwind.config`, integrar com lógica real; nunca copiar export bruto para `src/`

### Claude's Discretion
- Estrutura interna de pastas do Next.js (`app/`, `lib/`, `types/`, `components/`)
- Schema TypeScript exato das interfaces `Item`, `Group`, `Topic` do ItemRepository
- Estratégia de cache/invalidação do read model em dev (hot-reload, watchers)
- Layout e visual da tela de login: seguir `DESIGN.md` quando disponível; se ainda não existir, usar minimalismo como padrão

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §ACC-01, ACC-02, ACC-03 — autenticação single-user, credenciais externas
- `.planning/REQUIREMENTS.md` §ARC-01, ARC-02, ARC-03, ARC-04 — modelo de leitura, identidade de item, seam para v3
- `.planning/REQUIREMENTS.md` §RUN-01, RUN-02, RUN-03 — runtime, configuração por env, acesso ao pkm por path

### PKM Domain
- `reference/pkm/pkm-conventions.md` — convenções do pkm: nomenclatura, estrutura de arquivos
- `reference/pkm/pkm-structure.md` — hierarquia de pastas do repositório pkm
- `reference/schemas/frontmatter-item.md` — contrato de frontmatter de item (parsing no read model)
- `reference/schemas/frontmatter-grupo.md` — contrato de frontmatter de grupo

### Existing Indices (fast path do read model)
- `index/grupos.json` — índice de grupos por tópico (estrutura existente consumida pelo ItemRepository)
- `index/topicos.json` — índice de tópicos válidos

### Design (gerado antes da Fase 1)
- `DESIGN.md` — âncora de estilo gerado pelo Stitch 2 (deve existir na raiz antes de iniciar o plano)
- `reference/ui/screens/` — referências visuais do Stitch em `html` e imagem, usadas como inspiração de layout

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Nenhum código web existe ainda — projeto greenfield para a camada web da v2
- `index/grupos.json` e `index/topicos.json`: estrutura de dados existente que o ItemRepository consumirá como fast path
- `reference/schemas/`: contratos de frontmatter que guiam o parsing de itens no read model

### Established Patterns
- Modelo file-first: pkm como fonte primária de verdade, nunca substituído por banco na v2
- IA como escritora exclusiva: a web é estritamente de navegação e exibição, sem operações de escrita
- Frontmatter como metadata canônico: `reference/schemas/frontmatter-item.md` define o contrato

### Integration Points
- `pkm/` (pasta montada externamente via `PKM_PATH`): ponto de entrada de todo o read model
- `pkm/index/grupos.json` e `pkm/index/topicos.json`: fast path para estrutura da árvore de navegação
- `DESIGN.md` (raiz do projeto): input de estilo obrigatório ao gerar componentes UI

</code_context>

<specifics>
## Specific Ideas

- **Workflow Stitch → importar fontes**: usuário usa `.planning/STITCH-BRIEF.md` como prompt no Stitch 2, exporta referências em `html` e imagem para `reference/ui/screens/` e `DESIGN.md` para a raiz, e o Claude Code adapta/valida contra a spec seguindo as regras em `AGENTS.md §Referência de UI`
- **DESIGN.md como âncora**: padrão lançado pelo Google Stitch com 9 seções (cores, tipografia, componentes, layout, elevação, responsive, do's/don'ts, agent prompt guide), versionado em Git, lido nativamente por Claude Code
- **ItemRepository contract**: `listTopics(): Topic[]`, `listGroups(topic: string): Group[]`, `getItem(id: string): Item`, `searchByName(q: string): Item[]` — permite trocar implementação na v3 sem alterar navegação, viewer e busca

</specifics>

<deferred>
## Deferred Ideas

- Integração MCP do Stitch para importação automática de componentes — explorar quando disponível; por ora a importação é manual (cópia direta para `reference/ui/screens/`)
- Busca textual avançada com popup/lista de resultados — explicitamente fora da v2 ativa; ARC-04 prepara a seam mas não implementa
- Preview de `.excalidraw` somente leitura — backlog futuro

</deferred>

---

*Phase: 01-secure-read-model-foundation*
*Context gathered: 2026-04-06*
