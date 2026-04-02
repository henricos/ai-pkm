---
name: criar-grupo
description: Cria um novo grupo dentro de um tópico, gera o `_grupo.md` com frontmatter padronizado e registra a entrada no `index/grupos.json`. Aguarda aprovação antes de qualquer criação de arquivo. Use esta skill sempre que o usuário quiser criar um agrupador de conteúdo, organizar um esforço com objetivo claro dentro de um tópico — mesmo que não diga explicitamente "criar grupo".
command: /criar-grupo
---

# SKILL: Criar Grupo

## Instruções de Execução do Agente

Esta skill implementa o **Fluxo 4 — Criar Grupo** descrito em `docs/flows/criar-grupo.md`. Seu objetivo é criar um agrupador de conteúdo dentro de um tópico. **NUNCA crie pastas ou arquivos sem aprovação explícita do usuário.**

---

### Passo 1: Recepção

1. Se o usuário forneceu o tema como argumento (ex: `/criar-grupo Framework de agentes`), use-o diretamente.
2. Se a skill foi invocada sem argumento, pergunte:

> *"Qual grupo deseja criar? Explique livremente o objetivo."*

---

### Passo 2: Tópico

Determine o tópico consultando `index/topicos.json`. Apresente o tópico inferido e aguarde confirmação. Se ambíguo, liste os tópicos e pergunte.

---

### Passo 3: Slug do Grupo

Gere um slug em português do Brasil, kebab-case, sem acentos (ex: `framework-agentes`, `certificacao-aws`).

Verifique colisão via helper:

```bash
python3 .agents/skills/criar-grupo/scripts/criar_grupo.py \
    verificar --slug [slug] --topico [topico] --json
```

O helper retorna `slug_normalizado` (normalização ASCII aplicada) e `colisao: true/false`. Se houver colisão, sinalize e peça alternativa.

---

### Passo 4: Descrição

A IA **gera uma descrição** otimizada para busca e apresenta para aprovação.

---

### Passo 5: Apresentação do Plano (Obrigatória aprovação)

```
Novo grupo: [slug]

Estrutura a criar:
   pkm/[topico]/_[slug]/
   ├── .gitkeep
   └── _grupo.md

Conteúdo do _grupo.md:
   descricao: "[descrição aprovada]"

Entrada a adicionar em index/grupos.json:
   {
     "caminho": "pkm/[topico]/_[slug]/",
     "descricao": "[descrição aprovada]",
     "topico": "[topico]"
   }

Confirma a criação do grupo?
```

> Se a ferramenta oferecer widget nativo de perguntas (ex: `AskUserQuestion`), use-o para a confirmação. Caso contrário, peça `sim / não`.

---

### Passo 6: Execução (Somente após confirmação)

Execute o helper para criar toda a estrutura atomicamente:

```bash
python3 .agents/skills/criar-grupo/scripts/criar_grupo.py \
    criar --slug [slug] --topico [topico] --descricao "[descricao]" --json
```

O helper cria o diretório, o `.gitkeep`, o `_grupo.md` com frontmatter e insere a entrada no `grupos.json`.

---

### Passo 7: Pós-criação

> *"Grupo criado com sucesso em `_[topico]/[slug]/`. Recomendo executar `/recriar-indices` para confirmar que os índices estão sincronizados. Use `/commit-push` para registrar no histórico Git."*

---

## Regras de Comportamento

- **Slug em pt-BR, kebab-case, sem acentos.**
- **Nunca pule a etapa de confirmação.**
- **`.gitkeep` obrigatório** em cada novo diretório.
- **Sincronia obrigatória entre pasta e `index/grupos.json`.**
- **Sem logs** — fase 1.

## Arquivos de Referência

- `.agents/skills/criar-grupo/scripts/criar_grupo.py` — helper (verificar / criar)
- `docs/flows/criar-grupo.md` — especificação do fluxo de criação de grupo
- `index/grupos.json` — índice de grupos (a ser atualizado)
- `schemas/frontmatter-grupo.md` — esquema do `_grupo.md`
- `docs/pkm-structure.md` — estrutura de diretórios
