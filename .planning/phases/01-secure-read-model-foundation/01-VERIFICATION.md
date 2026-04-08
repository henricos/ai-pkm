---
phase: 01-secure-read-model-foundation
verified: 2026-04-08T07:45:00Z
status: gaps_found
score: 3/4 must-haves verified
gaps:
  - truth: "npm run test passa (todos os testes)"
    status: failed
    reason: "1 de 11 testes falha — env.test.ts 'RUN-01: lança ZodError com mensagem clara quando PKM_PATH está ausente'. O teste espera que import('../lib/env') rejeite com erro contendo 'PKM_PATH é obrigatório', mas env.ts chama process.exit(1) em vez de lançar exceção. O framework de testes captura '[Error: process.exit unexpectedly called with \"1\"]' em vez da mensagem esperada."
    artifacts:
      - path: "src/lib/env.ts"
        issue: "parseEnv() chama process.exit(1) quando vars estão ausentes em vez de lançar ZodError — comportamento correto para produção, mas incompatível com o teste que usa dynamic import para verificar a mensagem de erro"
      - path: "src/__tests__/env.test.ts"
        issue: "Teste usa 'await import(\"../lib/env\")' e espera rejeição com mensagem de ZodError, mas recebe 'Error: process.exit unexpectedly called with \"1\"' — teste e implementação têm expectativas incompatíveis"
    missing:
      - "Alinhar env.test.ts para verificar o stderr output de process.exit(1) em vez de esperar rejeição por ZodError, OU refatorar env.ts para lançar ZodError e capturar na borda de startup (ex: em layout.tsx ou start script)"
human_verification:
  - test: "Verificar autenticação end-to-end no browser"
    expected: "Acesso a / sem sessão redireciona para /login; credenciais corretas → home com tópicos; cookie httpOnly=true no DevTools"
    why_human: "Comportamento real do middleware (proxy.ts), redirect e cookie httpOnly só podem ser confirmados no runtime do navegador com Next.js rodando"
  - test: "Verificar visual da tela de login vs referência Stitch"
    expected: "Card centralizado, campos username/password, botão 'Sign In' em azul suave, sem rounded-xl, cores do DESIGN.md"
    why_human: "Fidelidade visual ao Stitch (code.html) só pode ser avaliada por humano"
---

# Phase 1: Secure Read Model Foundation — Relatório de Verificação

**Objetivo da Fase:** Usuario consegue abrir a aplicacao com login protegido e a web passa a ler o `pkm` montado externamente por um modelo canonico read-only, sem romper o fluxo file-first.
**Verificado:** 2026-04-08T07:45:00Z
**Status:** gaps_found
**Re-verificação:** Não — verificação inicial

---

## Alcance do Objetivo

### Verdades Observáveis

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | Usuário precisa se autenticar antes de acessar a interface web | ✓ VERIFICADO | `src/proxy.ts` exporta `auth as proxy`; Next.js 16 reconhece `proxy.ts` como middleware (confirmado via `isMiddlewareFilename` no source Next.js); build mostra `ƒ Proxy (Middleware)`; matcher protege todas rotas exceto `/api/auth`, `_next/*`, `favicon.ico` |
| 2 | A aplicação inicia com credenciais e path do pkm vindos de configuração externa | ✓ VERIFICADO | `src/lib/env.ts` valida PKM_PATH, AUTH_USERNAME, AUTH_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL via Zod 4; `src/lib/auth.ts` lê `env.AUTH_USERNAME` e `env.AUTH_PASSWORD`; nenhum valor hardcoded no repositório |
| 3 | Navegação e viewer passam a consumir o mesmo item lógico read-only com identidade estável | ✓ VERIFICADO | `src/lib/pkm/types.ts` define `Item` com `id` (path relativo estável); `ItemRepository` interface isola consumers da implementação; `FsItemRepository` implementa a interface; `src/app/page.tsx` consome `listTopics()` via interface |
| 4 | Existe fluxo documentado e reproduzível para subir a aplicação localmente | ✓ VERIFICADO | `docs/dev-setup.md` cobre todos os 5 env vars com exemplos, instrução `openssl rand -base64 32`, aviso de segurança sobre exposição pública, nota sobre índices em `process.cwd()` e troubleshooting |

**Score Verdades:** 4/4 verificadas

### Nota sobre `npm run test`

Apesar das 4 verdades de alto nível estarem verificadas, **1 de 11 testes falha**:

```
FAIL src/__tests__/env.test.ts > env validation > RUN-01: lança ZodError com mensagem clara quando PKM_PATH está ausente
Error: expect(received).toSatisfy()
Expected value to satisfy: [Function anonymous]
Received: [Error: process.exit unexpectedly called with "1"]
```

O teste expects que `import('../lib/env')` rejeite com um erro contendo "PKM_PATH é obrigatório". Porém `env.ts` usa `process.exit(1)` (comportamento fail-fast adequado para produção), que o Vitest intercepta como `process.exit unexpectedly called` — não uma rejeição de Promise com a mensagem esperada. O plano PLAN-02 listava `npm run test passa` como critério de sucesso, portanto este é um gap a fechar.

---

## Artefatos Verificados

| Artefato | Fornece | Status | Detalhes |
|----------|---------|--------|----------|
| `package.json` | Dependências pinnadas | ✓ VERIFICADO | `next@16.2.2`, `next-auth@5.0.0-beta.30`, `zod@4.3.6`, `gray-matter@4.0.3`; `tailwindcss@4.2.2` em devDependencies (válido); scripts `test`, `typecheck` presentes |
| `src/app/globals.css` | Design system tokens via @theme | ✓ VERIFICADO | Bloco `@theme` com 15 tokens de cor (`--color-surface`, `--color-on-surface`, `--color-tertiary`, etc.), tokens de tipografia (`--font-sans`, `--text-display-lg`, etc.) e elevation tokens; `@import "tailwindcss"` no topo |
| `src/lib/env.ts` | Validação Zod 4 fail-fast de env vars | ✓ VERIFICADO | Valida PKM_PATH, AUTH_USERNAME, AUTH_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL com mensagens de erro em pt-BR; usa `process.exit(1)` para fail-fast (comportamento correto para produção) |
| `src/lib/auth.ts` | Configuração NextAuth v5 | ✓ VERIFICADO | Exporta `handlers`, `auth`, `signIn`, `signOut`; credentials provider com `authorize()` comparando `env.AUTH_USERNAME/AUTH_PASSWORD`; `session: { strategy: "jwt" }`; páginas customizadas `signIn: "/login"` |
| `src/proxy.ts` | Proteção universal de rotas (middleware Next.js 16) | ✓ VERIFICADO | Exporta `auth as proxy`; Next.js 16 aceita `proxy.ts` como nome alternativo de middleware (confirmado via `isMiddlewareFilename` no source: `"middleware" | "proxy" | "src/middleware" | "src/proxy"`); matcher correto excluindo `api/auth`, `_next/*`, `favicon.ico` |
| `src/lib/pkm/item-repository.ts` | Interface ItemRepository — seam para v3 | ✓ VERIFICADO | Exporta interface com `listTopics()`, `listGroups()`, `getItem()`, `searchByName()` com JSDoc |
| `src/lib/pkm/fs-item-repository.ts` | Implementação filesystem do ItemRepository | ✓ VERIFICADO | `implements ItemRepository`; usa `env.PKM_PATH`; path traversal prevenido via `path.resolve + startsWith`; inferência de tipo por nome de arquivo (url_, .ext.md sidecar, não-.md); lê índices de `process.cwd()/index/` |
| `docs/dev-setup.md` | Guia reproduzível de setup local | ✓ VERIFICADO | Cobre os 5 env vars com exemplos, instrução `openssl rand -base64 32`, 2 avisos de segurança, nota sobre índices em raiz do ai-pkm, seção de troubleshooting |
| `src/app/api/auth/[...nextauth]/route.ts` | Handler NextAuth | ✓ VERIFICADO | Exporta `{ GET, POST }` de `handlers` |
| `src/app/api/pkm/topics/route.ts` | Endpoint de validação do read model | ✓ VERIFICADO | GET protegido por `auth()`; retorna `{ topics: Topic[] }` via `FsItemRepository().listTopics()` |
| `src/components/login-form.tsx` | Formulário de login shadcn/ui | ✓ VERIFICADO | `"use client"`; chama `signIn("credentials", { redirect: false })`; mensagem de erro genérica sem revelar campo; tokens DESIGN.md (sem `rounded-xl`, `text-slate-*`, `bg-blue-*`) |
| `src/app/(auth)/login/page.tsx` | Página /login | ✓ VERIFICADO | Server Component; verifica sessão e redireciona se autenticado; layout com tokens DESIGN.md |
| `src/app/page.tsx` | Home autenticada com smoke test do read model | ✓ VERIFICADO | Verifica sessão via `auth()` + redirect; instancia `FsItemRepository` e chama `listTopics()` — dados reais, não hardcoded |
| `src/lib/pkm/types.ts` | Tipos canônicos do domínio PKM | ✓ VERIFICADO | Exporta `Item`, `ItemType`, `ItemEstado`, `Topic`, `Subtopic`, `Group` |

---

## Verificação de Links Críticos (Key Links)

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `src/proxy.ts` | `src/lib/auth.ts` | `export { auth as proxy }` | ✓ WIRED | Linha 4: `export { auth as proxy } from "@/lib/auth"` — Next.js 16 reconhece `proxy.ts` como middleware |
| `src/lib/auth.ts authorize()` | env.AUTH_USERNAME / AUTH_PASSWORD | `env.AUTH_USERNAME` | ✓ WIRED | Linhas 17-22: `username === env.AUTH_USERNAME && password === env.AUTH_PASSWORD` |
| `src/components/login-form.tsx` | `/api/auth/[...nextauth]` | `signIn("credentials", ...)` | ✓ WIRED | Linha 22: `signIn("credentials", { username, password, redirect: false, callbackUrl })` |
| `src/lib/pkm/fs-item-repository.ts` | `env.PKM_PATH` | `path.resolve(env.PKM_PATH)` | ✓ WIRED | Linha 26: `this.pkmRoot = path.resolve(env.PKM_PATH)` |
| `src/lib/pkm/fs-item-repository.ts listTopics()` | `index/topicos.json` | `path.join(process.cwd(), 'index', 'topicos.json')` | ✓ WIRED | Linha 32: `const indexPath = path.join(this.indexDir, "topicos.json")` |
| `src/app/api/pkm/topics/route.ts` | `FsItemRepository` | `new FsItemRepository().listTopics()` | ✓ WIRED | Linha 16: `const repo = new FsItemRepository(); const topics = repo.listTopics()` |
| `docs/dev-setup.md` | `.env.example` | referência ao arquivo template | ✓ WIRED | Seção 2: `cp .env.example .env.local` — referência explícita |

---

## Rastreamento de Data-Flow (Nível 4)

| Artefato | Variável de Dados | Fonte | Produz Dados Reais | Status |
|----------|-------------------|-------|-------------------|--------|
| `src/app/page.tsx` | `topics` | `FsItemRepository().listTopics()` lê `index/topicos.json` | Sim — arquivo JSON real do repositório ai-pkm | ✓ FLOWING |
| `src/lib/auth.ts authorize()` | credenciais validadas | `env.AUTH_USERNAME`, `env.AUTH_PASSWORD` do process.env | Sim — lidos do ambiente em runtime | ✓ FLOWING |
| `src/app/api/pkm/topics/route.ts` | `topics` | `FsItemRepository().listTopics()` | Sim — dados reais do índice JSON | ✓ FLOWING |

---

## Spot-Checks Comportamentais

| Comportamento | Verificação | Resultado | Status |
|---------------|-------------|-----------|--------|
| `npm run build` passa | `npm run build 2>&1` | Compilação bem-sucedida; rota `ƒ Proxy (Middleware)` presente | ✓ PASS |
| `npm run typecheck` passa | `npm run typecheck 2>&1` | Sem erros de tipo | ✓ PASS |
| `npm run test` passa | `npm run test 2>&1` | 1 falha de 11 testes — env.test.ts RUN-01 | ✗ FAIL |
| `FsItemRepository` implementa `ItemRepository` | typecheck + teste ARC-04 | `const repo: ItemRepository = new FsItemRepository()` compila sem erro | ✓ PASS |
| Path traversal rejeitado | teste RUN-02 em item-repository.test.ts | `getItem("../../../etc/passwd")` lança `Error("Path traversal detectado")` | ✓ PASS |

---

## Cobertura de Requisitos

| Requisito | Plano | Descrição | Status | Evidência |
|-----------|-------|-----------|--------|-----------|
| ACC-01 | PLAN-02 | Interface web exige autenticação single-user em todos os ambientes | ✓ SATISFEITO | `src/proxy.ts` + matcher proteção universal; build confirma middleware ativo |
| ACC-02 | PLAN-02 | Login usa usuário e senha configurados por env vars, sem credenciais commitadas | ✓ SATISFEITO | `env.AUTH_USERNAME/AUTH_PASSWORD` em `authorize()`; `.env.example` apenas com placeholders; `.env.local` no `.gitignore` |
| ACC-03 | PLAN-02 | Usuário autenticado acessa a experiência completa sem modelo multiusuário | ✓ SATISFEITO | Sessão JWT com `strategy: "jwt"`; single-user por design; sem roles ou multiusuário |
| ARC-01 | PLAN-03 | Camada web consome pkm por modelo read-only sem tornar banco a fonte primária | ✓ SATISFEITO | `FsItemRepository` lê `index/topicos.json` e frontmatter; nenhum banco de dados introduzido |
| ARC-02 | PLAN-03 | Sistema define identidade estável de item lógico | ✓ SATISFEITO | `Item.id` = path relativo URL-decoded; estável enquanto arquivo não for renomeado |
| ARC-03 | PLAN-03 | Inbox, árvore, viewer e busca compartilham o mesmo modelo semântico de item | ✓ SATISFEITO | `src/lib/pkm/types.ts` define `Item` compartilhado; `ItemRepository` interface única |
| ARC-04 | PLAN-03 | Busca e indexação atrás de contratos internos preparados para troca na v3 | ✓ SATISFEITO | `ItemRepository` interface separa consumers da implementação; `searchByName` stub preserva seam |
| RUN-01 | PLAN-02 | Aplicação recebe configuração operacional por variáveis de ambiente | ✓ SATISFEITO | `env.ts` valida 5 vars obrigatórias via Zod 4; falha clara se ausentes (processo termina com mensagem legível) |
| RUN-02 | PLAN-03 | Aplicação assume pkm disponível por path ou volume montado externamente | ✓ SATISFEITO | `FsItemRepository` usa `env.PKM_PATH` via `path.resolve()`; nunca embutido no código |
| RUN-03 | PLAN-04 | Projeto documenta como rodar a aplicação em ambiente local/dev | ✓ SATISFEITO | `docs/dev-setup.md` reproduzível com todos os 5 env vars, exemplos e aviso de segurança |

---

## Anti-Padrões Encontrados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| `src/__tests__/env.test.ts` | 29 | Teste espera rejeição por ZodError mas implementação usa `process.exit(1)` | ⚠️ Aviso | Teste falha — `npm run test` retorna exit 1 |
| `src/lib/pkm/fs-item-repository.ts` | 92 | `searchByName()` retorna `[]` sempre | ℹ️ Info | Stub intencional (ARC-04 seam); não bloqueia nenhum objetivo da Fase 1 |

---

## Verificação Humana Necessária

### 1. Fluxo de Autenticação End-to-End

**Teste:** Configurar `.env.local` com 5 vars, rodar `npm run dev`, abrir http://localhost:3000
**Esperado:** Redireciona automaticamente para `/login`; credenciais corretas → home com lista de tópicos; credenciais erradas → mensagem genérica "Credenciais inválidas"; cookie `next-auth.session-token` com `httpOnly=true` no DevTools
**Por que humano:** Comportamento real do middleware `proxy.ts` em runtime, redirect de sessão e propriedades de cookie só podem ser confirmados no browser com Next.js rodando

### 2. Verificação Visual da Tela de Login

**Teste:** Abrir `/login` no browser e comparar com `reference/ui/screens/01-login/code.html`
**Esperado:** Card centralizado (max-w-[400px]), campos username e password com labels uppercase, botão "Sign In" com gradiente azul, sem bordas com raio excessivo (`rounded-xl`), paleta de cores do DESIGN.md (tons neutros, azul discreto)
**Por que humano:** Fidelidade visual ao Stitch só pode ser avaliada visualmente por humano

---

## Resumo dos Gaps

**1 gap bloqueante: `npm run test` falha** — o teste `RUN-01: lança ZodError com mensagem clara quando PKM_PATH está ausente` em `src/__tests__/env.test.ts` falha porque há uma incompatibilidade entre a implementação e a expectativa do teste:

- **Implementação (env.ts):** ao receber vars inválidas, chama `process.exit(1)` com mensagem de erro no stderr — comportamento correto para produção (fail-fast, o servidor não sobe)
- **Teste (env.test.ts):** espera que `import('../lib/env')` rejeite a Promise com um `Error` contendo "PKM_PATH é obrigatório" — o Vitest intercepta `process.exit(1)` como `Error: process.exit unexpectedly called with "1"`

**Solução recomendada:** Atualizar `env.test.ts` para mockar `process.exit` e verificar que foi chamado com `1` E que o stderr continha a mensagem de erro — sem alterar `env.ts` que tem o comportamento correto. Alternativamente, verificar o stderr capturado via `consoleSpy`. Não refatorar `env.ts` para lançar ZodError sem `process.exit` pois isso mudaria o comportamento de startup da aplicação.

Os 2 itens de verificação humana (fluxo auth end-to-end e visual da tela de login) são para confirmação do comportamento em runtime — os artefatos correspondentes existem, são substanciais e estão conectados.

---

_Verificado: 2026-04-08T07:45:00Z_
_Verificador: Claude (gsd-verifier)_
