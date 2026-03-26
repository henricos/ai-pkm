## Anotação Rápida

**Skill:** `/anotar`

**Quando usar:** Sempre que o usuário quiser depositar algo na inbox sem elaborar agora — um conceito, ferramenta, processo ou URL.

**O que faz:**
- Interpreta o input do usuário (argumento do comando ou mensagem) e identifica os itens a registrar
- Detecta automaticamente se são 1 ou vários itens (lote)
- Gera um embrião mínimo para cada item: URL pura para URLs, frase corrida para notas
- Apresenta card compacto de confirmação e salva na aprovação

**Fora de escopo:**
- não elabora nem pesquisa conteúdo
- não trata binários
- não classifica conteúdo
- não define slug definitivo da base
- não cria frontmatter

**Regras de comportamento:**
- o input é interpretado diretamente — sem diálogo iterativo
- em caso de dúvida sobre número de itens, perguntar antes de processar
- o modelo da nota é inferido pela seguinte ordem: (1) palavras-chave no input; (2) pesquisa rápida do item, mapeando para um dos modelos listados em `index/models.json`; (3) se ambíguo entre dois modelos, apresentar dúvida ao usuário antes do card; (4) se não encaixar em nenhum modelo, informar ao usuário e confirmar que o corpo ficará sem dica de modelo
- corpo de URL = URL pura, sem texto adicional
- corpo de nota = frase corrida: "Nota sobre o [tipo] de [nome]. Rascunho a expandir."
- o card de confirmação exibe apenas nome do arquivo e conteúdo
- o nome do arquivo na `pkm/__inbox/` é provisório e gerado automaticamente
- itens de URL recebem o prefixo `url_` no nome provisório — convenção completa em `docs/pkm-naming.md`
- múltiplos itens geram múltiplos arquivos, apresentados juntos em lote
- binários entram diretamente na `pkm/__inbox/` por cópia, sem passar por `/anotar`
