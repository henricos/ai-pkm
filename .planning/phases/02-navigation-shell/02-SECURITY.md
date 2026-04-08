---
phase: 2
slug: navigation-shell
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-08
---

# Phase 2 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Descrição | Dados que cruzam |
|----------|-----------|-----------------|
| PKM read model → navigation snapshot | Dados vindos do filesystem e dos índices entram na projeção consumida pela UI | Nomes de itens, contagens, scopes, hrefs derivados |
| Item identity → URL href | IDs lógicos são transformados em segmentos navegáveis e compartilháveis | Segmentos de URL encodados via route-helpers |
| Authenticated request → shell layout | O layout da shell só pode existir para sessão autenticada | Credenciais de sessão Next Auth |
| Route params → item workspace | Segmentos de URL definem qual item é carregado na área principal | Params decodificados via helpers canônicos |
| Client filter input → rendered tree | Texto digitado pelo usuário afeta o subconjunto estrutural visível da árvore | Input de texto livre normalizado antes de regex |
| Current URL → active item highlight | O rail deriva seleção e autoexpansão da rota atual | URL canônica via usePathname() |
| Snapshot data → icon/state rendering | A UI confia no snapshot para renderizar tipo, estado e contagens | Campos tipados de NavigationItemRef |

---

## Threat Register

| Threat ID | Categoria | Componente | Disposição | Mitigação | Status |
|-----------|-----------|-----------|------------|-----------|--------|
| T-02-01 | Tampering | `navigation-service.ts` ancestry e contagens | mitigate | Ancestry e contagens calculados exclusivamente server-side a partir dos índices validados; cobertos por testes em `navigation-service.test.ts:267-278` | closed |
| T-02-02 | Information Disclosure | hrefs de itens | mitigate | `route-helpers.ts:27-28` usa `encodeURIComponent` em cada segmento; nenhum path absoluto ou sidecar exposto no snapshot | closed |
| T-02-03 | Spoofing | distinção inbox vs library | mitigate | `NavigationScope` tipado como union `"library" \| "inbox"`; hrefs gerados exclusivamente via `itemToHref` em `route-helpers.ts:19` | closed |
| T-02-04 | Denial of Service | projeção estrutural grande | accept | Single-user local; projeção server-side reutiliza índices existentes sem varredura do PKM inteiro | closed |
| T-02-05 | Elevation of Privilege | `src/app/(shell)/layout.tsx` | mitigate | `auth()` chamado antes de qualquer renderização em `layout.tsx:23-26`; redireciona para `/login` antes de `getNavigationSnapshot()` | closed |
| T-02-06 | Tampering | params de rota nas páginas | mitigate | `library/[...path]/page.tsx:26` usa `decodeLibraryParams`; `inbox/[item]/page.tsx:26` usa `decodeInboxParam`; ambos resolvem via `getItemById` sem concatenação de path | closed |
| T-02-07 | Information Disclosure | workspace do item | mitigate | `workspace-item-state.tsx` tipado como `Pick<NavigationItemRef, "id" \| "label" \| "itemKind" \| "estado" \| "scope">` — sem conteúdo bruto, path absoluto ou sidecar | closed |
| T-02-08 | Denial of Service | remount completo da shell | accept | Single-user; App Router persistent layout previne remontagens completas entre rotas | closed |
| T-02-09 | Tampering | `filter-tree.ts` regex | mitigate | `patternToRegex()` em `filter-tree.ts:61-68` escapa todos os metacaracteres antes de construir regex; coberto por testes em `filter-tree.test.ts:101-123` | closed |
| T-02-10 | Spoofing | destaque do item ativo | mitigate | Item ativo derivado exclusivamente por `item.href === activeHref` contra snapshot; `activeHref` injetado via `usePathname()` em `left-rail.tsx:29` | closed |
| T-02-11 | Denial of Service | filtro em tempo real | accept | Single-user local; fuzzy threshold 0.35, usado apenas como fallback em `filter-tree.ts:225-227` | closed |
| T-02-12 | Information Disclosure | inbox fora do filtro | mitigate | `InboxLane` é componente separado; `left-rail.tsx:39` passa apenas `snapshot.tree` para `filterNavigationTree` — inbox nunca entra no pipeline de filtro | closed |

*Status: open · closed*
*Disposição: mitigate (implementação exigida) · accept (risco documentado) · transfer (terceiro)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Justificativa | Aceito por | Data |
|---------|------------|---------------|------------|------|
| AR-02-01 | T-02-04 | Sistema single-user local; projeção server-side reutiliza índices existentes sem varredura desnecessária | gsd-security-auditor | 2026-04-08 |
| AR-02-02 | T-02-08 | Sistema single-user; App Router persistent layout mitiga remontagens sem exigir controle adicional | gsd-security-auditor | 2026-04-08 |
| AR-02-03 | T-02-11 | Sistema single-user local; fuse.js com threshold conservador e uso apenas como fallback | gsd-security-auditor | 2026-04-08 |

---

## Security Audit Trail

| Data da Auditoria | Total de Ameaças | Fechadas | Abertas | Executado por |
|-------------------|-----------------|----------|---------|---------------|
| 2026-04-08 | 12 | 12 | 0 | gsd-security-auditor (agente a8501d98c6b13cbec) |

---

## Sign-Off

- [x] Todas as ameaças têm disposição (mitigate / accept / transfer)
- [x] Riscos aceitos documentados no Accepted Risks Log
- [x] `threats_open: 0` confirmado
- [x] `status: verified` definido no frontmatter

**Approval:** verified 2026-04-08
