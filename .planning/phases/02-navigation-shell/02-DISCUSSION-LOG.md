# Phase 2: Navigation Shell - Discussion Log

**Logged:** 2026-04-08
**Purpose:** trilha completa da discussao humana para auditoria. Nao e input primario para agentes downstream.

## Area 1: Inbox lane

### Pergunta 1
**Prompt:** Forma da inbox

**Opcoes apresentadas:**
- `A` Lista simples de itens
- `B` Lista agrupada por estado/tipo
- `C` Cartoes/blocos mais visuais

**Resposta:** `A`

### Pergunta 2
**Prompt:** Densidade

**Opcoes apresentadas:**
- `A` Compacta, estilo fila operacional
- `B` Media, com uma linha extra de contexto
- `C` Mais espacada e destacada

**Resposta:** `A`

### Pergunta 3
**Prompt:** Sinais visuais mais importantes

**Opcoes apresentadas:**
- `A` So contador + tipo do item
- `B` Tipo + estado + itens problematicos mais evidentes
- `C` Alem disso, mostrar tambem data/recencia

**Resposta:** `A`

### Pergunta 4
**Prompt:** Relacao com a arvore

**Opcoes apresentadas:**
- `A` Inbox sempre visivel e separada, nunca colapsa junto com a arvore
- `B` Inbox separada, mas pode ser recolhida como secao
- `C` Inbox separada, mas com comportamento quase igual a arvore

**Resposta:** `B`

**Clarificacoes livres:**
- Quando o contador for zero, a inbox pode ficar colapsada.
- A inbox pode lembrar um escaninho/gaveta se isso nao ferir o minimalismo geral.
- Se a ideia de escaninho destoar do design, preferir uma caixa simples com a lista dentro.

## Area 2: Tree behavior

### Pergunta 1
**Prompt:** Expansao inicial

**Opcoes apresentadas:**
- `A` So topicos raiz visiveis; resto fechado
- `B` Topicos raiz abertos; subtopicos/grupos fechados
- `C` Lembrar ultimo estado de expansao do usuario

**Resposta:** `A`

### Pergunta 2
**Prompt:** Ao abrir item por URL direta

**Opcoes apresentadas:**
- `A` Autoexpandir todos os ancestrais ate revelar o item
- `B` Nao expandir automaticamente
- `C` Autoexpandir so ate um nivel parcial

**Resposta:** `A`

### Pergunta 3
**Prompt:** Contagens na arvore

**Opcoes apresentadas:**
- `A` Mostrar so em nos estruturais principais
- `B` Mostrar em quase todos os nos
- `C` Mostrar so quando util

**Resposta:** `B`

**Clarificacao livre:**
- Mostrar em todos os agrupadores: topicos, subtopicos e grupos.

### Pergunta 4
**Prompt:** Indicadores de estado `rascunho/finalizado`

**Opcoes apresentadas:**
- `A` Muito sutis, quase editoriais
- `B` Claros, mas discretos
- `C` Bem evidentes, com cor/icone forte

**Resposta:** `B`

**Clarificacoes livres:**
- As cores separam rascunhos de definitivos.
- Os icones representam tipos: md, imagem, diagrama excalidraw, pdf, binario.

### Pergunta 5
**Prompt:** Comportamento ao selecionar

**Opcoes apresentadas:**
- `A` Clique no no ja navega/abre
- `B` Clique expande; abrir item exige clique separado
- `C` Misto: pastas expandem, itens abrem

**Resposta:** `C`

## Area 3: Filter interaction

### Pergunta 1
**Prompt:** Ritmo do filtro

**Opcoes apresentadas:**
- `A` Instantaneo a cada tecla
- `B` Debounce curto
- `C` So ao confirmar Enter

**Resposta:** `A`

**Clarificacoes livres:**
- O match nao pode ser apenas no comeco do nome; deve pegar qualquer parte.
- Se possivel, aceitar `*`.

### Pergunta 2
**Prompt:** Quando item filho da match

**Opcoes apresentadas:**
- `A` Mostrar o caminho completo ate ele
- `B` Mostrar so o item que casou
- `C` Mostrar item + contexto parcial

**Resposta:** `B`

**Clarificacao livre:**
- Esconder itens que nao casam, mas ainda na forma de arvore.

### Pergunta 3
**Prompt:** Destaque visual de match

**Opcoes apresentadas:**
- `A` So filtrar, sem highlight interno
- `B` Highlight sutil no trecho que casou
- `C` Highlight mais forte

**Resposta:** `B`

### Pergunta 4
**Prompt:** Estado vazio

**Opcoes apresentadas:**
- `A` Mensagem unica dizendo que nada foi encontrado
- `B` Mensagens separadas para inbox e arvore
- `C` Estado vazio mais elaborado com sugestoes

**Resposta:** `B`

**Clarificacao livre:**
- O usuario nao quer filtrar inbox; o filtro deve ser somente na arvore.

### Pergunta 5
**Prompt:** Alcance do filtro

**Opcoes apresentadas:**
- `A` Mesmo campo filtra inbox e arvore juntas
- `B` Campo principal filtra arvore; inbox tem filtro implicito menor
- `C` Inbox e arvore tem filtros separados

**Resposta:** `B`

**Clarificacao livre:**
- O usuario nao quer filtro na inbox.

### Pergunta 6
**Prompt:** Tolerancia de busca

**Opcoes apresentadas:**
- `A` Case-insensitive e acento-insensitive apenas
- `B` Isso + match parcial/fuzzy leve
- `C` Isso + fuzzy mais agressivo

**Resposta:** `B`

**Clarificacao livre:**
- O entendimento de fuzzy aceitavel e algo como trocas simples de letras, nao busca agressiva.

## Area 4: URL and selection model

### Pergunta 1
**Prompt:** Rota sem item selecionado

**Opcoes apresentadas:**
- `A` Mostrar estado vazio editorial na area direita
- `B` Abrir automaticamente um item padrao
- `C` Abrir automaticamente a inbox

**Resposta:** `A`

### Pergunta 2
**Prompt:** Estrutura de namespace

**Opcoes apresentadas:**
- `A` Separar claramente `library/...` e `inbox/...`
- `B` Usar uma unica convencao de rota para tudo
- `C` Separar so internamente, sem explicitar na URL

**Resposta:** `A`

### Pergunta 3
**Prompt:** Clique em item da inbox

**Opcoes apresentadas:**
- `A` Vai para rota propria da inbox
- `B` Abre o item na mesma area sem namespace diferente
- `C` Abre em overlay/drawer temporario

**Resposta:** `A`

### Pergunta 4
**Prompt:** Historico do browser

**Opcoes apresentadas:**
- `A` Cada item aberto entra no historico normal
- `B` So algumas transicoes entram no historico
- `C` Historico minimo, privilegiando estado interno

**Resposta:** `A`

### Pergunta 5
**Prompt:** Retorno apos login

**Opcoes apresentadas:**
- `A` Sempre cair em `/`
- `B` Voltar para a URL original pedida antes do login
- `C` Sempre cair na inbox

**Resposta:** `A`

### Pergunta 6
**Prompt:** URL visivel do item

**Opcoes apresentadas:**
- `A` Pode refletir o path real codificado do item
- `B` Deve usar convencao semantica propria
- `C` Misturar: path real na library, convencao especial na inbox

**Resposta:** `C`

## Resultado consolidado

- Inbox como faixa separada, compacta, simples e recolhivel quando zerada.
- Tree compacta no inicio, com reveal automatico do item ativo.
- Filtro estrutural em tempo real, atuando apenas na tree, com match parcial e highlight sutil.
- Rotas separadas para `library` e `inbox`, com shell unica e historico normal do browser.

---

*Phase: 02-navigation-shell*
*Discussion logged: 2026-04-08*
