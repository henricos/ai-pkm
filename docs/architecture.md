# Arquitetura — ai-pkm

## Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Linguagem | TypeScript | Contratos de dados sólidos; schemas rígidos para tools do agente; auxílio da IA na geração de código |
| Frontend | Next.js App Router | Server Components para performance; SEO nativo; Route Handlers como BFF no mesmo processo |
| UI | Ant Design | Maturidade para componentes complexos (árvore, tabelas, drawers, formulários) |
| Estilo | Tailwind CSS | Classes utilitárias; elimina CSS solto; facilita geração por IA |
| Design Tokens | `tailwind.config.ts` | Fonte única que alimenta Tailwind e o `ConfigProvider` do Ant Design |
| Validação | Zod | Saídas do agente validadas em runtime antes de chegarem à UI ou ao banco |
| ORM | Drizzle ORM | Type-safe, leve, ótimo suporte a SQLite, schemas inferidos pelo TypeScript |
| Banco | SQLite | Fase inicial; zero infraestrutura extra; banco é derivado e reconstruível |
| Agent SDK | Anthropic Agent SDK (TypeScript) | Sessões persistentes; continuidade de contexto entre interações |
| Runtime | Node.js via Next.js | Ambiente nativo para o Agent SDK; processo único |
| Automação auxiliar | Python + `uv` | Scripts de suporte para fluxos que exigem processamento local |
| Extração web | Playwright | Coleta de páginas web em fluxos de processamento de URL |
| Mídia | ffmpeg | Transcrição e processamento de áudio/vídeo (YouTube, Instagram, TikTok) |

---

## Estrutura de diretórios

> TODO — estrutura do código da aplicação Next.js (a ser preenchido quando o scaffolding do app existir).
> A estrutura do repositório atual (`ai-pkm` + `pkm`) está documentada em `docs/pkm-structure.md`.

---

## Modelo de dados principal

> TODO — preencher quando o scaffold do Next.js existir e os primeiros schemas Zod + Drizzle forem criados. As entidades centrais já são conhecidas conceitualmente: item, grupo, tópico, sessão de agente, operação. O modelo de dados emerge dos schemas, não o contrário.

---

## ADRs

### ADR-01 — Agent SDK rodando dentro do processo Next.js

**Contexto**
O Agent SDK é uma biblioteca TypeScript, não um serviço. A questão era se ele deveria rodar dentro do processo Next.js (via Route Handlers) ou em um worker Node separado.

**Decisão**
Agent SDK rodando dentro do Next.js, chamado diretamente de Route Handlers. Para tarefas longas, a resposta é streamada via SSE (Server-Sent Events).

**Consequências**
- Arquitetura mais simples: único processo, sem comunicação inter-serviços, sem portas extras
- SSE é necessário para streaming de execução em tempo real — Route Handlers do Next.js suportam nativamente com `ReadableStream`
- O timeout de Route Handlers em ambientes serverless (ex: Vercel) não se aplica aqui — o sistema é self-hosted, o processo não tem limite artificial de duração
- Um lock de execução serial deve ser mantido na aplicação (in-memory ou banco) para garantir que apenas uma sessão de agente esteja ativa por vez
- Se o processo cair durante uma execução, a sessão fica em estado inconsistente — a aplicação deve detectar sessões "penduradas" na inicialização e marcá-las como erro

**Quando revisitar**
Se o sistema precisar processar múltiplas ações em paralelo ou se o tempo de execução do agente impactar a responsividade da UI mesmo com SSE.

---

### ADR-02 — Skills consumidas como arquivos pelo agente, não via MCP

**Contexto**
O projeto já possui skills em `.agents/skills/` usadas por agentes CLI (Claude Code, Cursor). A questão era se o agente web precisaria que essas skills fossem reexpostas como ferramentas via MCP (Model Context Protocol) para consumi-las.

**Decisão**
Skills são consumidas como arquivos Markdown lidos do filesystem, da mesma forma que agentes CLI fazem hoje. Nenhuma exposição via MCP é necessária.

**Consequências**
- Compatibilidade total entre operação local (CLI) e operação web (Agent SDK) — as mesmas skills servem aos dois contextos
- Sem duplicação: não é preciso reimplementar skills como MCP servers
- O agente web simplesmente lê o arquivo da skill antes de executar, exatamente como o Claude Code faz
- MCP fica fora da stack desta versão

**Quando revisitar**
Se o sistema precisar consumir capacidades externas (ferramentas de terceiros, serviços remotos) que só estejam disponíveis via MCP.

---

### ADR-03 — SQLite sem busca vetorial na v1

**Contexto**
O sistema precisa de um banco para índices, metadados e estado operacional. A questão era incluir busca vetorial desde o início (sqlite-vec ou PostgreSQL + pgvector) ou postergar.

**Decisão**
SQLite puro na v1, sem extensão vetorial. O banco é tratado como índice derivado e reconstruível a partir do repositório `pkm`.

**Consequências**
- Zero infraestrutura adicional: SQLite roda no mesmo processo, sem servidor separado
- Busca semântica não estará disponível na v1
- A migração futura para sqlite-vec ou PostgreSQL + pgvector é possível sem impacto no conteúdo (que vive no `pkm`)

**Quando revisitar**
Quando o volume do acervo tornar a busca por texto insuficiente, ou quando o usuário precisar de recuperação semântica para alimentar contexto do agente.

---

## Fluxo de dados do caso mais crítico

> TODO — preencher quando o scaffold existir e os Route Handlers do agente forem implementados. O caso candidato já está claro: execução de skill com proposta de mudança, aprovação do usuário e commit no `pkm`. A lógica desse fluxo está descrita nos ADRs acima e nas specs de `flows/`; usar como base ao detalhar o diagrama de dados.

---

## Convenções de código

> TODO — preencher quando o código surgir. As convenções emergem do código, não de decisões antecipadas. Pontos de partida já definidos pela stack: TypeScript strict, Zod para validação de saídas do agente antes de chegarem à UI ou ao banco, Drizzle para acesso ao SQLite, Route Handlers como BFF do frontend.
