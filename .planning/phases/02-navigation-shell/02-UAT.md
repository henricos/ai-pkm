---
status: complete
phase: 02-navigation-shell
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md
started: 2026-04-08T00:00:00Z
updated: 2026-04-08T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Shell inicia sem erros
expected: Rode `npm run dev`. O servidor Next.js deve iniciar sem erros no terminal. Acesse http://localhost:3000 — a página carrega (sem tela branca de erro, sem stack trace visível no navegador). O console do navegador não deve exibir erros React críticos.
result: pass

### 2. Rail recolhível — toggle fecha e abre
expected: Na página inicial, há um botão de toggle no rail esquerdo (ícone de chevron ou menu). Clicar nele recolhe o rail (some ou fica estreito). Clicar novamente expande o rail de volta. O workspace à direita se ajusta ao espaço disponível.
result: pass

### 3. Estado vazio na rota raiz
expected: Acesse `/`. O workspace exibe um estado vazio editorial — uma mensagem de boas-vindas ou orientação visual sem listar todos os tópicos ou arquivos brutos. Não deve aparecer uma lista técnica de caminhos ou nomes de arquivos.
result: pass

### 4. Inbox lane acima da árvore no rail
expected: O rail esquerdo mostra uma seção de Inbox separada, posicionada acima da árvore de navegação. Ela exibe os itens da inbox (ou uma contagem) de forma compacta, com ícone de tipo por item.
result: issue
reported: "inbox visivel sim. acima da árvore (biblioteca) mas abaixo do filtro. como o filtro é somente da biblioteca, talvez tenha que colocar o filtro depois do inbox, acho que dentro da biblioteca (o cabecalho) e antes da arvore em si. contador mostra 1 quando inbox esta vazia — suspeita que o .gitignore esta sendo contado. inbox vazia exibe item fantasma com icone sem nome."
severity: minor

### 5. Árvore de navegação — raízes e expansão
expected: A árvore abaixo da inbox mostra apenas os tópicos raiz inicialmente. Clicar em um tópico expande-o para mostrar subtópicos, grupos ou itens filhos. Clicar novamente o recolhe.
result: issue
reported: "a arvore esta correta mas tem itens fantasma tambem e o contador esta com 1 a mais. expansao e ocultamento ok. suspeita que arquivo oculto (ex: .gitignore) esta sendo incluido como item."
severity: minor

### 6. Item ativo auto-expandido e destacado na árvore
expected: Acesse uma URL de um item na biblioteca (ex.: `/library/[topico]/[grupo]/[item]`). O item correspondente aparece destacado visualmente na árvore (aria-current="page") e seus ancestrais são auto-expandidos para que o item fique visível, mesmo partindo de raízes recolhidas.
result: pass

### 7. Filtro estrutural — substring e wildcard
expected: O rail tem um campo de filtro (ícone de funil, não lupa). Digitar parte de um nome de tópico ou item filtra a árvore em tempo real, mantendo os ancestrais visíveis. O trecho correspondente aparece destacado (cor tertiary, sem fundo colorido). Usar `*` como wildcard funciona (ex.: `agi*` encontra `agile`).
result: pass

### 8. Filtro fuzzy — tolerância a variações
expected: Digitar uma palavra com variação de acento ou leve erro ortográfico (ex.: `filosofia` vs `filosofia`, ou `ferramenta` vs `ferramente`) ainda retorna resultados relevantes, graças ao fallback fuzzy.
result: pass

### 9. Rota library/[...path] carrega item no workspace
expected: Clicar em um item da árvore de navegação (ou acessar diretamente `/library/[topico]/[grupo]/[item]`) exibe o item no workspace à direita com título, tipo e estado visíveis. Não deve aparecer caminho absoluto do arquivo ou conteúdo bruto markdown.
result: pass

### 10. Rota inbox/[item] carrega item da inbox no workspace
expected: Clicar em um item da inbox lane (ou acessar diretamente `/inbox/[item]`) exibe o item no workspace à direita com título, tipo e estado visíveis. Não deve aparecer caminho absoluto do arquivo ou conteúdo bruto.
result: pass

## Summary

total: 10
passed: 8
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Inbox lane com posição correta (filtro dentro da seção biblioteca, antes da árvore), contador correto (zero quando vazia), e estado vazio explícito sem item fantasma"
  status: fixed
  reason: "User reported: filtro acima da inbox (deveria ser dentro da seção biblioteca); contador mostra 1 quando vazia (suspeita .gitignore contado); inbox vazia exibe item fantasma com ícone sem nome"
  severity: minor
  test: 4
  root_cause: "listFiles incluía arquivos ocultos (ex: .gitkeep) que não são itens reais. Fix: filtrar nomes iniciados com '.'. Decisão conceitual: filtro permanece acima de tudo (posição atual mantida); InboxLane passa a sempre exibir o cabeçalho, lista condicional."
  artifacts: ["src/lib/navigation/navigation-service.ts", "src/components/shell/inbox-lane.tsx", "src/components/shell/left-rail.tsx"]
  missing: []
  debug_session: ""

- truth: "Árvore exibe apenas itens reais do PKM, sem arquivos ocultos; contador preciso em todos os agrupadores"
  status: fixed
  reason: "User reported: itens fantasma na árvore e contador com 1 a mais em agrupadores; suspeita que arquivo oculto (ex: .gitignore) está sendo incluído como item pelo listFiles"
  severity: minor
  test: 5
  root_cause: "listFiles incluía arquivos ocultos (prefixo '.') e o arquivo de convenção '_grupo.md' presente dentro de pastas de grupo. Fix: filtrar nomes com '.' e o arquivo '_grupo.md' especificamente."
  artifacts: ["src/lib/navigation/navigation-service.ts"]
  missing: []
  debug_session: ""
