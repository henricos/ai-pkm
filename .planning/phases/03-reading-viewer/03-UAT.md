---
status: resolved
phase: 03-reading-viewer
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md, 03-06-SUMMARY.md, 03-HUMAN-UAT.md]
started: 2026-04-09T22:52:14Z
updated: 2026-04-10T00:55:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Renderização de Markdown
expected: Ao clicar em qualquer item na LeftRail (biblioteca ou inbox), o conteúdo aparece renderizado como Markdown rico: headings com hierarquia visual, negrito/itálico, listas, tabelas GFM, blocos de código com syntax highlighting (Shiki) — não texto bruto com frontmatter visível.
result: pass
note: "Reverificado após 03-06: cifrão monetário não ativa LaTeX, Markdown rico permanece estável e itens não-Markdown não exibem conteúdo bruto."

### 2. Cabeçalho sticky com breadcrumb
expected: O ViewerHeader aparece fixo no topo da área de conteúdo. Lado esquerdo mostra "TÓPICO › GRUPO" (maiúsculas, rastreável) e um chip de estado do item (ex: "rascunho" ou "finalizado"). Para itens da inbox, exibe "INBOX".
result: pass

### 3. Efeito glassmorphism no scroll
expected: Quando o conteúdo do viewer é rolado para baixo (mais de ~8px), o cabeçalho ganha um efeito de vidro fosco (backdrop-blur + fundo semi-transparente). Antes de rolar, o cabeçalho é transparente.
result: pass

### 4. Download do arquivo raw
expected: O botão de download no ViewerHeader (ícone de download) aciona o download do arquivo Markdown bruto. O browser abre diálogo de salvar ou baixa diretamente o arquivo .md com o conteúdo original (incluindo frontmatter).
result: pass
note: "Reverificado após 03-06: binários baixam sem corrupção; para .md, o comportamento final aceito é download sem frontmatter."

### 5. Toggle do painel de informações
expected: Clicar no botão ℹ️ no ViewerHeader abre um painel lateral direito (280px) com metadados do item. Clicar novamente fecha o painel. O painel empurra o conteúdo para a esquerda (push layout) — não sobrepõe.
result: pass
note: "Reverificado após 03-06: painel abre sem crash, com push layout e metadados formatados."

### 6. Fecha painel com Escape
expected: Com o painel de informações aberto, pressionar a tecla Escape fecha o painel automaticamente.
result: pass

### 7. Metadados formatados em pt-BR no painel
expected: O painel de informações exibe os metadados do item formatados: datas em português (ex: "7 mar. 2026"), URL como link clicável, autores como chips, estado e tipo com destaque. Campos ausentes não aparecem (sem "N/A" ou campos vazios).
result: pass

### 8. Links externos abrem em nova aba
expected: Links externos no conteúdo Markdown (iniciando com http:// ou https://) abrem em nova aba (target="_blank"). Links internos navegam normalmente sem abrir nova aba.
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Cifrão ($) em texto comum não deve ativar math mode LaTeX"
  status: fixed
  reason: "User reported: valores monetários com $ disparam KaTeX, gerando erros com chars Unicode pt-BR (ã, õ, —, –)"
  severity: major
  test: 1
  root_cause: "remark-math usa delimitador $...$ por padrão, colide com cifrões em prosa; opção singleDollarTextMath não está desabilitada"
  artifacts:
    - path: "src/components/viewer/markdown-viewer.tsx"
      issue: "remarkMath() chamado sem opções — singleDollarTextMath default true"
  missing:
    - "Passar { singleDollarTextMath: false } para remarkMath"
  debug_session: ""

- truth: "Arquivos não-Markdown (PDF, Excalidraw, imagens) devem exibir visualização adequada ou mensagem de tipo não suportado — não conteúdo bruto"
  status: fixed
  reason: "User reported: .pdf mostra fonte bruto; .excalidraw mostra JSON bruto; .jpg mostra fonte bruto"
  severity: major
  test: 1
  root_cause: "ViewerPage não inspeciona item.type antes de renderizar — sempre chama getItemContent() e passa para MarkdownViewer mesmo para itens binários (type: 'binario')"
  artifacts:
    - path: "src/components/viewer/viewer-page.tsx"
      issue: "sem branch por item.type — binários renderizados como Markdown"
  missing:
    - "Adicionar branch em ViewerPage: se item.type === 'binario', renderizar mensagem de formato não suportado"
  debug_session: ""

- truth: "Download de arquivos binários (PDF, JPG, Excalidraw) deve servir o arquivo original sem corrupção"
  status: fixed
  reason: "User reported: PDF, JPG e Excalidraw baixaram corrompidos"
  severity: major
  test: 4
  root_cause: "route handler chama getItemContent() para todos os arquivos — readFileSync com encoding utf-8 corrompe binários; gray-matter faz parsing texto em cima dos bytes corrompidos"
  artifacts:
    - path: "src/app/api/pkm/raw/[...path]/route.ts"
      issue: "usa getItemContent() (text-only via gray-matter) para arquivos binários"
    - path: "src/lib/pkm/fs-item-repository.ts"
      issue: "getItemContent() usa readFileSync com utf-8 — não serve para binários"
  missing:
    - "Para não-.md: ler com readFileSync sem encoding (Buffer) e servir com Content-Type correto por extensão"
    - "Adicionar método getRawBuffer(id) no repositório ou detectar extensão no route handler"
  debug_session: ""

- truth: "Painel de informações abre sem crash ao clicar ℹ️"
  status: fixed
  reason: "User reported: crash RangeError: Invalid time value em formatDataCaptura (info-panel.tsx:37)"
  severity: blocker
  test: 5
  root_cause: "data_captura no frontmatter YAML é date sem aspas — gray-matter parseia como objeto Date JS, não string; formatDataCaptura concatena Date com 'T00:00:00' gerando string inválida para new Date()"
  artifacts:
    - path: "src/lib/pkm/fs-item-repository.ts"
      issue: "getItemFrontmatter() não normaliza data_captura de Date para string ISO antes de retornar RawFrontmatter"
  missing:
    - "Em getItemFrontmatter(), converter data_captura para string: se instanceof Date, usar .toISOString().slice(0, 10)"
  debug_session: ""
