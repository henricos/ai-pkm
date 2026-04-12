---
phase: 06-eliminar-flash-tema-viewer
plan: 06-01
status: pending-manual-verification
completed_at: 2026-04-12
requirements_completed: [PRS-06, PRS-07]
---

# Summary — Plan 06-01: bootstrap pre-paint do tema do viewer

## O que foi entregue

O carregamento do preset salvo deixou de depender apenas do `useEffect` do viewer. Agora o app injeta um bootstrap inline no `head`, lê `localStorage` antes do primeiro paint e publica o resultado em `html[data-viewer-theme-preload]`. O CSS passou a reagir a esse atributo apenas dentro de roots marcados com `data-viewer-scope`, preservando o escopo local do viewer.

## Mudanças principais

- Extraído um contrato compartilhado em `src/components/viewer/viewer-theme-contract.ts` com:
  - storage key única
  - atributo de bootstrap único
  - sanitização de temas válidos
  - serialização do script pre-paint
- `src/app/layout.tsx` agora injeta o script inline de bootstrap no `head` com `suppressHydrationWarning` no `html`.
- `src/components/viewer/viewer-client-shell.tsx` sincroniza o atributo de bootstrap com o tema hidratado e com trocas posteriores de preset, sem reler storage durante render.
- `src/components/viewer/viewer-theme.ts` passou a reutilizar o contrato compartilhado e marca o root do viewer com `data-viewer-scope`.
- `src/app/globals.css` passou a aceitar tanto o tema hidratado do viewer quanto o estado pre-paint vindo de `html[data-viewer-theme-preload]`, sempre ancorado ao escopo do viewer.
- Os testes cobrem o bootstrap script, o atributo pre-paint e a preservação do escopo local.

## Checks executados

- `npx vitest run src/__tests__/viewer-theme.test.tsx` ✅
- `npx vitest run src/__tests__/viewer-client-shell.test.tsx src/__tests__/viewer-theme.test.tsx` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Pendências

- Verificação visual manual em navegador real:
  1. salvar `github` e recarregar Markdown, imagem e PDF
  2. forçar valor inválido em `localStorage`
  3. confirmar que shell/login não recebem o preset

## Commit

Nenhum commit foi criado. O repositório exige aprovação explícita do operador antes de qualquer commit.
