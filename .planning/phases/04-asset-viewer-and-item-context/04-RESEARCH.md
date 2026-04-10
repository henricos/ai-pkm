# Phase 4: Asset Viewer and Item Context - Research

**Researched:** 2026-04-10 [VERIFIED: system date]
**Domain:** viewer de assets read-only, preview inline autenticado e contexto sidecar para itens binários [VERIFIED: codebase grep]
**Confidence:** HIGH [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] [CITED: https://nextjs.org/docs/app/building-your-application/routing/router-handlers] [VERIFIED: npm registry]

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Imagens abrem como conteudo principal do viewer, centralizadas e tratadas como peca principal da tela, nao como anexo secundario.
- **D-02:** A experiencia de imagem deve ser clean e editorial, sem barras, molduras ou chrome pesado que destoem do restante da shell.
- **D-03:** O comportamento base e `object-contain` com enquadramento confortavel e controles minimos de zoom in/out + reset simples. Pan livre, toolbar extensa e outras ferramentas avancadas nao sao prioridade.
- **D-03b:** A implementacao de imagem deve priorizar solucao leve no stack atual (HTML/CSS/React simples) antes de considerar biblioteca dedicada de media viewer.
- **D-04:** PDF usa preview inline basico e limpo dentro do viewer quando o navegador suportar, sem UI carregada nem abrir outra aba por padrao.
- **D-05:** O foco do PDF e o conteudo. Controles como busca interna, barra rica, thumbnails e chrome de leitor completo sao extras e nao obrigatorios nesta fase.
- **D-06:** O download continua sendo a acao normal do browser a partir do botao existente no header; nao e necessario abrir outra aba nem criar fluxo alternativo.
- **D-06b:** A estrategia preferencial para PDF nesta fase e aproveitar preview inline nativo do browser antes de pesquisar ou introduzir stacks mais pesadas como leitor dedicado.
- **D-07:** Binario + sidecar continuam sendo um unico item logico: o sidecar nao reaparece na navegacao e entra apenas como contexto do item principal.
- **D-08:** O conteudo do sidecar deve ser lido do arquivo Markdown associado e exibido no final do `InfoPanel`.
- **D-09:** O texto do sidecar deve ser apresentado de forma editorial com renderizacao Markdown rica, nao como YAML, texto cru de arquivo ou bloco tecnico.
- **D-10:** O fallback atual de formato nao suportado esta aceito como base da fase 4; nao precisa ser redesenhado nem ganhar novos comportamentos.
- **D-11:** O unico ajuste desejado no fallback atual e tornar a mensagem um pouco mais legivel/editorial, escurecendo um pouco o texto e aumentando levemente a tipografia.
- **D-12:** Ha preferencia explicita por preview somente leitura de `.excalidraw`, sem editor embutido e sem virar uma subfase de edicao.
- **D-13:** Preview read-only de `.excalidraw` nao e compromisso desta fase. So deve entrar se for trivial, de baixo custo e claramente sem superficie de edicao; caso contrario, o fallback atual de formato nao suportado e aceitavel e nao bloqueia a fase.

### Claude's Discretion
- Biblioteca concreta de zoom/preview de imagem, apenas se a implementacao leve no stack atual se mostrar insuficiente e desde que preserve a experiencia clean e evite chrome pesado.
- Estrategia tecnica exata de preview inline de PDF, desde que priorize a opcao nativa e permaneça basica, embutida e degrade para download sem outra aba obrigatoria.
- Forma exata de renderizar o Markdown do sidecar dentro do `InfoPanel`, desde que pareca contexto editorial e nao um segundo viewer competindo com o principal.
- Viabilidade tecnica final do preview read-only de `.excalidraw`, mas sem transformar isso em trilha principal de pesquisa desta fase.

### Deferred Ideas (OUT OF SCOPE)
- Toolbar rica de media viewer com muitos controles, barras persistentes, thumbnails ou chrome semelhante a app de galeria
- Busca interna de PDF, painel de paginas e outros recursos de leitor completo
- Qualquer capacidade de edicao, anotacao ou manipulacao persistente sobre imagem, PDF ou Excalidraw
- Se o preview read-only de `.excalidraw` exigir uma superficie de edicao disfarcada ou custo excessivo, a expansao dessa experiencia vira fase futura
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIEW-04 | Viewer de imagem com zoom e enquadramento confortavel | Viewer nativo com `<img>`, `object-contain`, container com `overflow: auto` e zoom por `scale`; sem biblioteca pesada nesta fase. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scale] |
| VIEW-05 | PDF com preview suficiente ou fallback claro | Preview inline via `<object type="application/pdf">` usando rota autenticada inline; fallback visual dentro do próprio `<object>` para download quando não renderizar. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition] |
| VIEW-06 | Sidecar textual não navega separadamente | Navegação já exclui sidecars da árvore; fase 4 precisa só consumir o sidecar como contexto do item principal. [VERIFIED: codebase grep] |
| VIEW-07 | Formato não renderizável com mensagem clara e download | Fallback atual já existe em `ViewerPage`; basta refinar copy/estilo e preservar o botão de download autenticado do header. [VERIFIED: codebase grep] |
| CTX-05 | Binário com sidecar exibe texto complementar no InfoPanel | `InfoPanel` já tem slot reservado; falta método no repositório para ler sidecar Markdown sem tentar parsear o binário bruto. [VERIFIED: codebase grep] |
</phase_requirements>

## Summary

O plano da fase 4 deve assumir uma solução deliberadamente leve: imagem com HTML/CSS nativos e PDF com preview inline do próprio navegador, ambos dentro da shell atual e sem introduzir viewer pesado nesta fase. Isso está alinhado com as decisões travadas da fase e com a capacidade nativa dos browsers modernos para `<img>`, `<object>` e containers com `overflow`. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow]

O ponto arquitetural mais importante é separar preview inline de download. A rota atual `/api/pkm/raw/[...path]` sempre responde com `Content-Disposition: attachment`, o que é correto para o botão de download, mas não serve como base limpa para preview embutido. O planner deve prever uma rota ou modo separado para preview inline autenticado, mantendo a validação de path traversal e o mesmo controle de acesso. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition] [CITED: https://nextjs.org/docs/app/building-your-application/routing/router-handlers]

O segundo ponto crítico é o sidecar. Hoje `ViewerPage` chama `getItemContent()` e `getItemFrontmatter()` antes de verificar `itemKind`, e `FsItemRepository` lê qualquer arquivo como UTF-8 com `gray-matter`. Para binários reais, isso precisa ser refatorado no plano: o branch de asset deve evitar ler o binário como Markdown e obter contexto a partir de um método explícito de sidecar. [VERIFIED: codebase grep]

**Primary recommendation:** planejar a fase 4 em torno de três entregas técnicas: `preview route inline`, `asset branches no ViewerPage` e `sidecar context no ItemRepository/InfoPanel`. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04]

## User Constraints

As decisões do `04-CONTEXT.md` exigem viewer clean, foco no conteúdo, prioridade para solução leve no stack atual, sidecar como contexto editorial e fallback claro sem redesenho profundo. O plano não deve pesquisar toolbar rica, leitor completo de PDF, nem integração pesada de Excalidraw. [VERIFIED: codebase grep]

## Project Constraints (from CLAUDE.md)

- Ler `AGENTS.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md` e `.planning/ROADMAP.md` antes de agir. [VERIFIED: codebase grep]
- Manter estrutura/configs/código em inglês e conteúdo autoral em `pt-BR`. [VERIFIED: codebase grep]
- Respeitar o `pkm` como fonte primária de verdade e manter a web read-only. [VERIFIED: codebase grep]
- Antes de implementar tela, seguir `DESIGN.md` e usar `reference/ui/screens/` apenas como inspiração visual, nunca como código direto. [VERIFIED: codebase grep]
- Preferir bibliotecas maduras e não reinventar componentes centrais cedo demais. [VERIFIED: codebase grep]
- Não fazer commit automático; qualquer commit precisa de aprovação explícita e uso da skill `/commit-push`. [VERIFIED: codebase grep]
- Não editar índices JSON manualmente; usar as skills apropriadas quando o trabalho for sobre PKM estrutural. [VERIFIED: codebase grep]

## Standard Stack

### Core

| Library / Platform | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | `16.2.3` no npm; `^16.2.3` no repo; publicado em 2026-04-08. [VERIFIED: npm registry] | App Router, Server Components e Route Handlers para viewer e preview autenticado. [CITED: https://nextjs.org/docs/app/building-your-application/routing/router-handlers] | Já é a base instalada do projeto e cobre a necessidade de endpoints inline sem trocar stack. [VERIFIED: codebase grep] |
| React | `19.2.5` no npm; `19.2.4` no repo; `19.2.4` publicado em 2026-01-26 e `19.2.5` em 2026-04-08. [VERIFIED: npm registry] | Componentização do viewer e controles mínimos de zoom/painel. [VERIFIED: codebase grep] | A fase não exige upgrade; o stack atual já suporta a solução proposta. [VERIFIED: codebase grep] |
| Browser-native `<img>` + CSS `overflow`/`scale` | Baseline amplamente disponível; `img` desde 2015, `overflow` desde 2015, `scale` desde 2022. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scale] | Viewer de imagem com enquadramento confortável e zoom simples. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img] | Atende D-03/D-03b sem trazer chrome pesado nem dependência nova. [VERIFIED: codebase grep] |
| Browser-native `<object type="application/pdf">` | Baseline amplamente disponível desde 2015. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] | Preview inline de PDF com fallback embutido. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] | Permite manter a fase leve e ainda exibir fallback claro no mesmo espaço do viewer. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-markdown | `10.1.0` no npm e no repo; publicado em 2025-03-07. [VERIFIED: npm registry] | Renderizar o corpo Markdown do sidecar de forma editorial e segura. [VERIFIED: installed package readme] | Reusar a mesma pipeline do viewer para o texto complementar no `InfoPanel`. [VERIFIED: codebase grep] |
| remark-gfm | `^4.0.1` no repo. [VERIFIED: codebase grep] | Preservar tabelas, task lists e links no sidecar, se houver. [VERIFIED: codebase grep] | Usar via `MarkdownAsync` já existente, não criar um renderer paralelo. [VERIFIED: codebase grep] |
| Vitest | `4.1.4` no npm; `3.2.4` no repo; `3.2.4` publicado em 2025-06-17 e `4.1.4` em 2026-04-09. [VERIFIED: npm registry] | Cobrir novos branches do viewer, rota de preview e repositório de sidecar. [VERIFIED: codebase grep] | Permanecer na versão do repo nesta fase; upgrade não é requisito do problema. [VERIFIED: codebase grep] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `<object>` nativo para PDF [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] | `react-pdf` / pdf.js [ASSUMED] | Traria peso, worker/config extra e UI mais complexa para uma fase cujo requisito explícito é preview básico e fallback claro. [VERIFIED: codebase grep] [ASSUMED] |
| `<img>` + `scale` + `overflow` [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scale] | viewer dedicado com pan/toolbars [ASSUMED] | Resolve um problema maior que o escopo atual e tende a violar a direção de UI clean/minimalista. [VERIFIED: codebase grep] [ASSUMED] |
| Reuso de `MarkdownAsync` existente [VERIFIED: codebase grep] [VERIFIED: installed package readme] | renderer Markdown paralelo no `InfoPanel` [ASSUMED] | Duplicaria estilo, sanitização e comportamento de plugins sem necessidade. [VERIFIED: codebase grep] [ASSUMED] |

**Installation:** Nenhum pacote novo é necessário para a recomendação principal desta fase. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04]

**Version verification:** `next@16.2.3`, `react-markdown@10.1.0`, `react@19.2.5` e `vitest@4.1.4` foram confirmados no npm registry em 2026-04-10; o repo usa `next@^16.2.3`, `react-markdown@^10.1.0`, `react@19.2.4` e `vitest@3.2.4`. [VERIFIED: npm registry] [VERIFIED: codebase grep]

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── app/api/pkm/
│   ├── raw/[...path]/route.ts          # download attachment existente
│   └── preview/[...path]/route.ts      # preview inline autenticado
├── components/viewer/
│   ├── viewer-page.tsx                 # roteia markdown/image/pdf/binary/excalidraw
│   ├── image-viewer.tsx                # img + zoom simples + reset
│   ├── pdf-viewer.tsx                  # object/embed + fallback de download
│   ├── unsupported-viewer.tsx          # fallback editorial reaproveitável
│   └── sidecar-markdown.tsx            # render do contexto complementar
└── lib/pkm/
    ├── item-repository.ts              # contrato estendido para sidecar/preview context
    └── fs-item-repository.ts           # leitura segura do sidecar adjacente
```

### Pattern 1: Dispatch por `itemKind` antes de qualquer leitura de conteúdo

**What:** `ViewerPage` deve decidir o branch por `item.itemKind` antes de chamar métodos que assumem Markdown. [VERIFIED: codebase grep]

**When to use:** Sempre que o item não for `markdown`, para evitar ler binários como UTF-8 e tentar parseá-los com `gray-matter`. [VERIFIED: codebase grep]

**Why:** Hoje `ViewerPage` chama `getItemContent()` e `getItemFrontmatter()` antes do `if (item.itemKind !== "markdown")`; isso é seguro para `.md`, mas incorreto para imagem/PDF/binário. [VERIFIED: codebase grep]

**Example:**

```typescript
// Source: codebase inference from ViewerPage + FsItemRepository
export async function ViewerPage({ item }: ViewerPageProps) {
  const repo = new FsItemRepository();

  if (item.itemKind === "markdown") {
    const content = repo.getItemContent(item.id);
    const frontmatter = repo.getItemFrontmatter(item.id) ?? { estado: item.estado };
    return <ViewerClientShell /* ... */><MarkdownViewer content={content} /></ViewerClientShell>;
  }

  const assetContext = repo.getBinaryContext(item.id);
  return <ViewerClientShell /* ... */>{renderAsset(item, assetContext)}</ViewerClientShell>;
}
```

Inference: esse padrão é necessário porque os fatos do código atual mostram leitura Markdown antecipada em branch que passará a servir binários reais. [VERIFIED: codebase grep]

### Pattern 2: Preview inline autenticado separado do download attachment

**What:** Criar uma rota de preview com `Content-Disposition: inline` ou sem o header de attachment, preservando auth e validação de path. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition] [CITED: https://nextjs.org/docs/app/building-your-application/routing/router-handlers]

**When to use:** Para `<img>` e `<object>` dentro do viewer. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04]

**Why:** A rota atual de download responde como attachment em todos os casos; isso é a semântica errada para preview inline. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition]

**Example:**

```typescript
// Source: Next.js route handlers + current raw route shape
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session) return new NextResponse(null, { status: 401 });

  const itemId = (await params).path.join("/");
  const repo = new FsItemRepository();
  const absPath = repo.resolveItemPath(itemId);
  const ext = path.extname(itemId).toLowerCase();
  const buffer = fs.readFileSync(absPath);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": CONTENT_TYPE_MAP[ext] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${path.basename(itemId)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
```

### Pattern 3: Sidecar como contexto enriquecido do item binário

**What:** Adicionar método explícito no `ItemRepository` para retornar `{ sidecarContent, sidecarFrontmatter }` a partir do arquivo adjacente `nome.extensao.md`. [VERIFIED: codebase grep]

**When to use:** Para qualquer `itemKind` não-Markdown que tenha sidecar associado. [VERIFIED: codebase grep]

**Why:** `InfoPanel` já reserva um slot para isso e `FsItemRepository` já detecta `sidecarPath`, mas ainda não expõe leitura segura e específica do sidecar. [VERIFIED: codebase grep]

**Example:**

```typescript
// Source: codebase inference from fs-item-repository.ts and info-panel.tsx
interface BinaryContext {
  sidecarContent: string | null;
  sidecarFrontmatter: RawFrontmatter | null;
}

getBinaryContext(id: string): BinaryContext {
  const item = this.getItem(id);
  if (!item?.sidecarPath || !fs.existsSync(item.sidecarPath)) {
    return { sidecarContent: null, sidecarFrontmatter: null };
  }

  const raw = fs.readFileSync(item.sidecarPath, "utf-8");
  const { data, content } = matter(raw);
  return {
    sidecarContent: content.trim() || null,
    sidecarFrontmatter: data as RawFrontmatter,
  };
}
```

### Anti-Patterns to Avoid

- **Reusar `/api/pkm/raw` como source de preview:** o route handler atual foi desenhado para download attachment, não para inline preview. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition]
- **Ler binário via `gray-matter`:** isso mistura duas naturezas de arquivo e empurra parsing incorreto para o caminho feliz da fase 4. [VERIFIED: codebase grep]
- **Usar `<iframe>` como solução principal de PDF:** `iframe` embute um browsing context completo, consome mais recursos e `object-fit` não tem efeito nele; além disso, o próprio MDN alerta que o evento `load` sempre dispara mesmo se o conteúdo falhar, o que piora o fallback. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe]
- **Criar um segundo sistema de Markdown só para sidecar:** o projeto já tem pipeline editorial com `MarkdownAsync`, `remark-gfm`, `remark-math` e Shiki. [VERIFIED: codebase grep] [VERIFIED: installed package readme]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Preview de PDF nesta fase | leitor completo com busca, thumbnails, paginação e worker próprio [ASSUMED] | `<object type="application/pdf">` + fallback de download [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] | O requisito pede preview suficiente, não reader completo. [VERIFIED: codebase grep] |
| Viewer de imagem | galeria avançada com pan livre e toolbar extensa [ASSUMED] | `<img>` centralizado + `object-contain` + zoom por `scale` e scroll container [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scale] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow] | Menor superfície, menos UI concorrendo com o conteúdo. [VERIFIED: codebase grep] |
| Contexto do sidecar | parser Markdown paralelo ou dump cru de arquivo [ASSUMED] | Reuso do pipeline `MarkdownAsync` existente [VERIFIED: installed package readme] [VERIFIED: codebase grep] | Mantém coerência visual, sanitização e plugins já validados na fase 3. [VERIFIED: codebase grep] |
| Resolução de sidecar | lógica ad hoc em componentes React [ASSUMED] | método explícito no `ItemRepository` / `FsItemRepository` [VERIFIED: codebase grep] | Preserva ARC-04 e evita espalhar detalhes de filesystem na UI. [VERIFIED: codebase grep] |

**Key insight:** nesta fase, o custo oculto não está em renderizar imagem ou PDF; está em misturar download, preview e sidecar no mesmo fluxo sem separar responsabilidades no repositório e nas rotas. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition]

## Common Pitfalls

### Pitfall 1: Preview inline usando rota de download
**What goes wrong:** a UI tenta usar `/api/pkm/raw/...` em `<img>` ou `<object>` e o browser recebe `attachment`, empurrando download ou comportamento inconsistente. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition]
**Why it happens:** a rota atual foi desenhada para CTX-02, não para preview. [VERIFIED: codebase grep]
**How to avoid:** criar rota/modo `preview` com `inline` e manter `raw` exclusivamente para download. [VERIFIED: codebase grep] [CITED: https://nextjs.org/docs/app/building-your-application/routing/router-handlers]
**Warning signs:** imagem não aparece, PDF baixa imediatamente, ou o viewer usa URL de attachment como `src`. [VERIFIED: codebase grep]

### Pitfall 2: Ler binário como Markdown
**What goes wrong:** `gray-matter` e leitura UTF-8 são aplicados a `.png`, `.pdf` ou `.zip`. [VERIFIED: codebase grep]
**Why it happens:** `ViewerPage` hoje busca conteúdo/frontmatter antes do branch por `itemKind`. [VERIFIED: codebase grep]
**How to avoid:** mover a decisão de branch para o topo do componente e introduzir método de contexto binário no repositório. [VERIFIED: codebase grep]
**Warning signs:** preview quebrado, caracteres inválidos, frontmatter vazio inesperado ou exceções ao renderizar binário. [VERIFIED: codebase grep]

### Pitfall 3: Escolher `<iframe>` para PDF e perder fallback confiável
**What goes wrong:** o PDF fica preso em um browsing context com sizing menos controlável e falha de carga difícil de detectar. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe]
**Why it happens:** `iframe` parece solução rápida, mas `object-fit` não funciona nele e o `load` é sempre disparado. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe]
**How to avoid:** usar `<object>` como padrão do PDF e colocar fallback HTML dentro dele. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04]
**Warning signs:** hacks para ajustar viewport, ausência de fallback no mesmo espaço ou dependência de nova aba para validar renderização. [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe]

### Pitfall 4: Sidecar aparecer como “segundo documento”
**What goes wrong:** o painel vira um segundo viewer, concorre com o asset principal e quebra a unidade lógica do item. [VERIFIED: codebase grep]
**Why it happens:** render do sidecar sem hierarquia visual ou com container grande demais. [ASSUMED]
**How to avoid:** renderizar o Markdown do sidecar no final do `InfoPanel`, com escala tipográfica menor e sem duplicar header/toolbar. [VERIFIED: codebase grep] [ASSUMED]
**Warning signs:** rolagem dominante no painel lateral, repetição de título/estado ou desejo de “abrir o sidecar” separadamente. [ASSUMED]

### Pitfall 5: Perder controles de segurança ao adicionar rota de preview
**What goes wrong:** preview inline vira bypass de autenticação ou de path traversal. [VERIFIED: codebase grep]
**Why it happens:** duplicação apressada do route handler sem repetir `auth()` e `resolveItemPath()`. [VERIFIED: codebase grep]
**How to avoid:** compartilhar a mesma rotina de validação/path resolution da rota raw. [VERIFIED: codebase grep] [CITED: https://nextjs.org/docs/app/building-your-application/routing/router-handlers]
**Warning signs:** preview responde sem sessão, aceita `../` ou perde `X-Content-Type-Options: nosniff`. [VERIFIED: codebase grep]

## Code Examples

Verified patterns from official sources and current codebase:

### Image viewer leve

```tsx
// Source: MDN img + overflow + scale; adapted to current viewer shell
export function ImageViewer({ src, alt }: { src: string; alt: string }) {
  const [zoom, setZoom] = useState(1);

  return (
    <section className="flex min-h-[calc(100dvh-2.75rem)] items-center justify-center px-6 py-8">
      <div className="flex max-h-full w-full flex-col gap-4">
        <div className="flex items-center justify-center gap-2 self-end">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>-</button>
          <button onClick={() => setZoom(1)}>100%</button>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>+</button>
        </div>

        <div className="overflow-auto rounded-sm bg-surface-container-low">
          <img
            src={src}
            alt={alt}
            className="mx-auto block h-auto max-h-[75vh] w-auto max-w-full object-contain transition-transform"
            style={{ scale: `${zoom}` }}
          />
        </div>
      </div>
    </section>
  );
}
```

### PDF preview com fallback embutido

```tsx
// Source: MDN object element fallback pattern
export function PdfViewer({ src, downloadHref }: { src: string; downloadHref: string }) {
  return (
    <section className="h-full px-6 py-8">
      <object
        data={src}
        type="application/pdf"
        className="h-[80vh] w-full rounded-sm bg-surface-container-low"
      >
        <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 text-center text-on-surface/65">
          <p className="text-base">Preview de PDF indisponível neste navegador.</p>
          <a href={downloadHref} download className="text-sm text-tertiary underline">
            Baixar PDF
          </a>
        </div>
      </object>
    </section>
  );
}
```

### Sidecar no InfoPanel usando a pipeline já existente

```tsx
// Source: current MarkdownViewer pipeline and reserved sidecar slot in InfoPanel
export async function SidecarMarkdown({ content }: { content: string }) {
  return (
    <section className="flex flex-col gap-3 pt-2">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40">
        Contexto complementar
      </span>
      <div className="prose prose-sm max-w-none text-on-surface/80">
        <MarkdownAsync remarkPlugins={[remarkGfm]}>{content}</MarkdownAsync>
      </div>
    </section>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fallback único para todo item não-Markdown no `ViewerPage` [VERIFIED: codebase grep] | Branches específicos por `itemKind` com preview inline para imagem/PDF e fallback só para formatos não renderizáveis. [VERIFIED: codebase grep] | Necessário nesta fase para atender VIEW-04/05/07. [VERIFIED: codebase grep] | O viewer deixa de tratar imagem/PDF como “anexos secundários”. [VERIFIED: codebase grep] |
| Download raw como única saída para binário [VERIFIED: codebase grep] | Separação entre preview inline autenticado e download attachment. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition] | Exigido pela fase 4. [VERIFIED: codebase grep] | Evita conflito entre preview e download. [VERIFIED: codebase grep] |
| Slot vazio `sidecar-content-phase4` no `InfoPanel` [VERIFIED: codebase grep] | Render do sidecar Markdown como contexto editorial do item principal. [VERIFIED: codebase grep] | Fase 4. [VERIFIED: codebase grep] | Cumpre CTX-05 sem reintroduzir sidecar na navegação. [VERIFIED: codebase grep] |

**Deprecated/outdated:**
- Tratar todos os não-Markdown como “Formato não suportado para visualização” é comportamento legado da fase 3 e não satisfaz mais VIEW-04/05. [VERIFIED: codebase grep]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `react-pdf` / pdf.js continuariam sendo mais pesados e fora de proporção para esta fase específica. [ASSUMED] | Standard Stack / Alternatives | Pode levar o planner a desconsiderar uma opção aceitável se o corpus real de PDF for mais complexo. |
| A2 | O sidecar deve ter escala visual menor que o conteúdo principal para não competir com o asset. [ASSUMED] | Common Pitfalls | Ajuste fino de UI pode precisar ser recalibrado durante execução. |
| A3 | A rota de preview provavelmente pode ser separada em endpoint próprio ou query param, mas endpoint próprio é a opção mais clara para manutenção. [ASSUMED] | Architecture Patterns | O plano pode escolher uma modelagem de rotas ligeiramente diferente. |

**If this table is empty:** Não se aplica. Há inferências de implementação que precisam ser tratadas como escolhas do planner, não como fatos do ecossistema. [VERIFIED: codebase grep]

## Open Questions (RESOLVED)

1. **O corpus real de PDFs exige algo além de preview nativo?**
   - Resolution: **não por padrão nesta fase**. A decisão operacional da fase 4 é implementar preview nativo via `<object type="application/pdf">` como baseline e manter fallback claro de download no mesmo viewer. A validação com 2-3 PDFs reais continua obrigatória durante a execução como checkpoint humano de aceitação, mas **não reabre a decisão arquitetural nesta fase**. Se alguma amostra falhar, o resultado esperado ainda é fallback claro de download, não adoção automática de biblioteca pesada. [VERIFIED: codebase grep] [VERIFIED: STATE.md]

2. **O `InfoPanel` de binário deve incorporar também frontmatter do sidecar ou só o corpo Markdown?**
   - Resolution: **apenas o corpo Markdown do sidecar entra no caminho crítico da fase 4**. O `frontmatter` do sidecar pode ser exposto ao repositório por conveniência técnica, mas seu uso visual no `InfoPanel` fica explicitamente fora do escopo obrigatório e só pode entrar se for trivial e não competir com o asset principal. [VERIFIED: codebase grep]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build, tests, Next runtime local | ✓ [VERIFIED: local command] | `v24.14.1` [VERIFIED: local command] | — |
| npm | scripts, package inspection, test execution | ✓ [VERIFIED: local command] | `11.11.0` [VERIFIED: local command] | — |
| npx | execução granular de Vitest | ✓ [VERIFIED: local command] | `11.11.0` [VERIFIED: local command] | usar `npm test` [VERIFIED: codebase grep] |
| Browser-native `<img>`, `<object>`, CSS `overflow`/`scale` | preview inline | ✓ em browsers modernos segundo MDN [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scale] | — | fallback de download para PDF/formatos não renderizáveis [VERIFIED: codebase grep] |

**Missing dependencies with no fallback:**
- Nenhuma dependência externa nova é bloqueadora para a recomendação principal. [VERIFIED: codebase grep]

**Missing dependencies with fallback:**
- Nenhuma. [VERIFIED: local command]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest com `jsdom`. [VERIFIED: codebase grep] |
| Config file | `vitest.config.ts`. [VERIFIED: codebase grep] |
| Quick run command | `npx vitest run src/__tests__/viewer-page.test.tsx src/__tests__/info-panel.test.tsx src/__tests__/raw-route.test.ts src/__tests__/item-repository.test.ts` [VERIFIED: codebase grep] |
| Full suite command | `npm test && npm run typecheck` [VERIFIED: codebase grep] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIEW-04 | `itemKind=image` renderiza viewer principal com zoom/reset e sem fallback genérico | unit/component | `npx vitest run src/__tests__/viewer-page.test.tsx` | ✅ [VERIFIED: codebase grep] |
| VIEW-05 | `itemKind=pdf` renderiza preview inline e mostra fallback claro quando necessário | unit/component + route | `npx vitest run src/__tests__/viewer-page.test.tsx src/__tests__/raw-route.test.ts` | ✅ [VERIFIED: codebase grep] |
| VIEW-06 | sidecar continua oculto na navegação e é tratado como parte do item binário | unit/service | `npx vitest run src/__tests__/navigation-service.test.ts src/__tests__/item-repository.test.ts` | ✅ [VERIFIED: codebase grep] |
| VIEW-07 | formatos sem preview exibem mensagem editorial clara e download permanece disponível | unit/component | `npx vitest run src/__tests__/viewer-page.test.tsx src/__tests__/viewer-header.test.tsx` | ✅ [VERIFIED: codebase grep] |
| CTX-05 | `InfoPanel` exibe o corpo Markdown do sidecar do binário | unit/component + repository | `npx vitest run src/__tests__/info-panel.test.tsx src/__tests__/item-repository.test.ts` | ✅ [VERIFIED: codebase grep] |

### Sampling Rate

- **Per task commit:** `npx vitest run` focado nos arquivos do viewer/repository tocados. [VERIFIED: codebase grep]
- **Per wave merge:** `npm test` [VERIFIED: codebase grep]
- **Phase gate:** `npm test && npm run typecheck` verdes antes de `/gsd-verify-work`. [VERIFIED: codebase grep]

### Wave 0 Gaps

- [ ] Cobrir explicitamente o novo branch `itemKind=image` com assertions de zoom/reset e ausência de `unsupported-format`. [VERIFIED: codebase grep]
- [ ] Cobrir explicitamente o novo branch `itemKind=pdf` com assertions de preview inline e fallback no viewer. [VERIFIED: codebase grep]
- [ ] Adicionar teste do `ItemRepository` para leitura de sidecar adjacente sem abrir o binário como UTF-8. [VERIFIED: codebase grep]
- [ ] Se houver rota `preview`, adicionar teste dedicado para `Content-Disposition: inline`, `Content-Type` correto e auth obrigatória. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes [VERIFIED: codebase grep] | `auth()` obrigatório em qualquer rota nova de preview, como já ocorre em `/api/pkm/raw`. [VERIFIED: codebase grep] |
| V3 Session Management | yes [VERIFIED: codebase grep] | Reaproveitar o mesmo modelo de sessão/cookie já usado pela app. [VERIFIED: codebase grep] |
| V4 Access Control | yes [VERIFIED: codebase grep] | Validar item/path no servidor com `resolveItemPath()` e nunca expor path absoluto ao cliente. [VERIFIED: codebase grep] |
| V5 Input Validation | yes [VERIFIED: codebase grep] | Tratar `itemId`/`params.path` como input não confiável e reaproveitar a validação contra path traversal. [VERIFIED: codebase grep] |
| V6 Cryptography | no mudança específica nesta fase. [VERIFIED: codebase grep] | Manter o estado atual; a fase não introduz nova criptografia. [VERIFIED: codebase grep] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal em rota de preview/raw | Tampering | `resolveItemPath()` server-side e erro 400 para `../`. [VERIFIED: codebase grep] |
| Bypass de auth via endpoint de asset | Elevation of Privilege | `auth()` antes de qualquer leitura de filesystem. [VERIFIED: codebase grep] |
| Content sniffing em binários | Information Disclosure | manter `X-Content-Type-Options: nosniff`. [VERIFIED: codebase grep] |
| XSS via sidecar Markdown | Tampering | reusar `react-markdown` safe-by-default e não introduzir `rehype-raw`. [VERIFIED: installed package readme] [VERIFIED: codebase grep] |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: codebase grep] `src/components/viewer/viewer-page.tsx`, `src/components/viewer/info-panel.tsx`, `src/components/viewer/viewer-client-shell.tsx`, `src/components/viewer/viewer-header.tsx`, `src/lib/pkm/fs-item-repository.ts`, `src/lib/pkm/item-repository.ts`, `src/app/api/pkm/raw/[...path]/route.ts`, `src/__tests__/viewer-page.test.tsx`, `src/__tests__/item-repository.test.ts`, `src/__tests__/raw-route.test.ts`, `src/__tests__/info-panel.test.tsx`, `src/lib/navigation/navigation-service.ts`, `src/lib/navigation/navigation-types.ts`
- [VERIFIED: npm registry] `next@16.2.3`, `react@19.2.5`, `react-markdown@10.1.0`, `vitest@4.1.4`
- [VERIFIED: installed package readme] `node_modules/react-markdown/readme.md`
- [CITED: https://nextjs.org/docs/app/building-your-application/routing/router-handlers] route handlers do App Router
- [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img] `<img>` element
- [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04] `<object>` element e fallback content
- [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe] limitações do `<iframe>` para este caso
- [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow] `overflow`
- [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scale] `scale`
- [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition] semântica de `inline` vs `attachment`

### Secondary (MEDIUM confidence)
- `DESIGN.md` e `reference/ui/screens/03-media-viewer/code.html` como referência visual local de composição clean/editorial. [VERIFIED: codebase grep]

### Tertiary (LOW confidence)
- Nenhuma necessária para a recomendação principal. [VERIFIED: codebase grep]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - o plano recomendado depende majoritariamente de browser APIs e do stack já instalado/verificado no repo. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object?s=04]
- Architecture: HIGH - os principais riscos e seams estão explícitos no código atual (`ViewerPage`, `FsItemRepository`, `raw route`, `InfoPanel`). [VERIFIED: codebase grep]
- Pitfalls: HIGH - os pitfalls derivam diretamente da semântica HTTP/HTML oficial e dos pontos frágeis observáveis no código existente. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition] [CITED: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe]

**Research date:** 2026-04-10 [VERIFIED: system date]
**Valid until:** 2026-05-10 para stack/docs; revalidar antes só se a estratégia mudar para biblioteca dedicada de PDF/imagem. [VERIFIED: npm registry] [ASSUMED]
