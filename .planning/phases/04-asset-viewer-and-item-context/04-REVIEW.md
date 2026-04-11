---
phase: 04-asset-viewer-and-item-context
reviewed: 2026-04-10T00:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - src/__tests__/info-panel.test.tsx
  - src/__tests__/item-repository.test.ts
  - src/__tests__/preview-route.test.ts
  - src/__tests__/viewer-page.test.tsx
  - src/app/api/pkm/preview/[...path]/route.ts
  - src/components/viewer/image-viewer.tsx
  - src/components/viewer/info-panel.tsx
  - src/components/viewer/pdf-viewer.tsx
  - src/components/viewer/sidecar-markdown.tsx
  - src/components/viewer/unsupported-viewer.tsx
  - src/components/viewer/viewer-client-shell.tsx
  - src/components/viewer/viewer-page.tsx
  - src/lib/pkm/fs-item-repository.ts
  - src/lib/pkm/item-repository.ts
  - src/lib/pkm/types.ts
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-04-10
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

A fase 04 entrega o viewer de assets binários (ImageViewer, PdfViewer, UnsupportedViewer), o sidecar editorial no InfoPanel, a rota autenticada `/api/pkm/preview`, e a integração em ViewerPage e ViewerClientShell. A implementação segue consistentemente as decisões de design: separação semântica inline/attachment, boundary de path traversal centralizado em `resolveAndValidatePath`, e ausência de leitura UTF-8 de binários no caminho do viewer.

Um problema crítico foi identificado: o header `Content-Disposition` na rota de preview usa o nome do arquivo sem sanitização, abrindo espaço para injeção de header se o filename contiver aspas, ponto-e-vírgula ou quebras de linha. Quatro avisos de qualidade envolvem falsos positivos na heurística de tipo sidecar, ausência de error handling em leituras de índice e em `getBinaryContext`, e XSS teórico por SVG servido como `image/svg+xml` inline.

---

## Critical Issues

### CR-01: Header injection em Content-Disposition via filename não sanitizado

**File:** `src/app/api/pkm/preview/[...path]/route.ts:73`

**Issue:** O header `Content-Disposition` é construído interpolando diretamente o nome do arquivo sem sanitizar aspas, ponto-e-vírgula ou caracteres de nova linha. Em sistemas Linux, nomes de arquivo podem conter qualquer caractere exceto `/` e `\0`. Um arquivo chamado `nota"injetada".pdf` produziria `inline; filename="nota"injetada".pdf"` — quebrando o valor do header. Um nome com `\r\n` poderia injetar headers HTTP arbitrários (CRLF injection), embora versões recentes do Node.js rejeitem isso em tempo de execução com um `TypeError`.

```typescript
// Problema atual — linha 73
"Content-Disposition": `inline; filename="${filename}"`,
```

**Fix:** Sanitizar o filename removendo caracteres problemáticos antes de usá-lo no header. O approach mais simples e seguro é usar `encodeURIComponent` no parâmetro `filename*` (RFC 5987), ou no mínimo remover/escapar aspas e caracteres de controle:

```typescript
// Opção 1 — RFC 5987 (melhor compatibilidade cross-browser)
const safeFilename = encodeURIComponent(filename);
"Content-Disposition": `inline; filename*=UTF-8''${safeFilename}`,

// Opção 2 — sanitização mínima (remove aspas e caracteres de controle)
const safeFilename = filename.replace(/["\\]/g, "").replace(/[\x00-\x1f]/g, "");
"Content-Disposition": `inline; filename="${safeFilename}"`,
```

---

## Warnings

### WR-01: Heurística `inferType()` produz falsos positivos em arquivos com ponto no nome

**File:** `src/lib/pkm/fs-item-repository.ts:154-156`

**Issue:** A detecção de sidecar usa o regex `/\.[^.]+\.[^.]+$/` para identificar arquivos com dupla extensão (ex: `foto.png.md`). Porém, qualquer `.md` com ponto no nome — como `nota-v2.0.md` ou `resumo.v1.md` — também corresponde ao padrão e é incorretamente classificado como `binario` em vez de `nota`. Isso fará com que `getItem()` trate a nota como binária, omitindo getItemContent e potencialmente afetando a navegação.

```typescript
// Atual — falso positivo para 'nota-v2.0.md'
const isSidecar = /\.[^.]+\.[^.]+$/.test(relPath);
if (isSidecar) return "binario";
```

**Fix:** Restringir o padrão para apenas arquivos cujo último segmento é `.md` e o penúltimo é uma extensão binária conhecida, ou checar explicitamente que o arquivo termina em `.md` após outra extensão não-`.md`:

```typescript
// Sidecar: termina em .<ext>.md onde <ext> não é md
const isSidecar = /\.[^.]+\.md$/.test(relPath) && !relPath.endsWith(".md");
// Simplificando: se o basename tem o padrão <name>.<ext>.md
const isSidecar = /\.[^.]+\.md$/.test(path.basename(relPath)) &&
  path.basename(relPath) !== path.basename(relPath, ".md") + ".md".replace(/\.[^.]+\.md$/, ".md");
```

Alternativa mais legível:

```typescript
// Verifica se basename tem formato: nome.extensao.md (e extensao != md)
const base = path.basename(relPath);
const isSidecar = /\.([^.]+)\.md$/.test(base) && !base.match(/^[^.]+\.md$/);
```

A forma mais robusta é comparar com uma lista de extensões binárias conhecidas do PKM.

### WR-02: SVG servido como `image/svg+xml` com `Content-Disposition: inline`

**File:** `src/app/api/pkm/preview/[...path]/route.ts:33`

**Issue:** Arquivos `.svg` são servidos com `Content-Type: image/svg+xml` e `Content-Disposition: inline`, permitindo que o browser renderize o SVG com scripts embutidos (`<script>` dentro do SVG). Isso constitui XSS se o arquivo SVG contiver JavaScript malicioso. O risco é mitigado pela autenticação obrigatória (o conteúdo pertence ao próprio usuário), mas um SVG capturado de fonte externa poderia conter código malicioso e ser executado ao ser visualizado.

```typescript
// Atual — SVG served as inline renderável
".svg": "image/svg+xml",
```

**Fix:** Servir SVGs como `text/plain` ou `image/svg+xml` com header `Content-Security-Policy` restrictivo, ou como `Content-Disposition: attachment` para forçar download em vez de renderização inline:

```typescript
// Opção 1 — forçar download de SVG (mais seguro)
if (ext === ".svg") {
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// Opção 2 — manter inline mas adicionar CSP
"Content-Security-Policy": "script-src 'none'",
```

### WR-03: `listTopics()` e `listGroups()` sem tratamento de erro

**File:** `src/lib/pkm/fs-item-repository.ts:33-41`

**Issue:** Ambos os métodos chamam `fs.readFileSync` e `JSON.parse` sem `try/catch`. Se `topicos.json` ou `grupos.json` não existir (ENOENT) ou estiver corrompido (JSON inválido), a exceção não tratada vai propagar até o Server Component e resultar em erro 500 para o usuário, com possível vazamento do stack trace no log.

```typescript
// Atual — sem tratamento
listTopics(): Topic[] {
  const raw = fs.readFileSync(indexPath, "utf-8");
  return JSON.parse(raw) as Topic[];
}
```

**Fix:** Envolver em `try/catch` e retornar array vazio em caso de erro, registrando o problema no log:

```typescript
listTopics(): Topic[] {
  try {
    const raw = fs.readFileSync(indexPath, "utf-8");
    return JSON.parse(raw) as Topic[];
  } catch (err) {
    console.error("[FsItemRepository] Falha ao ler topicos.json:", err);
    return [];
  }
}
```

### WR-04: `getBinaryContext()` chamado sem `try/catch` em `ViewerPage`

**File:** `src/components/viewer/viewer-page.tsx:69`

**Issue:** A chamada `repo.getBinaryContext(item.id)` pode lançar exceção por erros de filesystem (EPERM, EACCES, disco cheio) além do path traversal. Em `ViewerPage`, que é um Server Component, uma exceção não tratada resulta em erro 500 para o usuário ao tentar visualizar qualquer asset binário ou PDF.

```typescript
// Atual — linha 69, sem try/catch
const binaryContext = repo.getBinaryContext(item.id);
```

**Fix:** Envolver em `try/catch` com fallback para contexto vazio:

```typescript
let binaryContext: { sidecarContent: string | null; sidecarFrontmatter: RawFrontmatter | null };
try {
  binaryContext = repo.getBinaryContext(item.id);
} catch (err) {
  console.error("[ViewerPage] Falha ao ler contexto binário para:", item.id, err);
  binaryContext = { sidecarContent: null, sidecarFrontmatter: null };
}
const sidecarContent = binaryContext.sidecarContent;
```

---

## Info

### IN-01: `decodeURIComponent` redundante em `getItem()`

**File:** `src/lib/pkm/fs-item-repository.ts:45`

**Issue:** `getItem()` chama `decodeURIComponent(id)` na linha 45, mas `resolveAndValidatePath()` (chamada na linha 46) já executa a mesma decodificação internamente. A variável `decoded` na linha 45 só é usada para inferência de tipo (linha 54) e extração de segmentos (linha 58-59), mas poderia ser calculada de forma mais explícita a partir do `absPath`.

**Fix:** Remover a decodificação duplicada e usar `decoded` apenas onde necessário, ou extrair o decode para um utilitário compartilhado:

```typescript
getItem(id: string): Item | null {
  const absPath = this.resolveAndValidatePath(id); // decodifica internamente
  // Usar decodeURIComponent(id) apenas para inferência de metadados
  const decoded = decodeURIComponent(id);
  // ... resto do método
}
```

O código atual funciona corretamente; a redundância é apenas clareza.

### IN-02: Operador `??` redundante em `ViewerPage` para `getItemContent`

**File:** `src/components/viewer/viewer-page.tsx:51`

**Issue:** `repo.getItemContent(item.id) ?? ""` usa `??` para fallback, mas `getItemContent()` nunca retorna `null` ou `undefined` — retorna `string` em todos os casos (string vazia se arquivo não existe). O operador `??` é inócuo mas gera confusão sobre o contrato de retorno da função.

**Fix:** Remover o operador `??` ou atualizar a assinatura de `getItemContent` na interface para deixar explícito que retorna `string` (não `string | null`):

```typescript
// Simplificado — confiante no contrato da interface
const content = repo.getItemContent(item.id);
```

### IN-03: Slot de sidecar vazio renderiza `<div>` invisível no DOM

**File:** `src/components/viewer/info-panel.tsx:207-208`

**Issue:** Quando `sidecarContent` é falsy, o InfoPanel renderiza um `<div data-slot="sidecar-content-phase4" aria-hidden="true" />` vazio. Este elemento não tem impacto visual, mas polui o DOM e pode confundir ferramentas de acessibilidade ou testes que varrem todos os elementos do painel.

**Fix:** Retornar `null` em vez de um div vazio, mantendo apenas o slot preenchido:

```typescript
// Atual
{sidecarContent ? (
  <>
    <div className="border-t ..." />
    <div data-testid="sidecar-content-phase4" ...>...</div>
  </>
) : (
  <div data-slot="sidecar-content-phase4" aria-hidden="true" />
)}

// Proposto
{sidecarContent && (
  <>
    <div className="border-t ..." />
    <div data-testid="sidecar-content-phase4" ...>...</div>
  </>
)}
```

---

_Reviewed: 2026-04-10_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
