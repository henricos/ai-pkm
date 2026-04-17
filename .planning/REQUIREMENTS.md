# Requirements: ai-pkm

**Defined:** 2026-04-16
**Milestone:** `v2.2`
**Core Value:** Permitir operar o PKM com auxilio de IA, alternando entre uma experiencia visual na web e a operacao local via CLI, sem perder compatibilidade com o modelo file-first.

## v2.2 Requirements

### Contrato de Ambiente

- [x] **ENV-01**: App falha no startup com mensagem clara se `APP_BASE_PATH` estiver ausente no ambiente. Validado na Phase 10.
- [x] **ENV-02**: App falha no startup com mensagem clara se `NEXTAUTH_URL` estiver ausente no ambiente. Validado na Phase 10.
- [x] **ENV-03**: App valida que o pathname de `NEXTAUTH_URL` coincide com `APP_BASE_PATH`; falha cedo com mensagem que mostra um exemplo correto (ex: `APP_BASE_PATH=/pkm` junto de `NEXTAUTH_URL=https://host/pkm`) se divergirem. Validado na Phase 10.

### Build e Configuracao Next.js

- [x] **CFG-01**: `next.config.ts` usa `APP_BASE_PATH` como fonte do `basePath` do Next.js, tornando o prefixo explicito na configuracao do framework. Validado na Phase 10.
- [x] **CFG-02**: `release.yml` passa `--build-arg APP_BASE_PATH=/pkm` no step de `docker build`, tornando o valor baked visivel no codigo do workflow. Validado na Phase 10.
- [x] **CFG-03**: Existe helper `withBasePath(path)` central para construcao de URLs absolutas e redirects server-side onde o Next.js nao aplica o prefixo automaticamente. Validado na Phase 10.

### Ajustes de Codigo

- [ ] **APP-01**: Redirects em `src/app/(shell)/layout.tsx` e `src/app/(auth)/login/page.tsx` usam o prefixo configurado em vez de strings absolutas cruas.
- [ ] **APP-02**: Geracao de hrefs em `src/lib/navigation/route-helpers.ts` e callback fallback em `src/components/login-form.tsx` usam o prefixo configurado.
- [ ] **APP-03**: Rotas de preview e download em `src/components/viewer/viewer-page.tsx` e `src/components/viewer/viewer-header.tsx` usam o prefixo configurado.

### Testes

- [ ] **TST-01**: Testes de env cobrem: falha quando `APP_BASE_PATH` esta ausente; falha quando `NEXTAUTH_URL` esta ausente; falha quando `APP_BASE_PATH=/pkm` e `NEXTAUTH_URL` nao termina em `/pkm`; sucesso quando os dois estao sincronizados.
- [ ] **TST-02**: Testes de rotas cobrem: acesso nao autenticado redireciona para `/pkm/login`; login retorna para `/pkm`; navegacao funciona em `/pkm/library`.

### Documentacao Operacional

- [ ] **DOC-01**: `docs/dev-setup.md` documenta como configurar `APP_BASE_PATH` no `.env` para desenvolvimento local, com exemplos concretos e nota explicita de que `localhost:3000/pkm` e o acesso correto (raiz retorna 404).
- [ ] **DOC-02**: `README.md` documenta o contrato dos 3 lugares de configuracao — `.env` (dev), `.github/workflows/release.yml` (build), `compose.yaml` (runtime) — com exemplos concretos e explicacao de que mudar o path exige editar o workflow e abrir uma nova release.

## Future Requirements

### Configurabilidade Avancada

- **FUT-01**: `APP_BASE_PATH` pode ser alterado em runtime sem rebuild da imagem (requer adicao de reverse proxy local para prefix stripping).
- **FUT-02**: App suporta multiplos paths de base para ambientes distintos (staging vs prod) sem recompilar uma imagem diferente.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Reverse proxy local para strip do prefixo | Decisao consciente de nao adicionar proxy agora; Opcao B (baked) foi escolhida |
| `APP_BASE_PATH` como variavel de runtime no container | Next.js `basePath` e build-time; runtime configurability exige arquitetura diferente |
| Suporte a app na raiz com auth em subrota ou vice-versa | Tratado como configuracao invalida; o sync check recusa essa combinacao |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | Phase 10 | Validated |
| ENV-02 | Phase 10 | Validated |
| ENV-03 | Phase 10 | Validated |
| CFG-01 | Phase 10 | Validated |
| CFG-02 | Phase 10 | Validated |
| CFG-03 | Phase 10 | Validated |
| APP-01 | Phase 11 | Pending |
| APP-02 | Phase 11 | Pending |
| APP-03 | Phase 11 | Pending |
| TST-01 | Phase 12 | Pending |
| TST-02 | Phase 12 | Pending |
| DOC-01 | Phase 12 | Pending |
| DOC-02 | Phase 12 | Pending |

**Coverage:**
- v2.2 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-04-16*
