---
name: criar-nota
description: "Abre uma sessão de criação de nota a partir de um rascunho embrionário (dump da inbox). Constrói o documento com pesquisa externa e interação contínua, usando o template correspondente como guia de construção desde o início. Suporta dois modos: arquivo único e grupo/pasta. Use esta skill sempre que o usuário quiser criar uma nota, elaborar um rascunho, desenvolver um tema a partir de quase nada, ou mencionar qualquer atividade de construção de conteúdo novo — mesmo que não diga explicitamente \"criar nota\"."
command: /criar-nota
---

# SKILL: Sessão de Criação de Nota

## Instruções de Execução do Agente

Esta skill implementa o **Fluxo — Sessão de Criação de Nota** descrito em `docs/flows/criar-nota.md`. Cada invocação abre uma sessão de trabalho independente sobre um arquivo específico ou uma pasta (tópico ou grupo).

A criação é trabalho intelectual pesado — pesquisa, expansão, síntese, construção a partir de rascunhos embrionários. O template correspondente é adotado como guia silencioso de construção desde o início da sessão.

---

## Pré-condição: Detecção do Modo

Antes de iniciar a sessão, determine o modo de trabalho:

- **Argumento termina em `.md`** (ex: `/criar-nota _tecnologia/ia/minha-nota.md`) → **Modo A — Arquivo único**
- **Argumento é caminho de pasta** (ex: `/criar-nota _tecnologia/meu-framework`) → **Modo B — Grupo/pasta**
- **Sem argumento** → **Modo Descoberta** (ver abaixo)

Se o usuário mencionar um grupo sem especificar o tópico, consulte `index/grupos.json` para localizar. Se houver múltiplos candidatos, liste com opções numeradas e pergunte.

---

## Modo Descoberta (sem argumento)

Quando invocado sem argumento, em vez de perguntar qual arquivo, execute:

### Passo D1 — Buscar notas em rascunho

Faça grep por `estado: rascunho` em `pkm/*/` recursivamente (apenas arquivos `.md`, excluindo `url_*.md`).

### Passo D2 — Apresentar lista agrupada

Agrupe os resultados por tópico e apresente lista numerada:

```
Notas com estado: rascunho

desenvolvimento-pessoal
  1. metodo-zettelkasten-visao-geral.md
  2. como-fazer-anotacoes-inteligentes-sonke-ahrens.md

tecnologia
  3. como-funciona-transformer.md

Qual deseja trabalhar? (informe o número ou o caminho completo)
```

### Passo D3 — Prosseguir como Modo A

Após a escolha do usuário, prossiga normalmente como **Modo A — Arquivo único** a partir da Fase 1.

**Se nenhuma nota `rascunho` for encontrada:**

> *"Não há notas com `estado: rascunho` na base. Informe o caminho do arquivo ou pasta que deseja trabalhar."*

---

## Modo A — Arquivo Único

Para rascunhos, notas embrionárias ou qualquer arquivo que o usuário queira construir, expandir ou amadurecer individualmente.

### Fase 1 — Foco

**1.1 Leitura imediata**

Leia o conteúdo do arquivo identificado.

**1.1b Detecção de modelo (adoção silenciosa)**

Após a leitura (aplica-se apenas a notas — arquivos sem prefixo `url_`):
1. Leia o campo `modelo` do frontmatter.
   - **Campo presente**: construa o caminho `docs/schemas/[valor].md` e leia o arquivo. Adote como guia silencioso de construção e siga direto para a proposta de execução.
   - **Campo ausente**: leia `index/models.json`, compare o assunto do conteúdo com `assuntos_aplicaveis` de cada entrada e selecione o match mais adequado.
     - Se houver **match claro**: leia o modelo e siga direto para a proposta de execução.
     - Se estiver **ambíguo**: apresente sua hipótese e pergunte ao usuário qual modelo usar antes de continuar.
     - Se **nenhum match** for aplicável: informe que não encontrou modelo aplicável e peça confirmação explícita para seguir como nota sem modelo.
2. Ao selecionar um modelo, ele define a estrutura esperada — use-o para orientar sugestões de ação e para guiar a produção de saída. A gravação de `modelo: [nome-sem-extensao]` no frontmatter acontece junto da escrita aprovada.

**1.2 Propor plano de trabalho**

- **Se houver template definido ou inferido com confiança**: sugira diretamente qual ação (ou cadeia de ações) do cardápio se aplica. Se o template tiver seções ainda ausentes no rascunho, inclua isso na sugestão (ex: sugerir Pesquisar + Expandir para cobrir as seções faltantes).
- **Se não houver template claro**: pergunte ao usuário o que deseja fazer e que estrutura quer buscar. Use a resposta para tentar encaixar um template. Se continuar sem template aplicável, informe isso e peça confirmação explícita para seguir como nota sem template.

**1.3 Confirmação**

Aguarde confirmação. Só prossiga após aprovação.

---

### Fase 2 — Saída (posição flexível)

Define o formato do resultado. Pode acontecer antes ou depois da dinâmica.

- **Antes** — quando a ação tem saída previsível (ex: expandir, estruturar, reformular)
- **Depois** — quando a sessão é exploratória (ex: ramificar, socrática, generativa)

**Decisões:**
- Formato, tom, público-alvo
- Quer renomear o arquivo ao final? Se sim, a IA sugere um nome com base no conteúdo resultante.

No Modo A, o arquivo de saída é o mesmo de entrada — o template já foi detectado na Fase 1.

---

### Fase 3 — Dinâmica

**3.1 Propor dinâmica** — sugira uma dinâmica do cardápio, explicando brevemente.

**3.2 Executar o trabalho** — no modo escolhido até conclusão natural.

**3.3 Calibração de pesquisa** — ao longo da sessão, após cada rodada de pesquisa ou escrita, pergunte:

> *"Já parece bom ou quer pesquisar mais? Podemos aprofundar [tema X] ou mudar para [direção Y]."*

Aguarde direção do usuário: continuar, aprofundar, mudar de direção ou encerrar.

**3.4 Encerramento natural** — se a Fase 2 foi adiada, conduza as decisões de saída agora.

**3.5 Renomeação (se aprovada)** — execute a renomeação do arquivo após confirmação explícita do novo nome.

**3.6 Transição de estado** — ao encerrar a sessão, pergunte:

> *"A nota está finalizada? Posso marcar como `estado: finalizado`."*

- Se sim: edite o frontmatter, trocando `estado: rascunho` por `estado: finalizado`
- Se não: encerre sem alterar

---

## Modo B — Grupo/Pasta

Para trabalho que envolve múltiplos arquivos de uma pasta — síntese, comparação, produção de um arquivo resultado a partir de várias fontes.

### Fase 1 — Foco

**1.1 Listar arquivos do alvo**

Liste apenas os nomes dos arquivos na pasta escolhida (excluindo `.gitkeep` e `_grupo.md`). Quando houver binário e sidecar pareados, trate-os como uma única unidade conceitual. Não leia o conteúdo neste momento.

**1.2 Receber a intenção do usuário**

> *"Quais arquivos quer envolver e o que deseja alcançar nesta sessão?"*

**1.3 Propor plano de trabalho**

Sugira quais arquivos envolver e qual ação (ou cadeia de ações) do cardápio se aplica.

**1.4 Confirmação**

Aguarde confirmação. Só prossiga após aprovação.

**1.5 Leitura do conteúdo**

Leia o conteúdo dos arquivos aprovados.

---

### Fase 2 — Saída (posição flexível)

Define o formato do resultado. Pode acontecer antes ou depois da dinâmica.

- **Antes** — quando a ação tem saída previsível (ex: resumir, estruturar, reformular)
- **Depois** — quando a sessão é exploratória (ex: ramificar, socrática, generativa)

**Decisões:** formato, tom, público-alvo e arquivo de saída.

> *"O resultado vai para um arquivo novo ou atualiza um arquivo existente?"*

**Detecção de modelo (baseada no arquivo de saída):**

Após definir o arquivo de saída (aplica-se apenas a notas — sem prefixo `url_`):
1. Leia o campo `modelo` do frontmatter do arquivo de saída (se existente).
   - **Campo presente**: construa o caminho `docs/schemas/[valor].md` e leia o arquivo.
   - **Campo ausente**: leia `index/models.json`, compare o assunto com `assuntos_aplicaveis` de cada entrada e selecione o match mais adequado.
2. Se modelo selecionado: carregue, anuncie ao usuário:
   > *"Encontrei o modelo `[nome].md` — vou usá-lo como guia de estrutura e estilo para a saída."*
   A gravação de `modelo: [nome-sem-extensao]` no frontmatter acontece junto da escrita aprovada.
3. Se nenhum match: informe que não encontrou modelo aplicável e peça confirmação explícita para seguir com uma nota sem modelo.

---

### Fase 3 — Dinâmica

**3.1 Propor dinâmica** — sugira uma dinâmica do cardápio, explicando brevemente.

**3.2 Executar o trabalho** — no modo escolhido até conclusão natural. Ao produzir saída: estrutura e regras do template são seguidas como guia (se disponível).

**3.3 Calibração de pesquisa** — calibre o esforço de pesquisa interativamente com o usuário ao longo da sessão.

**3.4 Encerramento natural** — se a Fase 2 foi adiada, conduza as decisões de saída agora (incluindo detecção de template).

---

## Cardápio de Ações

*Exploração e expansão*
- **Pesquisar** — buscar na web fontes que complementem o material
- **Ramificar** — explorar direções adjacentes
- **Curar** — selecionar e anotar as melhores referências
- **Expandir** — desenvolver em profundidade uma ideia ou rascunho ainda embrionário

*Análise e compreensão*
- **Resumir** — condensar material extenso
- **Recortar** — extrair trechos específicos
- **Mapear** — identificar a estrutura conceitual
- **Comparar** — convergências, divergências e complementaridades

*Avaliação e crítica*
- **Verificar consistência** — contradições, saltos lógicos
- **Identificar consenso** — onde fontes concordam e divergem
- **Testar limites** — exceções e contra-exemplos
- **Avaliar fontes** — qualidade e viés

*Síntese e refinamento*
- **Sintetizar** — fundir múltiplas fontes numa visão integrada
- **Estruturar** — desenhar arquitetura ou fases
- **Argumentar** — tese, evidências e conclusão
- **Reformular** — reescrever com outra estrutura
- **Conectar** — relacionar com outros conceitos da base

---

## Cardápio de Dinâmicas

*Família 1: Escuta e organização*
- **Estruturação**, **Escuta ativa**, **Espelhamento**

*Família 2: Questionamento e desafio*
- **Socrática**, **Crítica**, **Steelmanning**, **Pré-mortem**, **Escada da inferência**

*Família 3: Expansão e geração*
- **Generativa**, **Perspectivista**, **Provocativa**, **Divergente-convergente**

*Família 4: Ensino e calibração*
- **Tutorial**, **Scaffolding**, **Feynman**

---

## Regras de Comportamento

- **Modo A:** arquivo é lido imediatamente. Template é adotado como guia silencioso — sem diagnóstico de divergência estrutural. Renomeação é opcional e acontece ao final, após confirmação explícita do novo nome.
- **Modo B:** conteúdo só após confirmação. Liste apenas nomes primeiro.
- **Calibração de pesquisa:** ao longo de toda sessão de criação, perguntar progressivamente se o resultado já está bom ou se quer continuar, aprofundar ou mudar direção.
- **Sessões independentes.** Não há estado persistente entre sessões.
- **Bom senso sobre mecânica.** O modelo de fases é estrutura, não burocracia.
- **Idioma:** pt-BR.

## Arquivos de Referência

- `docs/flows/criar-nota.md` — especificação do fluxo de criação de nota
- `docs/pkm-structure.md` — destinos válidos
- `index/grupos.json` — grupos disponíveis
