# Phase 12: Tests and Operational Documentation - Research

**Researched:** 2026-04-17
**Domain:** Vitest + Next.js App Router testing; documentação técnica operacional
**Confidence:** HIGH

## Summary

A Phase 12 é deliberadamente a fase de fechamento do milestone v2.2. Todo o código de produção relevante já existe (Phases 10 e 11). O trabalho consiste em dois arcos independentes: (1) escrever ou complementar testes que verifiquem o contrato de ambiente e os fluxos de rota com prefixo `/pkm`, e (2) atualizar dois documentos (`docs/dev-setup.md` e `README.md`) com o contrato dos 3 lugares de configuração.

A boa notícia: a infraestrutura de testes está completa, funcional e com padrões bem estabelecidos. O framework é Vitest + @testing-library/react, rodando com `npm test`. O arquivo `env.test.ts` já existe e já cobre os casos ENV-01, ENV-02 e ENV-03 — esses testes estão passando. O que falta para TST-01 é um único teste de "sucesso quando sincronizados", que já existe nesse arquivo mas com mock de `env` incompleto para o `APP_BASE_PATH`. Para TST-02, os testes de rotas de acesso não autenticado/login/navegação precisam ser escritos como testes de contrato (não e2e), seguindo o padrão do `auth.test.ts` existente.

O arco de documentação (DOC-01 e DOC-02) requer atualizar conteúdo já existente nos dois documentos — nenhum arquivo precisa ser criado do zero. O `dev-setup.md` omite completamente `APP_BASE_PATH` e o fato de que a raiz retorna 404. O `README.md` omite `APP_BASE_PATH` no compose de exemplo e não documenta o hardcode do workflow como um dos 3 lugares de configuração.

**Recomendação primária:** Dois planos paralelos — um para testes (TST-01 + TST-02), outro para documentação (DOC-01 + DOC-02). Cada plano é autocontido.

<phase_requirements>
## Phase Requirements

| ID | Descrição | Suporte da Pesquisa |
|----|-----------|---------------------|
| TST-01 | Testes de env cobrem: ausência de APP_BASE_PATH, ausência de NEXTAUTH_URL, divergência de pathname, e sucesso quando sincronizados. | `env.test.ts` já cobre ENV-01/02/03. Lacuna: nenhum teste de sucesso verificável com `APP_BASE_PATH=/pkm` + `NEXTAUTH_URL=https://host/pkm`. O teste "parse bem-sucedido" existe mas usa mock de env sem APP_BASE_PATH no mock (mock do módulo). Ver seção Gaps. |
| TST-02 | Testes de rota: acesso não autenticado redireciona para `/pkm/login`; login retorna para `/pkm`; navegação funciona em `/pkm/library`. | Nenhum arquivo de teste existente cobre fluxos de rota com prefixo. O `auth.test.ts` testa o matcher do middleware sem prefixo. Padrão claro: contract tests com mocks de `next/navigation` e `auth`, igual ao padrão existente. |
| DOC-01 | `docs/dev-setup.md` documenta `APP_BASE_PATH` no `.env` com exemplos concretos e nota de que raiz retorna 404. | `dev-setup.md` existe e é detalhado, mas não menciona `APP_BASE_PATH` nem `/pkm` em nenhum lugar. O `.env.example` atualizado é a referência. |
| DOC-02 | `README.md` documenta os 3 lugares de configuração com exemplos e nota de que mudar o path exige nova release. | `README.md` existe. O compose de exemplo no README não inclui `APP_BASE_PATH`. O workflow já está documentado. Falta seção explícita sobre o contrato dos 3 lugares. |
</phase_requirements>

---

## Standard Stack

### Core (já instalado no projeto)

| Biblioteca | Versão | Propósito | Por que padrão |
|-----------|--------|-----------|----------------|
| vitest | `^3.x` (via package.json) | Test runner e assertions | Já configurado, toda suite existente roda nele |
| @testing-library/react | instalado | Render de componentes React em JSDOM | Já usado em app-shell.test.tsx, viewer-page.test.tsx |
| @vitejs/plugin-react | instalado | Suporte a JSX/React no Vitest | Já no vitest.config.ts |

**Verificado:** `[VERIFIED: codebase grep]` — `package.json` e `vitest.config.ts` confirmam a stack completa.

### Configuração existente

**vitest.config.ts** (já existente, não precisa de alteração):
```typescript
// environment: "jsdom", globals: true, include: src/__tests__/**/*.test.{ts,tsx}
// alias @/ → ./src/
```

**Comando de teste:**
```bash
npm test          # vitest run (CI / one-shot)
npm run test:watch # vitest (interativo)
```

---

## Architecture Patterns

### Padrão estabelecido no projeto

Todos os arquivos de teste existentes seguem o mesmo padrão. A Phase 12 deve seguir esse padrão sem exceção.

**Padrão 1: Mock de `env` antes de qualquer import que dependa dele**
```typescript
// SEMPRE antes do import do módulo que usa @/lib/env
vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    APP_BASE_PATH: "/pkm",           // obrigatório após Phase 10
    AUTH_USERNAME: "testuser",
    AUTH_PASSWORD: "testpassword123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "https://host/pkm", // deve estar em sincronia com APP_BASE_PATH
  },
}));
```
`[VERIFIED: codebase]` — `viewer-page.test.tsx`, `preview-route.test.ts` usam esse padrão.

**Padrão 2: Teste de módulo com `vi.resetModules()` + `afterEach` para env isolation**
```typescript
const originalEnv = { ...process.env };

afterEach(() => {
  Object.keys(process.env).forEach((key) => {
    if (!(key in originalEnv)) delete process.env[key];
  });
  Object.assign(process.env, originalEnv);
  vi.unstubAllEnvs();
  vi.resetModules();
});
```
`[VERIFIED: codebase]` — `env.test.ts` e `runtime-paths.test.ts` usam esse padrão.

**Padrão 3: Testes de contrato para comportamento server-side (não e2e)**
O projeto testa comportamento de middlewares e redirects via contract tests — verificando a lógica diretamente, sem subir servidor. Veja `auth.test.ts`.

**Padrão 4: Estrutura de arquivo de teste**
```
src/__tests__/
└── nome-do-modulo.test.ts   # kebab-case, mesmo nome do módulo testado
```

### Padrão específico para TST-01

O arquivo `env.test.ts` já contém:
- ENV-01: falha quando `APP_BASE_PATH` ausente ✓
- ENV-02: falha quando `NEXTAUTH_URL` ausente ✓
- ENV-03: falha quando divergem ✓
- Parse bem-sucedido (stub parcial) ✓

**Lacuna identificada para TST-01:** O teste "parse bem-sucedido" existente não verifica explicitamente que `APP_BASE_PATH=/pkm` com `NEXTAUTH_URL=https://host/pkm` resulta em sucesso. O teste já passa, mas a intenção do TST-01 é que o caso de sucesso seja documentado como expectativa explícita — o que já está coberto pelo teste na linha 49. **Conclusão:** `env.test.ts` já satisfaz TST-01 — nenhum arquivo novo necessário. A checagem deve apenas verificar que os 4 casos requeridos pelo TST-01 estão documentados nos testes existentes.

**Atenção:** Dois testes em `runtime-paths.test.ts` estão falhando porque não mocam `APP_BASE_PATH`. Isso não é responsabilidade da Phase 12 (está fora do escopo de TST-01/TST-02), mas o planner deve estar ciente. Ver seção Open Questions.

### Padrão específico para TST-02

Nenhum arquivo existente testa fluxos de rota com prefixo `/pkm`. Os testes necessários são do tipo contract test, seguindo o padrão de `auth.test.ts`.

**Fluxos a cobrir:**
1. Acesso não autenticado → redireciona para `/pkm/login` (não `/login`)
2. Login bem-sucedido → retorna para `/pkm` (não `/`)
3. Navegação em `/pkm/library` funciona corretamente

**Estratégia para fluxo 1 (redirect não autenticado):**
O `ShellLayout` já usa `withBasePath("/login")` para o redirect. O teste deve mockar `auth()` retornando `null` e verificar que `redirect()` foi chamado com `/pkm/login`.

```typescript
// Arquivo proposto: src/__tests__/route-prefix.test.ts
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/env", () => ({ env: { APP_BASE_PATH: "/pkm", ... } }));

// O ShellLayout chama redirect(withBasePath("/login"))
// withBasePath("/login") com APP_BASE_PATH=/pkm → "/pkm/login"
```

**Estratégia para fluxo 2 (fallback de login):**
O `LoginPage` usa `withBasePath("/")` como `fallbackUrl`. O `LoginForm` usa esse valor como `callbackUrl`. O teste deve verificar que `fallbackUrl` passado para `LoginForm` é `/pkm`.

**Estratégia para fluxo 3 (navegação em `/pkm/library`):**
O `auth.ts` configura `pages.signIn = withBasePath("/login")`. Com `APP_BASE_PATH=/pkm`, isso resulta em `/pkm/login`. O teste deve verificar que o `signIn` page configurado no NextAuth tem o prefixo correto.

### Anti-Patterns a Evitar

- **Não usar `NEXTAUTH_URL=http://localhost:3000` no mock de env de testes TST-01/TST-02:** Essa URL não termina com `/pkm` e vai causar falha na validação de sincronia. Usar `NEXTAUTH_URL=https://host/pkm` nos mocks de módulo.
- **Não testar redirect de Next.js via renderização em JSDOM:** `redirect()` em Server Components lança uma exceção internamente no Next.js — não é capturável pelo testing-library diretamente. Usar `vi.mock("next/navigation", ...)` e verificar a chamada ao mock.
- **Não importar `@/lib/env` sem mock em testes isolados:** O módulo chama `process.exit(1)` se as env vars não estiverem presentes, o que derruba o teste runner.

---

## Don't Hand-Roll

| Problema | Não Construir | Usar Em Vez | Por Que |
|----------|---------------|-------------|---------|
| Verificar redirect server-side | Subir servidor de teste | Mock de `next/navigation` redirect + verificação de chamada | App Router Server Components não são testáveis via HTTP em Vitest/JSDOM |
| Isolar env vars entre testes | Variáveis globais | `vi.resetModules()` + restauração de `process.env` | Padrão já testado e funcionando nos testes existentes |
| Testar middleware Next.js | Testes e2e com Playwright | Contract tests verificando padrão do matcher | Adequado para o escopo; e2e seria out of scope para esta fase |

---

## Common Pitfalls

### Pitfall 1: Mock de `env` incompleto — falta `APP_BASE_PATH`
**O que dá errado:** Testes que importam módulos que chamam `withBasePath()` indiretamente falham porque o mock de `env` não inclui `APP_BASE_PATH`.
**Por que acontece:** O mock de `env` foi criado em fases anteriores (antes da Phase 10) sem esse campo.
**Como evitar:** Sempre incluir `APP_BASE_PATH: "/pkm"` e `NEXTAUTH_URL: "https://host/pkm"` em qualquer mock de `@/lib/env`.
**Sinal de alerta:** Erro `process.exit unexpectedly called with "1"` em testes que não testam env validation.

**Evidência:** `[VERIFIED: vitest output]` — `runtime-paths.test.ts` falha exatamente por isso. Os dois testes falhos no run atual (`PKG-02: usa INDEX_PATH` e `PKG-01: em dev usa fallback`) têm essa causa raiz.

### Pitfall 2: Testar `redirect()` do Next.js esperando que ele retorne um valor
**O que dá errado:** O `redirect()` do `next/navigation` em App Router lança internamente (é implementado com `throw`). Um `await ShellLayout(...)` vai rejeitar se `auth()` retornar `null` e `redirect()` for o mock padrão.
**Como evitar:** Mockar `redirect` como `vi.fn()` (que não lança) e verificar que foi chamado com o argumento correto.

### Pitfall 3: `NEXTAUTH_URL` incompatível no mock de env
**O que dá errado:** Usar `NEXTAUTH_URL=http://localhost:3000` (sem prefixo `/pkm`) em mocks vai causar falha na validação de sincronia de `env.ts` quando o módulo é importado diretamente (não mockado).
**Como evitar:** Em testes que importam o módulo `env` real, usar `NEXTAUTH_URL=https://host/pkm`. Em testes que mockam `env`, incluir a URL completa com prefixo.

### Pitfall 4: `dev-setup.md` documentando URL errada
**O que dá errado:** O `dev-setup.md` atual instrui o dev a configurar `NEXTAUTH_URL=http://localhost:3000` (sem `/pkm`). Após a Phase 10/11, essa configuração faz o app falhar na inicialização com o erro de sincronia.
**Como evitar:** Atualizar o exemplo no `dev-setup.md` para `NEXTAUTH_URL=http://localhost:3000/pkm` e adicionar seção sobre `APP_BASE_PATH`.

---

## Code Examples

Exemplos verificados a partir do código existente:

### Como mockar `redirect` do Next.js em testes de Server Component
```typescript
// Fonte: padrão estabelecido em auth.test.ts (sem redirect mock necessário lá)
// Novo padrão necessário para TST-02:

vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation(() => {
    // Não lança — permite que o test continue após o redirect
  }),
}));

import { redirect } from "next/navigation";
// ...
expect(redirect).toHaveBeenCalledWith("/pkm/login");
```

### Como verificar `withBasePath` em contexto de teste
```typescript
// Fonte: with-base-path.test.ts (verificado)
import { withBasePath } from "@/lib/base-path";

// Com APP_BASE_PATH=/pkm (via env mockado ou argumento explícito):
expect(withBasePath("/login", "/pkm")).toBe("/pkm/login");
expect(withBasePath("/", "/pkm")).toBe("/pkm");
```

### Template de mock de env para testes da Phase 12
```typescript
// [VERIFIED: codebase] — padrão de viewer-page.test.tsx e preview-route.test.ts
vi.mock("@/lib/env", () => ({
  env: {
    PKM_PATH: "/mock/pkm",
    APP_BASE_PATH: "/pkm",
    AUTH_USERNAME: "testuser",
    AUTH_PASSWORD: "testpassword123",
    NEXTAUTH_SECRET: "test-secret-with-at-least-32-characters-here",
    NEXTAUTH_URL: "https://host/pkm",
  },
}));
```

---

## Estado Atual dos Testes (TST-01)

**Verificado em `src/__tests__/env.test.ts`:**

| Caso do TST-01 | Coberto? | ID do teste existente |
|----------------|----------|----------------------|
| Falha quando `APP_BASE_PATH` ausente | Sim | `ENV-01: falha cedo quando APP_BASE_PATH está ausente` |
| Falha quando `NEXTAUTH_URL` ausente | Sim | `ENV-02: falha cedo quando NEXTAUTH_URL está ausente` |
| Falha quando pathname diverge | Sim | `ENV-03: falha cedo quando NEXTAUTH_URL diverge do APP_BASE_PATH` |
| Sucesso quando sincronizados | Sim | `RUN-01: parse bem-sucedido quando todas as vars obrigatórias estão presentes e sincronizadas` |

**Conclusão TST-01:** `[VERIFIED: codebase]` — Os 4 casos requeridos pelo TST-01 já estão cobertos em `env.test.ts`. O requisito TST-01 está **funcionalmente satisfeito pelo código existente**. O plano deve incluir uma tarefa de verificação (executar `npm test` e confirmar que esses testes passam com o ID de requisito TST-01 documentado nos comentários), mais do que escrever testes novos do zero.

**Ação de refinamento sugerida:** Adicionar o comentário `// TST-01` nos 4 testes existentes para rastreabilidade explícita com o requisito.

---

## Estado Atual da Documentação (DOC-01, DOC-02)

### `docs/dev-setup.md` — lacunas para DOC-01

`[VERIFIED: codebase read]` — O arquivo existe e é detalhado, mas:
1. **Não menciona `APP_BASE_PATH`** em nenhuma parte
2. **Exemplo de `.env.local` usa `NEXTAUTH_URL=http://localhost:3000`** (sem `/pkm`) — configuração inválida após Phase 10
3. **Não menciona que a raiz (`localhost:3000/`) retorna 404** — só `localhost:3000/pkm` é o acesso correto
4. **Seção "Verificação do fluxo" instrui abrir `http://localhost:3000`** — URL desatualizada (deveria ser `http://localhost:3000/pkm`)
5. **Troubleshooting não cobre erros de sincronia** de `APP_BASE_PATH` vs `NEXTAUTH_URL`

### `README.md` — lacunas para DOC-02

`[VERIFIED: codebase read]` — O arquivo existe e tem o Quickstart do runtime, mas:
1. **Compose de exemplo não inclui `APP_BASE_PATH`** como variável de ambiente
2. **`NEXTAUTH_URL` no exemplo é `http://SEU-HOST:3030`** (sem `/pkm`) — configuração inválida após Phase 10
3. **Não documenta os 3 lugares de configuração** como contrato explícito: `.env` (dev), `release-ghcr.yml` (build-arg), `compose.yaml` (runtime)
4. **Não menciona que mudar o path exige nova release** (porque `APP_BASE_PATH` é baked no build)
5. **Não menciona que `APP_BASE_PATH=/pkm` é hardcoded** no workflow `release-ghcr.yml`

### Os 3 lugares de configuração (referência para DOC-02)

`[VERIFIED: codebase]` — Verificado nos arquivos reais:

| Lugar | Arquivo | Tipo | Valor atual |
|-------|---------|------|-------------|
| Desenvolvimento | `.env` / `.env.local` | Runtime, variável | `APP_BASE_PATH=/pkm` |
| Build da imagem | `.github/workflows/release-ghcr.yml` linha 69 | Build-arg, hardcoded | `APP_BASE_PATH=/pkm` |
| Runtime container | `compose.yaml` | Runtime, mas APP_BASE_PATH ausente atualmente | Precisa de `APP_BASE_PATH=/pkm` |

**Nota crítica:** O `compose.yaml` do repositório (usado para validação local) **não inclui `APP_BASE_PATH`**. O README Quickstart também omite essa variável. Ambos precisam ser atualizados.

---

## Validation Architecture

### Framework de Testes
| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest 3.x + @testing-library/react |
| Config | `vitest.config.ts` (raiz do projeto) |
| Comando rápido | `npm test` |
| Suite completa | `npm test` |

### Mapeamento Requisitos → Testes

| ID | Comportamento | Tipo | Comando | Arquivo Existe? |
|----|---------------|------|---------|-----------------|
| TST-01 | env falha sem APP_BASE_PATH | unit | `npm test -- env.test.ts` | Sim (parcialmente mapeado) |
| TST-01 | env falha sem NEXTAUTH_URL | unit | `npm test -- env.test.ts` | Sim |
| TST-01 | env falha quando divergem | unit | `npm test -- env.test.ts` | Sim |
| TST-01 | env sucede quando sincronizados | unit | `npm test -- env.test.ts` | Sim |
| TST-02 | acesso não autenticado → `/pkm/login` | contract | `npm test -- route-prefix.test.ts` | Nao — Wave 0 |
| TST-02 | login retorna para `/pkm` | contract | `npm test -- route-prefix.test.ts` | Nao — Wave 0 |
| TST-02 | navegacao em `/pkm/library` | contract | `npm test -- route-prefix.test.ts` | Nao — Wave 0 |

### Wave 0 Gaps
- [ ] `src/__tests__/route-prefix.test.ts` — cobre TST-02 (novo arquivo)
- Sem gaps de infraestrutura — Vitest já configurado e funcional

---

## Security Domain

Esta fase não introduz código de segurança novo. Os controles relevantes já existem e foram validados nas Phases 10 e 11.

| Categoria ASVS | Aplica | Controle |
|----------------|--------|---------|
| V5 Input Validation | sim | `withBasePath()` rejeita paths inválidos com erro explícito |
| V2 Authentication | sim | `NEXTAUTH_URL` e `APP_BASE_PATH` sincronizados impedem configuração inválida de auth |

**Nota:** Os testes de TST-02 devem incluir o caso de acesso não autenticado redirecionando para `/pkm/login` — isso é parte do contrato de segurança de sessão.

---

## Open Questions (RESOLVED)

1. **Runtime-paths failures preexistentes**
   - O que sabemos: dois testes em `runtime-paths.test.ts` falham porque não incluem `APP_BASE_PATH` no setup de env.
   - O que está claro: não são responsabilidade da Phase 12 (requerem `APP_BASE_PATH=/pkm` no `setRequiredEnv` local desse arquivo).
   - Recomendação: O planner pode incluir uma subtarefa de corrigir esses dois testes como parte do plano de TST-01 (já que é o mesmo arquivo de env), mas não é bloqueante para TST-01 nem TST-02.
   - RESOLVED: Plano 12-01 Tarefa 2 corrige os dois testes falhos adicionando APP_BASE_PATH e NEXTAUTH_URL=https://host/pkm no setup de env.

2. **`compose.yaml` do repositório vs README Quickstart**
   - O `compose.yaml` na raiz (para validação local) não tem `APP_BASE_PATH`. O README Quickstart (para runtime externo) também não.
   - O planner deve decidir: atualizar apenas o texto do README (DOC-02), ou também atualizar o `compose.yaml` do repositório?
   - Recomendação: Atualizar ambos — `compose.yaml` (para manter o arquivo funcional) e o README (para documentação).
   - RESOLVED: Plano 12-02 Tarefa 2 atualiza ambos — compose.yaml recebe APP_BASE_PATH=/pkm e README recebe a seção dos 3 lugares com exemplo corrigido.

---

## Sources

### Primary (HIGH confidence)
- `src/__tests__/env.test.ts` — estado atual dos testes de env (lido diretamente)
- `src/lib/env.ts` — contrato de validação de env com Zod (lido diretamente)
- `src/lib/base-path.ts` — implementação de `withBasePath` (lido diretamente)
- `src/app/(shell)/layout.tsx` — uso de `withBasePath` em redirect (lido diretamente)
- `src/app/(auth)/login/page.tsx` — fallbackUrl com prefixo (lido diretamente)
- `src/lib/auth.ts` — pages.signIn com prefixo (lido diretamente)
- `docs/dev-setup.md` — estado atual da documentação de setup (lido diretamente)
- `README.md` — estado atual do README com Quickstart (lido diretamente)
- `.github/workflows/release-ghcr.yml` — APP_BASE_PATH hardcoded no build (lido diretamente)
- `compose.yaml` — ausência de APP_BASE_PATH confirmada (lido diretamente)
- `vitest.config.ts` — configuração de testes (lido diretamente)
- `npm test` output — 2 falhas preexistentes em runtime-paths.test.ts (executado diretamente)

### Secondary (MEDIUM confidence)
- Padrão de mocking de `next/navigation` — inferido dos padrões existentes em auth.test.ts e viewer-header.test.tsx

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verificado diretamente no repositório
- Architecture patterns: HIGH — extraídos dos 22 testes existentes
- Gaps de TST-01: HIGH — verificado linha a linha em env.test.ts
- Gaps de DOC-01/DOC-02: HIGH — verificado nos arquivos reais
- Pitfalls: HIGH — baseados em falhas reais encontradas no run de testes

**Research date:** 2026-04-17
**Valid until:** Estável — os arquivos lidos são código versionado no repositório
