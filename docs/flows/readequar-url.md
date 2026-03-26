## Readequar URL

**Skill:** `/readequar-url`

**Quando usar:** Quando o template `docs/schemas/url-resumo.md` mudar depois que arquivos foram processados, ou quando um resumo existente precisar ser estruturado conforme o template atual sem re-coletar a fonte.

**O que faz:**

1. Identifica o escopo — arquivo específico fornecido como argumento, ou todos os arquivos `formato: resumo` processados.
2. Valida cada arquivo: deve ter `tipo: url`, `formato: resumo`, `processado: true`. Arquivos com `formato: extrato` são pulados.
3. Lê o template `docs/schemas/url-resumo.md` uma vez para toda a sessão.
4. Para cada arquivo válido, compara as seções do corpo com a estrutura esperada e apresenta diagnóstico de divergências antes de prosseguir.
5. Executa apenas alterações estruturais:
   - Reposiciona seções fora de ordem para a sequência correta do template.
   - Realoca conteúdo que está em seção errada para a seção correspondente — conteúdo existente tem prioridade sobre lacuna.
   - Marca seções obrigatórias ausentes como `TBD — a complementar com /criticar-url`.
6. Apresenta o corpo readequado com as mudanças destacadas e aguarda aprovação antes de escrever.

**Comportamento:**
- Trabalho puramente estrutural — não reescreve conteúdo além do mínimo para manter coesão após reposicionamento.
- Não avalia qualidade editorial, não corrige texto, não pesquisa informação externa.
- Não re-coleta a fonte original.
- Preserva frontmatter e cabeçalho de proveniência (H1 + blockquote) intactos.
- Nunca escreve sem aprovação explícita.
- Lacunas marcadas como TBD são sinais para uma futura sessão de `/criticar-url`.
