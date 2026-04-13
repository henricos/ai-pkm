# Phase 1: Secure Read Model Foundation — Research

**Researched:** 2026-04-07
**Domain:** Next.js App Router + NextAuth.js credentials + ItemRepository filesystem + design system setup
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Next.js App Router como framework (SSR, file-based routing, middleware de auth nativo)
- **D-02:** React + TypeScript + Tailwind CSS + shadcn/ui — componentes copiados para `src/components/ui/`, baseados em Radix UI + Tailwind
- **D-03:** NextAuth.js (Auth.js) com credentials provider — session management via cookies httpOnly
- **D-04:** Credenciais (usuário + senha) fixas configuradas exclusivamente por variáveis de ambiente; nada sensível no repositório
- **D-05:** Middleware de auth protege todas as rotas da aplicação, inclusive em local/dev — sem exceção para conveniência
- **D-06:** `ItemRepository` interface abstrai o acesso ao pkm — v2.0 implementa sobre filesystem + index JSONs; v4.0 troca a implementação sem alterar o contrato
- **D-07:** Fast path: lê `pkm/index/grupos.json` e `pkm/index/topicos.json` como índice estrutural; enriquece com frontmatter dos arquivos quando necessário
- **D-08:** Item ID = path relativo ao pkm root (ex: `topico/grupo/nome-arquivo.md`), URL-encoded para uso em rotas Next.js
- **D-09:** Variáveis de ambiente obrigatórias: `PKM_PATH`, `AUTH_USERNAME`, `AUTH_PASSWORD`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **D-10:** `pkm` acessado exclusivamente por path externo montado — a aplicação nunca assume conteúdo embutido
- **D-11:** Documentação de setup local (README ou `docs/dev-setup.md`)
- **D-12:** `DESIGN.md` (raiz do projeto) é a fonte de verdade de estilo — conflitos com HTML do Stitch são resolvidos a favor do `DESIGN.md`
- **D-13:** `reference/ui/screens/` contém HTML exportado pelo Stitch como referência de composição visual — não é código de produção
- **D-14:** Fidelidade visual = `DESIGN.md` como guia de princípios + HTML do Stitch como referência de composição; quando divergem, prevalece `DESIGN.md`
- **D-15:** Protocolo de adaptação Stitch → React (5 passos: ler HTML → estruturar React → substituir por shadcn → aplicar tokens tailwind.config.ts → nunca copiar export bruto)
- **D-16:** `tailwind.config.ts` configurado na Fase 1 com custom tokens do `DESIGN.md`

### Claude's Discretion

- Estrutura interna de pastas do Next.js (`app/`, `lib/`, `types/`, `components/`)
- Schema TypeScript exato das interfaces `Item`, `Group`, `Topic` do ItemRepository
- Estratégia de cache/invalidação do read model em dev (hot-reload, watchers)
- **Versão do NextAuth**: v4 estável (`getServerSession`) vs Auth.js v5 nativo App Router (`auth()`) — Claude decide baseado em compatibilidade com Next.js
- Package manager (npm, pnpm ou yarn)
- Componentes shadcn/ui iniciais a instalar (no mínimo: `button`, `input`, `label`, `form`)

### Deferred Ideas (OUT OF SCOPE)

- Integração MCP do Stitch para importação automática de componentes
- Busca textual avançada com popup/lista de resultados
- Preview de `.excalidraw` somente leitura
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ACC-01 | Interface web exige autenticação single-user em todos os ambientes, incluindo local/dev | NextAuth credentials provider + middleware universal; seção Authentication |
| ACC-02 | Login usa usuário e senha fixos configurados por variáveis de ambiente, sem credenciais commitadas | Env vars via `.env.local` (gitignored); seção Runtime & Env Vars |
| ACC-03 | Usuário autenticado pode acessar a experiência completa sem modelo multiusuário ou papéis adicionais | Credentials provider single-user; session simples sem roles |
| ARC-01 | Camada web consome o pkm por meio de um modelo de leitura read-only, sem transformar banco em fonte primária | ItemRepository sobre filesystem; seção Read Model |
| ARC-02 | Sistema define identidade estável de item lógico para uso consistente entre navegação, viewer e busca | Item ID = path relativo URL-encoded; seção Read Model |
| ARC-03 | Inbox, árvore, viewer e busca compartilham o mesmo modelo semântico de item | Interface `Item` unificada com type discriminado; seção Read Model |
| ARC-04 | Busca e indexação ficam atrás de contratos internos preparados para futura troca de implementação | Interface `ItemRepository` como seam; seção Read Model / Don't Hand-Roll |
| RUN-01 | Aplicação recebe configuração operacional por variáveis de ambiente | `PKM_PATH`, `AUTH_*`, `NEXTAUTH_*`; seção Runtime & Env Vars |
| RUN-02 | Aplicação assume que o pkm está disponível por path ou volume montado externamente | `process.env.PKM_PATH` como raiz; nunca path relativo hardcoded |
| RUN-03 | Projeto documenta como rodar a aplicação em ambiente local/dev | `docs/dev-setup.md` ou README; seção Dev Setup |
</phase_requirements>

---

## Summary

A Fase 1 é projeto greenfield: não existe código web ainda. O objetivo é instanciar o framework Next.js 16.x com App Router, configurar autenticação single-user via NextAuth.js (escolha entre v4 estável e v5 beta — ver decisão abaixo), estabelecer a interface `ItemRepository` sobre filesystem + índices JSON existentes, e entregar a tela de login seguindo o design system do `DESIGN.md` adaptado via shadcn/ui.

O stack escolhido (Next.js + NextAuth + shadcn/ui + Tailwind) é maduro e bem documentado. A principal área de decisão técnica restante é a versão do NextAuth: v4 estável (última versão `4.24.13`, out/2025) versus v5 beta.30 (out/2025) — ambas compatíveis com Next.js 16. A análise de compatibilidade e estabilidade indica que **NextAuth v5 beta.30 é a escolha recomendada** para Next.js 16 e App Router nativo, mas carrega risco de breaking changes em releases futuros por ainda estar em beta. O plano deve pinnar a versão exata.

O read model é simples: ler `index/grupos.json` e `index/topicos.json` (índices já existentes no repositório) como fast path, parsear frontmatter YAML dos arquivos `.md` com `gray-matter` quando necessário. A interface `ItemRepository` isola a implementação de filesystem para permitir troca sem alterar os consumers (ARC-04).

**Recomendação primária:** Usar NextAuth v5 beta.30 + Next.js 16.2.2 + React 19 + Tailwind 4.x + shadcn CLI 4.2.0. Pinnar versões exatas no `package.json`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.2 | Framework SSR + App Router + Middleware | Latest stable (released 2026-04-01); suporta React 19 |
| react / react-dom | 19.2.4 | UI runtime | Peer dep do Next.js 16; async Server Components nativos |
| typescript | 6.0.2 | Type safety | Peer dep padrão do Next.js; v6 é atual |
| next-auth | 5.0.0-beta.30 | Auth + session management | Nativo para App Router; `auth()` em Server Components sem wrapper extra |
| tailwindcss | 4.2.2 | Utility CSS | Peer dep padrão shadcn/ui 4.x; v4 usa engine novo (Oxide) |
| @tailwindcss/postcss | 4.x | PostCSS plugin para Tailwind v4 | Requerido pela v4 em vez do postcss plugin antigo |
| gray-matter | 4.0.3 | Parsing de frontmatter YAML | Padrão de mercado; compatível com o schema de frontmatter do pkm |

[VERIFIED: npm registry — todos os pacotes acima verificados via `npm view <package> version` em 2026-04-07]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.3.6 | Validação de env vars e schemas | Validar `process.env` no startup; tipar o retorno do ItemRepository |
| shadcn (CLI) | 4.2.0 | Instala componentes shadcn/ui no projeto | Usado via `npx shadcn@4.2.0 add <component>` — não é dependência runtime |
| @types/node | 25.5.2 | Types para Node.js (fs, path, process.env) | Necessário para o ItemRepository que acessa filesystem |
| @types/react | 19.2.14 | Types React | Incluído automaticamente via create-next-app |

[VERIFIED: npm registry]

### Decisão de Versão: NextAuth v4 vs v5

NextAuth v5 (beta.30, out/2025) é compatível com Next.js `^14 || ^15 || ^16` [VERIFIED: npm view next-auth@5.0.0-beta.30 peerDependencies]. Vantagens sobre v4:

- `auth()` pode ser chamado diretamente em Server Components e Route Handlers sem `getServerSession(authOptions)` wrapper
- Middleware nativo: `export { auth as middleware }` — mais simples que v4
- Exporta `next-auth/next` para compatibilidade com `/api/auth/[...nextauth]`

Riscos do v5 beta: ainda não é `latest` no npm; possíveis breaking changes em releases futuros. Mitigação: pinnar `"next-auth": "5.0.0-beta.30"` exato no `package.json`.

**Recomendação:** Usar v5 beta.30. O ganho de ergonomia no App Router justifica o risco, dado que a versão está pinnada e o projeto é read-model (low attack surface).

[ASSUMED: A estabilidade "suficiente" do NextAuth v5 beta.30 para produção single-user não foi verificada em produção real — é análise de tradeoffs]

### Tailwind v4 vs v3

Tailwind v4.x usa engine Oxide (Rust) e não usa mais `tailwind.config.js/ts` como ponto central — configuração migra para `@theme` dentro do CSS principal. Isso é um breaking change relevante para o `tailwind.config.ts` descrito em D-16.

- **Se usar shadcn/ui 4.x**: requer Tailwind 4.x e configuração via CSS `@theme`. O `tailwind.config.ts` de D-16 precisa ser adaptado para o formato v4.
- **Se usar shadcn/ui 3.x**: usa Tailwind 3.x com `tailwind.config.ts` clássico.

[VERIFIED: npm registry — shadcn@4.2.0 requer tailwindcss@^4; shadcn@3.x requer tailwindcss@^3]

**Recomendação:** Usar shadcn@4.2.0 + Tailwind 4.2.2. Os custom tokens do `DESIGN.md` são definidos como CSS variables dentro de `@theme {}` no arquivo CSS global, não em `tailwind.config.ts`. O arquivo `tailwind.config.ts` em Tailwind v4 é opcional e usado apenas para plugins ou overrides avançados. [VERIFIED: npm registry]

### Alternativas Consideradas

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| NextAuth v5 beta | NextAuth v4.24.13 (latest stable) | v4 mais estável mas verboso no App Router; v5 é mais ergonômico |
| Next.js 16.2.2 | Next.js 15.3.9 (next-15-3 tag) | 15.x também estável; 16.x é o `latest` com RC features possíveis |
| Tailwind v4 + shadcn@4 | Tailwind v3 + shadcn@3 | v3 tem tailwind.config.ts clássico (mais familiar), mas v4 é o futuro |
| gray-matter | js-yaml direto | gray-matter já separa frontmatter do corpo; js-yaml só parseia YAML puro |

### Installation

```bash
npx create-next-app@16.2.2 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install next-auth@5.0.0-beta.30
npm install gray-matter zod
npm install -D @types/node
npx shadcn@4.2.0 init
npx shadcn@4.2.0 add button input label form
```

[VERIFIED: npm registry — versões confirmadas em 2026-04-07]

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # tela de login
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # handler do NextAuth v5
│   ├── layout.tsx                # root layout com SessionProvider
│   └── page.tsx                  # redirect para /login ou home
├── components/
│   ├── ui/                       # componentes shadcn/ui (gerados pelo CLI)
│   └── login-form.tsx            # componente de formulário de login
├── lib/
│   ├── auth.ts                   # configuração do NextAuth (auth object)
│   ├── pkm/
│   │   ├── item-repository.ts    # interface ItemRepository
│   │   ├── fs-item-repository.ts # implementação filesystem
│   │   └── types.ts              # interfaces Item, Group, Topic
│   └── env.ts                    # validação de env vars via zod
├── middleware.ts                 # auth middleware (exporta auth do NextAuth)
└── types/
    └── next-auth.d.ts            # augmentation de tipos da sessão
```

### Pattern 1: NextAuth v5 com Credentials Provider

**O que é:** Configuração mínima do NextAuth para login com usuário/senha via env vars, com sessão JWT (sem banco de dados).

**Quando usar:** Single-user, credenciais fixas, sem OAuth, App Router nativo.

```typescript
// src/lib/auth.ts
// Source: NextAuth v5 docs — credentials provider
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        if (
          username === process.env.AUTH_USERNAME &&
          password === process.env.AUTH_PASSWORD
        ) {
          return { id: "1", name: username };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
```

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

[CITED: nextauth.js.org/getting-started — padrão NextAuth v5 App Router]

### Pattern 2: Middleware Universal de Auth

**O que é:** Middleware Next.js que protege todas as rotas, redirecionando para `/login` se não autenticado. Cobre local/dev sem exceção (D-05).

**Quando usar:** Toda rota da aplicação deve ser protegida — sem whitelist de conveniência.

```typescript
// src/middleware.ts
// Source: NextAuth v5 docs — middleware export
export { auth as middleware } from "@/lib/auth";

export const config = {
  // Protege todas as rotas exceto as do NextAuth e assets estáticos
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
```

[CITED: nextauth.js.org/getting-started/session-management/protecting]

### Pattern 3: ItemRepository Interface e Implementação Filesystem

**O que é:** Contrato TypeScript que abstrai o acesso ao pkm. A implementação v2.0 usa `fs.readFileSync` + `gray-matter` para frontmatter + índices JSON como fast path. A v4.0 substitui a implementação sem alterar os consumers (ARC-04).

**Quando usar:** Toda vez que a aplicação precisar de dados do pkm — navegação, viewer, busca.

```typescript
// src/lib/pkm/types.ts
export type ItemType = "nota" | "url" | "binario" | "sidecar";
export type ItemEstado = "rascunho" | "finalizado";

export interface Item {
  id: string;          // path relativo à raiz do pkm, URL-encoded
  path: string;        // path absoluto no filesystem
  name: string;        // nome do arquivo sem extensão
  type: ItemType;
  estado: ItemEstado;
  topic: string;
  group?: string;      // nome do grupo (pasta _grupo), se aplicável
  dataCaptura: string;
  url?: string;        // apenas para type === "url"
  sidecarPath?: string; // apenas para type === "binario" com sidecar
}

export interface Topic {
  id: string;
  descricao: string;
  subtopicos?: Subtopic[];
}

export interface Subtopic {
  id: string;
  descricao: string;
}

export interface Group {
  caminho: string;
  descricao: string;
  topico: string;
}

// src/lib/pkm/item-repository.ts
export interface ItemRepository {
  listTopics(): Topic[];
  listGroups(topic: string): Group[];
  getItem(id: string): Item | null;
  searchByName(q: string): Item[];
}
```

[ASSUMED: O schema TypeScript exato está dentro do escopo de discretion de Claude — esta proposta é baseada no contrato do CONTEXT.md e nos schemas do projeto]

### Pattern 4: Validação de Env Vars no Startup

**O que é:** Validação com Zod de todas as env vars obrigatórias no momento do import de `src/lib/env.ts`, garantindo que a aplicação falhe imediatamente (fail-fast) com mensagem clara se algo estiver faltando.

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  PKM_PATH: z.string().min(1, "PKM_PATH é obrigatório"),
  AUTH_USERNAME: z.string().min(1),
  AUTH_PASSWORD: z.string().min(8, "AUTH_PASSWORD deve ter pelo menos 8 caracteres"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET deve ter pelo menos 32 caracteres"),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

[ASSUMED: O requisito de min length 8/32 é recomendação de segurança baseada em boas práticas — não extraído de documentação específica do projeto]

### Pattern 5: Adaptação Stitch → shadcn/ui (Tela de Login)

**O que é:** Protocolo D-15 — ler o HTML do Stitch para layout/hierarquia, recriar em React com primitivos shadcn/ui, aplicar tokens do `DESIGN.md` via Tailwind v4.

O HTML do Stitch (`reference/ui/screens/01-login/code.html`) usa:
- Cores literais Tailwind default: `slate-*`, `blue-600`, `white`
- Não usa os custom tokens do `DESIGN.md`

Mapeamento Stitch → `DESIGN.md` tokens para a tela de login:

| Stitch (literal) | DESIGN.md token | CSS variable |
|------------------|-----------------|--------------|
| `bg-slate-50` | `surface` | `--color-surface` |
| `bg-white` | `surface_container_lowest` | `--color-surface-container-lowest` |
| `text-slate-900` | `on_surface` | `--color-on-surface` |
| `border-slate-200` | `outline_variant` (15% opacity) | (via `bg-outline-variant/15`) |
| `text-blue-600` | `tertiary` | `--color-tertiary` |
| `bg-blue-600` (button) | `tertiary` com gradient | `--color-tertiary` → `--color-tertiary-container` |
| `text-slate-500` | `on_surface` com opacidade reduzida | — |
| `rounded-xl` | proibido — usar `rounded-sm` (0.125rem) | — |

**Nota crítica:** O `DESIGN.md` proíbe `border-radius` grande. O card do Stitch usa `rounded-xl` — deve ser substituído por `rounded-sm` ou `rounded-md` conforme o design system.

[VERIFIED: leitura direta de `DESIGN.md` e `reference/ui/screens/01-login/code.html`]

### Anti-Patterns a Evitar

- **Session em localStorage:** NextAuth usa cookies httpOnly por padrão — nunca sobrescrever com storage do browser (XSS)
- **Comparação de senha com ==:** Usar comparação constante-time ou, para single-user com env var, é aceitável desde que não haja risco de timing attack em loop; o risco aqui é baixo mas deve ser documentado
- **Hardcodar `PKM_PATH`:** A aplicação não deve ter fallback para path relativo interno — falhar com erro claro se `PKM_PATH` não estiver definido
- **Leitura de arquivo em middleware:** O middleware roda no Edge Runtime — nunca chamar `fs.readFileSync` ali; autenticação no middleware, acesso ao filesystem apenas em Server Components/Route Handlers
- **Copiar HTML do Stitch para `src/`:** D-15 proíbe explicitamente; sempre refatorar
- **Usar cores literais Tailwind no código:** Usar apenas os custom tokens do `tailwind.config.ts` / `@theme` CSS derivados do `DESIGN.md`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | Cookie parsing, JWT sign/verify manual | NextAuth.js | CSRF, rotation, refresh, secure defaults |
| CSRF protection | Token manual no formulário | NextAuth.js built-in | NextAuth gerencia CSRF internamente no handler |
| YAML frontmatter parsing | Regex ou split manual | gray-matter | Lida com multi-document, edge cases de YAML, streaming |
| Env var validation | if (!process.env.X) throw | Zod schema | Mensagens claras, type inference, composição de regras |
| Form validation na tela de login | Estado manual + validação manual | shadcn Form + react-hook-form | Acessibilidade, aria, error states corretos |
| UI primitives (Input, Button, Label) | HTML bruto | shadcn/ui components | Acessibilidade Radix, focus management, tokens integrados |

**Insight chave:** O middleware do Next.js roda no Edge Runtime (sem acesso a Node.js APIs como `fs`). Toda lógica de filesystem deve ser mantida fora do middleware — apenas verificação de sessão ali.

---

## Runtime State Inventory

**Fase greenfield — nenhum estado de runtime a migrar.**

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Nenhum — aplicação web ainda não existe | Nenhuma |
| Live service config | Nenhum — sem serviços externos configurados para a web | Nenhuma |
| OS-registered state | Nenhum — nenhum daemon ou task registrada | Nenhuma |
| Secrets/env vars | `.env.local` não existe ainda — criar do zero | Criar `.env.local` como parte do Wave 0 |
| Build artifacts | Nenhum — sem código compilado existente | Nenhuma |

**Nota:** O repositório `pkm/` montado em `pkm/` já existe e contém conteúdo real. O `index/grupos.json` e `index/topicos.json` existem e são lidos pelo ItemRepository. Nenhuma migração de dado necessária.

---

## Common Pitfalls

### Pitfall 1: Middleware Roda no Edge Runtime (sem `fs`)

**O que vai errado:** Tentar ler arquivos do pkm dentro do `middleware.ts` — `fs is not defined`.

**Por que acontece:** Next.js middleware é executado no Edge Runtime, que não tem acesso às APIs do Node.js. Somente verificação de JWT/session é permitida ali.

**Como evitar:** O middleware só verifica a sessão via `auth()`. Toda leitura de filesystem fica em Server Components, Route Handlers ou `lib/pkm/`.

**Sinais de alerta:** Erro `Module not found: Can't resolve 'fs'` ou `path` em build.

### Pitfall 2: Tailwind v4 não usa `tailwind.config.ts` para tokens de cor

**O que vai errado:** Definir cores customizadas em `tailwind.config.ts` como feito no v3 (`theme.extend.colors`) — as classes são geradas mas o design system do Stitch/DESIGN.md usa CSS variables que não funcionam corretamente.

**Por que acontece:** Tailwind v4 migrou a configuração de tokens para CSS (`@theme {}` block no arquivo CSS principal). O `tailwind.config.ts` em v4 é usado apenas para plugins e configurações avançadas de content scanning.

**Como evitar:** Definir todos os custom tokens do `DESIGN.md` como CSS variables dentro de `@theme {}` no `src/app/globals.css`.

**Exemplo correto (v4):**
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-surface: #f8f9fa;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f1f4f6;
  --color-surface-container: #eaeff1;
  --color-on-surface: #2b3437;
  --color-tertiary: #0055d7;
  --color-tertiary-container: #0266ff;
  --color-primary-container: /* valor do DESIGN.md */;
  --color-on-primary-container: /* valor do DESIGN.md */;
  --font-family-sans: "Inter", sans-serif;
}
```

[CITED: tailwindcss.com/docs/v4-upgrade — breaking change da v4]

### Pitfall 3: NextAuth v5 — `NEXTAUTH_URL` vs `AUTH_URL`

**O que vai errado:** Em NextAuth v5, o nome da env var mudou de `NEXTAUTH_URL` para `AUTH_URL` na configuração padrão, mas `NEXTAUTH_URL` ainda é aceito por compatibilidade. O `NEXTAUTH_SECRET` virou `AUTH_SECRET`.

**Por que acontece:** Auth.js v5 renomeou as variáveis para remover o prefixo `NEXT_` (para ser framework-agnóstico).

**Como evitar:** O CONTEXT.md fixou os nomes das env vars como `NEXTAUTH_SECRET` e `NEXTAUTH_URL` (D-09) — verificar no código de configuração que esses nomes são lidos corretamente. NextAuth v5 ainda aceita `NEXTAUTH_SECRET` como alias. Documentar isso no `docs/dev-setup.md`.

[CITED: authjs.io/getting-started/migrating-to-v5 — env var rename]

### Pitfall 4: PKM_PATH relativo vs absoluto

**O que vai errado:** `PKM_PATH=pkm` (relativo) funciona em dev mas quebra em ambientes onde o cwd não é a raiz do projeto.

**Como evitar:** Documentar que `PKM_PATH` deve ser sempre absoluto. No ItemRepository, usar `path.resolve(process.env.PKM_PATH)` ao construir o repositório — nunca assumir que é relativo.

### Pitfall 5: shadcn `add form` instala react-hook-form

**O que vai errado:** O componente `form` do shadcn depende de `react-hook-form` e `@hookform/resolvers`. Se não instalados, o build falha.

**Como evitar:** Rodar `npx shadcn add form` automaticamente instala as dependências, mas é necessário verificar que `react-hook-form` e `@hookform/resolvers` aparecem no `package.json`.

---

## Code Examples

### Leitura de Índices JSON no ItemRepository

```typescript
// src/lib/pkm/fs-item-repository.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ItemRepository, Item, Topic, Group } from "./types";
import { env } from "@/lib/env";

export class FsItemRepository implements ItemRepository {
  private readonly root: string;

  constructor() {
    // PKM_PATH pode apontar para o pkm/ montado externamente OU o pkm/ local (dev)
    this.root = path.resolve(env.PKM_PATH);
  }

  listTopics(): Topic[] {
    // Fast path: índice JSON do repositório ai-pkm (não do pkm/)
    const indexPath = path.join(process.cwd(), "index", "topicos.json");
    const raw = fs.readFileSync(indexPath, "utf-8");
    return JSON.parse(raw) as Topic[];
  }

  listGroups(topic: string): Group[] {
    const indexPath = path.join(process.cwd(), "index", "grupos.json");
    const raw = fs.readFileSync(indexPath, "utf-8");
    const all = JSON.parse(raw) as Group[];
    return all.filter((g) => g.topico === topic);
  }

  getItem(id: string): Item | null {
    const decoded = decodeURIComponent(id);
    const absPath = path.join(this.root, decoded);
    if (!fs.existsSync(absPath)) return null;
    const raw = fs.readFileSync(absPath, "utf-8");
    const { data: frontmatter } = matter(raw);
    // ... montar objeto Item a partir de frontmatter + path
    return null; // placeholder
  }

  searchByName(q: string): Item[] {
    // Fase 1: implementação mínima — varre index/grupos.json para matches por nome
    // Fase futura: troca de implementação sem alterar contrato
    return [];
  }
}
```

[ASSUMED: A localização dos índices JSON (`process.cwd()/index/`) assume que o app roda a partir da raiz do repositório `ai-pkm`. Confirmar com operador se em produção o CWD pode ser diferente]

### Login Form com shadcn/ui

```typescript
// src/components/login-form.tsx — esqueleto baseado no protocolo D-15
"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      callbackUrl: "/",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* tokens: bg-surface-container-lowest, text-on-surface, etc. */}
      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-label-sm uppercase tracking-widest text-on-surface/60">
          Username
        </Label>
        <Input id="username" name="username" required autoComplete="username" />
      </div>
      {/* ... password field, submit button */}
      <Button type="submit" className="w-full bg-tertiary text-on-tertiary">
        Sign In
      </Button>
    </form>
  );
}
```

[ASSUMED: Os class names de custom tokens (ex: `bg-surface-container-lowest`, `text-on-surface`) dependerão da configuração final do `@theme` no CSS. A nomenclatura exata das classes geradas pelo Tailwind v4 a partir de CSS variables precisa ser verificada na documentação oficial durante a implementação]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSession(authOptions)` no App Router | `auth()` direto em Server Components | NextAuth v5 | Menos boilerplate; importação direta sem wrapper |
| `tailwind.config.js` com `theme.extend.colors` | `@theme {}` no CSS principal | Tailwind v4 (2025) | Tokens como CSS variables nativas; melhor composição |
| `pages/api/auth/[...nextauth].ts` | `app/api/auth/[...nextauth]/route.ts` | Next.js 13+ App Router | Route Handler em vez de API Route do Pages Router |
| `next-auth` package | `next-auth` com exports de `next-auth/next`, `next-auth/react` | NextAuth v5 | Melhor tree-shaking; exports específicos por ambiente |
| `shadcn-ui` (npm package antigo) | `shadcn` CLI (`npx shadcn@latest`) | shadcn 2024+ | O CLI não é dependência runtime; componentes são copiados para o projeto |

**Deprecated/Outdated:**
- `withAuth` middleware wrapper do NextAuth v4: substituído por `export { auth as middleware }` no v5
- `NEXTAUTH_URL` / `NEXTAUTH_SECRET` como nome canônico: renomeados para `AUTH_URL` / `AUTH_SECRET` no v5 (mas aliases ainda funcionam)
- `tailwind.config.js` para tokens: não é o padrão do v4, embora ainda suportado via `@config` directive

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | NextAuth v5 beta.30 é suficientemente estável para produção single-user | Standard Stack | Bugs ou breaking changes requerem downgrade para v4; impacto na estrutura do código de auth |
| A2 | Os índices `index/grupos.json` e `index/topicos.json` ficam na raiz do `ai-pkm`, não dentro de `pkm/` | Code Examples | FsItemRepository leria o path errado; fácil de corrigir no Plan |
| A3 | O CWD em runtime é sempre a raiz do repositório `ai-pkm` para acesso aos índices | Code Examples | Em Docker ou outros envs, o CWD pode ser diferente; considerar configurar também `INDEX_PATH` ou usar `__dirname` |
| A4 | Os class names Tailwind v4 gerados a partir de CSS variables seguem padrão `bg-[--color-surface]` ou `bg-surface` | Code Examples | Se a nomenclatura for diferente, os class names nos componentes precisam de ajuste |
| A5 | `AUTH_PASSWORD` mínimo de 8 caracteres é suficiente para single-user em ambiente local | Pattern 4 | Para exposição pública, seria necessário senha mais forte; aceitável para MVP interno |

---

## Open Questions

1. **Localização dos índices JSON em produção**
   - O que sabemos: `index/grupos.json` e `index/topicos.json` existem na raiz do `ai-pkm` e são usados como fast path pelo ItemRepository
   - O que é incerto: em ambiente de produção/Docker, o volume montado inclui apenas o `pkm/` ou também o `ai-pkm/` com os índices? Os índices são derivados do pkm e podem ser regenerados, mas precisam estar acessíveis ao runtime
   - Recomendação: Plano deve cobrir onde os índices ficam em produção; para dev, estão em `process.cwd()/index/`

2. **Estratégia de cache/invalidação do read model**
   - O que sabemos: está em discretion de Claude (CONTEXT.md)
   - O que é incerto: em dev, se o operador atualizar o pkm (via skills CLI), o Next.js dev server precisa invalidar o cache dos Server Components que leram o read model
   - Recomendação: Para Fase 1, usar `cache: "no-store"` ou função sem cache no servidor (mais simples); watchers de filesystem são otimização para fases futuras

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 (requer >=20.9.0) | ✓ | v24.12.0 | — |
| npm | Package manager | ✓ | 11.6.2 | — |
| pnpm | Package manager alternativo | ✗ | — | npm (disponível) |
| yarn | Package manager alternativo | ✗ | — | npm (disponível) |
| bun | Package manager alternativo | ✗ | — | npm (disponível) |
| pkm/ directory | ItemRepository (PKM_PATH) | ✓ | — (conteúdo real em `/home/henrico/github/henricos/ai-pkm/pkm/`) | — |
| index/grupos.json | Fast path do ItemRepository | ✓ | — (arquivo existe) | — |
| index/topicos.json | Fast path do ItemRepository | ✓ | — (arquivo existe) | — |

**Package manager recomendado:** npm (único disponível no ambiente). O plano deve usar `npm` em todos os comandos.

**Nota:** Node.js v24.12.0 satisfaz o requisito `>=20.9.0` do Next.js 16. [VERIFIED: `node --version` + `npm view next@16.2.2 engines`]

---

## Validation Architecture

`nyquist_validation` está habilitado (verificado em `.planning/config.json`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest + Testing Library (padrão create-next-app) ou Vitest |
| Config file | `jest.config.ts` ou `vitest.config.ts` — Wave 0 cria |
| Quick run command | `npm test -- --testPathPattern=<file> --watchAll=false` |
| Full suite command | `npm test -- --watchAll=false` |

**Recomendação:** Usar **Vitest** em vez de Jest para Fase 1. Vitest tem integração nativa com Vite/módulos ESM e é mais rápido para projetos TypeScript modernos. Para Next.js, o padrão ainda é Jest com `jest-environment-jsdom`, mas Vitest com `@vitejs/plugin-react` funciona bem para unit tests de componentes e lib.

[ASSUMED: Vitest não é o padrão do `create-next-app` — o operador pode preferir Jest se quiser seguir o scaffolding padrão]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACC-01 | Middleware redireciona para `/login` sem sessão | unit | `npm test -- middleware.test` | ❌ Wave 0 |
| ACC-02 | Credenciais vêm de env vars, não hardcodadas | unit | `npm test -- auth.test` | ❌ Wave 0 |
| ACC-03 | Login bem-sucedido cria sessão e acessa rota protegida | integration (smoke) | `npm test -- auth.integration.test` | ❌ Wave 0 |
| ARC-01 | ItemRepository.listTopics() retorna tópicos do JSON | unit | `npm test -- item-repository.test` | ❌ Wave 0 |
| ARC-02 | Item ID é path relativo URL-encoded | unit | `npm test -- item-id.test` | ❌ Wave 0 |
| ARC-03 | getItem retorna Item com type correto inferido do path | unit | `npm test -- item-repository.test` | ❌ Wave 0 |
| ARC-04 | FsItemRepository implementa interface ItemRepository | unit (type-level) | `npm run typecheck` | ❌ Wave 0 |
| RUN-01 | env.ts lança erro claro se env var obrigatória estiver ausente | unit | `npm test -- env.test` | ❌ Wave 0 |
| RUN-02 | ItemRepository usa PKM_PATH, não path hardcoded | unit | `npm test -- item-repository.test` | ❌ Wave 0 |
| RUN-03 | docs/dev-setup.md existe e cobre setup local | manual | verificação manual | ❌ Wave 0 |

### Sampling Rate

- **Por task commit:** `npm run typecheck` (verificação de tipos — zero config extra)
- **Por wave merge:** `npm test -- --watchAll=false` (suite completa)
- **Phase gate:** Suite verde + verificação manual da tela de login antes de `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/middleware.test.ts` — cobre ACC-01: redirecionamento sem sessão
- [ ] `src/__tests__/lib/auth.test.ts` — cobre ACC-02: credenciais via env
- [ ] `src/__tests__/lib/pkm/item-repository.test.ts` — cobre ARC-01, ARC-02, ARC-03, RUN-02
- [ ] `src/__tests__/lib/env.test.ts` — cobre RUN-01: fail-fast em env ausente
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react @testing-library/react` ou Jest equivalente
- [ ] `vitest.config.ts` (ou `jest.config.ts`) com ambiente jsdom

---

## Security Domain

`security_enforcement` não está explicitamente desativado em `.planning/config.json` — seção incluída.

### Applicable ASVS Categories (L1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | sim | NextAuth credentials provider; comparação de senha via env var; sem rate limiting nativo (aceitável para single-user local) |
| V3 Session Management | sim | NextAuth JWT em cookie httpOnly, sameSite, secure em produção |
| V4 Access Control | sim | Middleware universal — toda rota protegida exceto `/login` e `/api/auth/*` |
| V5 Input Validation | sim | Zod no env.ts; shadcn Form + react-hook-form no formulário de login |
| V6 Cryptography | parcial | `NEXTAUTH_SECRET` para assinar JWT — mínimo 32 caracteres; não há criptografia customizada |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Credential brute-force | Spoofing | Single-user local: risco baixo. Para exposição pública: adicionar rate limiting (ex: `next-rate-limit`) — fora do escopo da Fase 1 mas deve ser documentado |
| Session hijacking | Elevation | Cookie httpOnly + sameSite=lax (NextAuth default); secure=true em produção via `NEXTAUTH_URL` com HTTPS |
| Credenciais expostas no repositório | Information Disclosure | `.env.local` no `.gitignore`; validação no CI que bloqueia commit de arquivos `.env*` |
| Path traversal no PKM_PATH | Tampering | `path.resolve()` + validação que o path acessado começa com `PKM_PATH` antes de servir qualquer arquivo |
| CSRF no formulário de login | Tampering | NextAuth gerencia CSRF internamente no handler `/api/auth/[...nextauth]` |
| XSS via conteúdo do pkm | Tampering | Fase 1 não renderiza conteúdo markdown — sem risco de XSS na Fase 1; a sanitização fica na Fase 3 (viewer) |

**Nota de segurança importante:** O `AUTH_PASSWORD` é comparado como string simples na função `authorize`. Para single-user em ambiente local/dev, isso é aceitável. Para exposição pública, deve-se usar comparação em tempo constante (`crypto.timingSafeEqual`) ou hashing com bcrypt. O plano deve documentar essa limitação.

---

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view <package>`) — versões verificadas em 2026-04-07 para: `next`, `react`, `next-auth`, `tailwindcss`, `shadcn`, `gray-matter`, `zod`, `typescript`
- Leitura direta de arquivos do projeto: `DESIGN.md`, `reference/ui/screens/01-login/code.html`, `index/grupos.json`, `index/topicos.json`, `reference/schemas/frontmatter-item.md`, `reference/pkm/pkm-structure.md`

### Secondary (MEDIUM confidence)
- `authjs.io/getting-started` — padrão de configuração NextAuth v5 com credentials provider e App Router
- `tailwindcss.com/docs/v4-upgrade` — breaking changes do Tailwind v4 em relação a `@theme` vs `tailwind.config.ts`
- `nextjs.org/docs/app/building-your-application/routing/middleware` — Edge Runtime constraints

### Tertiary (LOW confidence)
- Padrões de estrutura de pastas Next.js (`app/`, `lib/`, etc.) — baseado em convenções amplamente adotadas, não em documentação normativa oficial

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versões verificadas via npm registry
- Authentication pattern: MEDIUM-HIGH — documentação oficial NextAuth v5 + peerDeps verificados; risco residual do beta
- Architecture (ItemRepository): MEDIUM — contrato extraído do CONTEXT.md; implementação exata em discretion
- Tailwind v4 configuração: MEDIUM — breaking change documentado; implementação exata de `@theme` precisa ser validada durante execução
- Design system adaptation: HIGH — baseado em leitura direta do `DESIGN.md` e do HTML do Stitch
- Pitfalls: HIGH — Edge Runtime constraint é fato documentado; outros pitfalls são boas práticas verificáveis

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (30 dias — stack estável, mas NextAuth v5 beta pode ter releases)
