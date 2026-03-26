---
name: reorganizar-topicos
description: "Reorganiza a taxonomia do repositório em dois modos explícitos: ajuste local dentro de um tópico/subtópico ou revisão da taxonomia de nível 1. Propõe subtópicos, quebras de subtópicos em irmãos, criação, renomeação ou fusão de tópicos raiz, sempre com aprovação humana antes de qualquer escrita."
command: /reorganizar-topicos
---

# SKILL: Reorganizar Tópicos

## Instruções de Execução do Agente

Esta skill implementa o **Fluxo 7 — Reorganizar Tópicos** descrito em `docs/flows/reorganizar-topicos.md`. Seu objetivo é corrigir problemas de organização taxonômica sem violar os invariantes do sistema. **NUNCA crie, renomeie ou mova pastas e arquivos sem aprovação explícita do usuário.**

---

## Invariantes obrigatórios

- A taxonomia suporta no máximo **2 níveis**.
- Nunca crie terceiro nível hierárquico.
- Se um subtópico ficou amplo demais, a quebra correta é em **subtópicos irmãos no tópico pai**.
- `pkm/sistema/indices/topicos.json` é a fonte da verdade para tópicos válidos.
- `pkm/sistema/indices/grupos.json` é derivado; quando grupos forem afetados, ele deve permanecer coerente com o frontmatter.
- Se a evidência for insuficiente, a resposta correta é **não reorganizar**.

---

## Passo 1: Escolher o modo

Pergunte explicitamente qual dos dois modos o usuário quer acionar:

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o. Caso contrário, apresente as opções numeradas.

1. **Reorganização local**
2. **Revisão da taxonomia de nível 1**

Se o usuário já deixou isso inequívoco no pedido, apenas confirme o modo inferido.

---

## Passo 2A: Reorganização local

Use este modo quando o problema estiver dentro de um tópico raiz ou subtópico existente.

### Entrada

1. Identifique o alvo:
   - tópico raiz (`_[topico]/`)
   - subtópico (`_[topico]/_[subtopico]/`)
2. Se o alvo não tiver sido informado, pergunte qual pasta deve ser analisada.

### Análise

1. Liste os arquivos e pastas do alvo.
2. Leia apenas o suficiente para identificar agrupamentos naturais: nomes, frontmatter e trechos curtos quando necessário.
3. Detecte possíveis novos subtópicos.
4. Se o alvo já for um subtópico e estiver amplo demais, proponha sua quebra em subtópicos irmãos no tópico pai.

### Proposta

Apresente em lote:

```text
Modo: reorganização local
Alvo: [caminho]

Subtópicos propostos:
- [slug-1] — [justificativa curta]
- [slug-2] — [justificativa curta]

Redistribuição proposta:
- [arquivo A] -> [novo caminho]
- [arquivo B] -> [novo caminho]

Atualizações de frontmatter:
- [arquivo A] topico: [valor antigo] -> [valor novo]
- [arquivo B] topico: [valor antigo] -> [valor novo]

Confirma a reorganização?
```

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o para a confirmação. Caso contrário, peça `sim / não`.

### Execução

Somente após confirmação, monte o payload de operações e execute via helper:

```bash
uv --directory .agents/skills/reorganizar-topicos/scripts run python reorganizar_topicos.py \
    executar --payload '<json>' --json
```

Operações disponíveis: `criar_pasta`, `criar_gitkeep`, `mover`, `atualizar_frontmatter`,
`atualizar_grupos_json_entrada`, `remover_grupos_json_entrada`, `remover_pasta_vazia`.

O helper executa o lote atomicamente por operação e retorna o resultado de cada uma.

---

## Passo 2B: Revisão da taxonomia de nível 1

Use este modo quando o problema for estrutural no conjunto dos tópicos raiz.

### Análise

1. Consulte `pkm/sistema/indices/topicos.json`.
2. Analise a distribuição real do conteúdo existente.
3. Busque recorrência de temas e sinais de desalinhamento:
   - arquivos sem encaixe bom
   - tópicos excessivamente amplos
   - tópicos sobrepostos
   - temas recorrentes espremidos artificialmente em um tópico inadequado
4. Sem evidência suficiente, recomende explicitamente não mudar a taxonomia.

### Proposta

A skill pode propor:
- criar tópico raiz
- renomear tópico raiz
- fundir tópicos raiz

Apresente em lote:

```text
Modo: revisão da taxonomia de nível 1

Diagnóstico:
- [síntese curta da evidência]

Mudanças propostas:
- [ação 1]
- [ação 2]

Plano de migração:
- [caminho antigo] -> [caminho novo]
- [arquivo/grupo afetado]

Atualizações necessárias:
- pkm/sistema/indices/topicos.json
- frontmatter dos arquivos afetados
- grupos.json, se houver grupos impactados

Confirma a reorganização?
```

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o para a confirmação. Caso contrário, peça `sim / não`.

### Execução

Somente após confirmação, monte o payload de operações e execute via helper:

```bash
uv --directory .agents/skills/reorganizar-topicos/scripts run python reorganizar_topicos.py \
    executar --payload '<json>' --json
```

Use as operações `atualizar_topicos_json`, `criar_pasta`, `criar_gitkeep`, `mover`,
`atualizar_frontmatter`, `atualizar_grupos_json_entrada`, `remover_grupos_json_entrada`
conforme o plano aprovado.

---

## Passo final (Modos A e B)

Após executar qualquer reorganização:

> *"Reorganização concluída. Recomendo executar `/recriar-indices` para confirmar que os índices estão sincronizados. Use `/commit-push` para registrar no histórico Git."*

---

## Regras de comportamento

- **Nunca pule a etapa de confirmação.**
- **Se a proposta violar o limite de 2 níveis, descarte-a.**
- **Não proponha mudança de nível 1 por estética; exija evidência no conteúdo real.**
- **Não preserve caminhos antigos por compatibilidade implícita; o sistema usa o estado atual como fonte da verdade.**
- **Idioma:** pt-BR, exceto trechos literais já existentes nas fontes.

## Arquivos de referência

- `.agents/skills/reorganizar-topicos/scripts/reorganizar_topicos.py` — helper (executar)
- `docs/flows/reorganizar-topicos.md` — especificação do fluxo de reorganização de tópicos
- `docs/pkm-taxonomy.md` — regras da taxonomia
- `docs/pkm-structure.md` — papel de tópicos, subtópicos e grupos
- `pkm/sistema/indices/topicos.json` — taxonomia vigente
- `pkm/sistema/indices/grupos.json` — índice derivado de grupos
- `docs/schemas/frontmatter-conhecimento.md` — contrato do campo `topico`
