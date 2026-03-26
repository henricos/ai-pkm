## Criar Grupo

**Skill:** `/criar-grupo`

**Quando usar:** Ao iniciar um esforço com objetivo claro que justifique um agrupador de conteúdo dentro de um tópico.

**O que faz:**
1. O usuário explica livremente o grupo.
2. A IA determina o tópico (via `index/topicos.json`), gera uma descrição otimizada para busca e deduz o âmbito (`pessoal`, `trabalho` ou `ambos`). Todos são apresentados para aprovação.
3. Cria a pasta em `pkm/[topico]/_[slug]/`, gera o arquivo `_grupo.md` com frontmatter padronizado e registra a entrada em `index/grupos.json`.

Aguarda aprovação antes de qualquer criação de arquivo.

**Natureza dos grupos:** grupos são agrupadores atemporais de conhecimento. Não são tarefas, não carregam status e não possuem ciclo temporal implícito. O fato de nascerem de um esforço com objetivo claro não os transforma em entidades com prazo ou encerramento obrigatório.

**Pós-criação:** após concluir, sugira fortemente ao usuário executar `/recriar-indices` para confirmar que os índices estão sincronizados.
