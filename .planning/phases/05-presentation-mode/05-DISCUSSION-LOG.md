# Phase 5: Presentation Mode - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured later in `05-CONTEXT.md` — this log preserves the discussion and allows safe resumption.

**Date:** 2026-04-11
**Phase:** 05-presentation-mode
**Mode:** discuss (interactive)
**Status:** checkpoint parcial
**Areas discussed:** Superficie de apresentacao, Controles e saida do modo
**Areas pending:** Ponteiro laser, Temas de leitura/apresentacao

---

## Checkpoint Summary

Este checkpoint foi persistido de forma intencional antes do fim da discussao da fase para permitir:
- retomada por outro agente sem depender do historico completo da conversa
- commit intermediario seguro
- continuidade posterior a partir das areas pendentes

---

## Areas Discussed

### Superficie de apresentacao

| Decisao | Escolha | Notas |
|---------|---------|-------|
| Nivel de limpeza da tela | `Palco puro` | Modo apresentacao remove praticamente todo o chrome e deixa o conteudo como foco visual. |
| Disponibilidade do `InfoPanel` | `Indisponivel` | Durante o modo apresentacao, o painel lateral nao deve abrir nem competir com o palco principal. |

**Resumo interpretativo:** o modo apresentacao da fase 5 nao e uma variacao leve da shell atual; ele e uma superficie propria, interna a aplicacao, orientada a foco maximo no conteudo.

---

### Controles e saida do modo

| Decisao | Escolha | Notas |
|---------|---------|-------|
| Descoberta dos controles | `Regiao de ativacao no canto inferior esquerdo` | Nao reaparecem ao mover o mouse pela tela inteira. |
| Visibilidade padrao | `Invisiveis por padrao` | So aparecem quando a area de ativacao e acionada. |
| Aparencia dos controles | `Discretos, semi-transparentes e auto-ocultaveis` | Inspirados no comportamento do PowerPoint. |
| Saida do modo | `Esc` ou botao dedicado de sair | O botao de sair faz parte do conjunto de controles. |
| Modo de interacao dos controles | `Interacao normal quando visiveis` | Apesar de discretos, devem permanecer clicaveis e previsiveis. |

**Referencia explicita do usuario:** "quero a mesma experiencia do modo apresentacao do PowerPoint".

**Explicacao operacional registrada do usuario:**
- os controles ficam invisiveis
- existe uma regiao no canto inferior esquerdo da tela que ativa/exibe os controles
- quando aparecem, eles sao bem discretos e semi-transparentes

**Conjunto de controles mencionado pelo usuario:**
- ligar/desligar ponteiro laser
- ligar marcador fixo
- limpar anotacoes do marcador fixo
- sair do modo apresentacao

**Resolucao de escopo para esta fase:**
- `marcador fixo/anotacao` nao entra como entrega funcional da phase 5 neste momento
- a UI deve apenas `deixar o slot previsto` para esse recurso futuro
- `limpar anotacoes` segue a mesma regra: parte do slot futuro, nao da entrega atual

---

## Locked Decisions So Far

- O modo apresentacao da phase 5 usa a direcao `palco puro`.
- O `InfoPanel` fica indisponivel durante o modo apresentacao.
- Os controles seguem a referencia de comportamento do PowerPoint descrita pelo usuario.
- Os controles nao devem reaparecer em qualquer movimento global de mouse; a revelacao depende de uma regiao de ativacao localizada.
- O recurso de anotacao fica explicitamente fora da entrega atual, mas com slot previsto.

---

## Pending Areas For Next Session

### Ponteiro laser
- Como ativar/desativar
- Se segue o cursor continuamente ou so durante gesto/pressionamento
- Intensidade do rastro e tempo de dissipacao
- Comportamento fora do modo apresentacao

### Temas de leitura/apresentacao
- O que muda entre os presets inspirados em ChatGPT, GitHub e Excalidraw
- Se o tema afeta apenas o conteudo ou tambem controles/chrome residual
- Como a troca de tema se conecta ao slot ja reservado no `ViewerHeader`

---

## Deferred Ideas

- Anotacao persistente sobre o conteudo
- Acao funcional de limpar anotacoes

Esses itens foram mencionados pelo usuario no modelo mental dos controles, mas permanecem fora da entrega confirmada desta fase por enquanto.

---

*Phase: 05-presentation-mode*
*Checkpoint persisted: 2026-04-11*
