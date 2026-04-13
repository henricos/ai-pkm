# Requirements: ai-pkm

**Defined:** 2026-04-13
**Milestone:** `v2.1`
**Core Value:** Permitir operar o PKM com auxilio de IA, alternando entre uma experiencia visual na web e a operacao local via CLI, sem perder compatibilidade com o modelo file-first.

## v2.1 Requirements

### Packaging

- [ ] **PKG-01**: Aplicacao pode ser empacotada como imagem Docker distribuivel contendo apenas a web app e seus artefatos de runtime.
- [ ] **PKG-02**: Runtime em container recebe o `pkm` por path ou volume montado externamente, sem copiar o acervo para dentro da imagem.
- [ ] **PKG-03**: Equipe consegue validar localmente o container da aplicacao com configuracao minima documentada antes de publicar uma release.

### Versioning

- [ ] **VER-01**: Projeto expõe versao de aplicativo em SemVer completo no ecossistema Node/web.
- [ ] **VER-02**: Operador consegue fechar uma release com `npm version patch|minor|major`, gerando o bump de versao do projeto, o commit de release e a tag Git correspondente.
- [ ] **VER-03**: Cada release publicada permanece rastreavel entre versao do app, tag Git e tag imutavel da imagem.

### Publication

- [ ] **PUB-01**: Push de tag Git de release dispara automaticamente um workflow de publicacao no GitHub Actions.
- [ ] **PUB-02**: Workflow de publicacao executa o build da imagem Docker em GitHub-hosted runner Ubuntu.
- [ ] **PUB-03**: Workflow publica a imagem da aplicacao no GitHub Container Registry como imagem publica.
- [ ] **PUB-04**: Cada release publicada recebe pelo menos as tags de imagem `vX.Y.Z` e `latest`.

### Deployment

- [ ] **DEP-01**: Operador consegue atualizar a aplicacao no servidor atual consumindo a nova imagem publicada, sem `git pull` dentro do container.
- [ ] **DEP-02**: Redeploy no Portainer preserva configuracao externa e o mesmo volume montado do `pkm`.
- [ ] **DEP-03**: Repositorio documenta o fluxo operacional minimo de release e redeploy para o ambiente atual com Docker + Portainer.

## Future Requirements

### Deployment Evolution

- **FUT-01**: Pipeline pode acionar deploy remoto automatizado sem depender de operacao manual no Portainer.
- **FUT-02**: Estrategia de release suporta canais adicionais alem de `latest`, como `stable`, `beta` ou imagens por ambiente.
- **FUT-03**: Distribuicao pode ser portada para outro alvo operacional, como VPS dedicada ou Kubernetes, sem redesenhar o modelo de empacotamento.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Embutir o `pkm` na imagem Docker | Viola a separacao entre aplicacao publica e conteudo privado file-first |
| Atualizacao da aplicacao por `git pull` dentro do container | Gera runtime menos rastreavel e foge do modelo baseado em imagem versionada |
| Deploy remoto totalmente automatico a partir do GitHub Actions | Nao e necessario para fechar o primeiro fluxo operacional do servidor atual |
| Multiplos ambientes de release com estrategia complexa de canais | Aumenta escopo operacional antes de provar o fluxo simples `vX.Y.Z` + `latest` |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PKG-01 | Phase 7 | Pending |
| PKG-02 | Phase 7 | Pending |
| PKG-03 | Phase 7 | Pending |
| VER-01 | Phase 8 | Pending |
| VER-02 | Phase 8 | Pending |
| VER-03 | Phase 8 | Pending |
| PUB-01 | Phase 8 | Pending |
| PUB-02 | Phase 8 | Pending |
| PUB-03 | Phase 8 | Pending |
| PUB-04 | Phase 8 | Pending |
| DEP-01 | Phase 9 | Pending |
| DEP-02 | Phase 9 | Pending |
| DEP-03 | Phase 9 | Pending |

**Coverage:**
- v2.1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-04-13*
*Last updated: 2026-04-13 after milestone v2.1 initialization*
