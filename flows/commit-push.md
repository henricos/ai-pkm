## Commit e Push

**Skill:** `/commit-push`

**Quando usar:** Quando o usuário quiser salvar mudanças locais no Git, revisar a mensagem de commit, fazer commit, commitar, comitar ou publicar alterações no remoto.

**O que faz:**
- Determina a raiz do repositório Git e executa todos os comandos a partir dela.
- Inspeciona o estado atual com `git status` e `git diff`.
- Propõe uma mensagem de commit em Conventional Commits, em `pt-BR`, exibida como card visual (blockquote).
- Aguarda uma única aprovação humana e executa o staging, commit e push com comandos simples e explícitos.

**Regras de governança da mensagem:**
- O assunto deve seguir `tipo: assunto conciso`.
- O corpo é obrigatório: parágrafo resumindo o objetivo + lista de bullets com as mudanças.
- A mensagem inteira deve estar em Português do Brasil.

**Modo squash (parâmetro opcional):**

Quando acionado com o argumento `squash` (ex: `/commit-push squash`), executa uma fase prévia antes do fluxo normal:
1. Calcula a base com `git merge-base HEAD @{upstream}` (fallback: `main`)
2. Exibe a lista de commits que serão achatados (`git log <base>..HEAD --oneline`)
3. Se lista vazia, informa e encerra
4. Executa `git reset --soft <base>` — desfaz os commits, mantém as mudanças em staging
5. Informa que o push usará `--force-with-lease` e aguarda confirmação
6. Segue o fluxo normal a partir da proposta de mensagem

Sem o argumento `squash`, comportamento idêntico ao atual.

**Comportamento:**
- Se a working tree estiver limpa, informa e encerra.
- O card da mensagem é exibido sem solicitar aprovação — a aprovação acontece uma única vez, antes da execução.
- Após aprovação: `git add` com arquivos explícitos, `git commit` com `-m` encadeados (sem heredoc, sem subshell), e `git push` se solicitado.
- No modo squash com histórico já publicado: push com `--force-with-lease`.
- Se o push falhar por ausência de upstream, informa o bloqueio e aguarda orientação.
