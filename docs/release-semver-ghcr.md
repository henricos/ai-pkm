# Guia de Release SemVer para GHCR

Este documento define o fluxo canônico de release do projeto para gerar uma nova versão da aplicação e publicar a imagem correspondente em `ghcr.io/henricos/ai-pkm`.

Use este guia quando o objetivo for fechar uma release oficial do app Node/web. O fluxo oficial continua baseado nos comandos nativos do Git e do npm, sem wrapper opaco.

Se você quiser apenas subir a aplicação já publicada, não use este documento; siga o quickstart de runtime no `README.md`.

O projeto também possui a skill `/fechar-versao`, mas ela existe para orquestrar este mesmo fluxo canônico, não para substituí-lo.

## Pré-condições obrigatórias

- a release oficial nasce da branch `main`
- a working tree precisa estar limpa antes do bump
- a validação local precisa passar antes do `npm version`
- o mecanismo oficial de bump, commit e tag é `npm version patch|minor|major`

## Checklist canônico

Execute os comandos exatamente nesta ordem:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git diff --quiet && git diff --cached --quiet
npm test && npm run typecheck && npm run build
npm version patch|minor|major
git push origin main --follow-tags
```

## O que cada passo prova

### 1. Sincronizar a linha oficial

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
```

Esse bloco garante que a release parte da linha oficial do repositório e evita fechar versão sobre uma branch divergente.

### 2. Confirmar working tree limpa

```bash
git diff --quiet && git diff --cached --quiet
```

Se esse comando falhar, pare. Não feche a release com mudanças locais pendentes.

### 3. Rodar o gate local obrigatório

```bash
npm test && npm run typecheck && npm run build
```

Esse é o preflight mínimo antes de gerar o commit e a tag de release.

### 4. Gerar a release oficial

```bash
npm version patch|minor|major
```

Escolha o bump real da release:

- `patch` para hotfix sem mudança de escopo
- `minor` para incremento compatível de funcionalidade
- `major` para quebra compatível com nova linha SemVer

O comando acima é a fonte oficial da release: ele atualiza o `package.json`, cria o commit de release e cria a tag Git correspondente no formato `vX.Y.Z`.

### 5. Publicar commit e tag

```bash
git push origin main --follow-tags
```

Esse push é o gatilho oficial do workflow [`Release GHCR`](../.github/workflows/release-ghcr.yml). O workflow publica a imagem canônica em `ghcr.io/henricos/ai-pkm`.

## Conferência de rastreabilidade

Depois do push, confirme a cadeia completa:

1. `package.json` mostra a nova versão `X.Y.Z`.
2. Existe uma tag Git `vX.Y.Z` apontando para o commit de release criado por `npm version`.
3. O GitHub Actions executou o workflow `Release GHCR` para essa tag.
4. O GHCR exibe `ghcr.io/henricos/ai-pkm:vX.Y.Z` e `ghcr.io/henricos/ai-pkm:latest`.
5. O footer da tela de login mostra `vX.Y.Z · abc1234`, onde o hash curto corresponde ao commit da release.

## Conferência rápida no GHCR

Verifique no pacote publicado:

- nome canônico: `ghcr.io/henricos/ai-pkm`
- tag imutável da release: `vX.Y.Z`
- ponteiro operacional: `latest`

Se for o primeiro publish do pacote e ele nascer privado, ajuste a visibilidade para `public` uma única vez no GitHub Packages antes de considerar a cadeia validada.

## Depois do publish

Quando a imagem nova já estiver publicada, o próximo passo é seguir o fluxo de runtime por `docker compose` descrito no `README.md`.

## Relação com desenvolvimento local

- Para setup de desenvolvimento, use [docs/dev-setup.md](/home/henrico/github/henricos/ai-pkm/docs/dev-setup.md).

## Automação guiada futura

Qualquer automação guiada futura deve apenas orquestrar esses comandos canônicos, preferencialmente via skill. Ela não deve substituir `npm version`, nem esconder o mecanismo real da release atrás de script wrapper, alias ou `Make` target proprietário.
