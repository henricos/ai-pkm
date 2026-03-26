---
name: validar-estrutura
description: "Valida a coerência estrutural do repositório sem escrever em arquivos. Use esta skill sempre que o usuário quiser checar a integridade do sistema, verificar taxonomia, frontmatter, caminhos, .gitkeep ou o índice de grupos, especialmente antes de commits, após reorganizações ou quando suspeitar de inconsistências."
command: /validar-estrutura
---

# SKILL: Validar Estrutura

## Instruções de Execução do Agente

Esta skill implementa o **Fluxo 9 — Validar Estrutura** descrito em `docs/flows/validar-estrutura.md`. Seu objetivo é executar uma checagem não mutante da coerência estrutural do repositório e devolver o resultado em linguagem humana. **NUNCA modifique arquivos como parte desta skill.**

---

## Passo 1: Executar a validação

Rode o script interno da skill:

```bash
python3 .agents/skills/validar-estrutura/scripts/validar_estrutura.py
```

Ele valida, no mínimo:
- coerência entre `index/topicos.json` e as pastas reais
- limite de no máximo 2 níveis taxonômicos
- frontmatter obrigatório em arquivos de conhecimento
- integridade do frontmatter YAML dos arquivos `.agents/skills/*/SKILL.md`
- coerência entre o campo `topico` e o caminho do arquivo
- sidecar obrigatório para binários de conhecimento em `pkm/[topico]/...`
- coerência entre binário e sidecar `nome.extensao.md`
- ausência de embeddings em arquivos Markdown de conhecimento
- ausência de campos temporais indevidos em grupos
- coerência entre `_grupo.md` e `index/grupos.json`
- `.gitkeep` em `pkm/__inbox/` e tópicos raiz vazios
- **coerência prefixo × frontmatter:** arquivo com prefixo `url_` deve ter campo `url` no frontmatter; arquivo com campo `url` no frontmatter deve ter prefixo `url_`

---

## Passo 2: Interpretar o resultado

### Se a validação passar

Informe em linguagem direta:

> **Validação concluída.** A estrutura, a taxonomia, os sidecars, o frontmatter e o índice de grupos estão coerentes.

### Se a validação falhar

1. Liste os problemas encontrados agrupando por natureza quando fizer sentido.
2. Aponte os caminhos afetados.
3. Explique sucintamente o que cada falha significa no sistema.
4. Se o reparo exigir uma skill específica, sugira a próxima ação correta:
   - `/recriar-indices` para divergência de `grupos.json`
   - `/reorganizar-topicos` para problemas taxonômicos
   - `/criar-grupo` quando a inconsistência vier de modelagem de grupo
5. Não proponha correção automática sem pedido explícito do usuário.

---

## Regras de comportamento

- **Nunca escreve em arquivos.**
- **Nunca "corrige no caminho".** Primeiro reporta.
- **Se não houver falhas, mantenha a resposta curta.**
- **Se houver falhas, priorize clareza e caminhos afetados.**
- **Idioma:** pt-BR.

## Arquivos de referência

- `docs/flows/validar-estrutura.md` — especificação do fluxo de validação estrutural
- `docs/pkm-structure.md` — estrutura esperada
- `docs/pkm-taxonomy.md` — invariantes da taxonomia
- `docs/pkm-indexes.md` — papel derivado de `grupos.json`
- `docs/schemas/frontmatter-item.md` — contrato dos itens de conhecimento
- `docs/schemas/frontmatter-grupo.md` — contrato de grupos
