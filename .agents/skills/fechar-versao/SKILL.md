---
name: fechar-versao
description: Fecha uma release SemVer da aplicação usando o fluxo canônico do projeto (`npm version` + `git push origin main --follow-tags`), valida a cadeia externa no GitHub Actions e no GHCR, e aborta se as pré-condições de branch, sincronização com `main` ou working tree limpa não estiverem satisfeitas. Use esta skill sempre que o usuário quiser fechar uma versão, soltar uma release, gerar uma tag SemVer ou publicar uma nova imagem da aplicação — mesmo que não diga explicitamente "fechar versão".
command: /fechar-versao
---

# SKILL: Fechar Versao

## Instruções de Execução do Agente

Esta skill fecha uma release oficial da aplicação e valida a cadeia externa até GitHub Actions + GHCR. O objetivo é **orquestrar o fluxo canônico**, nunca escondê-lo atrás de wrapper opaco.

**Regras invioláveis:**

- **Nunca** siga se a branch atual não for `main`.
- **Nunca** siga se `main` local não estiver alinhada com `origin/main`.
- **Nunca** siga se a working tree não estiver limpa.
- **Nunca** faça commit, stash, reset ou limpeza automática para “destravar” a release.
- **Nunca** trate `--allow-same-version --force` como caminho padrão; isso é apenas recovery path para falha de ambiente restrito após o bump já ter sido aplicado.

---

## Passo 1: Pré-condições Git

Verifique, nesta ordem:

```bash
git branch --show-current
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git diff --quiet && git diff --cached --quiet
```

### Regras de aborto

1. Se a branch atual não for `main`, **aborte** e oriente explicitamente:

> *"A release oficial só pode ser fechada a partir de `main`. O esperado era estar em `main` antes de iniciar a skill."*

2. Se `HEAD` local não coincidir com `origin/main`, **aborte** e oriente explicitamente:

> *"A release oficial só pode ser fechada com `main` local alinhada a `origin/main`. O esperado era uma `main` atualizada e sem divergência antes do bump."*

3. Se a working tree não estiver limpa, **aborte** e oriente explicitamente:

> *"A working tree precisa estar limpa antes da release. Esta skill não faz commit nem stash de mudanças pendentes."*

---

## Passo 2: Determinar a Próxima Versão

Leia a versão atual do `package.json`.

Calcule as três opções canônicas:

- `patch` -> próxima `X.Y.Z`
- `minor` -> próxima `X.Y.0`
- `major` -> próxima `X.0.0`

### Pergunta obrigatória ao usuário

> Se a ferramenta oferecer widget nativo de perguntas com opções, use-o. Caso contrário, apresente as opções numeradas.

Formato recomendado:

1. **Patch** — `2.0.2 -> 2.0.3`
2. **Minor** — `2.0.2 -> 2.1.0`
3. **Major** — `2.0.2 -> 3.0.0`
4. **Cancelar**

Depois da escolha, confirme explicitamente:

> *"Vou fechar a release `vX.Y.Z` com bump `patch|minor|major`. Confirma?"*

Se o usuário não confirmar, **aborte sem executar comandos de release**.

---

## Passo 3: Gate Local Obrigatório

Execute exatamente estes checks:

```bash
npm test
npm run typecheck
```

Para o build de produção, use ambiente explícito e reproduzível. O contrato atual da fase validou este padrão:

```bash
APP_VERSION=[versao-atual-ou-alvo] \
NEXT_PUBLIC_GIT_HASH=[hash-curto-ou-placeholder] \
PKM_PATH=/tmp/build/pkm \
INDEX_PATH=/tmp/build/index \
AUTH_USERNAME=build-user \
AUTH_PASSWORD=build-password \
NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234 \
NEXTAUTH_URL=http://127.0.0.1:3000 \
npm run build
```

### Regras

- Se qualquer check falhar, **aborte**.
- Se o build travar ou falhar por limitação do sandbox, é permitido reexecutá-lo fora do sandbox.
- O build pode emitir warning de tracing do Turbopack; **warning não bloqueia** se o comando terminar com sucesso.

---

## Passo 4: Gerar a Release Oficial

O caminho canônico é sempre:

```bash
npm version patch|minor|major
```

Esse é o mecanismo oficial da release. Ele deve:

- atualizar `package.json`
- atualizar `package-lock.json`
- criar o commit de release
- criar a tag Git `vX.Y.Z`

### Recovery path permitido

Se `npm version` falhar **depois** de aplicar o bump, e a causa for limitação do ambiente restrito (por exemplo, falha ao criar `.git/index.lock`), siga este protocolo:

1. Verifique se `package.json` e `package-lock.json` já foram para a versão-alvo `X.Y.Z`.
2. Verifique se ainda **não** existe commit/tag da release.
3. Conclua a trilha com:

```bash
npm version X.Y.Z --allow-same-version --force
```

4. Registre no resumo final que houve recuperação de release parcial por sandbox.

**Não use esse caminho se o `npm version` canônico tiver funcionado normalmente.**

---

## Passo 5: Publicar Commit e Tag

Publique a release com:

```bash
git push origin main --follow-tags
```

Se esse push falhar, **aborte** e informe que a cadeia externa não foi disparada.

---

## Passo 6: Validar a Cadeia Externa

Após o push, a skill deve aguardar e validar o resultado real do workflow e do pacote.

### 6.1 Workflow

Confirme:

- existe uma run do workflow `Release GHCR` para a tag da release
- o job `publish` terminou com `success`

Se a run ainda estiver em progresso, aguarde e consulte novamente até obter conclusão final ou timeout razoável.

### 6.2 GHCR

Confirme:

- o pacote público `ghcr.io/henricos/ai-pkm` existe
- a tag imutável `vX.Y.Z` aparece no pacote
- a tag `latest` aparece no pacote
- a visibilidade está `Public`

### Regras

- A skill só conclui com sucesso se workflow **e** pacote tiverem sido confirmados.
- Se o workflow concluir com falha, reporte falha e pare.
- Se o workflow concluir com sucesso mas o pacote não puder ser confirmado, reporte isso explicitamente como pendência operacional.

---

## Passo 7: Resumo Final

Ao concluir, apresente um resumo curto e bem formatado com:

- versão anterior
- versão nova
- tipo de bump (`patch`, `minor`, `major`)
- commit de release
- tag Git
- status do workflow `Release GHCR`
- status do job `publish`
- status do pacote `ghcr.io/henricos/ai-pkm`
- tags confirmadas no GHCR
- observação se houve ou não recovery path

Formato sugerido:

```text
Release fechada com sucesso

- Versão anterior: 2.0.2
- Nova versão: 2.0.3
- Bump: patch
- Commit de release: abc1234
- Tag: v2.0.3
- Workflow: Release GHCR (#2) — success
- Job publish: success
- Pacote GHCR: público
- Tags confirmadas: latest, v2.0.3
- Recovery path: não utilizado
```

---

## Observações Operacionais

- Esta skill **não** substitui `docs/release-semver-ghcr.md`; ela apenas executa o mesmo contrato.
- Esta skill **não** deve criar script wrapper, alias ou Make target.
- Esta skill pode pedir elevação de permissão quando o ambiente restringir `git add`, `git push` ou `next build`.

---

## Arquivos de Referência

- `docs/release-semver-ghcr.md` — fluxo canônico da release
- `.github/workflows/release-ghcr.yml` — pipeline de publicação
- `package.json` — versão oficial da aplicação
- `Dockerfile` — labels e argumentos de rastreabilidade
- `.planning/phases/08-semver-release-pipeline/.continue-here.md` — trilha validada da release real `v2.0.2`
