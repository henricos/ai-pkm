---
phase: 12-tests-and-operational-documentation
reviewed: 2026-04-18T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - compose.yaml
  - docs/dev-setup.md
  - README.md
  - src/__tests__/env.test.ts
  - src/__tests__/route-prefix.test.ts
  - src/__tests__/runtime-paths.test.ts
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-04-18
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Revisão cobre os três arquivos de teste Vitest introduzidos na Phase 12, os dois arquivos de documentação operacional (`README.md` e `docs/dev-setup.md`) e o `compose.yaml` de desenvolvimento. Os testes exercem três contratos críticos: validação fail-fast de env vars (`env.test.ts`), redirect com prefixo de rota (`route-prefix.test.ts`) e resolução de runtime paths (`runtime-paths.test.ts`).

Nenhum problema de segurança crítico foi encontrado. Três warnings de corretude foram identificados — dois nos testes (isolamento de módulo com cache de singleton e uma inconsistência entre o `NEXTAUTH_URL` usado no teste e o contrato esperado) e um no `compose.yaml` (variável de ambiente `INDEX_PATH` com `read_only: true` no volume, mas sem proteção equivalente em `PKM_PATH` ao nível do documento). Três itens de informação foram identificados para melhoria de robustez e clareza.

---

## Warnings

### WR-01: Singleton de `getRuntimePaths` vaza entre testes de `runtime-paths.test.ts`

**File:** `src/__tests__/runtime-paths.test.ts:16`
**Issue:** `getRuntimePaths()` usa um singleton cacheado (`cachedRuntimePaths`). O `vi.resetModules()` é chamado em `beforeEach`, o que reimporta o módulo — mas apenas se o import for feito dentro de cada `test`. No teste `PKG-01` (linha 38) e `PKG-02` (linha 22), `getRuntimePaths` é importado dentro do corpo do teste, então o reset funciona. No entanto, o `afterEach` não limpa o módulo `../lib/env` (que também é singleton e é cacheado por `export const env = parseEnv()`). Se os testes rodarem em ordem adversa ou se `env` for carregado via side-effect antes do stub, o valor de `NODE_ENV` do stub pode não ter efeito no `superRefine` de `env.ts` que depende de `process.env.NODE_ENV` diretamente (e não do objeto `env` parseado). O teste `PKG-02` na linha 55 usa `vi.stubEnv("NODE_ENV", "production")` sem chamar `vi.resetModules()` antes do import de `../lib/env`, confiando que o `beforeEach` já resetou — o que é correto — mas o restore de `NODE_ENV` em `afterEach` não desfaz o stub antes de `Object.assign(process.env, originalEnv)`, podendo deixar `NODE_ENV` em estado inesperado se `vi.unstubAllEnvs()` não for chamado. O `afterEach` atual não chama `vi.unstubAllEnvs()`.

**Fix:** Adicionar `vi.unstubAllEnvs()` no `afterEach` de `runtime-paths.test.ts`, após o restore manual de `process.env`:

```typescript
afterEach(() => {
  Object.keys(process.env).forEach((key) => {
    if (!(key in originalEnv)) delete process.env[key];
  });
  Object.assign(process.env, originalEnv);
  vi.unstubAllEnvs(); // adicionar esta linha
  process.chdir(originalCwd);
});
```

---

### WR-02: Teste `PKG-02` em `runtime-paths.test.ts` usa `NEXTAUTH_URL` sem o pathname `/pkm`

**File:** `src/__tests__/runtime-paths.test.ts:62`
**Issue:** O teste `"PKG-02: falha cedo em produção quando INDEX_PATH não foi configurado"` configura `NEXTAUTH_URL=http://localhost:3000` (sem o pathname `/pkm`). O `env.ts` executa o `superRefine` que valida que o pathname de `NEXTAUTH_URL` corresponde a `APP_BASE_PATH`. Como `APP_BASE_PATH` não está definido neste teste, o Zod falhará por conta de `APP_BASE_PATH` ausente — o que pode mascarar a falha real que o teste pretende verificar (ausência de `INDEX_PATH`). A mensagem de erro que ativa o `process.exit(1)` pode ser outra que não `INDEX_PATH`, tornando o teste correto por coincidência, mas verificando a asserção errada.

**Fix:** Configurar todas as variáveis válidas exceto `INDEX_PATH` — inclusive `APP_BASE_PATH` e um `NEXTAUTH_URL` consistente — para que a única causa de falha seja exatamente `INDEX_PATH` ausente em produção:

```typescript
test("PKG-02: falha cedo em produção quando INDEX_PATH não foi configurado", async () => {
  vi.stubEnv("NODE_ENV", "production");
  process.env.PKM_PATH = "/data/pkm";
  process.env.APP_BASE_PATH = "/pkm";                      // adicionar
  process.env.AUTH_USERNAME = "testuser";
  process.env.AUTH_PASSWORD = "testpassword123";
  process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012";
  process.env.NEXTAUTH_URL = "http://localhost:3000/pkm";  // corrigir
  // INDEX_PATH ausente intencionalmente

  const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit called");
  });
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  await expect(import("../lib/env")).rejects.toThrow("process.exit called");
  expect(exitSpy).toHaveBeenCalledWith(1);
  expect(errorSpy.mock.calls.join()).toContain("INDEX_PATH"); // asserção na causa correta

  exitSpy.mockRestore();
  errorSpy.mockRestore();
});
```

---

### WR-03: `compose.yaml` não define `restart` policy — container não reinicia após falha de runtime

**File:** `compose.yaml:1`
**Issue:** O serviço `web` no `compose.yaml` de desenvolvimento não define `restart`. Sem política de restart, o container encerra permanentemente após qualquer falha de runtime (ex: OOM, crash de processo Node). Para uso em dev contínuo, isso é uma inconveniência que pode confundir o operador. O `compose.yaml` de exemplo no `README.md` inclui `restart: unless-stopped`, mas o `compose.yaml` versionado não tem. Isso cria divergência entre o contrato documentado para o runtime de container e a configuração real do arquivo versionado.

**Fix:** Adicionar `restart: unless-stopped` ao serviço `web` no `compose.yaml` versionado para alinhar com o exemplo do `README.md`:

```yaml
services:
  web:
    image: ai-pkm:local
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      # ...
```

---

## Info

### IN-01: `env.test.ts` — `exitSpy` e `errorSpy` não são restaurados em `afterEach`, apenas manualmente

**File:** `src/__tests__/env.test.ts:37-47`
**Issue:** Os spies `exitSpy` e `errorSpy` são restaurados manualmente com `.mockRestore()` no final de cada teste. Se o teste lançar antes de chegar ao `mockRestore()` (ex: a própria asserção `rejects.toThrow` falhar por outro motivo), os spies ficam ativos para o próximo teste. O padrão mais robusto é usar `vi.restoreAllMocks()` no `afterEach`, garantindo restore independente do caminho de execução.

**Fix:** Adicionar ao `afterEach` de `env.test.ts`:

```typescript
afterEach(() => {
  // restore manual atual omitido — substituir por:
  vi.restoreAllMocks();
  // ...demais restaurações
});
```

Ou alternativamente configurar `restoreMocks: true` no `vitest.config.ts`, que aplica globalmente.

---

### IN-02: `README.md` — exemplo de `compose.yaml` inclui credenciais placeholder em texto literal

**File:** `README.md:55-56`
**Issue:** O bloco de exemplo de `compose.yaml` no `README.md` inclui valores literais como `AUTH_PASSWORD: uma-senha-segura` e `NEXTAUTH_SECRET: troque-por-uma-string-aleatoria-com-pelo-menos-32-caracteres` diretamente no campo `environment`. Embora sejam apenas exemplos didáticos e o texto adjacente instrua a substituir, esse padrão pode induzir usuários a copiar o bloco sem substituir. A prática preferível é usar interpolação de variável de ambiente (`AUTH_PASSWORD: ${AUTH_PASSWORD}`) mesmo nos exemplos, para que o arquivo seja copiável e funcional sem expor credenciais acidentais.

**Fix:** Substituir valores literais de credenciais no exemplo do `README.md` por interpolação de variável de ambiente:

```yaml
environment:
  AUTH_USERNAME: ${AUTH_USERNAME}
  AUTH_PASSWORD: ${AUTH_PASSWORD}
  NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
  NEXTAUTH_URL: ${NEXTAUTH_URL}
```

---

### IN-03: `route-prefix.test.ts` — `vi.resetModules()` em `beforeEach` pode não ter efeito sobre mocks estáticos declarados no topo do arquivo

**File:** `src/__tests__/route-prefix.test.ts:63`
**Issue:** `vi.resetModules()` é chamado em `beforeEach` para garantir que os imports dinâmicos dentro dos testes recebam módulos frescos. No entanto, os mocks declarados com `vi.mock(...)` no topo do arquivo (linhas 8-53) são hoisted e aplicados antes de qualquer código de teste. Isso significa que os módulos mockados (ex: `@/lib/env`, `@/lib/auth`) continuarão usando os factories definidos estaticamente. Para a maioria dos testes aqui isso é intencional e correto. O risco é que um mock definido no topo que guarda estado interno (ex: `vi.fn()`) pode acumular chamadas entre testes se `mockClear()` não for chamado. O `beforeEach` atual chama `vi.mocked(redirect).mockClear()` apenas para `redirect` — `auth` não tem `mockClear()` explícito, embora `vi.resetModules()` recrie o módulo que o consome.

**Fix:** Adicionar `vi.mocked(auth).mockClear()` no `beforeEach` para garantir que o histórico de chamadas de `auth` seja limpo entre testes:

```typescript
beforeEach(() => {
  process.env.APP_BASE_PATH = "/pkm";
  vi.mocked(redirect as ReturnType<typeof vi.fn>).mockClear();
  vi.mocked(auth).mockClear(); // adicionar
  vi.resetModules();
});
```

---

_Reviewed: 2026-04-18_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
