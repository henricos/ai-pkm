## Criticar URL

**Skill:** `/criticar-url`

**Quando usar:** Quando o usuário quiser avaliar se um resumo de URL está bem escrito, fiel ao conteúdo-fonte e estruturalmente correto — ou quando quiser melhorá-lo ativamente.

**Pré-condição obrigatória:** o arquivo deve ter `tipo: url`, `formato: resumo`, `processado: true` e possuir cache `{slug}-transcript.txt` em `.agents/skills/processar-url/scripts/temp/`. Sem o cache, o fluxo aborta com instrução para executar `/processar-url` primeiro.

**O que faz:**

1. Identifica o escopo — arquivo específico fornecido como argumento, ou todos os arquivos `formato: resumo` processados.
2. Valida cada arquivo contra os critérios de elegibilidade e verifica presença do cache.
3. Avalia o resumo em três eixos, usando o transcript como fonte de verdade e o template `docs/schemas/url-resumo.md` como régua de estrutura:
   - **Fidelidade ao conteúdo-fonte:** cobertura dos pontos principais, ausências relevantes, distorções.
   - **Qualidade editorial por seção:** `## Síntese` (interpretativa, 2-3 frases), `## Narrativa` (progressão do raciocínio, prosa argumentativa), `## O que fica` (voz interpretativa distinta da Narrativa, quando presente), `## Recursos` (links validados, curadoria real).
   - **Estrutura:** seções presentes conforme template, ordem correta, ausências indevidas.
4. Apresenta a crítica de forma direta e acionável — aponta trechos específicos, não faz críticas genéricas.
5. Oferece sessão de melhoria interativa baseada exclusivamente no transcript existente — sem pesquisa externa de conteúdo.

**Comportamento:**
- Nunca escreve sem aprovação explícita.
- Nunca inventa informação não presente no transcript.
- Na sessão de melhoria, preserva seções aprovadas e reescreve somente as problemáticas.
- Curadoria de links em `## Recursos` é permitida (verificação de existência); links não confirmados são marcados como `(link não confirmado)`.
- Ao concluir uma revisão, apresenta o resumo completo com as mudanças destacadas antes de escrever no arquivo.
- Preserva frontmatter e cabeçalho de proveniência (H1 + blockquote) intactos.
