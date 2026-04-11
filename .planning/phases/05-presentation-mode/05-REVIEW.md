---
phase: 05-presentation-mode
reviewed: 2026-04-11T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - src/components/viewer/laser-pointer-overlay.tsx
  - src/components/viewer/presentation-controls.tsx
  - src/components/viewer/presentation-overlay.tsx
  - src/components/viewer/viewer-client-shell.tsx
  - src/components/viewer/viewer-header.tsx
  - src/components/viewer/viewer-theme.ts
  - src/__tests__/laser-pointer-overlay.test.tsx
  - src/__tests__/presentation-mode.test.tsx
  - src/__tests__/viewer-client-shell.test.tsx
  - src/__tests__/viewer-header.test.tsx
  - src/__tests__/viewer-theme.test.tsx
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-04-11
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Revisão cobre os seis componentes de source e cinco arquivos de teste da Phase 5 (modo apresentação + laser pointer + temas). A implementação é sólida: o fluxo de estado está correto, as salvaguardas de SSR estão em vigor, a acessibilidade está razoável e não foram encontradas vulnerabilidades de segurança. Três problemas de correção merecem atenção antes de uma release: um ref lido em render que não aciona re-renders, um `strokeLinejoin` ineficaz em `<line>`, e uma constante de proximidade declarada dentro do corpo do componente a cada render. Os itens de info são sugestões de limpeza sem impacto funcional.

---

## Warnings

### WR-01: `isPressedRef` lido em JSX não aciona re-render — cursor dot pode não aparecer

**File:** `src/components/viewer/laser-pointer-overlay.tsx:262`

**Issue:** O círculo de cursor ativo é condicional a `isPressedRef.current`, que é uma `ref`. Refs não são observadas pelo ciclo de render do React; portanto, quando o usuário pressiona o botão do mouse, a mudança de `isPressedRef.current` de `false` para `true` não dispara um re-render por si só. O círculo só aparecerá na próxima vez que outro estado mudar (por exemplo, quando o RAF atualizar `trail` via `setTrail`). Na prática o dot aparece com um frame de atraso, mas pode não aparecer se o RAF estiver pausado (documento oculto) ou em movimentos muito rápidos sem deslocamento suficiente para criar pontos de trail.

**Fix:** Introduzir um estado booleano para `isPressed` ao lado da ref, ou ler `trail.length > 0` como proxy (o trail só existe enquanto pressionado), que já é state observável. Exemplo:

```tsx
// Adicionar estado explícito em paralelo à ref
const [isPressed, setIsPressed] = useState(false);

const handlePointerDown = useCallback((e: React.PointerEvent) => {
  if (!active || isHiddenRef.current) return;
  isPressedRef.current = true;
  setIsPressed(true);          // <-- dispara re-render
  // ... resto do handler
}, [active]);

const handlePointerUp = useCallback(() => {
  isPressedRef.current = false;
  setIsPressed(false);         // <-- dispara re-render
}, []);

// No JSX, usar o state em vez da ref:
{active && trail.length > 0 && isPressed && (
  <circle ... />
)}
```

---

### WR-02: `strokeLinejoin="round"` em elementos `<line>` não tem efeito

**File:** `src/components/viewer/laser-pointer-overlay.tsx:223`

**Issue:** O atributo SVG `stroke-linejoin` só se aplica a pontos de junção em elementos que possuem vértices múltiplos: `<path>`, `<polyline>` e `<polygon>`. Em elementos `<line>`, que têm apenas dois pontos e portanto nenhuma junção, o atributo é ignorado pelo motor de renderização SVG. A propriedade `strokeLinecap="round"` nas extremidades dos segmentos já garante a suavidade pretendida.

**Fix:** Remover o atributo para eliminar o ruído no código e evitar confusão futura:

```tsx
<line
  key={`seg-${prev.id}-${curr.id}`}
  data-testid="laser-trail-point"
  x1={prev.x}
  y1={prev.y}
  x2={curr.x}
  y2={curr.y}
  stroke="#ef4444"
  strokeWidth={strokeWidth}
  strokeLinecap="round"
  // strokeLinejoin removido — sem efeito em <line>
  opacity={opacity}
/>
```

---

### WR-03: `MIN_POINT_DIST` declarado dentro do corpo do componente — recriado a cada render

**File:** `src/components/viewer/laser-pointer-overlay.tsx:124`

**Issue:** A constante `MIN_POINT_DIST = 3` é declarada com `const` dentro da função do componente, portanto é recriada em cada render. As constantes análogas `MAX_STROKE_WIDTH` e `MIN_STROKE_WIDTH` foram corretamente declaradas no escopo do módulo. Além do overhead trivial de alocação, a inconsistência dificulta a leitura: o leitor precisa verificar se o valor muda entre renders.

**Fix:** Mover para o escopo do módulo junto com as demais constantes:

```tsx
/** Distância mínima entre pontos consecutivos (px) */
const MIN_POINT_DIST = 3;

/** Espessura máxima do traço no ponto mais recente (em px) */
const MAX_STROKE_WIDTH = 5;
/** Espessura mínima abaixo da qual o segmento fica transparente */
const MIN_STROKE_WIDTH = 0.5;
```

---

## Info

### IN-01: `pointIdCounter` é variável de módulo compartilhada — não é resetada entre testes

**File:** `src/components/viewer/laser-pointer-overlay.tsx:47`

**Issue:** `let pointIdCounter = 0` é um contador de escopo de módulo. Em produção isso é correto: IDs de pontos de trail são usados apenas como React keys e devem ser únicos dentro de uma sessão. Porém, como o módulo é carregado uma única vez pelo runner de testes, o contador acumula entre todos os testes do arquivo `laser-pointer-overlay.test.tsx`. Isso não causa falha nos testes atualmente (nenhum teste verifica os valores das IDs), mas é um efeito colateral silencioso que pode surpreender no futuro.

**Fix:** Se a unicidade de IDs de trail for testada no futuro, considerar exportar uma função `resetPointIdCounter()` para uso em `beforeEach`, ou encapsular o counter como `useRef` local (aceitando que IDs só sejam únicos dentro de uma instância):

```tsx
// Opção: encapsular no componente (IDs únicos por instância)
const pointIdCounterRef = useRef(0);
// uso: { id: ++pointIdCounterRef.current, x, y, timestamp: performance.now() }
```

---

### IN-02: `performance.now()` chamado dentro de `renderTrail()` em vez de usar o timestamp do RAF

**File:** `src/components/viewer/laser-pointer-overlay.tsx:192`

**Issue:** `renderTrail()` chama `const now = performance.now()` durante a fase de render do React. O loop RAF já faz a poda dos pontos com base no tempo e atualiza o state. Ao recalcular `now` dentro do render, a opacidade é calculada com um timestamp ligeiramente posterior ao momento em que o estado foi computado. Em prática o delta é sub-milissegundo e imperceptível, mas a função `renderTrail` poderia receber `now` como parâmetro derivado do RAF para manter a lógica temporal coesa em um único lugar.

**Fix:** Passar o timestamp atual como prop ou memoizar o valor computado durante o RAF — alternativamente, aceitar a abordagem atual como pragmática dado o delta ser insignificante. Nenhuma ação urgente necessária.

---

### IN-03: `"use client"` em `viewer-theme.ts` impede reuso server-side das funções utilitárias puras

**File:** `src/components/viewer/viewer-theme.ts:1`

**Issue:** A diretiva `"use client"` é necessária para as partes que usam hooks React (`ViewerThemeProvider`, `useViewerTheme`, `ViewerThemeRoot`). Porém, as funções puras `isValidTheme`, `readSavedTheme`, `saveTheme`, `themeRootClass` e `themeProseClass`, bem como as constantes `VIEWER_THEMES`, `VIEWER_THEME_LABELS`, `VIEWER_PRESETS` e `DEFAULT_THEME`, não têm dependência de cliente. A diretiva no nível do arquivo contamina todo o módulo, impedindo que essas utilidades sejam importadas em Server Components sem warnings.

**Fix:** Separar as funções utilitárias e constantes em `viewer-theme-utils.ts` (sem diretiva), mantendo o context/hooks/componentes em `viewer-theme.ts` com `"use client"`. Não urgente, mas melhora a arquitetura para uso futuro em RSC.

---

### IN-04: `defaultProps` com `vi.fn()` em escopo de módulo nos testes pode vazar entre suites

**File:** `src/__tests__/presentation-mode.test.tsx:35`

**Issue:** `const defaultProps = { onExit: vi.fn() }` é criado no escopo do módulo de teste, não dentro de `beforeEach`. Embora `vi.clearAllMocks()` no `afterEach` limpe o histórico de chamadas, a referência permanece compartilhada entre todos os testes do arquivo. Testes que chamam `defaultProps.onExit` como callback e depois inspecionam o mock podem ver chamadas de testes anteriores se `clearAllMocks` falhar ou for omitido por engano.

**Fix:** Mover a criação do mock para `beforeEach`:

```tsx
let defaultProps: { onExit: ReturnType<typeof vi.fn> };

beforeEach(() => {
  defaultProps = { onExit: vi.fn() };
  vi.useFakeTimers();
});
```

---

_Reviewed: 2026-04-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
