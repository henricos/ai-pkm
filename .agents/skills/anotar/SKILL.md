---
name: anotar
description: Captura rápida de conceito, ferramenta, processo ou URL na inbox. Use quando o usuário quiser anotar algo rapidamente, sem elaborar agora — mesmo que não diga explicitamente "anotar".
command: /anotar
---

# SKILL: Anotação Rápida

## Instruções de Execução do Agente

Esta skill implementa o fluxo **Anotação Rápida** descrito em `docs/flows/anotar.md`. O objetivo é capturar com fricção mínima: a IA interpreta o input, gera um card compacto e salva após uma única aprovação. **NUNCA salve sem aprovação explícita.**

---

### Passo 1: Parsear o input

O input chega via argumento do comando ou mensagem de conversa. Se vier vazio, pergunte:

> *"O que você quer anotar?"*

**Identificação de itens:**

- **URL:** qualquer string que começa com `http://` ou `https://`
- **Nota:** qualquer palavra, nome próprio ou frase que não seja URL

**Detecção de lote:**

- Múltiplas linhas onde cada uma parece um item independente → lote
- Múltiplas URLs separadas → lote
- Termos separados por vírgula claramente distintos entre si → lote
- **Em caso de dúvida sobre se são 1 ou N itens:** pergunte antes de processar

Cada item gera um arquivo separado.

---

### Passo 2: Classificar cada item

**URL:**
- Tipo: `url`
- Corpo: a URL pura, sem nenhum texto adicional
- Nome provisório: `url_[slug].md` conforme `docs/pkm-naming.md`
  - Use os sinais da URL (domínio/autor e caminho) para montar o slug
  - Ex: `url_karpathy-vibe-coding.md`

**Nota:**
- Tipo: `nota`
- Inferir o template a partir da seguinte ordem:

  **1. Palavras-chave no input:**
  - "conceito", "ideia", "definição", "teoria" → `conceito`
  - "ferramenta", "biblioteca", "framework", "plugin", "editor", "cli", "app", "extensão" → `ferramenta`
  - "processo", "fluxo", "procedimento", "método", "técnica", "metodologia", "padrão", "prática", "algoritmo" → `processo`

  **2. Se sem palavra-chave:** ler `sistema/indices/templates.json` e pesquisar o item rapidamente; mapear para o template cujo `assuntos_aplicaveis` melhor descreve o item. Para lotes, pesquisar em paralelo.

  **3. Se ambíguo entre dois templates:** apresentar a dúvida ao usuário com contexto mínimo antes de exibir o card.

  **4. Se não encaixar em nenhum template:** informar ao usuário que nenhum template foi identificado e confirmar que o corpo ficará sem dica de template.

- Corpo:
  - Com template identificado: `Nota sobre o [tipo] de [nome]. Rascunho a expandir.`
  - Sem template (confirmado pelo usuário): `Nota sobre [nome]. Rascunho a expandir.`
- Nome provisório: slug kebab-case do nome em pt-BR, sem prefixo
  - Ex: `vibe-coding.md`, `feature-flags.md`

---

### Passo 3: Apresentar card de confirmação

Exiba um bloco por item, sem texto adicional ao redor:

```
__inbox/vibe-coding.md
→ Nota sobre o conceito de vibe coding. Rascunho a expandir.
```

```
__inbox/url_karpathy-vibe-coding.md
→ https://x.com/karpathy/status/...
```

Se for lote, liste todos os blocos juntos antes de perguntar.

Ao final:
- 1 item: *"ok para salvar?"*
- Lote: *"ok para salvar os N itens?"*

Se o usuário pedir ajuste, refine o card e reapresente.

---

### Passo 4: Salvar

Após aprovação:

1. Verificar conflito de nome em `pkm/__inbox/`; se existir, acrescentar sufixo numérico (ex: `vibe-coding-2.md`)
2. Salvar cada item como Markdown puro em `pkm/__inbox/`, sem frontmatter
3. Confirmar:
   - 1 item: *"Anotado em `pkm/__inbox/X.md`. Use `/triar` quando quiser rotear."*
   - Lote: *"Anotados N itens na `pkm/__inbox/`. Use `/triar` quando quiser rotear."*

---

## Regras de Comportamento

- **Resultado sempre em `pkm/__inbox/`, sem frontmatter.**
- **Nunca salve sem aprovação.**
- **Este fluxo não trata binários** — binários entram por cópia direta em `pkm/__inbox/`.
- **Uma URL por arquivo.** Múltiplas URLs geram múltiplos arquivos.
- **Corpo de URL = URL pura.** Nenhum texto adicional.
- **Corpo de nota = frase corrida.** Não use bullets, headers ou frontmatter.
- **O nome do arquivo é provisório.** O nome definitivo é responsabilidade da triagem.
- **URLs recebem prefixo `url_`** no nome provisório. Convenção completa em `docs/pkm-naming.md`.
- **Idioma:** toda comunicação e todo conteúdo gerado devem estar em `pt-BR`.
- **Fase 1:** sem logs; auditoria exclusivamente via Git.

## Arquivos de Referência

- `docs/flows/anotar.md` — especificação do fluxo
- `docs/pkm-naming.md` — convenção de nomes (prefixo `url_`, padrão autor-título)
- `docs/pkm-structure.md` — definição da `pkm/__inbox/`
