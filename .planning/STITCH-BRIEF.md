# Stitch Brief — ai-pkm Web UI

Use este documento como briefing de sessão no Google Stitch para gerar a referência visual do frontend do `ai-pkm`.

O objetivo deste brief não é congelar cores, fontes, tokens ou refinamentos estéticos. Isso deve ser explorado no Stitch.

O objetivo deste brief é descrever com precisão:
- a estrutura da interface
- as superfícies principais
- os estados e modos de uso
- a hierarquia de informação
- os comportamentos esperados
- as diferenças entre navegação, leitura, apresentação e recursos futuros

## 1. O produto

### O que é

`ai-pkm` é uma interface web de navegação, leitura e apresentação para um PKM file-first.

O conteúdo vive em um repositório separado e estruturado em arquivos Markdown, ativos binários e sidecars textuais. A interface web não é um editor e não deve parecer um editor.

Ela se aproxima de uma mistura entre:
- a estrutura navegável de ferramentas como Obsidian
- a clareza e blocos organizados de ferramentas como Notion

Mas com uma diferença central:
- ela deve ser mais focada
- mais orientada a leitura
- menos genérica
- e construída sobre a ideia de que a IA é a única escritora da base

O usuário humano:
- navega
- lê
- apresenta
- orienta a IA

Ele não entra na interface para editar manualmente o conteúdo.

A interface web existe para:
- navegar o acervo
- ler conteúdo com boa qualidade
- visualizar ativos visuais
- apresentar conteúdo em tela
- no futuro, servir como base para experiências mais avançadas

### O que a web faz

A web deve ser percebida como:
- clean
- leve
- confiável
- fortemente orientada a leitura
- visualmente intencional, mas não ornamental

A web não deve parecer:
- CMS genérico
- editor de notas
- painel administrativo
- dashboard de produtividade colorido

### O que a web não é

Não há, nesta camada:
- edição manual de conteúdo
- criação manual de itens
- drag and drop estrutural
- múltiplos usuários
- colaboração em tempo real

No futuro, a web poderá incorporar mais fluxos e recursos, mas a base visual deve nascer coerente com o princípio de que a UI é de navegação e exibição.

---

## 2. Como pensar esta interface

Não pense esta UI como um conjunto de “páginas separadas”.

Pense como um sistema de interface com:
- uma shell principal persistente
- uma navegação lateral esquerda
- uma superfície de conteúdo à direita
- modos internos de visualização
- variações por tipo de item

### Princípios de UX

1. O conteúdo é o protagonista.
2. A navegação deve ser clara, nunca barulhenta.
3. A inbox é operacionalmente diferente da árvore principal e deve parecer diferente.
4. A árvore é estrutura. A busca textual é outra coisa.
5. Sidecar não é item principal de navegação.
6. O modo apresentação não é outra página: é um modo do viewer.
7. A UI deve parecer boa no desktop, mas não pode quebrar em telas menores ou em WebView futuro.

### Inspiração visual

Buscar uma direção:
- minimalista
- clean
- editorial
- precisa
- com boa tipografia
- com hierarquia espacial forte

Boas referências de sensação:
- Obsidian, na lógica de navegação
- interfaces editoriais limpas
- produtos que priorizam leitura em vez de controles

Evitar:
- excesso de ornamentos
- barras e painéis pesados
- visual genérico de dashboard
- brutalismo técnico
- “cara de painel admin”

---

## 3. Estrutura geral da aplicação

Representação conceitual:

```text
┌──────────────────────────────────────────────┐
│                  Login                       │
│                                              │
│                 ai-pkm                       │
│                                              │
│   Usuario  [____________________________]    │
│   Senha    [____________________________]    │
│                                              │
│            [ Entrar ]                        │
│                                              │
│      erro inline quando necessario           │
└──────────────────────────────────────────────┘

Depois do login:

┌──────────────────────────────────────────────────────────────────────────────┐
│ Left Rail             │ Header do item atual                                 │
│                       │ - titulo                                             │
│ topo do rail          │ - acoes do item                                      │
│ - filtro              ├──────────────────────────────────────────────────────│
│ - lupa futura         │                                                      │
│ - settings            │ Superficie principal de visualizacao                 │
│ - status/console      │ - markdown                                           │
│                       │ - imagem                                             │
│ Inbox destacada       │ - excalidraw                                         │
│ - lista propria       │ - pdf/binario fallback                               │
│ - contador            │                                                      │
│                       │ Painel lateral direito interno                       │
│ Arvore principal      │ - informacoes do item                                │
│ - topicos             │ - metadados                                          │
│ - subtopicos          │ - texto complementar / sidecar                       │
│ - grupos              │                                                      │
│ - arquivos            │                                                      │
└───────────────────────┴──────────────────────────────────────────────────────┘
```

### Grandes zonas da UI

#### 1. Tela de login

Existe antes da shell.

É minimalista, single-user, limpa e focada.

#### 2. Left rail

Não é só uma sidebar de navegação.

Ela mistura:
- filtro
- entrada futura para busca
- inbox destacada
- árvore principal
- settings
- status/chamada futura da console de IA

#### 3. Right workspace

É a área principal do produto.

Ela contém:
- header do item atual
- ações específicas do item
- superfície de leitura/visualização
- painel direito interno de informações complementares

#### 4. Presentation mode

Não é uma rota nova.

É um modo do workspace que remove o chrome e deixa quase só o conteúdo.

---

## 4. Login

### Papel da tela

Mesmo sendo um produto single-user, a aplicação deve sempre abrir com tela de login.

Isso vale:
- local/dev
- runtime empacotado
- publicação futura

### O que a tela deve comunicar

- acesso privado
- produto pessoal/técnico
- simplicidade
- ausência total de fricção desnecessária

### Elementos

- nome ou marca do app
- campo de usuário
- campo de senha
- toggle de visibilidade da senha
- botão primário de entrar
- erro inline quando credenciais forem inválidas

### O que não deve existir

- cadastro
- esqueci a senha
- oauth
- links extras
- marketing
- ilustrações supérfluas
- “lembrar de mim”

### Estados

- vazio
- foco em campo
- carregando
- erro inline

---

## 5. Left Rail

O painel esquerdo é uma das peças mais importantes do produto.

Ele precisa parecer:
- funcional
- denso o suficiente para navegação
- leve o suficiente para não competir com o conteúdo

Ele também é retrátil.

Recolher o painel esquerdo é uma forma de foco visual e quase-tela-cheia, mesmo fora do modo apresentação.

### Estrutura interna do painel esquerdo

```text
┌─────────────────────────────┐
│ Top bar do rail             │
│ [filtro] [lupa futura] [⚙] │
│ [status/console futura]     │
├─────────────────────────────┤
│ Inbox destacada             │
│ - lista propria             │
│ - contador                  │
├─────────────────────────────┤
│ Arvore principal            │
│ - topicos                   │
│ - subtopicos                │
│ - grupos                    │
│ - arquivos                  │
└─────────────────────────────┘
```

### Limite estrutural da árvore

A árvore não é arbitrariamente profunda.

A estrutura máxima esperada é:
- tópico
- subtópico
- grupo
- arquivo

Regras importantes:
- existe no máximo 1 nível de subtópico
- tanto no tópico quanto no subtópico podem existir arquivos ou grupos
- um grupo dentro de um subtópico cria o nível visual mais profundo esperado
- esse é o limite máximo da navegação estrutural

### Topo do rail

No topo do painel esquerdo deve existir espaço para:
- filtro estrutural
- entrada visual para busca textual futura com ícone de lupa
- acesso a configurações
- alguma região para estado geral/chamada da console de IA

Importante:
- filtro e busca não são a mesma coisa
- isso deve ficar claro visualmente

### Filtro estrutural

O filtro:
- age sobre nomes
- restringe visualmente o que aparece na inbox/árvore
- não é busca em conteúdo
- deve ser rápido e visualmente direto

Convenção visual recomendada:
- filtro = ícone de funil
- busca textual = ícone de lupa

### Busca textual futura

Mesmo que não esteja no escopo ativo imediato, a interface deve reservar lugar conceitual para a busca textual.

Ela deve ser entendida como um recurso separado do filtro estrutural.

### Inbox

A inbox não deve aparecer como mais um ramo da árvore.

Ela deve ser:
- uma seção própria
- acima da árvore
- visualmente destacada
- apresentada como lista simples, não como árvore

A inbox existe porque operacionalmente ela é diferente da base estruturada.

### O que a inbox precisa destacar

- contagem
- sensação de pendência
- leitura rápida da lista
- distinção visual em relação à árvore principal

### Árvore principal

A árvore principal representa a base estruturada.

Ela deve suportar visualmente:
- tópico
- subtópico
- grupo
- arquivo

### Tipos de item que devem existir visualmente

- nota
- url
- binário

Esses tipos devem ter ícones distintos.

### O que destacar na árvore

- item atual selecionado
- contagens junto dos próprios nós/pastas
- status visual por cor para diferenciar `rascunho/incompleto` de `finalizado`

### O que não mostrar

Não mostrar sidecar como item visível da árvore.

Sidecar é infraestrutura interna do item lógico e não deve poluir a navegação.

### O que evitar

- breadcrumbs redundantes
- indicadores visuais supérfluos de sidecar
- “recém-adicionado”
- excesso de badges

---

## 6. Right Workspace

Esta é a área principal de valor do produto.

Ela deve dar sensação de:
- foco
- leitura confortável
- boa composição visual
- clareza do item atual

### Estrutura

```text
┌────────────────────────────────────────────────────────────┐
│ Header do item atual                                      │
│ titulo                         [i] [download] [present]   │
├────────────────────────────────────────────────────────────┤
│                                                               │
│  Superficie principal de visualizacao                         │
│                                                               │
│  - markdown                                                   │
│  - imagem                                                     │
│  - excalidraw                                                 │
│  - pdf/binario fallback                                       │
│                                                               │
│                                      ┌─────────────────────┐  │
│                                      │ Painel lateral      │  │
│                                      │ direito interno     │  │
│                                      │ - metadados         │  │
│                                      │ - texto complementar│  │
│                                      └─────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Header do item atual

O header da área direita não é o header da aplicação inteira.

Ele pertence ao item atualmente aberto.

Elementos esperados:
- título do item atual
- ações daquele item

### Ações do item

As ações relevantes aqui são:
- abrir modo apresentação
- download do item atual
- abrir painel de informações

Outras ações futuras podem surgir, mas o header deve permanecer contido.

### O que não precisa existir

- breadcrumbs
- botões de edição
- ações administrativas

---

## 7. Painel de informações do item

Este ponto é importante e deve ser representado corretamente no Stitch.

Não queremos:
- YAML cru
- dump técnico
- visual de código-fonte

Queremos:
- um único ícone `i`
- um único mecanismo de painel
- painel lateral direito, interno ao workspace
- apresentação editorial e agradável

### Papel do painel

Mostrar informações complementares do item atual.

Dependendo do item, esse painel pode reunir:
- metadados estruturados
- texto complementar
- conteúdo do sidecar

### Como isso varia por tipo de item

#### Nota / URL / Markdown

O painel pode mostrar:
- metadados relevantes
- campos estruturados
- informações auxiliares

#### Binário com sidecar

O painel deve mostrar:
- o texto complementar do sidecar
- e, se fizer sentido, metadados do item

### Forma visual esperada

Não mostrar YAML puro.

Preferir:
- pares campo/valor
- blocos textuais bem compostos
- labels discretas
- áreas de texto bem tratadas

Deve parecer uma ficha editorial, não um inspetor técnico cru.

---

## 8. Viewer por tipo de item

Não pensar isso como “telas separadas”, e sim como estados do mesmo workspace.

### 8.1 Markdown / nota / URL resumida

Este é o caso principal do produto.

#### O viewer deve suportar bem

- headings
- parágrafos
- listas
- tabelas
- blockquotes
- blocos de código com highlight
- task lists
- links clicáveis
- callouts/admonitions

#### O viewer ainda não precisa enfatizar

Como prioridade visual principal, não precisa desenhar como núcleo da primeira geração:
- fórmulas matemáticas
- imagens embutidas em Markdown
- Mermaid ou diagramas embutidos

Esses pontos podem existir como expansão futura.

#### Sensação desejada

O Markdown deve parecer:
- muito legível
- bem tipografado
- editorial
- confortável

Não deve parecer:
- HTML genérico
- página técnica crua
- renderizador de documentação genérico sem personalidade

### 8.2 Imagem

Imagem é prioridade real.

Deve ser tratada como conteúdo principal, não anexo.

#### A interface deve sugerir

- enquadramento confortável
- visualização ampla
- possibilidade de zoom
- sensação de viewer dedicado

O painel de informações permanece como mecanismo complementar.

### 8.3 Excalidraw

O arquivo `.excalidraw` deve entrar no brief como parte importante da visão futura visual, mesmo que a implementação seja progressiva.

Pensar nele como:
- um tipo de ativo visual de primeira classe
- próximo do tratamento de imagem/asset
- preferencialmente com boa visualização
- sem comprometer a ideia central de que a web não é um editor nesta fase

O brief pode explorar como um `.excalidraw` deveria parecer em modo leitura/visualização.

Não tratar o editor completo como requisito visual principal desta primeira entrega.

### 8.4 PDF e outros binários

PDF não precisa de uma linguagem visual super específica agora.

Ele pode ser tratado como uma variação de binário:
- quando houver preview suficiente, mostrar preview
- quando não houver, comunicar fallback com clareza

O mesmo vale para outros binários sem visualizador próprio.

### Estados de fallback

Isso deve estar bem representado conceitualmente:
- preview disponível
- preview degradado
- sem preview
- fallback para download

O usuário nunca deve ficar diante de uma área “quebrada” ou vazia sem explicação.

---

## 9. Modo apresentação

Modo apresentação não é outra tela isolada.

É um modo do workspace.

### O que ele é

- um modo interno da aplicação
- não é o fullscreen nativo do navegador
- não é `F11`

### O que ele faz

Ele remove a maior parte do chrome da interface e deixa o conteúdo como foco total.

### O que desaparece

No modo apresentação, devem sumir:
- painel esquerdo
- filtro / busca / settings / status
- header da área direita
- título
- painel de informações
- outros elementos de manutenção

### O que fica

Fica essencialmente:
- o conteúdo
- controles discretos mínimos

### Controles

Os controles do modo apresentação devem:
- aparecer discretamente
- ser translúcidos
- auto-ocultar
- surgir no canto inferior esquerdo

Controles mínimos:
- sair do modo
- ligar/desligar ponteiro
- ligar/desligar anotação

### Ponteiro

O ponteiro:
- não depende do modo apresentação
- pode ser usado também fora dele
- deve ter comportamento de laser temporário com rastro que desaparece
- lembrar a sensação do ponteiro do Excalidraw

### Anotação

A anotação persistente entra como visão futura e pode aparecer no brief.

Ela deve ser pensada como:
- camada por cima do conteúdo
- efêmera
- descartável
- com ação de limpar tudo
- acompanhando o scroll do conteúdo

Não pensar em persistência.

### Temas

A UI deve ter seleção de temas prontos.

Importante:
- não há editor de tema na interface
- não há customização livre de cores/fontes pelo usuário
- o sistema apenas oferece uma lista de temas aprovados

Os temas iniciais devem ser pensados como variações de apresentação/leitura inspiradas em:
- ChatGPT
- GitHub
- Excalidraw

Mas o Stitch deve decidir a direção visual detalhada.

---

## 10. Busca e filtro

Este ponto precisa ficar muito claro no brief, porque já foi fonte de ambiguidade.

### Filtro estrutural

É o que fica no topo do rail.

Serve para:
- restringir visualmente inbox e árvore
- agir sobre nome/estrutura
- ajudar navegação imediata

Não é busca em conteúdo.

### Busca textual avançada

É outra experiência.

Mesmo que não esteja no primeiro recorte implementado, o brief pode representá-la como parte da visão completa da UI.

Ela deve ser:
- separada do filtro
- associada à lupa
- uma superfície própria de resultados
- com nome do item + caminho
- ao clicar em um resultado, fechar a busca e abrir o item correspondente

### O que não fazer

Não misturar:
- filtro da árvore
- busca em conteúdo
- árvore filtrada por matches internos de texto

Se o Stitch representar isso, deve deixar visualmente clara a diferença.

---

## 11. Restrições de implementação para o output do Stitch

### O output desejado

- HTML
- imagem de screenshot/export visual
- componentes organizados por superfície ou estado
- dados mockados, sem lógica de negócio real
- handlers simulados ou vazios quando necessário
- sem dependência de backend real
- sem integração real com filesystem
- sem autenticação real

O Stitch deve gerar material utilizável como referência visual e estrutural.

Isso significa, idealmente:
- arquivos `html` legíveis o suficiente para servir como referência estrutural
- screenshots ou imagens exportadas para capturar composição e atmosfera visual
- boa separação visual entre superfícies
- markup legível o suficiente para ser usado como referência na implementação real

### O que o Stitch deve focar

- layout
- hierarquia
- composição
- padrões de componente
- linguagem visual
- estados
- coerência entre modos

### O que o Stitch não precisa resolver agora

- lógica de autenticação real
- integração real com filesystem
- leitura real de `pkm`
- backend
- sessão
- middleware
- persistência

### Como modelar os protótipos

Os protótipos/exportações devem usar:
- dados mockados
- props claras
- handlers vazios ou simulados
- sem lógica de negócio acoplada

---
