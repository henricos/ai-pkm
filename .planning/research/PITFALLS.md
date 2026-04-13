# Pitfalls Research

**Domain:** viewer web file-first para repositório PKM com Markdown rico, árvore navegável, inbox separada, preview binário com sidecars ocultos e modo apresentação
**Researched:** 2026-04-06
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Escolher o renderer errado e transformar Markdown em pseudo-CMS

**What goes wrong:**
O viewer começa simples, mas vira uma mistura confusa de `react-markdown`, `rehype-raw`, plugins ad hoc e exceções por tipo de nota. O resultado é fidelidade inconsistente entre arquivos, quebras em fórmulas/código/tabelas e uma superfície de ataque desnecessária se HTML cru ou MDX entrar no pipeline.

**Why it happens:**
Equipes tratam “renderizar Markdown” como detalhe de UI e não como contrato de compatibilidade. Também confundem Markdown com MDX por conveniência, mesmo quando o acervo é conteúdo file-first e não componentes executáveis.

**How to avoid:**
- Definir um dialeto-alvo explícito para v2.0: CommonMark + GFM + matemática + code fences, sem MDX.
- Padronizar uma pipeline única de parsing/renderização para todo Markdown.
- Só habilitar HTML cru se houver sanitização explícita e motivo real; por padrão, renderizar sem HTML arbitrário.
- Congelar uma suíte de arquivos de referência do próprio PKM para regressão visual do renderer.

**Warning signs:**
- Notas que renderizam diferente conforme a rota ou componente usado.
- Crescimento de exceções por modelo de nota.
- Necessidade de “plugins mágicos” para corrigir arquivos individuais.
- Discussão recorrente sobre suportar MDX antes de existir caso real.

**Phase to address:**
Fase inicial de viewer/renderer base, antes de busca, apresentação e refinamentos visuais.

---

### Pitfall 2: Espelhar o filesystem cru na árvore e perder a unidade lógica do item

**What goes wrong:**
O produto exibe binário e sidecar como dois arquivos independentes, ou esconde sidecars com heurísticas frágeis demais. Isso quebra navegação, gera resultados duplicados em busca, confunde seleção e dificulta evoluir para metadados e ações futuras.

**Why it happens:**
É tentador mapear `readdir` diretamente para nós da árvore. Isso parece “file-first”, mas ignora que o usuário navega entidades lógicas, não artefatos técnicos.

**How to avoid:**
- Criar desde o início uma camada de “item lógico” separada do filesystem bruto.
- Modelar explicitamente relações `primary file -> sidecar(s)` e `folder -> group/topic`.
- Tratar inbox como domínio próprio, com estados de integridade para binários sem sidecar.
- Fazer árvore, viewer, busca e preview consumirem o mesmo modelo lógico.

**Warning signs:**
- Binário aparece duas vezes: como preview e como arquivo na árvore.
- Busca retorna sidecar isolado sem contexto do item principal.
- Regras de ocultação vivem só no frontend.
- Bugs do tipo “clicar no sidecar abre a imagem errada” ou “renomear perde o vínculo”.

**Phase to address:**
Fase de indexação/modelagem de leitura e construção da árvore.

---

### Pitfall 3: Misturar árvore, filtro e busca como se fossem a mesma interação

**What goes wrong:**
Buscar colapsa a árvore inteira, some com contexto hierárquico, oculta o caminho do resultado ou destrói o estado de expansão anterior. O usuário acha o arquivo, mas não entende onde ele vive nem consegue continuar navegando a partir dele.

**Why it happens:**
Muitos componentes de árvore oferecem `filterTreeNode`/highlight, então equipes usam isso como busca completa. Só que filtrar nós visíveis não resolve navegação contextual em acervos hierárquicos.

**How to avoid:**
- Separar três modos: navegação normal, filtro local da árvore e busca global.
- Em busca global, sempre mostrar caminho completo e permitir “revelar na árvore”.
- Preservar/restaurar estado de expansão anterior ao sair da busca.
- Não depender de API de highlight do componente como arquitetura de busca.

**Warning signs:**
- Resultado encontrado, mas o nó pai está oculto ou colapsado.
- Limpar a busca destrói o contexto de navegação.
- Busca parece “funcionar” em demos pequenas, mas fica inutilizável com milhares de itens.
- Usuário precisa usar breadcrumbs improvisados para compensar árvore quebrada.

**Phase to address:**
Fase de navegação e busca textual, com critérios explícitos de UX e estado.

---

### Pitfall 4: Ignorar fallback de preview e depender de um happy path por tipo de arquivo

**What goes wrong:**
Imagem funciona, PDF falha em arquivos grandes ou navegadores específicos, e o produto não oferece fallback útil. O viewer fica em branco, sem download, sem abrir original, sem mostrar sidecar, sem mensagem diagnóstica.

**Why it happens:**
Projetos tratam preview como “ou renderiza ou não renderiza”. Isso é especialmente frágil para PDF, canvas pesado e formatos binários menos previsíveis.

**How to avoid:**
- Definir uma hierarquia de preview por tipo: renderização rica -> fallback simplificado -> abrir original/download.
- Para PDF, assumir desde o começo que haverá casos de degradação; medir memória, paginação e lazy rendering.
- Manter sidecar acessível mesmo quando o preview principal falhar.
- Registrar estados explícitos de `supported`, `degraded`, `failed`, `no-preview`.

**Warning signs:**
- Viewer vazio ou spinner infinito em PDFs grandes.
- Erros só reproduzem em Safari/iPad ou em arquivos reais do acervo.
- O time discute “dar suporte a PDF” sem definir o que acontece quando ele falha.
- QA valida apenas exemplos pequenos e limpos.

**Phase to address:**
Fase de preview binário/viewer multimodal, antes do modo apresentação.

---

### Pitfall 5: Confiar demais em file watchers e perder mudanças reais

**What goes wrong:**
Mudanças feitas por Git, editor externo, operação CLI ou escrita atômica não são refletidas corretamente. A árvore e a busca ficam divergentes do repositório até reiniciar ou reindexar tudo.

**Why it happens:**
`fs.watch` parece suficiente em dev, mas tem caveats por plataforma, eventos incompletos e comportamento inconsistente com renames, writes atômicos e volumes montados.

**How to avoid:**
- Tratar eventos de watch como gatilho de suspeita, não como fonte autoritativa de verdade.
- Usar Git/commit hash e reindexação incremental determinística como mecanismo principal de reconciliação.
- Prever caminho seguro de full rebuild.
- Testar explicitamente renomeio, replace atômico, sync via Git e mudanças em lote.

**Warning signs:**
- “Refresh manual resolve”.
- Bugs intermitentes de arquivo fantasma ou item removido que continua visível.
- Reindex incremental falha quando arquivos são movidos entre pastas.
- Comportamento diferente entre Linux/macOS/container.

**Phase to address:**
Fase de sincronização/indexação incremental e observabilidade operacional.

---

### Pitfall 6: Deixar o índice derivado vazar como fonte de verdade

**What goes wrong:**
O banco ou cache começa a guardar semântica que não existe no `pkm`, e a UI passa a depender de campos derivados frágeis. Depois, qualquer operação CLI ou mudança de convenção quebra consistência, e reconstruir o índice já não recompõe o estado real.

**Why it happens:**
É mais rápido enfiar “flags úteis” no banco do que recalcular corretamente a partir do filesystem e frontmatter. O problema aparece mais tarde, quando o produto precisa coexistir com Git e CLI.

**How to avoid:**
- Documentar claramente o que é intrínseco ao conteúdo e o que é derivado.
- Proibir campos operacionais novos no índice sem prova de reconstruibilidade.
- Tornar rebuild completo um caminho suportado e testado.
- Versionar o schema de indexação separadamente das convenções do `pkm`.

**Warning signs:**
- A correção oficial para bugs é “limpa o banco”.
- Existe informação na UI que ninguém consegue apontar de onde vem no repositório.
- Mudança simples de nomenclatura exige migração complexa no banco.
- CLI e web discordam sobre o mesmo item.

**Phase to address:**
Fase de modelo de leitura/SQLite e qualquer fase que introduza novos campos indexados.

---

### Pitfall 7: Esconder complexidade da inbox e criar uma UX “quase igual” à base principal

**What goes wrong:**
A inbox parece só mais uma pasta, então itens incompletos, binários sem sidecar e rascunhos brutos recebem a mesma UX da base estruturada. Isso embaralha prioridade, mascara erros de integridade e enfraquece o papel da triagem.

**Why it happens:**
Do ponto de vista visual, é fácil reaproveitar a mesma árvore e o mesmo viewer para tudo. Mas inbox é backlog operacional, não biblioteca organizada.

**How to avoid:**
- Dar tratamento visual e comportamental distinto para inbox.
- Exibir estados de prontidão/incompletude por item.
- Bloquear ou sinalizar claramente itens que não podem ser promovidos ainda.
- Separar métricas e filtros da inbox das áreas estruturadas do PKM.

**Warning signs:**
- Usuário não consegue distinguir conteúdo consolidado de material pendente.
- Binários incompletos parecem válidos até falhar em outra etapa.
- A árvore principal fica poluída por itens temporários.
- Busca mistura resultados “definitivos” com lixo operacional sem contexto.

**Phase to address:**
Fase de UX estrutural da navegação e regras da inbox.

---

### Pitfall 8: Acoplar o modo apresentação ao layout normal em vez de tratá-lo como estado de leitura

**What goes wrong:**
“Modo apresentação” vira só fullscreen com sidebar escondida. Atalhos quebram, foco some, overlays atrapalham seleção/cópia, PDFs/imagens ficam sem ergonomia e o modo não serve nem para leitura nem para apresentar.

**Why it happens:**
Como o requisito parece cosmético, ele costuma entrar tarde como camada de CSS por cima do viewer existente.

**How to avoid:**
- Definir modo apresentação como estado próprio com contratos de input, foco, contraste e controles mínimos.
- Garantir compatibilidade por tipo de conteúdo: Markdown, imagem e PDF.
- Projetar escape hatch claro para sair do modo, revelar sidecar e alternar tema.
- Testar teclado, pointer e telas pequenas/lentas.

**Warning signs:**
- Implementação baseada quase só em classes de fullscreen.
- Recursos como laser pointer surgem antes de existir fluxo sólido de leitura.
- Seleção de texto, zoom ou paginação quebram em apresentação.
- O time valida só em monitor desktop.

**Phase to address:**
Fase dedicada de presentation mode, após viewer base estar estável.

---

### Pitfall 9: Projetar a busca de hoje de um jeito que inviabiliza a de amanhã

**What goes wrong:**
A busca textual v1 nasce acoplada à UI, sem modelo de documento pesquisável nem limites claros. Depois, adicionar SQLite FTS, embeddings ou facetas exige reescrever ingestão, resultados e ranking do zero.

**Why it happens:**
Como a v2.0 não precisa de busca semântica, equipes improvisam com `grep`, cache de cliente ou filtros sobre a árvore. Isso resolve o demo, mas não cria uma superfície evolutiva.

**How to avoid:**
- Definir desde já um contrato de documento indexável: `logical_item_id`, `source_type`, `searchable_text`, `path`, `title`.
- Excluir frontmatter do corpus pesquisável por regra explícita, não por acidente.
- Separar engine de busca de apresentação dos resultados.
- Planejar ranking e snippets como responsabilidade do backend, mesmo que simples no início.

**Warning signs:**
- Busca depende do estado já carregado no cliente.
- Resultados de árvore e resultados de conteúdo usam formatos diferentes.
- Não existe ID estável de item lógico.
- Discussão sobre FTS futura começa com “vamos refazer a busca”.

**Phase to address:**
Fase de busca textual e modelagem do índice de leitura.

---

### Pitfall 10: Deixar a futura camada agentica depender de detalhes do viewer

**What goes wrong:**
Quando chegar a fase de agente web/DB mais rica, ações dependem de nós da árvore, estados transitórios do frontend ou caminhos de arquivo crus. Isso torna automação, aprovações e reconciliação muito mais frágeis.

**Why it happens:**
Como a v2.0 é “só leitura”, é comum ignorar contratos estáveis para seleção, contexto e operações. Depois a aplicação tenta reaproveitar componentes visuais como API operacional.

**How to avoid:**
- Introduzir IDs estáveis de item, grupo e localização lógica desde a camada de leitura.
- Separar DTOs de viewer, busca e operação, mesmo que o agente ainda não exista na UI.
- Garantir que qualquer item selecionável possa ser referenciado sem depender da posição atual na árvore.
- Reservar espaço para anexar estado operacional sem poluir o conteúdo base.

**Warning signs:**
- Eventos e APIs aceitam só `path` cru como identidade.
- Componentes de UI montam regras de negócio por conta própria.
- Não há forma consistente de referenciar “o item atual” fora da árvore.
- Toda ideia de ação futura começa com “o componente X sabe fazer isso”.

**Phase to address:**
Fase de modelagem de contratos internos e fundação de APIs de leitura.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Usar `path` como única identidade | Implementação rápida | Renames e moves quebram seleção, cache, busca e futuras ações agenticas | Só como detalhe interno transitório, nunca como contrato externo |
| Filtrar a própria árvore em vez de ter busca global | Menos código inicial | UX ruim, perda de contexto e difícil evolução para FTS/ranking | Apenas como filtro local complementar |
| Indexar sidecar e binário como documentos independentes | Ingestão simples | Resultados duplicados e semântica quebrada do item lógico | Nunca |
| Resolver preview falho com “download only” para tudo | Reduz complexidade do viewer | Produto parece incompleto e não diferencia tipos de conteúdo | Aceitável só para formatos realmente fora de escopo |
| Colocar exceções de renderização por modelo de nota | Corrige casos rápidos | Renderer vira impossível de prever e testar | Nunca como estratégia de longo prazo |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `unified` / remark / rehype | Habilitar `rehype-raw` ou MDX por conveniência sem política de sanitização | Tratar o pipeline como contrato de conteúdo; preferir Markdown não executável e sanitização explícita |
| Ant Design `Tree` / `TreeSelect` | Assumir que virtualização, busca e lazy load do componente resolvem IA/PKM UX por si só | Usar o componente só como view; manter modelo lógico, busca e estado fora dele |
| PDF.js / visualizador PDF | Assumir renderização uniforme em todo navegador e tamanho de arquivo | Implementar lazy render, limites e fallback explícito |
| Watchers do filesystem | Assumir que evento de watch equivale a mudança consistente do repositório | Reconciliar com Git/hash e ter rebuild incremental/determinístico |
| SQLite / FTS futura | Misturar schema de indexação com semântica do conteúdo | Manter índice derivado, versionado e reconstruível |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Árvore inteira renderizada/expandida sem virtualização controlada | Sidebar lenta, scroll irregular, busca com jank | Virtualizar a lista visível, limitar auto-expand e preservar contexto separadamente | Centenas a milhares de nós |
| Busca feita no cliente sobre corpus carregado | Travamentos ao digitar, resultados incompletos | Fazer consulta no backend com contrato de resultado estável | Acervos médios e sidecars textuais longos |
| PDF em canvas sem lazy rendering | Memória alta, páginas em branco, travas em Safari/iPad | Renderizar por página/viewport e degradar cedo | PDFs grandes ou múltiplos documentos abertos |
| Reindexação total a cada mudança | UI desatualizada ou picos de CPU após sync | Incremental por commit/mudança, com rebuild completo só como fallback | Lotes médios de arquivos e syncs frequentes |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Permitir HTML cru/MDX executável no corpus sem controle | XSS ou execução indevida ao visualizar conteúdo | Preferir Markdown não executável; sanitizar HTML explicitamente; não tratar acervo como código confiável por padrão |
| Expor sidecars/arquivos ocultos por rota direta sem política clara | Vazamento de artefatos internos ou inconsistentes | Centralizar resolução de item lógico e aplicar regras uniformes de exposição |
| Transformar caminho de arquivo em parâmetro livre de acesso | Traversal ou leitura indevida fora do escopo do `pkm` | Resolver sempre por raiz conhecida + IDs/caminhos normalizados no backend |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Busca que perde o contexto da árvore | Usuário encontra texto, mas não entende onde está | Mostrar caminho, revelar na árvore e preservar estado anterior |
| Sidecar invisível demais | Usuário não descobre contexto textual do binário | Tornar sidecar oculto na árvore, mas evidente no viewer do item |
| Inbox visualmente igual à base | Pendências parecem conteúdo consolidado | Diferenciar estado, prioridade e ações possíveis |
| Presentation mode só cosmético | Fluxo de leitura/apresentação quebra em uso real | Tratar apresentação como estado funcional, não skin |

## "Looks Done But Isn't" Checklist

- [ ] **Renderer Markdown:** suporta arquivos reais do acervo, não só exemplos curtos; verificar tabelas, fórmulas, code fences e HTML inesperado
- [ ] **Item lógico binário+sidecar:** sidecar não aparece na árvore, mas aparece no viewer e na busca vinculada ao item principal
- [ ] **Busca textual:** mostra caminho, snippet e ação de revelar na árvore; verificar que frontmatter não entrou no índice
- [ ] **Inbox:** binário sem sidecar aparece como incompleto e não como item “normal”
- [ ] **Preview PDF/imagem:** existe estado de fallback útil, não tela vazia
- [ ] **Sync/indexação:** rename, move e mudança via Git/CLI refletem corretamente sem rebuild manual
- [ ] **Modo apresentação:** teclado, fullscreen, saída do modo e sidecar continuam funcionais

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Renderer ad hoc e inconsistente | HIGH | Congelar corpus de regressão, reduzir para uma pipeline única e remover exceções por componente |
| Item lógico mal modelado | HIGH | Introduzir camada de agregação entre filesystem e UI; migrar árvore, busca e viewer para ela |
| Busca acoplada à árvore | MEDIUM | Extrair contrato de resultado global e manter filtro de árvore separado |
| Preview sem fallback | MEDIUM | Adicionar estados explícitos de degradação e rotas de download/abertura original |
| Índice tratado como fonte de verdade | HIGH | Definir rebuild suportado, remover campos não reconstruíveis e validar paridade CLI/web |
| Watchers frágeis | MEDIUM | Reorientar sync para hash/commit + incremental determinístico + full rebuild de emergência |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Escolher o renderer errado | Fase de renderer base | Corpus de regressão renderiza igual em todas as rotas e sem MDX/HTML arbitrário |
| Espelhar o filesystem cru | Fase de modelagem de leitura | Árvore, viewer e busca usam o mesmo `logical_item_id` |
| Misturar árvore, filtro e busca | Fase de navegação e busca | Resultado revela caminho completo e restaura expansão anterior |
| Ignorar fallback de preview | Fase de viewer binário | Cada tipo tem estado `supported/degraded/failed/no-preview` testado |
| Confiar demais em watchers | Fase de sincronização/indexação | Rename/move/Git sync passam em testes de reconciliação |
| Índice derivado virar fonte de verdade | Fase de SQLite/indexação | Rebuild completo recompõe o mesmo estado visto na UI |
| Inbox “quase igual” à base | Fase de UX estrutural | Itens incompletos são destacados e bloqueados corretamente |
| Presentation mode cosmético | Fase de presentation mode | Keyboard/focus/exit funcionam em Markdown, imagem e PDF |
| Busca de hoje inviabilizar a de amanhã | Fase de busca textual | Contrato de documento indexável existe antes de FTS/semântica |
| Futura camada agentica depender do viewer | Fase de contratos internos/API de leitura | Seleção de item funciona sem depender da posição na árvore |

## Sources

- Next.js MDX guide, incluindo alerta de RCE para MDX remoto: https://nextjs.org/docs/pages/guides/mdx
- CommonMark spec, seção de raw HTML: https://spec.commonmark.org/
- `rehype-raw` README e seção de security: https://github.com/rehypejs/rehype-raw
- `remark-html` README, descrevendo pipeline com `rehype-sanitize`: https://github.com/remarkjs/remark-html
- Ant Design `TreeSelect` FAQ sobre busca, async loading e limitações com virtual scroll/horizontal scroll: https://ant.design/components/tree-select/
- Node.js docs sobre `fs.watch` caveats: https://nodejs.org/api/fs.html
- PDF.js issue sobre limites de memória/canvas em Safari: https://github.com/mozilla/pdf.js/issues/11297

---
*Pitfalls research for: viewer web file-first de PKM com Markdown rico e previews binários*
*Researched: 2026-04-06*
