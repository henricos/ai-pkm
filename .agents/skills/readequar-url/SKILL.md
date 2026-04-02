---
name: readequar-url
description: "Adapta o corpo de arquivos `url_` com `modelo: url-resumo` já processados a um template novo ou atualizado. O trabalho é puramente estrutural: reposicionar seções, realocar conteúdo entre seções e marcar lacunas como TBD. Não re-coleta a fonte, não usa helper, não avalia qualidade. Use esta skill quando o template `url-resumo.md` mudar depois que arquivos foram processados, ou quando um resumo existente precisa ser estruturado conforme o template atual."
command: /readequar-url
---

# SKILL: Readequação de URL Resumo

## Instruções de Execução do Agente

Esta skill implementa o **Fluxo — Readequar URL** descrito em `docs/flows/readequar-url.md`. Readequa o corpo de arquivos `url_` com `modelo: url-resumo` ao template em `models/url-resumo.md`. O trabalho é puramente estrutural — sem re-coleta de fonte, sem pesquisa externa.

**Somente opera em arquivos `url_` com `modelo: url-resumo` e `estado: finalizado`.**

---

## Passo 1: Detecção do Escopo

- **Com argumento** (ex: `/readequar-url pkm/tecnologia/url_ibm-technology-rag-vs-long-context.md`) → usa o(s) arquivo(s) informado(s) diretamente.
- **Sem argumento** → pergunte ao usuário:

> "Quais arquivos deseja readequar?"
>
> 1. **Informar arquivo(s) específico(s)**
> 2. **Todos os arquivos `modelo: url-resumo` finalizados**
> 3. **Cancelar**

Se "Todos", obtenha a lista via helper:

```bash
python3 .agents/skills/readequar-url/scripts/listar_urls.py listar --json
```

Se arquivo específico:

```bash
python3 .agents/skills/readequar-url/scripts/listar_urls.py \
    listar --arquivo pkm/topico/url_slug.md --json
```

---

## Passo 2: Validação dos Arquivos

Para cada arquivo selecionado, verifique:

- Prefixo `url_` no nome do arquivo — se não, pule com aviso: *"Arquivo não é do tipo url — ignorado."*
- `modelo: url-resumo` — se for `extrato`, pule: *"Arquivo tem `modelo: url-extrato` — readequação não aplicável."*
- `estado: finalizado` — se `rascunho`, pule: *"Arquivo ainda não foi processado — execute `/processar-url` primeiro."*

---

## Passo 3: Leitura do Template

Leia `models/url-resumo.md` uma vez antes de processar qualquer arquivo.

---

## Passo 4: Análise de Divergência

Para cada arquivo válido:

1. Leia o arquivo completo
2. Identifique o cabeçalho de proveniência (H1 + blockquote) — não é responsabilidade deste template, não alterar
3. Compare as seções do corpo com a estrutura do template (`## Síntese`, `## Narrativa`, `## O que fica`, `## Recursos`):
   - Seções obrigatórias ausentes
   - Seções presentes que não estão previstas no template
   - Ordem das seções em relação à sequência esperada

Apresente o diagnóstico antes de prosseguir:

> *"Divergências em `[arquivo]`: [lista]. Prosseguir com a readequação?"*

---

## Passo 5: Readequação

Execute apenas alterações estruturais:

1. **Reposicionar** seções fora de ordem para a sequência correta do template
2. **Realocar** conteúdo que está em seção errada para a seção correspondente — conteúdo existente tem prioridade sobre lacuna
3. **Marcar como TBD** seções obrigatórias ausentes para as quais não há conteúdo disponível:
   ```
   TBD — a complementar com /criticar-url
   ```
4. **Não reescreva** o conteúdo além do mínimo para manter coesão após reposicionamento
5. **Não altere** o cabeçalho de proveniência (H1 + blockquote)

---

## Passo 6: Apresentação

Para cada arquivo, apresente o corpo readequado destacando:

- O que foi reposicionado
- O que foi realocado
- O que virou TBD

Aguarde aprovação explícita antes de escrever.

---

## Passo 7: Escrita

Escreva no arquivo após aprovação (substituição completa do conteúdo, preservando frontmatter intacto).

---

## Regras de Comportamento

- Nunca escreve sem aprovação explícita
- Não re-coleta fonte, não usa helper Python
- Não avalia qualidade de conteúdo — apenas estrutura
- Lacunas marcadas como TBD são sinais para uma futura sessão de `/criticar-url`
- Preserva o frontmatter intacto; nunca altera campos de metadados
- Opera somente em arquivos `url_` com `modelo: url-resumo` e `estado: finalizado`

## Arquivos de Referência

- `.agents/skills/readequar-url/scripts/listar_urls.py` — helper (listar)
- `models/url-resumo.md` — **template do corpo** (fonte de verdade)
- `docs/flows/processar-url.md` — contexto do ciclo de vida do arquivo
- `schemas/frontmatter-item.md` — esquema de frontmatter de itens de conhecimento
