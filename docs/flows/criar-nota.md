## Sessão de Criação de Nota

**Skill:** `/criar-nota`

**Quando usar:** Para criar uma nota a partir de um rascunho embrionário (dump da inbox). A sessão constrói o documento a partir de quase nada, com pesquisa externa e interação contínua, usando o template correspondente como guia de construção desde o início.

---

**Detecção do modo:**

```
Se argumento termina em `.md` → Modo A (arquivo único)
Se argumento é caminho de pasta → Modo B (grupo/pasta)
Se sem argumento → Modo Descoberta (listar notas com estado: rascunho)
```

**Modo Descoberta (sem argumento):**

Quando invocado sem argumento, em vez de perguntar qual arquivo, o fluxo executa:
1. Grep por `estado: rascunho` em todos os arquivos `.md` de `pkm/*/` recursivamente, excluindo `url_*.md`
2. Agrupa os resultados por tópico
3. Apresenta lista numerada agrupada para o usuário escolher qual nota trabalhar
4. Após escolha, prossegue como Modo A (arquivo único)

Se nenhuma nota `rascunho` for encontrada, informa o usuário e pergunta se deseja informar um caminho específico.

---

**Modo A — Arquivo único:**

```
FASE 1 — FOCO
  IA lê o arquivo imediatamente
  DETECÇÃO DE MODELO:
    Lê campo `modelo` do frontmatter
    Se `modelo` estiver presente:
      carrega o arquivo correspondente em `docs/schemas/`
      adota como guia silencioso de construção
      segue direto para proposta de execução
    Se `modelo` estiver ausente:
      consulta `index/models.json`
      tenta inferir o match mais adequado a partir do conteúdo
      Se houver match claro:
        carrega o modelo
        adota como guia silencioso de construção
        segue direto para proposta de execução
      Se houver ambiguidade:
        IA apresenta a hipótese e pergunta ao usuário qual modelo usar
      Se não houver match:
        IA informa que não encontrou modelo aplicável
        IA pede confirmação explícita para seguir como nota sem modelo
  Se houver modelo definido ou inferido com confiança:
    IA sugere diretamente uma ação (ou cadeia de ações) do cardápio,
    considerando as seções do modelo ainda ausentes no rascunho
    (ex: sugerir Expandir + Pesquisar para cobrir lacunas)
  Se não houver modelo claro:
    IA pergunta ao usuário o que deseja fazer e qual estrutura deseja buscar
    IA usa essa resposta para tentar encaixar um modelo
    Se continuar sem modelo aplicável:
      IA informa que não encontrou modelo aplicável
      IA pede confirmação explícita para seguir como nota sem modelo
  Usuário confirma

FASE 2 — SAÍDA (posição flexível)
  Opção A: definir formato agora (direciona a dinâmica)
  Opção B: adiar para o final (formato emerge do trabalho)
  Decisões: formato, tom, público-alvo
  Pergunta extra: quer renomear o arquivo ao final? (IA sugere nome se sim)
  (Arquivo de saída é o mesmo de entrada — modelo já foi detectado na Fase 1)

FASE 3 — DINÂMICA
  Usuário escolhe como quer interagir (ou aceita sugestão da IA)
  Trabalho acontece neste modo até conclusão natural
  Pesquisa externa é calibrada interativamente ao longo da sessão:
    Após cada rodada de pesquisa/escrita, IA pergunta:
      "Já parece bom ou quer pesquisar mais? Podemos aprofundar X ou mudar para Y."
    Usuário direciona: continuar, aprofundar, mudar direção ou encerrar
  Ao produzir saída: estrutura e regras do template são seguidas como guia

[FASE 4 — SAÍDA, só se adiou na fase 2]
  Definir formato, tom, público, destino; confirmar renomeação se aplicável

[RENOMEAÇÃO — só se aprovada]
  IA executa a renomeação do arquivo após encerramento da sessão
```

---

**Modo B — Grupo/pasta:**

```
FASE 1 — FOCO
  IA lista os arquivos do alvo (apenas nomes, sem ler conteúdo)
  Usuário descreve: assunto/recorte + o que quer alcançar
  IA sugere: quais arquivos envolver + ação (ou cadeia de ações)
  Usuário confirma arquivos e ações
  IA lê o conteúdo dos arquivos aprovados

FASE 2 — SAÍDA (posição flexível)
  Opção A: definir formato agora (direciona a dinâmica)
  Opção B: adiar para o final (formato emerge do trabalho)
  Decisões incluem: formato, tom, público-alvo, arquivo de saída
  Pergunta: o resultado vai para um arquivo novo ou atualiza um arquivo existente?
  DETECÇÃO DE MODELO (baseada no arquivo de saída):
    Após definir o arquivo de saída, lê o campo `modelo` do frontmatter (se existente)
    Se `modelo` estiver presente:
      carrega o arquivo correspondente em `docs/schemas/`
      anuncia ao usuário
      "Encontrei o modelo X — vou usá-lo como guia de estrutura e estilo."
      A gravação de `modelo: [nome-sem-extensao]` no frontmatter acontece junto da escrita aprovada
    Se `modelo` estiver ausente:
      consulta `index/models.json`
      compara o assunto com `assuntos_aplicaveis` de cada entrada
      Se houver match claro:
        carrega o modelo
        anuncia ao usuário
        "Encontrei o modelo X — vou usá-lo como guia de estrutura e estilo."
        A gravação de `modelo: [nome-sem-extensao]` no frontmatter acontece junto da escrita aprovada
      Se houver ambiguidade:
        IA apresenta a hipótese e pergunta ao usuário qual modelo usar
      Se não houver match:
        IA informa que não encontrou modelo aplicável
        IA pede confirmação explícita para seguir com uma nota sem modelo

FASE 3 — DINÂMICA
  Usuário escolhe como quer interagir (ou aceita sugestão da IA)
  Trabalho acontece neste modo até conclusão natural
  Pesquisa externa é calibrada interativamente com o usuário
  Ao produzir saída: estrutura e regras do template são seguidas como guia

[FASE 4 — SAÍDA, só se adiou na fase 2]
  Definir formato, tom, público, destino dos arquivos resultantes
```

---

**Cardápio de ações:**

Organizadas por natureza. O cardápio é vocabulário compartilhado — o usuário pode escolher uma ação diretamente ou descrever uma intenção e a IA propõe quais ações (e em que ordem) usando este vocabulário.

*Exploração e expansão — trazer coisa nova para dentro*
- **Pesquisar** — buscar na web fontes, dados, perspectivas que complementem o material existente
- **Ramificar** — partir de um conceito presente e explorar direções adjacentes ainda não cobertas
- **Curar** — selecionar, organizar e anotar as melhores referências sobre um tema, formando um corpo de consulta coerente

*Análise e compreensão — entender melhor o que já está ali*
- **Resumir** — condensar material extenso preservando as ideias centrais
- **Recortar** — extrair trechos específicos de documentos longos, organizados por tema ou critério
- **Mapear** — identificar a estrutura conceitual do material (que conceitos existem, como se relacionam)
- **Comparar** — colocar duas ou mais fontes/ideias lado a lado, identificando convergências, divergências e complementaridades

*Avaliação e crítica — testar a solidez do que se tem*
- **Verificar consistência** — identificar contradições internas, afirmações sem suporte, saltos lógicos
- **Identificar consenso** — dado um conjunto de fontes, onde concordam, onde divergem, qual posição tem mais peso
- **Testar limites** — pegar uma afirmação ou modelo e buscar exceções, contra-exemplos, condições onde falha
- **Avaliar fontes** — julgar qualidade, confiabilidade e viés das fontes usadas

*Síntese e refinamento — produzir algo novo a partir do material*
- **Sintetizar** — fundir múltiplas fontes/ideias numa visão integrada e coerente
- **Estruturar** — desenhar a arquitetura, fases ou componentes de algo novo, organizando as partes e suas relações
- **Argumentar** — construir uma linha argumentativa com tese, evidências e conclusão
- **Reformular** — reescrever material existente com outra estrutura, ênfase ou enquadramento
- **Conectar** — relacionar o material do workspace com outros conceitos da base de conhecimento
- **Expandir** — desenvolver em profundidade uma ideia ou rascunho ainda embrionário

**Cardápio de dinâmicas:**

Organizadas por família. A dinâmica define como a interação funciona entre o usuário e a IA durante a sessão.

*Família 1: Escuta e organização — o usuário traz matéria-prima, a IA dá forma*
- **Estruturação** — o usuário despeja ideias, referências, pensamentos soltos; a IA organiza, categoriza e dá forma
- **Escuta ativa** — o usuário articula o problema passo a passo; a IA intervém minimamente, fazendo apenas perguntas de esclarecimento
- **Espelhamento** — a IA reformula o que o usuário disse com outra estrutura ou linguagem, para o usuário validar se é realmente o que pensa

*Família 2: Questionamento e desafio — a IA provoca, o usuário responde e aprofunda*
- **Socrática** — a IA faz perguntas para puxar o raciocínio, sem entregar respostas
- **Crítica** — a IA atua como adversário intelectual; questiona premissas, aponta fraquezas, exige justificativas
- **Steelmanning** — antes de criticar uma posição, a IA reconstrói o melhor argumento possível a favor dela
- **Pré-mortem** — a IA declara "isso já foi implementado e falhou completamente" e gera cenários de falha plausíveis
- **Escada da inferência** — a IA desce junto com o usuário o caminho do dado bruto até a conclusão, tornando visível cada salto interpretativo

*Família 3: Expansão e geração — a IA propõe ativamente, o usuário filtra e direciona*
- **Generativa** — a IA propõe ideias, conexões e hipóteses; o usuário filtra e direciona
- **Perspectivista** — a IA assume deliberadamente diferentes pontos de vista sobre a mesma ideia
- **Provocativa** — a IA gera afirmações deliberadamente absurdas ou invertidas como trampolim criativo
- **Divergente-convergente** — alternância explícita entre fases de gerar sem julgamento e fases de avaliar com rigor

*Família 4: Ensino e calibração — a IA ajusta o nível de suporte ao usuário*
- **Tutorial** — a IA explica conceitos, preenche lacunas de entendimento, traduz jargão
- **Scaffolding** — a IA começa dando mais suporte e vai retirando gradualmente conforme o usuário demonstra domínio
- **Feynman** — a IA pede que o usuário explique o conceito como se fosse para uma criança; onde a explicação falha, está a lacuna de entendimento

**Comportamento:**
- **Modo A:** arquivo é lido imediatamente após identificação do alvo. Modelo é adotado como guia silencioso de construção — sem diagnóstico de divergência estrutural. Renomeação é opcional e acontece ao final, após confirmação explícita.
- **Modo B:** IA lista os arquivos do alvo (apenas nomes). Quando houver binário e sidecar pareados, deve tratá-los como uma única unidade conceitual na apresentação inicial. O conteúdo só é lido após o usuário definir o recorte e confirmar quais arquivos envolver.
- Pesquisa externa é calibrada interativamente: após cada rodada, a IA pergunta se o resultado já é suficiente ou se quer continuar, aprofundar ou mudar direção.
- Cada sessão é independente — não há estado persistente entre sessões além dos próprios arquivos.
- Arquivos criados ou modificados durante a sessão ficam na pasta-alvo.
- A fase de saída inclui decisões sobre: formato (markdown, lista, tabela, mapa conceitual), tom (técnico, informal, didático), público-alvo, e se o resultado vai para um arquivo novo ou atualiza arquivo existente.

**Transição de estado (Modo A):**

Ao encerrar uma sessão do Modo A, a IA deve perguntar:

> "A nota está finalizada? Posso marcar como `estado: finalizado`."

- Se sim: atualizar o campo `estado` no frontmatter de `rascunho` para `finalizado`
- Se não: encerrar sem alterar o campo
