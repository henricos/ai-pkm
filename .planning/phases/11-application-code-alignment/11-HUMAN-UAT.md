---
status: partial
phase: 11-application-code-alignment
source: [11-VERIFICATION.md]
started: 2026-04-17T23:15:00Z
updated: 2026-04-17T23:15:00Z
---

## Current Test

[aguardando teste humano]

## Tests

### 1. Shell em /pkm
expected: `localhost:3000/pkm` exibe o shell autenticado e `localhost:3000/` retorna 404 com `APP_BASE_PATH=/pkm` no ambiente.
result: [pending]

### 2. Redirect não autenticado
expected: Acesso sem sessão a rota protegida (ex: `/pkm/library`) redireciona para `/pkm/login` no browser (URL com prefixo correto).
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
