# Stitch Brief — PKM Web v2

Use este documento como prompt de sessão no Google Stitch para gerar o design system e as telas da v2 do PKM. Cole o conteúdo abaixo no Stitch e itere até ter todas as 5 telas aprovadas.

---

## 1. Contexto do produto

**O que é:** Uma interface web de navegação e leitura para um sistema de gestão de conhecimento pessoal (PKM) file-first. O conteúdo é escrito em Markdown, organizado em tópicos e grupos, e versionado em Git.

**Quem usa:** Usuário único, operador técnico. Não há cadastro, não há multiusuário, não há colaboração.

**O que a web faz:** Apenas navega e exibe — árvore de tópicos, leitura de notas Markdown, visualização de imagens e PDFs, modo apresentação. Não há edição, não há upload, não há formulários além do login.

**Stack técnica:** Next.js App Router, React, Tailwind CSS, shadcn/ui, lucide-react. O output do Stitch deve ser React + Tailwind, usando shadcn/ui como base de componentes.

---

## 2. Direção visual

**Mood:** Minimalista e funcional — foco total no conteúdo, pouco ornamento. Inspiração em Linear e Obsidian, mas em light mode. Não é um app de produtividade colorido; é uma ferramenta de leitura e pensamento.

**Modo:** Light mode como padrão. Fundo branco/off-white, superfícies levemente distintas, tipografia com hierarquia clara.

**Densidade:** Compacta mas respirável. A sidebar de navegação pode ser densa; a área de conteúdo precisa de margem generosa para leitura.

**Fonte:** Inter em toda a interface. Usar escala tipográfica bem definida (sm/base/lg/xl/2xl).

**Cor de acento:** Propor uma cor de acento sóbria que funcione bem em light mode — azul frio, slate, ou similar. Não usar cores vibrantes ou saturadas.

**Bordas e raios:** Bordas sutis, raio de borda pequeno a médio. Nada arredondado demais.

**Instrução:** Não use cores arbitrárias — proponha um sistema de tokens (cores semânticas: background, surface, border, text-primary, text-muted, accent, accent-hover) que possa ser mapeado para `tailwind.config`.

---

## 3. Telas

### Tela 1 — Login

**Contexto:** Primeira tela que o usuário vê. Autenticação single-user com usuário e senha. Não há registro, não há "esqueci a senha", não há OAuth.

**Componentes:**
- Logo ou nome do app (simples, sem elaboração)
- Campo de usuário (Input)
- Campo de senha (Input com toggle de visibilidade)
- Botão "Entrar" (Button, primário)
- Mensagem de erro inline quando as credenciais são inválidas
- Nenhum outro elemento — tela limpa e focada

**Comportamentos:**
- Submit via botão ou Enter
- Erro aparece abaixo do formulário (sem modal, sem toast)
- Sem "lembrar de mim", sem links extras

**Estado vazio:** Campos em branco, botão habilitado
**Estado com erro:** Campos com borda vermelha, mensagem de erro visível

---

### Tela 2 — Shell de navegação

**Contexto:** Tela principal após o login. O usuário navega pela árvore de conhecimento. A área de conteúdo exibe a nota selecionada (ver Tela 3). Esta tela define o layout base de todas as demais.

**Layout:** Sidebar fixa à esquerda + área de conteúdo à direita. Proporção sugerida: sidebar ~280px, conteúdo ocupa o restante.

**Componentes da sidebar:**
- Cabeçalho com nome do PKM e ícone de usuário (sem menu complexo)
- Campo de busca de notas (somente por nome — sem busca full-text)
- Seção "Inbox" com contador de itens
- Árvore de tópicos expansível: tópico → grupos → notas
  - Cada tópico é expansível/colapsável
  - Grupos dentro do tópico são listados
  - Notas dentro do grupo são listadas
  - Item selecionado tem estado de destaque
- Botão de logout no rodapé da sidebar

**Componentes da área de conteúdo:**
- Placeholder quando nenhuma nota está selecionada ("Selecione uma nota para começar")
- Área onde a nota carregada será exibida (ver Tela 3)

**Estado vazio (sidebar):** Árvore sem nenhum tópico — mensagem de estado vazio
**Estado com conteúdo:** Tópicos listados, um item selecionado e destacado

---

### Tela 3 — Viewer de Markdown

**Contexto:** Exibição de uma nota Markdown dentro do shell (Tela 2). A sidebar continua visível. A área de conteúdo exibe a nota com metadados.

**Layout:** Área de conteúdo dividida em: coluna principal (nota) + painel lateral de metadata (colapsável ou fixo).

**Componentes da coluna principal:**
- Título da nota (h1)
- Corpo da nota em Markdown renderizado: headings, parágrafos, listas, código inline e em bloco, blockquotes, tabelas, links
- Suporte a imagens inline no Markdown

**Componentes do painel de metadata:**
- Campo `estado` (rascunho / finalizado) com badge de cor
- Campo `modelo` (tipo da nota)
- Campo `data_captura`
- Campo `autores` (lista, se presente)
- Campo `data_publicacao` (se presente)
- Campos opcionais omitidos quando vazios

**Comportamentos:**
- Links internos (entre notas) não funcionam na v2 — exibir como texto
- Links externos abrem em nova aba
- Sem modo de edição — nenhum botão de editar

**Estado:** Sempre com conteúdo (a tela só aparece quando uma nota é selecionada)

---

### Tela 4 — Viewer de imagem / PDF com sidecar

**Contexto:** Visualização de um arquivo binário (imagem ou PDF) que pode ter um sidecar `.md` associado com contexto escrito sobre ele.

**Layout:** Área de conteúdo com o arquivo visual em destaque + painel de sidecar à direita (quando existir).

**Componentes (imagem):**
- Imagem exibida em tamanho adequado, com zoom ao clicar (lightbox simples)
- Nome do arquivo como título acima

**Componentes (PDF):**
- Viewer de PDF embutido (iframe ou viewer nativo do browser)
- Nome do arquivo como título acima
- Botão "Abrir em nova aba"

**Componentes do painel de sidecar:**
- Indica que é o "Contexto" do arquivo
- Conteúdo Markdown do sidecar renderizado (mesma regra da Tela 3)
- Se não houver sidecar, o painel não é exibido (área de conteúdo usa 100% da largura)

**Estado vazio do sidecar:** Painel não renderizado (não há estado vazio visível)

---

### Tela 5 — Modo apresentação

**Contexto:** Uma nota Markdown pode ser aberta em modo apresentação — foco total no conteúdo, sem distrações, com suporte a temas e laser pointer visual.

**Layout:** Tela cheia. Sidebar oculta. Conteúdo centralizado com largura máxima de leitura (~720px).

**Componentes:**
- Barra de controle discreta no topo (ou ativada por hover): botão para sair, seletor de tema, indicador de posição de scroll
- Conteúdo da nota renderizado em Markdown com tipografia ampliada
- Laser pointer: ponto vermelho semitransparente que segue o cursor (ativado por toggle na barra de controle)
- Temas disponíveis: ao menos 2 (ex: claro padrão e escuro para ambiente com projetor)

**Comportamentos:**
- Entrar no modo: botão na Tela 3 (no viewer de nota)
- Sair do modo: botão na barra de controle ou tecla Esc
- Laser pointer ligado/desligado via toggle
- Troca de tema sem recarregar a página

**Estado:** Sempre com conteúdo (só entra no modo se uma nota estiver aberta)

---

## 4. Constraints técnicas

- **Output:** React + Tailwind CSS (JSX com classes Tailwind, não CSS modules)
- **Componentes base:** shadcn/ui sempre que possível (Button, Input, Card, Badge, Separator, ScrollArea, etc.)
- **Ícones:** lucide-react exclusivamente
- **Responsividade:** desktop-first. Mobile não é prioridade na v2, mas evitar layouts que quebrem completamente abaixo de 768px
- **Sem lógica de negócio:** os componentes exportados devem ser puramente de layout e estilo. Props com dados mockados. Handlers de evento como `() => {}` ou props opcionais
- **TypeScript:** exportar interfaces de props para cada componente
- **Sem estado global:** sem Context, sem Zustand, sem Redux nos exports — somente state local quando necessário para o visual (ex: toggle de sidebar, tema)

---

## 5. O que exportar

Para cada tela:
1. Um ou mais arquivos `.tsx` com os componentes da tela
2. `DESIGN.md` — sistema de design completo nas 9 seções padrão do Stitch (cores, tipografia, componentes, layout, espaçamento, elevação/sombra, responsividade, do's & don'ts, agent prompt guide)

O `DESIGN.md` é o artefato mais importante: ele define os tokens que todas as fases de implementação vão usar.
