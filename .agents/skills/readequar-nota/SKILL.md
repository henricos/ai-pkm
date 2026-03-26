---
name: readequar-nota
description: "Adapta uma nota existente (com conteúdo real) a um template novo ou atualizado. O trabalho é puramente estrutural: reposicionar seções, realocar conteúdo entre seções e marcar lacunas como TBD. Não inclui pesquisa externa nem avaliação de qualidade. Use esta skill quando o template de uma nota mudou depois que o conteúdo foi escrito, ou quando uma nota foi escrita sem seguir o template e precisa ser estruturada."
command: /readequar-nota
---

# SKILL: Readequação de Nota

## Instruções de Execução do Agente

Esta skill implementa o **Fluxo — Readequação de Nota** descrito em `docs/flows/readequar-nota.md`. O trabalho é puramente estrutural — reposicionamento, realocação de conteúdo e marcação de lacunas. Sem pesquisa externa, sem avaliação de qualidade.

---

## Passo 1: Detecção do Alvo

- **Com argumento** (ex: `/readequar-nota _tecnologia/claude-code-web.md`) → usa o arquivo informado diretamente.
- **Sem argumento** → pergunte ao usuário qual arquivo deseja readequar.

---

## Passo 2: Leitura

Leia o arquivo completo, incluindo o frontmatter.

---

## Passo 3: Localização do Template

Leia o campo `template` do frontmatter da nota.

- **Campo presente**: construa o caminho `docs/schemas/[valor].md` e leia o arquivo.
- **Campo ausente**: encerre com a mensagem:

  > *"Não é possível readequar sem template associado. Execute `/criar-nota` primeiro para que o template seja definido no frontmatter."*

---

## Passo 4: Análise de Divergência

Compare as seções do documento com as seções do template:

- Seções obrigatórias ausentes no documento
- Seções presentes que não estão previstas no template
- Ordem das seções em relação à sequência esperada pelo template

Apresente o diagnóstico ao usuário de forma clara antes de prosseguir:

> *"Encontrei as seguintes divergências em relação ao template: [lista]. Posso prosseguir com a readequação?"*

Aguarde confirmação.

---

## Passo 5: Readequação

Execute as alterações estruturais sem pesquisa externa:

1. **Reposicionar** seções fora de ordem para a sequência correta do template.
2. **Realocar** conteúdo que está em seção errada para a seção correspondente no template. Faça isso antes de qualquer outra ação — conteúdo existente tem prioridade sobre lacuna.
3. **Marcar como TBD** seções obrigatórias ausentes para as quais não há conteúdo disponível em nenhuma parte do documento:
   ```
   TBD — a pesquisar
   ```
4. **Não reescreva** o conteúdo além do mínimo necessário para manter coesão após reposicionamento.

---

## Passo 6: Apresentação

Apresente a nota readequada completa. Destaque explicitamente:

- O que foi reposicionado (seções que mudaram de lugar)
- O que foi realocado (conteúdo movido de uma seção para outra)
- O que virou TBD (lacunas sem conteúdo disponível)

Aguarde aprovação explícita antes de escrever.

---

## Passo 7: Escrita

Escreva no arquivo após aprovação explícita (substituição completa do conteúdo).

---

## Regras de Comportamento

- Nunca escreve em arquivos sem aprovação explícita do usuário.
- Não faz pesquisa externa. O material de trabalho é exclusivamente o conteúdo já presente no documento.
- Não avalia qualidade de conteúdo — apenas estrutura.
- Lacunas marcadas como TBD são sinais para uma futura sessão de `/criticar-nota`.
- Se o subtipo não for identificável, tenta resolver com o usuário antes de prosseguir.

## Arquivos de Referência

- `docs/flows/readequar-nota.md` — especificação do fluxo
- `sistema/indices/templates.json` — catálogo de templates disponíveis (campo `template` do frontmatter aponta para um deles)
