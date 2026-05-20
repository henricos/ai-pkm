# Implementar Identity Provider Keycloak (OIDC)

## Contexto

O `ai-pkm` usa hoje NextAuth.js v5 com provider `Credentials` (username + password via env vars).
O objetivo é substituir por autenticação via Keycloak OIDC, eliminando o login local e integrando
o app ao SSO do ecossistema de apps pessoais.

**Guia de setup do Keycloak:** `~/local-dev/keycloak-setup-caramello.md`

---

## Decisões de arquitetura

- **Sem página de login local:** o app redireciona direto para `id.caramello.cloud`
- **Controle de acesso:** dois níveis
  - Realm: só usuários criados manualmente no Keycloak podem logar (auto-registro bloqueado)
  - Client Role: apenas usuários com o role `user` no client `ai-pkm` passam
- **Tabela `users` (futura, quando migrar para DB):**
  ```sql
  CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    sub        TEXT UNIQUE NOT NULL,  -- JWT sub, imutável
    email      TEXT,
    name       TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
  Todas as outras tabelas usam `users.id` (int) como FK. O `sub` é só para lookup no login.
- **Hoje (single-user, sem DB):** app não precisa de tabela de usuários; a sessão do NextAuth já carrega `sub` e `email`

---

## Pré-requisitos

- [ ] Keycloak configurado conforme Onda 1 do guia
- [ ] Client `ai-pkm` criado no Keycloak com Client Role `user`
- [ ] Client ID, Client Secret e Issuer URL disponíveis

---

## Variáveis de ambiente

| Variável | Ação | Valor de exemplo |
|---|---|---|
| `AUTH_USERNAME` | **REMOVER** | — |
| `AUTH_PASSWORD` | **REMOVER** | — |
| `KEYCLOAK_CLIENT_ID` | **ADICIONAR** | `ai-pkm` |
| `KEYCLOAK_CLIENT_SECRET` | **ADICIONAR** | (do painel Keycloak → Client → Credentials) |
| `KEYCLOAK_ISSUER` | **ADICIONAR** | `https://id.caramello.cloud/realms/caramello` |
| `NEXTAUTH_SECRET` | manter | string aleatória ≥ 32 chars |
| `NEXTAUTH_URL` | manter | `https://pkm.caramello.cloud/pkm` |

---

## Mudanças no código

### 1. `src/lib/env.ts`

Remover as entradas `AUTH_USERNAME` e `AUTH_PASSWORD` do schema Zod.
Adicionar no lugar:

```typescript
KEYCLOAK_CLIENT_ID: z
  .string({ error: (iss) => (iss.input === undefined ? "KEYCLOAK_CLIENT_ID é obrigatório" : undefined) })
  .min(1, "KEYCLOAK_CLIENT_ID é obrigatório"),
KEYCLOAK_CLIENT_SECRET: z
  .string({ error: (iss) => (iss.input === undefined ? "KEYCLOAK_CLIENT_SECRET é obrigatório" : undefined) })
  .min(1, "KEYCLOAK_CLIENT_SECRET é obrigatório"),
KEYCLOAK_ISSUER: z
  .string({ error: (iss) => (iss.input === undefined ? "KEYCLOAK_ISSUER é obrigatório" : undefined) })
  .url("KEYCLOAK_ISSUER deve ser uma URL válida"),
```

### 2. `src/lib/auth.ts`

Substituir o arquivo inteiro:

```typescript
import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { env } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  logger: {
    error: (error) => console.error(`[auth] ${error.name}: ${error.message}`),
  },
  trustHost: true,
  providers: [
    Keycloak({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      issuer: env.KEYCLOAK_ISSUER,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        // sub vindo do Keycloak — imutável, usar como chave externa em users
        token.sub = account.providerAccountId
        // resource_access está no access token (não no ID token)
        // decodifica sem verificar (verificação já foi feita pelo NextAuth)
        if (account.access_token) {
          try {
            const payload = JSON.parse(
              Buffer.from(account.access_token.split(".")[1], "base64url").toString()
            )
            token.resource_access = payload.resource_access
          } catch {
            // access token não é JWT (opaque) — ignorar, controle fica só no realm
          }
        }
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub as string
      // Verifica Client Role "user" no client ai-pkm
      const clientRoles =
        (token.resource_access as any)?.[env.KEYCLOAK_CLIENT_ID]?.roles ?? []
      if (!clientRoles.includes("user")) {
        // Usuário autenticado no realm mas sem acesso a este app
        throw new Error("Sem permissão para este app")
      }
      return session
    },
  },
});
```

> **Nota sobre `resource_access`:** Este campo fica no access token, não no ID token.
> O código acima decodifica o access token para extraí-lo. Se preferir uma abordagem
> mais simples (e confiar no controle do realm como camada única), pode remover o bloco
> `resource_access` e o check no `session` callback — o Keycloak já bloqueia usuários
> não cadastrados no realm antes de emitir qualquer token.

### 3. `.env.example`

Conteúdo atualizado:

```dotenv
# Obrigatórias
PKM_PATH=/absolute/path/to/your/pkm
NEXTAUTH_SECRET=string_aleatoria_minimo_32_chars
NEXTAUTH_URL=http://localhost:3000/pkm
APP_BASE_PATH=/pkm

# Keycloak OIDC
KEYCLOAK_CLIENT_ID=ai-pkm
KEYCLOAK_CLIENT_SECRET=client_secret_do_painel_keycloak
KEYCLOAK_ISSUER=https://id.caramello.cloud/realms/caramello

# Opcionais
# Necessária em produção; em dev local pode usar o fallback para ./index
# INDEX_PATH=/absolute/path/to/your/index

# Use apenas se a app não iniciar a partir da raiz versionada do projeto
# APP_ROOT_PATH=/absolute/path/to/your/app-root
```

### 4. `src/app/(shell)/layout.tsx`

Trocar o redirect para `/login` por redirect direto para o Keycloak:

```typescript
// Antes:
if (!session) {
  redirect("/login");
}

// Depois:
if (!session) {
  await signIn("keycloak");
}
```

Adicionar o import de `signIn` no topo do arquivo:

```typescript
import { auth, signIn } from "@/lib/auth";
```

> `signIn("keycloak")` em Server Component lança um `NEXT_REDIRECT` internamente —
> não precisa de `redirect()` explícito.

### 5. `src/app/(auth)/login/page.tsx` — deletar

A página de login local não é mais necessária. A rota `/login` pode ser removida.

Se quiser manter uma rota `/login` como alias (opcional):

```typescript
// src/app/(auth)/login/page.tsx
import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/")
  await signIn("keycloak")
}
```

---

## Extensão de tipos do NextAuth (se necessário)

Se o TypeScript reclamar que `session.user.id` não existe, adicione/atualize a declaração de tipos:

```typescript
// src/types/next-auth.d.ts (criar se não existir)
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}
```

---

## Verificação

- [ ] `npm run build` sem erros de TypeScript
- [ ] `npm run dev` inicia sem erros de variáveis de ambiente
- [ ] Acessar `/` → redireciona para `id.caramello.cloud` (sem tela de login local)
- [ ] Login via Google com usuário autorizado → volta ao app autenticado
- [ ] `session.user.id` contém o `sub` do Keycloak (UUID)
- [ ] Logout via `/api/auth/signout` funciona e limpa a sessão
- [ ] Conta Google sem usuário preexistente no Keycloak → acesso negado pelo Keycloak
- [ ] Usuário no Keycloak sem Client Role `user` no `ai-pkm` → `throw` no session callback

---

## Configuração para desenvolvimento local

Para rodar localmente apontando para o Keycloak de produção:

```dotenv
KEYCLOAK_CLIENT_ID=ai-pkm
KEYCLOAK_CLIENT_SECRET=<copiar do painel>
KEYCLOAK_ISSUER=https://id.caramello.cloud/realms/caramello
NEXTAUTH_URL=http://localhost:3000/pkm
```

Adicionar `http://localhost:3000/api/auth/callback/keycloak` nas **Valid redirect URIs**
do client `ai-pkm` no Keycloak para que o fluxo funcione em dev.
