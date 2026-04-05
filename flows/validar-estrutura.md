## Validar Estrutura

**Skill:** `/validar-estrutura`

**Quando usar:** Antes de mudanças estruturais relevantes, após reorganização manual assistida, ou quando houver suspeita de divergência entre taxonomia, frontmatter, caminhos e índice derivado.

**O que faz:**
- Executa uma validação não mutante da coerência estrutural do repositório.
- Verifica taxonomia, caminhos, frontmatter, sidecars de binários, ausência de embeddings em Markdown, `.gitkeep` e coerência do índice derivado de grupos.
- Traduz o resultado técnico para uma resposta humana e acionável.

**Comportamento:**
- Nunca escreve em arquivos.
- Se tudo estiver coerente, responde de forma curta.
- Se houver falhas, lista os caminhos afetados, explica o significado de cada problema e sugere a skill correta para correção quando aplicável.
