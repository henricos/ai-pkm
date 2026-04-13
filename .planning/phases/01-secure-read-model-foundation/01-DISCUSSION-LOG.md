# Phase 1: Secure Read Model Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves a análise da discussão.

**Date (session 1):** 2026-04-06
**Date (session 2):** 2026-04-07
**Phase:** 01-secure-read-model-foundation
**Mode:** discuss (session 1) + discuss update (session 2)
**Areas analyzed (session 1):** Framework/Stack, Autenticação, Read Model, Item Identity, Workflow Stitch 2 + DESIGN.md
**Areas analyzed (session 2):** Fluxo Stitch → Componentes, Biblioteca de componentes (shadcn/ui), Fidelidade visual

---

## Session 1 (2026-04-06)

### Gray Areas Presented

| Área | Questão | Opções apresentadas |
|------|---------|---------------------|
| Framework | Stack para a v2.0 | Next.js App Router vs Vite+React+Express |
| Autenticação | Mecanismo de login single-user | NextAuth.js credentials vs JWT custom |
| Stitch timing | Quando executar sessão no Stitch | Antes da Fase 1 vs Antes da Fase 2 |
| Read Model | Como ler o pkm montado | Index JSONs como fast path vs Filesystem direto |
| Item ID | Identidade estável de item | Path relativo ao pkm root vs Hash SHA256 |

### Decisions Made

- **Framework:** Next.js App Router + React + Tailwind CSS — output nativo do Stitch 2 é React/Tailwind; Next.js simplifica full-stack com SSR, middleware de auth e file-based routing
- **Autenticação:** NextAuth.js (Auth.js) com credentials provider — matura, session via cookies httpOnly, integração nativa com Next.js; credenciais via env
- **Stitch timing:** Antes da Fase 1 — DESIGN.md commitado antes da implementação
- **Read Model:** Index JSONs como fast path com interface `ItemRepository` — aproveita índices existentes, abstrai implementação para troca na v4.0
- **Item Identity:** Path relativo ao pkm root, URL-encoded — legível, determinístico; muda só com rename (aceitável em modelo read-only)

### Deferred (session 1)

- Integração MCP do Stitch para importação automática
- Tela de login no Stitch (pode ser feito como parte da sessão pré-Fase 1, mas não obrigatório)

---

## Session 2 (2026-04-07)

### Contexto da sessão

Sessão de atualização motivada pelo fato de o Google Stitch ter exportado apenas HTML + DESIGN.md (não TypeScript/React como esperado). O usuário queria confirmar se a referência seria seguida na implementação e como o protocolo de adaptação funcionaria.

Os pré-requisitos de design estão agora cumpridos:
- `DESIGN.md` existe na raiz do projeto
- `reference/ui/screens/01-login/`, `02-content-viewer/`, `03-media-viewer/`, `04-presentation-mode/` existem

### Discussão

**Fluxo Stitch → Componentes:**
O HTML do Stitch usa Tailwind CDN + Material Symbols + cores literais (`slate-900`, `blue-600`). Foi definido que o HTML é referência de composição visual — não copiado — e que os valores literais são substituídos pelos custom tokens do `DESIGN.md` mapeados no `tailwind.config.ts`.

**Biblioteca de componentes:**
shadcn/ui já estava mencionado em AGENTS.md mas não estava explícito no CONTEXT.md. Usuário perguntou o que é shadcn/ui e quais as alternativas. Alternativas apresentadas: Tailwind puro, Radix UI direto, Mantine. shadcn/ui confirmado por ser compatível com Next.js App Router, funcionar nativamente com Tailwind e dar controle total sobre estilização.

Decisão de instalar na Fase 1 (não depois): a tela de login é a única UI da Fase 1; instalar shadcn depois geraria retrabalho no login. Fase 1 entrega `tailwind.config.ts` + shadcn instalado como fundação completa para Fases 2–5.

**Fidelidade visual:**
Três opções: alta fidelidade ao DESIGN.md, alta fidelidade ao HTML exportado, ou DESIGN.md + HTML como complemento. Usuário escolheu a terceira — ambos são referência, conflitos resolvidos a favor do DESIGN.md.

### Corrections Applied to CONTEXT.md

| Seção | Original | Atualizado |
|-------|----------|------------|
| D-02 | "React + Tailwind CSS" | "React + TypeScript + Tailwind CSS + shadcn/ui" |
| D-12 a D-14 | Pré-requisito pendente | Pré-requisito marcado como ✅ cumprido; D-14 atualizado com regra de fidelidade visual |
| D-15 (novo) | — | Protocolo explícito de adaptação Stitch → React (5 passos) |
| D-16 (novo) | — | tailwind.config.ts com tokens do DESIGN.md entregue na Fase 1 |
| Claude's Discretion | Sem menção ao NextAuth version | Adicionado: Claude decide entre v4 e v5 com preferência por v5 se estável |
| canonical_refs | Sem referência às telas do Stitch | Adicionado: code.html e screen.png do login; AGENTS.md §Referência de UI |
| code_context | Sem DESIGN.md nem Stitch screens | DESIGN.md e reference/ui/screens/01-login/ adicionados como assets confirmados |
| Domain | Pré-requisito como obrigação futura | Marcado como ✅ Cumprido |

### Sem escopo creep

Nenhuma ideia fora do escopo da Fase 1 foi levantada nesta sessão.
