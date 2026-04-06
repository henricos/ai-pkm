# Phase 1: Secure Read Model Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves a análise da discussão.

**Date:** 2026-04-06
**Phase:** 01-secure-read-model-foundation
**Mode:** discuss
**Areas analyzed:** Framework/Stack, Autenticação, Read Model, Item Identity, Workflow Stitch 2 + DESIGN.md

## Gray Areas Presented

| Área | Questão | Opções apresentadas |
|------|---------|---------------------|
| Framework | Stack para a v2 | Next.js App Router vs Vite+React+Express |
| Autenticação | Mecanismo de login single-user | NextAuth.js credentials vs JWT custom |
| Stitch timing | Quando executar sessão no Stitch | Antes da Fase 1 vs Antes da Fase 2 |
| Read Model | Como ler o pkm montado | Index JSONs como fast path vs Filesystem direto |
| Item ID | Identidade estável de item | Path relativo ao pkm root vs Hash SHA256 |

## Decisions Made

### Framework
- **Escolha:** Next.js App Router + React + Tailwind CSS
- **Rationale:** Output nativo do Stitch 2 é React/Tailwind; Next.js simplifica o full-stack com SSR, middleware de auth e file-based routing

### Autenticação
- **Escolha:** NextAuth.js (Auth.js) com credentials provider
- **Rationale:** Biblioteca madura, session management via cookies httpOnly, integração nativa com Next.js; credenciais via env

### Workflow Stitch 2
- **Tema emergente:** Usuário quer usar Google Stitch 2 como ferramenta de geração de UI — exporta React/Tailwind + DESIGN.md, importa para o projeto, Claude Code adapta
- **Escolha de timing:** Antes da Fase 1 — DESIGN.md commitado antes da implementação
- **DESIGN.md:** Padrão do Google Stitch 2 (9 seções), lido nativamente por Claude Code, versionado em Git

### Read Model
- **Escolha:** Index JSONs como fast path com interface `ItemRepository`
- **Rationale:** Aproveita índices existentes (`grupos.json`, `topicos.json`), abstrai implementação para troca na v3 sem alterar contratos de navegação/viewer

### Item Identity
- **Escolha:** Path relativo ao pkm root, URL-encoded
- **Rationale:** Legível, derivável do filesystem, determinístico; muda só com rename (aceitável em modelo read-only)

## Context Surfaced During Discussion

- Google Stitch 2 (lançado fevereiro 2026): plataforma AI para geração de UI, output React/Tailwind, exporta DESIGN.md
- DESIGN.md: padrão lançado pelo Google Stitch com 9 seções (cores, tipografia, componentes, layout, elevação, responsive, do's/don'ts, agent prompt guide); adotado por Claude Code, Cursor, GitHub Copilot

## Corrections / Redirections

- Usuário iniciou discussão com foco no workflow Stitch → a conversa expandiu para cobrir todas as decisões de stack necessárias para a Fase 1
- Nenhuma correção de premissa foi necessária — escolhas recomendadas foram confirmadas

## Deferred

- Integração MCP do Stitch para importação automática
- Tela de login no Stitch (pode ser feito como parte da sessão pré-Fase 1, mas não obrigatório)
