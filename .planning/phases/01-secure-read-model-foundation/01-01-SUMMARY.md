---
phase: 01-secure-read-model-foundation
plan: "01"
subsystem: foundation
tags: [next.js, tailwind, shadcn, vitest, design-system, typescript]
dependency_graph:
  requires: []
  provides:
    - next-app-router-scaffold
    - tailwind-v4-design-tokens
    - vitest-test-infrastructure
    - env-stub
  affects:
    - 01-02 (auth — usa env.ts stub e estrutura Next.js)
    - 01-03 (read model — usa estrutura Next.js e env.ts stub)
tech_stack:
  added:
    - next@16.2.2
    - next-auth@5.0.0-beta.30
    - react@19.2.4
    - react-dom@19.2.4
    - tailwindcss@4.2.2
    - shadcn/ui (CLI 4.2.0, preset Radix/Nova)
    - vitest@3.2.4
    - typescript@5.9.3
    - gray-matter@4.0.3
    - zod@4.3.6
    - "@vitejs/plugin-react@4.5.0"
    - "@testing-library/react@16.3.0"
    - jsdom@26.1.0
  patterns:
    - Next.js App Router com TypeScript
    - Tailwind v4 com tokens em @theme CSS block (sem tailwind.config.ts)
    - shadcn/ui com componentes copiados para src/components/ui/
    - Vitest com ambiente jsdom para testes de componentes
key_files:
  created:
    - package.json
    - next.config.ts
    - tsconfig.json
    - postcss.config.mjs
    - components.json
    - .env.example
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/lib/env.ts
    - src/lib/utils.ts
    - src/components/ui/button.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - vitest.config.ts
    - src/__tests__/auth.test.ts
    - src/__tests__/item-repository.test.ts
    - src/__tests__/env.test.ts
  modified:
    - .gitignore (adicionado .env.local explicitamente)
decisions:
  - "Usar shadcn/ui CLI 4.2.0 com preset Radix/Nova em vez de custom — gera utils.ts e estrutura compatível com Tailwind v4 automaticamente"
  - "Tokens do DESIGN.md definidos no bloco @theme do globals.css (Tailwind v4 — sem tailwind.config.ts), conforme RESEARCH.md Pitfall 2"
  - "shadcn adicionou Geist como fonte padrão — revertido para Inter conforme DESIGN.md §3"
  - "Todos os @import movidos para o topo do globals.css para evitar warning de CSS sobre regras fora de ordem"
metrics:
  duration: "10 min"
  completed_date: "2026-04-08"
  tasks_completed: 3
  files_created: 18
  files_modified: 1
---

# Phase 1 Plan 01: Bootstrap Next.js 16 + Design System + Vitest — Summary

**One-liner:** Next.js 16.2.2 com App Router bootstrapped, tokens do DESIGN.md mapeados para @theme Tailwind v4, e Vitest com 10 stubs de teste para todos os requisitos da fase.

---

## O que foi entregue

### Tarefa 1: Projeto Next.js 16 com App Router e dependências pinnadas

O projeto foi inicializado manualmente (o `create-next-app` não aceita diretórios com arquivos existentes) instalando cada dependência via `npm install` com versões exatas. O shadcn/ui foi inicializado com `npx shadcn@4.2.0 init -b radix -p nova -y` após a estrutura do Next.js estar no lugar.

**Versões exatas instaladas:**
- `next`: 16.2.2
- `next-auth`: 5.0.0-beta.30
- `tailwindcss`: 4.2.2
- `vitest`: 3.2.4
- `typescript`: 5.9.3
- `gray-matter`: 4.0.3
- `zod`: 4.3.6

**Estrutura de pastas criada:**
```
src/
├── app/
│   ├── globals.css       # design system tokens @theme
│   ├── layout.tsx        # root layout com Inter
│   └── page.tsx          # redirect para /login
├── components/
│   └── ui/               # button.tsx, input.tsx, label.tsx (shadcn)
├── lib/
│   ├── env.ts            # stub minimal PKM_PATH
│   └── utils.ts          # cn() helper do shadcn
└── __tests__/
    ├── auth.test.ts
    ├── item-repository.test.ts
    └── env.test.ts
```

**Scripts npm disponíveis:**
- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run test` — Vitest run (stubs todo, exit 0)
- `npm run test:watch` — Vitest em modo watch
- `npm run typecheck` — tsc --noEmit

### Tarefa 2: Design system tokens em @theme Tailwind v4

Os tokens do `DESIGN.md` foram definidos no bloco `@theme {}` do `src/app/globals.css`:

**Tokens de cor definidos:**
- `--color-surface: #f8f9fa` (Base Layer)
- `--color-surface-container-lowest: #ffffff` (Primary Workspaces)
- `--color-surface-container-low: #f1f4f6` (Supportive Panels)
- `--color-surface-container: #eaeff1`
- `--color-surface-container-high: #dee3e5` (Chips)
- `--color-surface-bright: #ffffff` (Overlays)
- `--color-on-surface: #2b3437` (Text)
- `--color-tertiary: #0055d7` (Accent Blue)
- `--color-tertiary-container: #0266ff`
- `--color-on-tertiary: #ffffff`
- `--color-primary-container: #dde5f5` (Secondary actions)
- `--color-on-primary-container: #0a2456`
- `--color-inverse-surface: #0c0f10` (Tooltips)
- `--color-inverse-on-surface: #f3f4f4`
- `--color-outline-variant: #c8cfd1` (Ghost borders)

**Tokens de tipografia:**
- `--font-sans: "Inter", sans-serif`
- `--text-display-lg: 3.5rem`
- `--text-headline-sm: 1.5rem`
- `--text-title-md: 1.125rem`
- `--text-body-md: 0.875rem`
- `--text-label-sm: 0.6875rem`

**Elevation:**
- `--shadow-ambient: 0 12px 40px rgba(43, 52, 55, 0.06)`
- `--radius-sm: 0.125rem`
- `--radius-md: 0.375rem`

### Tarefa 3: Vitest configurado com stubs de teste

O `vitest.config.ts` foi criado com ambiente jsdom e alias `@/*`. Os três arquivos de teste foram criados com `test.todo()` para todos os requisitos:

- `auth.test.ts`: ACC-01, ACC-02, ACC-03 (3 stubs)
- `item-repository.test.ts`: ARC-01, ARC-02, ARC-03, ARC-04, RUN-02 (5 stubs)
- `env.test.ts`: RUN-01 (2 stubs)

`npm run test` retorna exit 0 com 10 testes `todo`.

---

## Deviations from Plan

### Desvio 1 — create-next-app não aceita diretório com arquivos existentes

**Encontrado durante:** Tarefa 1
**Situação:** `npx create-next-app@16.2.2 . --yes` rejeita diretórios com arquivos existentes (`.planning/`, `AGENTS.md`, etc.)
**Correção:** Projeto inicializado manualmente: `npm init -y` + instalação individual de dependências + criação manual dos arquivos de configuração (next.config.ts, tsconfig.json, postcss.config.mjs). O resultado final é idêntico ao que o create-next-app geraria.
**Impacto:** Nenhum — todos os arquivos necessários foram criados manualmente.

### Desvio 2 — shadcn/ui substituiu fonte Inter por Geist no layout.tsx

**Encontrado durante:** Tarefa 2
**Situação:** `npx shadcn@4.2.0 init` modificou automaticamente o `layout.tsx` para usar `Geist` como fonte padrão do preset Nova.
**Correção automática (Regra 1 — bug):** `layout.tsx` reescrito para usar `Inter` conforme `DESIGN.md §3` que define Inter como fonte exclusiva.
**Arquivos modificados:** `src/app/layout.tsx`

### Desvio 3 — shadcn/ui adicionou @import fora de ordem no globals.css

**Encontrado durante:** Tarefa 2
**Situação:** O shadcn inseriu `@import "tw-animate-css"` e `@import "shadcn/tailwind.css"` após o bloco `@theme {}`, causando warning de CSS sobre ordem de @import.
**Correção automática (Regra 1 — bug):** globals.css reescrito com todos os @import no topo antes do bloco @theme.
**Arquivos modificados:** `src/app/globals.css`

### Desvio 4 — Tarefa 2 sem commit separado

**Situação:** O processo do shadcn init modificou globals.css e layout.tsx no mesmo momento da criação do projeto (Tarefa 1). Os tokens do design system foram aplicados como parte do setup inicial, sem alterações adicionais que justificassem um commit separado da Tarefa 2.
**Resolução:** Os tokens estão presentes no commit da Tarefa 1 (`1b42092`). Documentado aqui para rastreabilidade.

---

## Known Stubs

| Arquivo | Conteúdo stub | Razão | Plano que resolve |
|---------|---------------|-------|------------------|
| `src/lib/env.ts` | `PKM_PATH: process.env.PKM_PATH ?? ""` | Stub minimal para paralelismo Wave 2 | PLAN-02 |
| `src/__tests__/auth.test.ts` | 3 `test.todo()` | Implementação após PLAN-02 | PLAN-02 |
| `src/__tests__/item-repository.test.ts` | 5 `test.todo()` | Implementação após PLAN-03 | PLAN-03 |
| `src/__tests__/env.test.ts` | 2 `test.todo()` | Implementação após PLAN-02 | PLAN-02 |

Os stubs são **intencionais** — servem como scaffolding de testes para os planos paralelos da Wave 2. Não impedem o objetivo deste plano (bootstrap + design system + infraestrutura de testes).

---

## Threat Flags

Nenhuma nova superfície de segurança introduzida neste plano. Ameaças T-1-01 e T-1-02 mitigadas:
- `.env.local` confirmado no `.gitignore` (`.env.*` + linha explícita `.env.local`)
- `.env.example` contém apenas placeholders sem valores reais
- Versões de next e next-auth pinnadas exatas sem `^`

---

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `src/app/globals.css` | FOUND |
| `vitest.config.ts` | FOUND |
| `src/__tests__/auth.test.ts` | FOUND |
| `src/__tests__/item-repository.test.ts` | FOUND |
| `src/__tests__/env.test.ts` | FOUND |
| `.env.example` | FOUND |
| `src/lib/env.ts` | FOUND |
| `src/components/ui/button.tsx` | FOUND |
| commit `1b42092` | FOUND |
| commit `7b1a8ad` | FOUND |
