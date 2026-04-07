# Phase 1: Secure Read Model Foundation - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Autenticação single-user + modelo canônico read-only sobre o `pkm` montado externamente + setup de runtime. A camada web passa a ler o pkm por um `ItemRepository` com identidade estável por item. A UI da Fase 1 se limita à tela de login (minimalista); a shell principal de navegação é Fase 2.

**Pré-requisito de workflow:** ✅ Cumprido — `DESIGN.md` (raiz do projeto) e telas de referência do Stitch (`reference/ui/screens/`) existem e estão commitados. A implementação da Fase 1 pode começar.

</domain>

<decisions>
## Implementation Decisions

### Stack
- **D-01:** Next.js App Router como framework (SSR, file-based routing, middleware de auth nativo)
- **D-02:** React + TypeScript + Tailwind CSS + **shadcn/ui** como stack UI — shadcn/ui é a biblioteca de componentes (componentes copiados para `src/components/ui/`, baseados em Radix UI + Tailwind). Compatível com output do Stitch e com AGENTS.md §Referência de UI.

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

### Setup de Design System (Fase 1 entrega junto com auth + read model)
- **D-12:** `DESIGN.md` (raiz do projeto) é a fonte de verdade de estilo — tokens de cor, tipografia, elevação e componentes definidos ali são canônicos. Conflitos com HTML do Stitch são resolvidos a favor do `DESIGN.md`.
- **D-13:** `reference/ui/screens/` contém HTML exportado pelo Stitch como referência de composição visual (layout, hierarquia, proporções) — não é código de produção.
- **D-14:** Fidelidade visual = `DESIGN.md` como guia de princípios + HTML do Stitch como referência de composição. Quando `DESIGN.md` e HTML divergem (ex: cores diferentes), prevalece `DESIGN.md`. Quando a composição visual precisa ser fiel ao Stitch mas os tokens devem vir do `DESIGN.md`, o implementador adapta sem precisar abrir uma nova discussão.
- **D-15:** Protocolo de adaptação Stitch → React:
  1. Ler HTML do Stitch para entender layout, hierarquia e proporções
  2. Estruturar componentes React/TypeScript a partir dessa composição
  3. Substituir elementos HTML brutos por primitivos shadcn/ui equivalentes (`Input`, `Button`, `Label`, `Form`, etc.)
  4. Aplicar tokens do `tailwind.config.ts` derivados do `DESIGN.md` (nunca classes CDN ou valores literais do HTML exportado)
  5. Nunca copiar arquivo de `reference/ui/screens/` diretamente para `src/` sem refatoração completa
- **D-16:** `tailwind.config.ts` configurado na Fase 1 com os custom tokens do `DESIGN.md` (cores: `tertiary`, `surface_container_lowest`, `surface_container_low`, `surface`, `on_surface`, `primary_container`, etc.; tipografia: Inter; elevação: shadow definido pelo design system). Todas as fases seguintes partem dessa configuração já pronta.

### Claude's Discretion
- Estrutura interna de pastas do Next.js (`app/`, `lib/`, `types/`, `components/`)
- Schema TypeScript exato das interfaces `Item`, `Group`, `Topic` do ItemRepository
- Estratégia de cache/invalidação do read model em dev (hot-reload, watchers)
- **Versão do NextAuth**: v4 estável (`getServerSession`) vs Auth.js v5 nativo para App Router (`auth()` em server components) — Claude decide baseado na compatibilidade com a versão do Next.js escolhida. Preferência por v5 se estável, v4 se v5 ainda for instável na data da implementação.
- Package manager (npm, pnpm ou yarn)
- Componentes shadcn/ui iniciais a instalar (no mínimo: `button`, `input`, `label`, `form`)

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

### Design System
- `DESIGN.md` — âncora canônica de estilo: tokens de cor, tipografia, componentes, regras de elevação e do's/don'ts. **Fonte de verdade para tailwind.config.ts.**
- `reference/ui/screens/01-login/code.html` — referência visual do Stitch para a tela de login: composição, hierarquia, proporções
- `reference/ui/screens/01-login/screen.png` — captura visual do layout de login

### Adaptation Rules
- `AGENTS.md` §Referência de UI — protocolo completo de uso do Stitch output: preservar intenção de layout, componentizar, adaptar tokens, integrar shadcn/ui, nunca copiar export bruto

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Nenhum código web existe ainda — projeto greenfield para a camada web da v2
- `index/grupos.json` e `index/topicos.json`: estrutura de dados existente que o ItemRepository consumirá como fast path
- `reference/schemas/`: contratos de frontmatter que guiam o parsing de itens no read model
- `DESIGN.md`: sistema de design completo gerado pelo Google Stitch — tokens, tipografia, componentes, regras de elevação
- `reference/ui/screens/01-login/`: HTML e screenshot da tela de login exportados pelo Stitch — referência de composição visual

### Established Patterns
- Modelo file-first: pkm como fonte primária de verdade, nunca substituído por banco na v2
- IA como escritora exclusiva: a web é estritamente de navegação e exibição, sem operações de escrita
- Frontmatter como metadata canônico: `reference/schemas/frontmatter-item.md` define o contrato
- DESIGN.md + shadcn/ui: tokens customizados no tailwind.config.ts + primitivos Radix UI

### Integration Points
- `pkm/` (pasta montada externamente via `PKM_PATH`): ponto de entrada de todo o read model
- `pkm/index/grupos.json` e `pkm/index/topicos.json`: fast path para estrutura da árvore de navegação
- `DESIGN.md` (raiz do projeto): input canônico de estilo para `tailwind.config.ts` e todos os componentes

</code_context>

<specifics>
## Specific Ideas

- **Fluxo Stitch → componentes**: HTML exportado é lido como referência de composição (não copiado). Tokens literais do HTML (ex: `slate-900`, `blue-600`) são substituídos pelos custom tokens do `tailwind.config.ts` derivados do `DESIGN.md` (ex: `on_surface`, `tertiary`). Shadcn/ui fornece os primitivos de formulário para a tela de login.
- **DESIGN.md como âncora**: padrão lançado pelo Google Stitch com sistema de design completo (cores, tipografia, componentes, elevação, responsive, do's/don'ts). Conflito DESIGN.md vs HTML do Stitch → prevalece DESIGN.md.
- **ItemRepository contract**: `listTopics(): Topic[]`, `listGroups(topic: string): Group[]`, `getItem(id: string): Item`, `searchByName(q: string): Item[]` — permite trocar implementação na v3 sem alterar navegação, viewer e busca.

</specifics>

<deferred>
## Deferred Ideas

- Integração MCP do Stitch para importação automática de componentes — explorar quando disponível; por ora a importação é manual (cópia direta para `reference/ui/screens/`)
- Busca textual avançada com popup/lista de resultados — explicitamente fora da v2 ativa; ARC-04 prepara a seam mas não implementa
- Preview de `.excalidraw` somente leitura — backlog futuro

</deferred>

---

*Phase: 01-secure-read-model-foundation*
*Context gathered: 2026-04-07*
