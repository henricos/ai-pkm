---
phase: 12-tests-and-operational-documentation
plan: "02"
subsystem: docs
tags: [documentation, APP_BASE_PATH, NEXTAUTH_URL, basePath, dev-setup, compose]

requires:
  - phase: 10-base-path-foundation
    provides: "contrato ENV fail-fast com APP_BASE_PATH e NEXTAUTH_URL sincronizados"
  - phase: 11-application-code-alignment
    provides: "consumers da aplicação alinhados ao prefixo configurado"

provides:
  - "docs/dev-setup.md atualizado com APP_BASE_PATH, URLs corretas e troubleshooting"
  - "README.md com seção Contrato dos 3 lugares de configuração e nota de nova release"
  - "compose.yaml de validação local incluindo APP_BASE_PATH=/pkm"

affects:
  - operadores novos que seguem docs para setup local
  - qualquer fase que modifique compose.yaml ou documentação operacional

tech-stack:
  added: []
  patterns:
    - "Documentação do contrato dos 3 lugares: .env (dev), release-ghcr.yml (build-arg hardcoded), compose.yaml (runtime)"
    - "Sincronização obrigatória documentada: pathname de NEXTAUTH_URL deve terminar com APP_BASE_PATH"

key-files:
  created: []
  modified:
    - docs/dev-setup.md
    - README.md
    - compose.yaml

key-decisions:
  - "APP_BASE_PATH documentado como variável obrigatória em dev-setup.md com seção própria"
  - "Contrato dos 3 lugares materializado como seção dedicada no README com tabela explícita"
  - "compose.yaml do repositório recebe APP_BASE_PATH=/pkm para validação local da imagem"

patterns-established:
  - "Toda documentação de setup deve referenciar os 3 lugares de configuração de APP_BASE_PATH"
  - "NEXTAUTH_URL nos exemplos sempre inclui o prefixo /pkm"

requirements-completed: [DOC-01, DOC-02]

duration: 25min
completed: 2026-04-18
---

# Phase 12 Plan 02: Documentação Operacional do Contrato de basePath Summary

**Documentação completa do contrato APP_BASE_PATH em dev-setup.md, README.md e compose.yaml, cobrindo os 3 lugares de configuração e eliminando o conhecimento implícito sobre o prefixo /pkm**

## Performance

- **Duration:** 25 min
- **Started:** 2026-04-18T10:00:00Z
- **Completed:** 2026-04-18T10:25:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `docs/dev-setup.md` recebe seção própria para `APP_BASE_PATH`, corrige `NEXTAUTH_URL` para incluir `/pkm` em todos os exemplos, explica que a raiz retorna 404, corrige a seção de verificação do fluxo e adiciona troubleshooting de sincronia
- `README.md` recebe seção "Contrato dos 3 lugares de configuração" com tabela explícita, nota de que mudar o path exige nova release, exemplo de compose atualizado com `APP_BASE_PATH` e `NEXTAUTH_URL` terminando em `/pkm`
- `compose.yaml` do repositório passa a incluir `APP_BASE_PATH: /pkm` na seção environment, eliminando falha silenciosa ao validar a imagem localmente

## Task Commits

Cada tarefa foi commitada atomicamente:

1. **Tarefa 1: Atualizar docs/dev-setup.md com APP_BASE_PATH e URLs corretas (DOC-01)** - `369354e` (docs)
2. **Tarefa 2: Atualizar README.md e compose.yaml com contrato dos 3 lugares (DOC-02)** - `edd0f8e` (docs)

**Metadados do plano:** commit de SUMMARY a seguir (docs)

## Files Created/Modified

- `docs/dev-setup.md` — seção APP_BASE_PATH adicionada, NEXTAUTH_URL corrigida para /pkm, nota de 404 na raiz, verificação do fluxo atualizada, troubleshooting de sincronia adicionado, rodapé atualizado para Phase 12 (v2.2)
- `README.md` — seção "Contrato dos 3 lugares" adicionada com tabela, nota de nova release, exemplo de compose corrigido com APP_BASE_PATH e NEXTAUTH_URL terminando em /pkm, URL de confirmação final corrigida para incluir /pkm
- `compose.yaml` — APP_BASE_PATH: /pkm adicionado na seção environment

## Decisions Made

- Manter seção de `APP_BASE_PATH` após `NEXTAUTH_URL` em dev-setup.md para reforçar a dependência entre as duas variáveis
- Seção "Contrato dos 3 lugares" inserida entre o Quickstart e a seção Desenvolvimento no README, onde tem máxima visibilidade para um operador que acabou de subir a aplicação
- O exemplo `NEXTAUTH_URL=http://localhost:3000` (sem prefixo) foi completamente removido dos exemplos para evitar ambiguidade

## Deviations from Plan

Nenhum — plano executado exatamente como escrito.

## Issues Encountered

Nenhum — as edições foram aplicadas diretamente conforme especificado no plano.

**Nota operacional:** As edições iniciais foram feitas no path do repositório principal (`/home/henrico/github/henricos/ai-pkm/docs/dev-setup.md`) antes de perceber que o worktree correto é `/home/henrico/github/henricos/ai-pkm/.claude/worktrees/agent-ad1f5e61/`. As edições foram reaplicadas no path correto sem impacto no resultado final.

## User Setup Required

Nenhum — não requer configuração de serviço externo.

## Known Stubs

Nenhum — todos os exemplos usam placeholders explícitos (ex: `http://SEU-HOST:3030/pkm`) com instrução para substituição antes de usar. Nenhum valor real ou stub de dados flui para a UI.

## Threat Flags

Nenhuma nova superfície de segurança introduzida. Esta fase é estritamente documentação. As ameaças T-12-05 a T-12-08 do plano foram atendidas:

- T-12-05 (Information Disclosure): exemplos usam placeholders fictícios, sem entropia real
- T-12-06 (Elevation of Privilege): aviso de segurança existente mantido intacto no dev-setup.md
- T-12-07 (Tampering): APP_BASE_PATH=/pkm no compose.yaml é valor estático para validação local
- T-12-08 (Denial of Service): documentação corrigida previne configuração de NEXTAUTH_URL sem prefixo /pkm

## Next Phase Readiness

- DOC-01 e DOC-02 entregues — milestone v2.2 tem documentação operacional completa
- Qualquer operador novo pode configurar o ambiente apenas com dev-setup.md e README.md
- O contrato dos 3 lugares está explícito e rastreável no README

## Self-Check: PASSED

- FOUND: docs/dev-setup.md (modificado, commitado em 369354e)
- FOUND: README.md (modificado, commitado em edd0f8e)
- FOUND: compose.yaml (modificado, commitado em edd0f8e)
- FOUND: .planning/phases/12-tests-and-operational-documentation/12-02-SUMMARY.md
- FOUND: commit 369354e (Tarefa 1)
- FOUND: commit edd0f8e (Tarefa 2)

---
*Phase: 12-tests-and-operational-documentation*
*Completed: 2026-04-18*
