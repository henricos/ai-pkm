---
name: recriar-indices
description: Regenera o índice JSON `index/grupos.json` a partir dos arquivos `_grupo.md` encontrados nas pastas de tópicos. Apresenta diff resumido e aguarda aprovação antes de sobrescrever.
command: /recriar-indices
---

# SKILL: Recriar Índices

## Instruções de Execução do Agente

Esta skill implementa o **Fluxo 6 — Recriar Índices** descrito em `docs/flows/recriar-indices.md`. Ela varre as pastas de tópicos, extrai o frontmatter de arquivos `_grupo.md` e regenera o índice JSON correspondente. **NUNCA sobrescreva índices sem aprovação explícita do usuário.**

---

### Passo 1: Varredura via helper

Execute o helper para escanear o repositório e obter o diff:

```bash
uv --directory .agents/skills/recriar-indices/scripts run python recriar_indices.py escanear --json
```

O resultado inclui os campos `atual`, `novo` e `diff` (com `adicionados`, `removidos`, `modificados`).

---

### Passo 2: Apresentação do Diff

Com base no JSON retornado pelo helper, apresente:

```
Índice: grupos.json

Antes: [N] entradas
Depois: [M] entradas

Adicionadas: [lista de caminhos]
Removidas: [lista de caminhos]
Modificadas: [lista de caminhos com campos alterados]
```

Se `diff` não tiver entradas: *"Sem alterações em grupos.json."*

---

### Passo 3: Confirmação

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o para a confirmação. Caso contrário, peça `sim / não`.

> *"Confirma a recriação do índice?"*

---

### Passo 4: Execução (Somente após confirmação)

Execute o helper com o subcomando `salvar`:

```bash
uv --directory .agents/skills/recriar-indices/scripts run python recriar_indices.py salvar --json
```

Informe: *"Índice recriado com sucesso. Use `/commit-push` para registrar no histórico Git."*

---

## Regras de Comportamento

- **Nunca sobrescreva sem aprovação.**
- **Frontmatter é a fonte da verdade.**
- **JSON válido:** Sempre valide antes de apresentar o diff.
- **Idioma:** pt-BR.

## Arquivos de Referência

- `.agents/skills/recriar-indices/scripts/recriar_indices.py` — helper (escanear / salvar)
- `docs/flows/recriar-indices.md` — especificação do fluxo de recriação de índices
- `docs/pkm-conventions.md` — convenção de índices JSON (seção Índices JSON)
- `index/grupos.json` — índice a ser recriado
- `schemas/frontmatter-grupo.md` — esquema do `_grupo.md`
