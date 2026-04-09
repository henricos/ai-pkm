---
phase: 3
slug: reading-viewer
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-09
---

# Phase 3 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Test ↔ Component | Mocks controlam imports externos — sem dados reais ou filesystem | Nenhum |
| npm registry → package.json | Versões pinadas explicitamente — sem range aberto | Dependências de build |
| globals.css → browser | CSS global sem input de usuário | Estilo estático |
| URL param → filesystem | ID do item vem da URL — validado antes de qualquer operação fs | item.id (path relativo) |
| FsItemRepository → pkm filesystem | Leitura limitada ao pkmRoot via resolveAndValidatePath | Conteúdo de arquivos |
| Markdown content → React JSX | react-markdown transforma string em JSX — sanitização built-in | Conteúdo Markdown |
| item.id → /api/pkm/raw/ URL | itemId é path relativo, não absoluto — encodeURIComponent aplicado | Path relativo |
| External links → new tab | Links https:// abrem nova aba com noopener noreferrer | Nenhum (saída) |
| HTTP request → /api/pkm/raw/ | Rota pública — auth() guard obrigatório antes de qualquer leitura | Arquivo raw |
| NavigationItemRef → ViewerPage | item.id (path relativo) passa para getItemContent — validado server-side | item.id |
| frontmatter.url → InfoPanel | URL do frontmatter renderizada como link — noopener noreferrer aplicado | URL externa |
| item.path → cliente | NUNCA enviado ao cliente — ViewerPage usa item.id e derivados | Nenhum (bloqueado) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-3-W0-01 | Tampering | test mocks | accept | Wave 0 não toca dados reais; mocks são controlados e sem efeito colateral | closed |
| T-3-02-01 | Tampering | package.json | accept | Versões pinadas no RESEARCH.md; npm install determina resolução — nenhum dado de usuário envolvido | closed |
| T-3-02-02 | Information Disclosure | globals.css | accept | CSS global sem tokens secretos; prose overrides usam variáveis CSS públicas | closed |
| T-3-01 | Tampering (path traversal) | getItemContent(), getItemFrontmatter(), ViewerPage | mitigate | `resolveAndValidatePath()` em `fs-item-repository.ts:107` usa `path.resolve + startsWith(pkmRoot+sep)`. Testes em `item-repository.test.ts:96,114` validam bloqueio de `../../../etc/passwd`. Segundo nível via `getItemById` server-side em ViewerPage | closed |
| T-3-02 | Tampering (XSS) | MarkdownViewer, InfoPanel | mitigate | react-markdown sanitiza por padrão; sem `dangerouslySetInnerHTML`; sem `rehype-raw`; `defaultUrlTransform` rejeita `javascript:` URIs. InfoPanel usa `target="_blank" rel="noopener noreferrer"` | closed |
| T-3-03 | Information Disclosure | RawFrontmatter, ViewerHeader, ViewerPage | mitigate/accept | `encodeURIComponent(itemId)` em `viewer-header.tsx:115`; `item.path` absoluto nunca enviado ao cliente; NavigationItemRef não expõe path absoluto; ViewerPage deriva topic/group do item.id (relativo) | closed |
| T-3-04 | Elevation of Privilege | GET /api/pkm/raw/[...path] | mitigate | `auth()` chamado na primeira linha (`route.ts:25`) — retorna 401 antes de qualquer leitura de filesystem. Segundo nível: `resolveAndValidatePath()` no FsItemRepository bloqueia path traversal | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-3-01 | T-3-W0-01 | Wave 0 (stubs de teste) não toca dados reais nem filesystem — risco residual zero | Henrico Scaranello | 2026-04-09 |
| AR-3-02 | T-3-02-01 | Versões pinadas explicitamente; npm install resolve sem input de usuário — risco de supply chain aceito como padrão de mercado | Henrico Scaranello | 2026-04-09 |
| AR-3-03 | T-3-02-02 | CSS global sem tokens secretos ou dados sensíveis — sem surface de ataque real | Henrico Scaranello | 2026-04-09 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-09 | 7 | 7 | 0 | gsd-secure-phase (claude-sonnet-4-6) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-09
