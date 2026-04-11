# Phase 5: Presentation Mode - Research

**Researched:** 2026-04-11 [VERIFIED: system date]
**Domain:** modo de apresentacao interno do viewer, controles discretos, ponteiro laser temporario e presets de tema aplicados apenas ao conteudo [VERIFIED: codebase grep]
**Confidence:** HIGH [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage] [CITED: https://github.com/excalidraw/excalidraw/releases] [VERIFIED: npm registry]

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** O modo apresentacao segue a direcao de `palco puro`: quase todo o chrome de manutencao some e o conteudo vira foco principal.
- **D-02:** `InfoPanel` fica indisponivel no modo apresentacao; nao deve competir com a superficie principal.
- **D-03:** O modo apresentacao e interno da app e nao pode ser reduzido a mero uso da Fullscreen API do navegador.
- **D-04:** Os controles seguem explicitamente a referencia do PowerPoint: discretos, semitransparentes, auto-ocultaveis e revelados por uma regiao no canto inferior esquerdo.
- **D-05:** Movimento global de mouse nao deve fazer os controles reaparecerem; a descoberta precisa passar pela regiao de ativacao.
- **D-06:** Sair do modo acontece por `Esc` ou por botao dedicado.
- **D-07:** O conjunto minimo de controles desta fase cobre sair do modo e ligar/desligar o laser; anotacao fica no maximo como placeholder visual nao funcional.
- **D-08:** O ponteiro laser precisa buscar fidelidade pratica ao comportamento do Excalidraw, com persistencia curta e dissipacao progressiva.
- **D-09:** O laser funciona dentro e fora do modo apresentacao.
- **D-10:** A pesquisa deve priorizar reuso ou engenharia reversa pratica do comportamento do Excalidraw antes de propor implementacao totalmente do zero.
- **D-11:** Os presets de tema afetam apenas o viewer, nao a shell inteira.
- **D-12:** Os presets iniciais precisam incluir variantes inspiradas em ChatGPT, GitHub e Excalidraw.
- **D-13:** A troca de tema acontece pelo slot reservado no `ViewerHeader`, fora do modo apresentacao.

### Claude's Discretion
- Estrutura tecnica exata do estado global/local para presentation mode, contanto que preserve a shell atual fora do modo.
- Parametros finos de auto-hide, fade e comprimento do rastro do laser.
- Estrategia exata para aplicar os temas em markdown, imagem, PDF e fallback sem reescrever os viewers do zero.
- Persistencia local da escolha de tema e do estado do laser, desde que nao introduza backend nem banco.

### Deferred Ideas (OUT OF SCOPE)
- Anotacao persistente real sobre o conteudo.
- Configuracao da cor do laser.
- Theming global de toda a shell.
- Dependencia de fullscreen nativo como experiencia primaria.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PRS-01 | Modo de apresentacao interno distinto do fullscreen nativo | A Fullscreen API pode complementar, mas nao substitui o modo interno; o requisito pede uma superficie da app controlada pelo proprio viewer. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API] |
| PRS-02 | Ocultar shell e chrome de manutencao | O `ViewerClientShell` ja concentra header, scroll e `InfoPanel`; ele e o seam natural para trocar entre shell normal e palco puro. [VERIFIED: codebase grep] |
| PRS-03 | Controles discretos e auto-ocultaveis no canto inferior esquerdo | Padrao pode ser implementado com estado cliente + timers + hit area dedicada, sem depender de biblioteca externa. [VERIFIED: codebase grep] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] |
| PRS-04 | Sair do modo e ligar/desligar ponteiro, com placeholder futuro para anotacao | O header atual ja reserva o botao de apresentacao; os controles do palco podem concentrar os toggles minimos exigidos. [VERIFIED: codebase grep] |
| PRS-05 | Ponteiro laser temporario com rastro progressivo dentro e fora do modo | Pointer Events + `requestAnimationFrame()` sao a base correta para capturar movimento e dissipar trilhas com tempo, inclusive em telas de alta taxa de refresh. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] |
| PRS-06 | Temas prontos de leitura/apresentacao | O projeto ja usa tokens CSS/Tailwind e viewers separados; a forma mais segura e introduzir presets por data-attribute/classe no canvas do viewer, sem reinventar o design system. [VERIFIED: codebase grep] |
| PRS-07 | Presets inspirados em ChatGPT, GitHub e Excalidraw | Os temas podem variar tipografia, largura, fundo, codigo e contraste do container do conteudo sem alterar a shell inteira. [VERIFIED: codebase grep] |
</phase_requirements>

## Summary

O plano da fase 5 deve assumir que `presentation mode` e uma camada client-side transversal ao viewer atual, nao uma nova pagina nem um fullscreen nativo disfarçado. A implementacao ideal entra em `ViewerClientShell`, porque ali ja vivem o header sticky, o scroll container e o `InfoPanel`; isso permite esconder chrome, bloquear o painel e substituir a moldura normal por um palco puro sem bifurcar a arquitetura do app. [VERIFIED: codebase grep]

Para o laser, a recomendacao principal e avaliar primeiro o pacote separado `@excalidraw/laser-pointer`, confirmado no npm em `1.3.2` em 2026-04-11, porque ele reduz o custo de perseguir fidelidade pratica ao comportamento do Excalidraw sem importar o editor inteiro. Se a integracao do pacote nao encaixar de forma limpa no viewer atual, o fallback aceitavel continua sendo uma overlay local controlada por `PointerEvent` e animada por `requestAnimationFrame()`. [VERIFIED: npm registry] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState]

Nao encontrei documentacao publica do Excalidraw expondo um componente de laser reutilizavel pronto; a inferencia segura, olhando a documentacao publica e o estado atual do projeto, e tratar o comportamento do Excalidraw como referencia de UX, nao como dependencia direta. Em 2026-04-11, a release mais recente publicada do Excalidraw era `v0.18.0`, de 2025-03-11, e a documentacao publica foca integracao do editor, nao um modulo standalone de ponteiro. [CITED: https://github.com/excalidraw/excalidraw/releases] [CITED: https://docs.excalidraw.com/]

Para temas, a opcao mais robusta e aplicar presets somente ao canvas do viewer, via classe ou data-attribute no root do conteudo, com persistencia local opcional em `localStorage`. Isso preserva o requisito de nao tematizar a shell inteira e evita reestilizar navegacao, auth ou app chrome. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage] [VERIFIED: codebase grep]

**Primary recommendation:** decompor a fase 5 em quatro entregas: contratos de teste, superficie de apresentacao + controles, overlay de laser, e presets de tema + fechamento final. [VERIFIED: codebase grep]

## Project Constraints (from AGENTS.md)

- Ler `PROJECT.md`, `REQUIREMENTS.md` e `ROADMAP.md` antes de planejar ou implementar. [VERIFIED: codebase grep]
- Manter conteudo autoral em `pt-BR` e estrutura/codigo em ingles. [VERIFIED: codebase grep]
- Nao fazer commits automaticos; qualquer commit exige aprovacao e uso da skill de commit. [VERIFIED: codebase grep]
- Seguir `DESIGN.md` e usar Stitch apenas como referencia visual, nunca como codigo direto. [VERIFIED: codebase grep]
- Preservar o `pkm` como fonte de verdade e manter a web read-only. [VERIFIED: codebase grep]

## Standard Stack

### Core

| Library / Platform | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | `^16.2.3` no repo. [VERIFIED: package.json] | Shell App Router e composicao server/client do viewer. | O modo apresentacao e comportamento cliente dentro de uma arquitetura ja existente; nao exige troca de stack. [VERIFIED: codebase grep] |
| React | `19.2.4` no repo. [VERIFIED: package.json] | Estado cliente para presentation mode, controles e overlay do laser. | O viewer atual ja combina Server Components com shells cliente; a fase 5 encaixa naturalmente nesse padrao. [VERIFIED: codebase grep] |
| Tailwind CSS | `4.2.2` no repo. [VERIFIED: package.json] | Aplicar presets de tema, transicoes e superficie de palco puro. | O projeto ja usa tokens e classes utilitarias como lingua primaria de UI. [VERIFIED: codebase grep] |
| Pointer Events | Baseline amplamente disponivel. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent] | Capturar movimento e tipo de ponteiro para o laser. | Mais adequado que handlers legados de mouse quando o comportamento precisa atravessar mouse, pen e touch. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent] |
| `requestAnimationFrame()` | Baseline amplamente disponivel desde 2015. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] | Dissipacao do rastro e atualizacao sincronizada com repaints. | Evita timing artificial e lida melhor com telas de alta taxa de refresh. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | `^1.7.0` no repo. [VERIFIED: package.json] | Icones discretos dos controles de apresentacao e tema. | Reusar a dependencia atual em vez de SVGs novos dispersos. [VERIFIED: package.json] |
| `@radix-ui/react-tooltip` | `^1.2.8` no repo. [VERIFIED: package.json] | Tooltips opcionais e discretos dos controles do palco. | Util apenas se o plano quiser affordance minima sem poluir a UI. [VERIFIED: package.json] |
| `@excalidraw/laser-pointer` | `1.3.2` no npm em 2026-04-11. [VERIFIED: npm registry] | Reuso do comportamento de smoothing/outline do laser do ecossistema Excalidraw. | Candidato preferencial para o plano do laser, desde que a integracao nao force arquitetura maior que a fase pede. [VERIFIED: npm registry] |
| `localStorage` | Web API nativa. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage] | Persistir preset de tema entre sessoes. | Aceitavel porque a preferencia e local, sem backend e sem impacto estrutural. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Usar `@excalidraw/laser-pointer` | Overlay local implementada totalmente do zero | O pacote reduz risco de fidelidade, mas so vale a pena se integrar sem arrastar dependencias e adaptacoes excessivas ao viewer atual. [VERIFIED: npm registry] |
| Overlay local de laser com Pointer Events + RAF | Integrar o editor Excalidraw inteiro ou tentar extrair comportamento interno nao documentado | Custo e acoplamento desproporcionais para um viewer read-only; o requisito pede o comportamento, nao o editor. [CITED: https://docs.excalidraw.com/] [CITED: https://github.com/excalidraw/excalidraw/releases] |
| Modo interno do viewer | Fullscreen nativo como experiencia primaria | Nao cumpre PRS-01, e o proprio MDN deixa claro que fullscreen e um estado do browser, com regras de saida e limitacoes proprias. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API] |
| Presets por classe/data-attribute no viewer | Tema global da app inteira | Violaria as decisoes D-17/D-18 da fase. [VERIFIED: codebase grep] |

**Installation:** O plano do laser pode exigir adicionar `@excalidraw/laser-pointer@1.3.2` se a validacao rapida da integracao confirmar encaixe limpo; fora isso, nenhum pacote novo e estritamente necessario. [VERIFIED: npm registry] [VERIFIED: package.json]

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── components/viewer/
│   ├── viewer-client-shell.tsx          # estado do modo apresentacao
│   ├── viewer-header.tsx                # botao real de apresentacao + seletor de tema
│   ├── presentation-overlay.tsx         # palco puro + hit area + controles
│   ├── presentation-controls.tsx        # cluster inferior esquerdo
│   ├── laser-pointer-overlay.tsx        # desenho e dissipacao do rastro
│   └── viewer-theme.ts                  # presets ChatGPT/GitHub/Excalidraw
└── __tests__/
    ├── viewer-client-shell.test.tsx
    ├── viewer-header.test.tsx
    ├── laser-pointer-overlay.test.tsx
    └── presentation-mode.test.tsx
```

### Pattern 1: Presentation mode como estado do `ViewerClientShell`

**What:** Centralizar `isPresentationMode`, `isLaserEnabled`, `themePreset` e a indisponibilidade do `InfoPanel` em `ViewerClientShell`. [VERIFIED: codebase grep]

**When to use:** Sempre que o item estiver sendo exibido por `ViewerPage`, independente de ser markdown, imagem, PDF ou fallback. [VERIFIED: codebase grep]

**Why:** Hoje o header e o painel ja dependem do shell cliente; o presentation mode precisa mudar exatamente essas partes e nao o roteamento. [VERIFIED: codebase grep]

### Pattern 2: Controles revelados por hit area, nao por movimento global

**What:** Manter uma area interativa fixa no canto inferior esquerdo que alterna a visibilidade do cluster de controles; fora dela, o mouse move nao ressuscita o chrome. [VERIFIED: context]

**When to use:** Apenas em presentation mode. [VERIFIED: context]

**Why:** Essa regra e um requisito funcional, nao detalhe visual. O comportamento reduz poluicao e replica melhor a referencia do PowerPoint. [VERIFIED: context]

### Pattern 3: Laser como overlay temporal, nao como cursor customizado

**What:** Desenhar o laser em camada dedicada sobre o viewer, armazenando amostras de pontos com timestamp e apagando segmentos antigos por idade/opacidade. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] [CITED: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent]

**When to use:** Dentro e fora do presentation mode quando o toggle do laser estiver ligado. [VERIFIED: context]

**Why:** Cursor CSS nao resolve rastro, e `setTimeout` nao entrega a mesma coerencia temporal em monitores de 120/144hz. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame]

### Pattern 4: Presets de tema aplicados somente ao viewer root

**What:** Aplicar `data-viewer-theme="chatgpt|github|excalidraw"` no root do viewer e derivar estilos de markdown, code blocks, assets e fallback desse root. [VERIFIED: codebase grep]

**When to use:** Na renderizacao normal e em presentation mode. [VERIFIED: context]

**Why:** O requisito pede variedade editorial sem reestruturar a shell; isso e mais seguro do que trocar tokens globais da app inteira. [VERIFIED: codebase grep]

## Risks and Mitigations

| Risk | Severity | Why it matters | Mitigation |
|------|----------|----------------|------------|
| Presentation mode quebrar apenas no markdown e ignorar imagem/PDF | high | O requisito e transversal ao viewer inteiro | Planejar e testar usando `ViewerClientShell` como boundary unico |
| Controles ressurgirem com qualquer movimento global | high | Viola decisao travada do usuario | Cobrir explicitamente com testes de hit area e visibilidade |
| Laser causar re-render custoso em toda a arvore React | medium | Pode degradar leitura e PDF/image viewers | Isolar overlay e estado temporal em componente dedicado |
| Temas vazarem para a shell inteira | medium | Contraria D-17 | Limitar classes/data-attrs ao root do viewer |
| Persistencia local falhar em contexto restrito | low | Pode quebrar leitura se feito sem guardas | Fazer fallback silencioso quando `localStorage` nao estiver disponivel |

## Planning Implications

- A fase pede **Wave 0 de testes** antes de codar, porque ha varios contratos de UX nao triviais.
- O plano deve separar **presentation shell** e **laser overlay**; embora se integrem, o risco tecnico e diferente.
- O tema precisa vir por ultimo: ele depende da infraestrutura do viewer e do presentation mode ja estarem estaveis.
- O fechamento da fase deve incluir **checkpoint manual** em markdown, imagem e PDF, porque parte da entrega e julgamento visual/comportamental.

## Recommended Plan Breakdown

1. `05-01-PLAN.md` — contratos de teste para presentation mode, controles, laser e presets.
2. `05-02-PLAN.md` — presentation shell interno, hit area, controles e integracao com `ViewerHeader`/`InfoPanel`.
3. `05-03-PLAN.md` — laser pointer overlay com rastro temporal dentro e fora do modo apresentacao.
4. `05-04-PLAN.md` — presets ChatGPT/GitHub/Excalidraw no viewer + persistencia local + fechamento manual da fase.

---
*Phase: 05-presentation-mode*
*Research completed: 2026-04-11*
