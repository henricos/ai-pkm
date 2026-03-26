## Reorganizar Tópicos

**Skill:** `/reorganizar-topicos`

**Quando usar:** Quando o usuário identificar que um tópico está carregado demais, quando um subtópico precisar ser quebrado em irmãos, ou quando ficar claro que a taxonomia de nível 1 já não atende bem a distribuição real do conhecimento.

**A skill sempre começa perguntando qual modo o usuário quer acionar.**

### Modo A — Reorganização local

Use quando o problema está dentro de um tópico raiz ou de um subtópico específico.

**O que faz:**
- Recebe como alvo um tópico raiz ou subtópico existente.
- Inspeciona a estrutura e os arquivos do alvo para identificar agrupamentos naturais.
- Propõe a criação de um ou mais subtópicos.
- Se o alvo for um subtópico que cresceu demais, propõe quebrá-lo em **subtópicos irmãos no tópico pai**.
- Nunca cria terceiro nível hierárquico.
- Apresenta em lote a proposta completa: subtópicos a criar, justificativas curtas, arquivos a mover e novo valor de `topico` no frontmatter.
- Aguarda aprovação humana antes de criar pastas, mover arquivos e atualizar frontmatter.

### Modo B — Revisão da taxonomia de nível 1

Use quando o problema não é local e sim estrutural: o conjunto atual de tópicos raiz deixou de representar bem a distribuição real do conhecimento.

**O que faz:**
- Analisa a distribuição real do conteúdo e a recorrência dos temas existentes.
- Pode propor **criar, renomear e fundir** tópicos de nível 1.
- Usa evidência empírica do conteúdo como base principal da proposta; sem massa crítica, deve recomendar não mudar.
- Apresenta em lote um plano completo de migração: tópicos afetados, caminhos a alterar, atualizações em `pkm/sistema/indices/topicos.json`, frontmatter dos arquivos afetados e impacto sobre grupos.
- Aguarda aprovação humana antes de qualquer escrita.

**Comportamento:**
- Sempre interativo — apresenta proposta e aguarda aprovação antes de qualquer movimentação.
- Mantém o limite de no máximo 2 níveis hierárquicos.
- Atualiza `pkm/sistema/indices/topicos.json` conforme convenção em `docs/pkm-taxonomy.md`.
- Quando houver arquivos ou grupos afetados, atualiza caminhos, ajusta frontmatter e mantém `pkm/sistema/indices/grupos.json` coerente.
- Se a evidência for insuficiente, a resposta correta é recomendar não reorganizar.
- Ao concluir, sugere fortemente ao usuário executar `/recriar-indices` para confirmar que os índices estão sincronizados.

**Convenção de referência:** `docs/pkm-taxonomy.md`
