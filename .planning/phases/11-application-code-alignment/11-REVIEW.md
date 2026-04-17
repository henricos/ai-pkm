---
phase: 11-application-code-alignment
reviewed: 2026-04-17T22:56:31Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/app/(auth)/login/page.tsx
  - src/app/(shell)/layout.tsx
  - src/components/login-form.tsx
  - src/components/viewer/viewer-client-shell.tsx
  - src/components/viewer/viewer-header.tsx
  - src/components/viewer/viewer-page.tsx
  - src/__tests__/viewer-client-shell.test.tsx
  - src/__tests__/viewer-header.test.tsx
  - src/lib/auth.ts
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-04-17T22:56:31Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Revisão cobre a cadeia de autenticação (login page, LoginForm, auth.ts, shell layout) e os componentes do viewer (ViewerPage, ViewerClientShell, ViewerHeader) com seus respectivos testes.

O código está bem estruturado e as decisões de segurança mais críticas estão documentadas. Não foram encontradas vulnerabilidades críticas exploráveis. Os três warnings envolvem: uma lacuna de sanitização no callbackUrl que não bloqueia path traversal, uma comparação de credenciais vulnerável a timing attack (já documentada no código como limitação conhecida), e um padrão de useEffect com `useRef` guard que produz comportamento incorreto no React StrictMode em desenvolvimento. As issues de Info são três itens de qualidade: type assertions sem null check, um tipo deprecated não utilizado, e ausência de mocks para dependências transitivas nos testes de integração do ViewerClientShell.

---

## Warnings

### WR-01: isValidCallback aceita URLs com path traversal

**File:** `src/components/login-form.tsx:10-16`

**Issue:** A função `isValidCallback` rejeita URLs absolutas que contêm `"://"` e aceita apenas strings que comecem com `baseFallback` (ex: `"/pkm"`). Porém, uma URL como `/pkm/../../../etc/passwd` passa na verificação de `startsWith("/pkm")` — a sequência `../` não é bloqueada nem normalizada. Embora `router.push()` do Next.js normalize o path no browser antes de navegar, a validação expressa uma garantia mais forte do que realmente oferece e seria falha em qualquer contexto server-side ou de redirect direto.

**Fix:**
```typescript
function isValidCallback(url: string, baseFallback: string): boolean {
  // Rejeitar URLs absolutas
  if (url.includes("://")) return false;
  // Rejeitar protocol-relative (// sem esquema explícito)
  if (url.startsWith("//")) return false;
  // Normalizar para detectar path traversal antes de checar prefixo
  try {
    // URL() requer uma base para paths relativos
    const normalized = new URL(url, "http://localhost").pathname;
    return normalized.startsWith(baseFallback === "/" ? "/" : baseFallback);
  } catch {
    return false;
  }
}
```

---

### WR-02: Comparação de credenciais vulnerável a timing attack

**File:** `src/lib/auth.ts:23-29`

**Issue:** A comparação `username === env.AUTH_USERNAME && password === env.AUTH_PASSWORD` usa igualdade de string em tempo linear mas com curto-circuito (&&). Um atacante com controle de latência de rede pode inferir se o username está correto com base no tempo de resposta. O código já documenta este ponto (`// AVISO DE SEGURANÇA`), mas a limitação não está visível como issue rastreável.

**Fix:**
```typescript
import { timingSafeEqual, createHash } from "crypto";

function safeEqual(a: string, b: string): boolean {
  // Usa buffers de mesmo tamanho para evitar timing leak por comprimento diferente
  const bufA = Buffer.from(createHash("sha256").update(a).digest("hex"));
  const bufB = Buffer.from(createHash("sha256").update(b).digest("hex"));
  return timingSafeEqual(bufA, bufB);
}

// Na função authorize:
if (safeEqual(username, env.AUTH_USERNAME) && safeEqual(password, env.AUTH_PASSWORD)) {
  return { id: "1", name: username };
}
```

---

### WR-03: useEffect com ref guard quebra no React StrictMode

**File:** `src/components/viewer/viewer-client-shell.tsx:88-103`

**Issue:** O `useEffect` usa `hydratedThemeRef.current` como guard para distinguir o render inicial (ler localStorage) dos renders subsequentes (aplicar tema ao DOM). No React StrictMode (ativo em desenvolvimento), effects são executados duas vezes consecutivas: na primeira execução `hydratedThemeRef.current` é `false`, o código lê o localStorage e seta o ref como `true`; na segunda execução (remontagem do StrictMode) o ref já é `true`, então o branch de localStorage é pulado e o tema do localStorage não é aplicado. O resultado em desenvolvimento é que o tema salvo nunca é restaurado, dificultando o teste manual do fluxo SSR safety.

**Fix:** Mover o guard para dentro do efeito usando uma variável local `let ran = false`, ou substituir pelo padrão de estado de montagem com `useLayoutEffect`:

```typescript
useEffect(() => {
  const saved = readSavedTheme();
  applyBootstrapThemeAttribute(document.documentElement, saved);
  if (saved) {
    setActiveTheme(saved);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // executa apenas na montagem

useEffect(() => {
  // Aplica tema ao DOM a cada mudança (troca de preset pelo usuário)
  applyBootstrapThemeAttribute(document.documentElement, activeTheme);
}, [activeTheme]);
```

Separar os dois efeitos elimina o ref guard e deixa o comportamento correto tanto em StrictMode quanto em produção.

---

## Info

### IN-01: Type assertion sem null check em formData.get()

**File:** `src/components/login-form.tsx:34-35`

**Issue:** `formData.get("username") as string` e `formData.get("password") as string` ignoram que `FormData.get()` retorna `FormDataEntryValue | null`. Os campos são `required`, então HTML validation previne o submit com valores nulos em browsers, mas a asserção de tipo bypass a checagem estática e deixaria o código silenciosamente quebrado em ambientes de teste sem DOM completo.

**Fix:**
```typescript
const username = (formData.get("username") ?? "") as string;
const password = (formData.get("password") ?? "") as string;
```

---

### IN-02: Tipo deprecated ViewerThemePreset exportado sem uso

**File:** `src/components/viewer/viewer-header.tsx:31`

**Issue:** `export type ViewerThemePreset = ViewerTheme;` está marcado com `@deprecated` e não é importado por nenhum outro arquivo no projeto. É código morto que pode confundir futuros consumidores sobre qual tipo usar.

**Fix:** Remover a linha:
```typescript
// Remover:
/** @deprecated Use ViewerTheme from viewer-theme */
export type ViewerThemePreset = ViewerTheme;
```

---

### IN-03: Dependências transitivas não mockadas nos testes de ViewerClientShell

**File:** `src/__tests__/viewer-client-shell.test.tsx:16-91`

**Issue:** `PresentationOverlay`, `LaserPointerOverlay` e `ViewerThemeRoot` são usados a partir das implementações reais (sem mock). Esses componentes instanciam `useEffect` com `document.addEventListener`, timers e acesso ao `document.documentElement`. Em jsdom isso funciona acidentalmente mas qualquer falha nesses componentes vai aparecer nos testes do shell com stack traces que apontam para implementações externas, dificultando o diagnóstico. Os testes de `PRS-02 (Esc)` dependem silenciosamente do comportamento real do `PresentationOverlay`.

**Fix:** Se a intenção é testar apenas o `ViewerClientShell` em isolamento, adicionar mocks:
```typescript
vi.mock("@/components/viewer/presentation-overlay", () => ({
  PresentationOverlay: ({ children, onExit }: { children: React.ReactNode; onExit: () => void }) => (
    <div data-testid="presentation-stage">
      <button data-testid="exit-presentation" onClick={onExit}>Sair</button>
      {children}
    </div>
  ),
}));

vi.mock("@/components/viewer/laser-pointer-overlay", () => ({
  LaserPointerOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/viewer/viewer-theme", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, ViewerThemeRoot: ({ children }: { children: React.ReactNode }) => <>{children}</> };
});
```

Se a intenção é testar integração entre shell e overlay, documentar isso no describe block.

---

_Reviewed: 2026-04-17T22:56:31Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
