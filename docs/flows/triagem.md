## Triagem Interativa

**Skill:** `/triar`

**Quando usar:** Sempre que houver arquivos novos em `pkm/__inbox/` aguardando classificação.

**O que faz:** Lê os itens de `pkm/__inbox/`, determina tipo e destino de cada um usando a hierarquia abaixo, gera um nome final para todo item independente do tipo (Markdown ou binário), e apresenta tudo em tabela para aprovação em lote.

**Origem dos itens:**
- Markdown provisório criado por `/anotar`
- Markdown já pronto copiado diretamente para `pkm/__inbox/`
- binários copiados diretamente para `pkm/__inbox/`

**Hierarquia de classificação:**
1. Determina o **tópico** (via `pkm/sistema/indices/topicos.json`). Se nenhum tópico adequado, sinaliza e mantém na inbox.
2. Determina se o item pertence a um **grupo** existente (via `pkm/sistema/indices/grupos.json` filtrado pelo tópico).
3. Destino final: `_[topico]/` (solto), `_[topico]/[grupo]/` (dentro de grupo), ou `_[topico]/_[subtopico]/` (subtópico).

**Critério de classificação do tipo:**
- A classificação é **estrutural**, não semântica: o assunto ou tema do arquivo não é critério — apenas a estrutura interna do conteúdo determina o tipo.
- Um item é `tipo: url` somente se o conteúdo completo for uma URL isolada, no máximo acompanhada de uma frase curta como rótulo ou título do link (equivalente ao texto âncora de um hyperlink). Nada além disso.
- Um item é `tipo: nota` se tiver qualquer conteúdo além de URL + rótulo curto: frases de contexto, parágrafos, citações, listas descritivas, notas pessoais, qualquer texto que vá além de um rótulo de link.
- O campo `url` do frontmatter **nunca** é preenchido com links que aparecem dentro do corpo de texto de uma nota — apenas com a URL que é o único conteúdo do arquivo.

**Tratamento de URLs:** Itens com `tipo: url` recebem frontmatter com `url`, `formato` e `processado: false` conforme `docs/schemas/frontmatter-conhecimento.md`. O `formato` é preenchido automaticamente por regra — `resumo` para vídeos (YouTube, Instagram, TikTok) e `extrato` para web/PDF — e exibido como coluna editável na tabela de aprovação. O usuário pode alterá-lo antes de confirmar; não é feita pergunta interativa por item.

**Busca de metadados de URL:** Para preencher `autores`, `data_publicacao` e melhorar o nome do arquivo, siga esta hierarquia por item:
1. Tente `WebFetch` na URL — funciona para a maioria das páginas web e PDFs.
2. Se a URL for do YouTube e o `WebFetch` falhar ou retornar conteúdo pobre, use via Bash: `curl -s "https://www.youtube.com/oembed?url=URL&format=json"` — retorna `title` (use para nomear o arquivo) e `author_name` (use como `autores`).
3. Se nenhum dos anteriores funcionar, derive nome e autoria apenas dos sinais da própria URL (domínio, canal, caminho).

**Tratamento de notas:** Itens com `tipo: nota` recebem `maturidade: rascunho` no frontmatter automaticamente, sem intervenção do usuário. O campo é obrigatório e nunca deve ser omitido.

**Template de nota:** Para itens com `tipo: nota`, a triagem tenta identificar o template mais adequado consultando `sistema/indices/templates.json`. O campo `template` recebe o nome do arquivo de template sem extensão (ex: `nota-ferramenta`). A lógica de resolução é:
1. **Encaixe claro** — o conteúdo ou o nome do arquivo sinaliza claramente um único template (ex: "Nota sobre a ferramenta X" → `nota-ferramenta`). Defina o campo automaticamente, sem perguntar.
2. **Ambiguidade** — o item poderia encaixar em dois ou mais templates. Questione o usuário listando as opções antes de prosseguir.
3. **Sem encaixe aparente** — nenhum template disponível parece se aplicar ao conteúdo. Questione o usuário confirmando que nenhum template é adequado; somente após confirmação o campo `template` é omitido no frontmatter.

Aplica-se a notas Markdown e a sidecars de binários. Para `tipo: url`, o campo nunca é usado.

**Nome final para URLs:** A triagem usa como primeiro candidato o **nome do arquivo inbox existente** (quando gerado pelo `/anotar` com contexto do usuário). Só recorre a dedução por URL ou pergunta ao usuário se o nome for genérico demais (ex: `url-capturada.md`). O nome final de todo arquivo `tipo: url` deve seguir obrigatoriamente a convenção em `docs/pkm-naming.md` — em especial o prefixo `url_` e o padrão autor-título. O fluxo `/processar-url` pode melhorar o nome depois, se a extração ou o resumo revelarem opção melhor.

**Tratamento de binários:** Itens não-Markdown presentes na inbox podem permanecer temporariamente sem sidecar. Se aprovados na triagem, são movidos para o destino final e recebem um sidecar adjacente no formato `nome.extensao.md`, com frontmatter conforme `docs/schemas/frontmatter-conhecimento.md`.

**Tópico inadequado:** Quando nenhum tópico existente acomodar bem um item, a triagem deve sinalizar na tabela com destino "sem tópico adequado", sugerir qual novo tópico seria bom criar (nome + descrição), e manter o item na inbox. Indicar ao usuário que pode usar `/reorganizar-topicos` para criar o tópico sugerido.

**Pastas de destino:** As pastas dos tópicos listados em `topicos.json` sempre existem no repositório. A triagem não cria pastas nem `.gitkeep` — esses são responsabilidade de outras skills.

**Apresentação:** Tabela com item, tipo, destino proposto, nome final e, para itens `tipo: url`, a coluna `Formato` (preenchida por regra, editável). Aprovação em lote.
