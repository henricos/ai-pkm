---
name: commit-push
description: Habilidade core para revisar mudanças locais no Git, propor uma mensagem de commit em Conventional Commits, pedir aprovação humana e executar commit e/ou push com segurança. Use quando o usuário quiser salvar mudanças, comitar, commitar, fazer commit, subir alterações ou revisar a mensagem de commit antes de publicar.
command: /commit-push
---

# SKILL: Commit e Push

## Instruções de Execução do Agente

Esta skill implementa o fluxo de encerramento de trabalho no Git. O objetivo é produzir commits claros com o mínimo de fricção: inspeciona, exibe o card da mensagem e executa após uma única aprovação.

---

### Passo 0 — Detectar modo squash

Verifique se a invocação contém o argumento `squash` (ex: `/commit-push squash`).

**Se não contiver:** pule para o Passo 1 sem nenhuma alteração.

**Se contiver:**

1. Determine a raiz do repositório e execute a partir dela.
2. Calcule a base do squash: `git merge-base HEAD @{upstream}` — se falhar (sem upstream), use `git merge-base HEAD main`.
3. Liste os commits a achatar: `git log <base>..HEAD --oneline`.
4. Se a lista estiver vazia, informe "nenhum commit para squash" e encerre.
5. Exiba a lista ao usuário e confirme a operação antes de prosseguir.
6. Execute `git reset --soft <base>` — os commits são desfeitos, mas as mudanças permanecem em staging.
7. Informe que o push final usará `--force-with-lease` (necessário pois o histórico publicado será reescrito).
8. Siga para o Passo 1 normalmente.

---

### Passo 1 — Localizar raiz e inspecionar

Determine a raiz do repositório Git atual — use `git rev-parse --show-toplevel` se necessário — e execute todos os comandos a partir dela.

Execute `git status` e `git diff`. Se a working tree estiver limpa, informe ao usuário e encerre.

---

### Passo 2 — Exibir card da mensagem

Com base no diff, elabore a mensagem conforme as regras de governança desta skill e exiba o card usando blockquote. **Não solicite aprovação ainda.**

> **`tipo: assunto conciso`**
>
> Parágrafo resumindo o objetivo da atividade.
>
> - mudança realizada
> - mudança realizada

---

### Passo 3 — Aprovação única

Após exibir o card, pergunte ao usuário:

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o. Caso contrário, apresente as opções numeradas.

1. Aprovar e executar `commit + push`
2. Aprovar e executar somente `commit`
3. Ajustar a mensagem

Se o usuário ajustar, reelabore o card e volte a este passo.

---

### Passo 4 — Executar

Após aprovação, execute os comandos em sequência — cada um simples, direto e explícito:

1. **Staging:** `git add arquivo1 arquivo2 ...` — liste os arquivos pelo nome. Nunca use `git add .` ou substituição de shell (`$(...)`, backticks).
2. **Commit:** use múltiplos `-m` encadeados — um para o título, um para o parágrafo, um por bullet:
   ```
   git commit -m "tipo: assunto" -m "Parágrafo do corpo." -m "- mudança 1" -m "- mudança 2"
   ```
   Nunca use heredoc nem subshell. Cada `-m` adicional vira uma seção separada na mensagem.
3. **Push** (se opção for `commit + push`):
   - Modo squash com histórico já publicado: `git push --force-with-lease`
   - Demais casos: `git push`

Se o push falhar por ausência de upstream, informe o bloqueio e aguarde orientação.

---

## Regras de Governança da Mensagem

### 1. Formato

`tipo: assunto conciso` — Conventional Commits em `pt-BR`.

Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `chore`.

### 2. Corpo obrigatório

Toda mensagem deve ter corpo:

1. Parágrafo curto resumindo o objetivo da atividade.
2. Lista de bullets descrevendo as mudanças realizadas.

### 3. Idioma

Toda a mensagem em Português do Brasil.

### 4. Tamanho

Assunto: idealmente até 72 caracteres.

---

## Regras de Comportamento

- Execute sempre a partir da raiz do repositório Git.
- Exiba o card antes de pedir aprovação — nunca ao contrário.
- Use arquivos explícitos no `git add`, nunca staging cego.
- Nunca use substituição de shell (`$(...)`), backticks ou heredoc em comandos git.
- Use `-m` encadeados para mensagens multilinhas.
- Se o push falhar, trate o erro — não verifique upstream antes de tentar.
- Mantenha a comunicação curta, objetiva e em `pt-BR`.
