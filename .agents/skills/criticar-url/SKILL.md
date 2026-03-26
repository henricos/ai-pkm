---
name: criticar-url
description: "Avalia a qualidade editorial do resumo de arquivos `url_` com `modelo: resumo` comparando o conteúdo do arquivo com o texto-fonte cacheado. Identifica problemas de fidelidade, profundidade e estrutura, e conduz sessão interativa de melhoria com aprovação. Depende do cache `{slug}-transcript.txt` — aborta se ausente. Use esta skill sempre que o usuário quiser calibrar, melhorar ou avaliar a qualidade de um resumo de URL — mesmo que não diga explicitamente \"criticar url\"."
command: /criticar-url
---

# SKILL: Crítica de URL Resumo

## Instruções de Execução do Agente

Esta skill implementa o **Fluxo — Criticar URL** descrito em `docs/flows/criticar-url.md`. Avalia a qualidade editorial de arquivos `url_` com `modelo: resumo` usando o texto-fonte cacheado como referência. Não faz pesquisa externa — trabalha exclusivamente com o arquivo e o cache existente.

**Somente opera em arquivos com `modelo: resumo` e `estado: finalizado`.**

---

## Passo 1: Detecção do Escopo

- **Com argumento** (ex: `/criticar-url pkm/tecnologia/url_ibm-technology-rag-vs-long-context.md`) → usa o(s) arquivo(s) informado(s) diretamente.
- **Sem argumento** → pergunte ao usuário:

> "Quais arquivos deseja criticar?"
>
> 1. **Informar arquivo(s) específico(s)**
> 2. **Todos os arquivos `modelo: resumo` processados**
> 3. **Cancelar**

---

## Passo 2: Validação dos Arquivos via helper

Execute o helper para validar e listar os arquivos elegíveis:

```bash
# Para arquivo específico:
uv --directory .agents/skills/criticar-url/scripts run python listar_urls.py \
    listar --arquivo pkm/topico/url_slug.md --json

# Para todos:
uv --directory .agents/skills/criticar-url/scripts run python listar_urls.py listar --json
```

O helper retorna cada entrada com `arquivo`, `slug` e `tem_cache`. Arquivos com `tem_cache: false` devem ser pulados com aviso:

> *"Cache `{slug}-transcript.txt` não encontrado. Para criticar este arquivo, execute `/processar-url` primeiro (ou com `--forcar-reprocessamento` se o arquivo já foi processado)."*

---

## Passo 3: Leitura

Para cada arquivo com cache válido:

1. Leia o arquivo url_ completo
2. Leia o template `docs/schemas/url-resumo.md`
3. Leia o conteúdo de `{slug}-transcript.txt`

---

## Passo 4: Crítica de Qualidade

Use o transcript como fonte de verdade e o template como régua de estrutura.

Avalie o resumo atual em três eixos:

**Fidelidade ao conteúdo-fonte:**
- O resumo cobre os pontos principais do transcript?
- Há pontos centrais do transcript ausentes ou subrepresentados?
- Há afirmações no resumo que contradizem ou distorcem o transcript?

**Qualidade editorial por seção** (conforme regras de `url-resumo.md`):
- `## Síntese`: tem 2-3 frases? Captura a tese central? É interpretativa, não descritiva?
- `## Narrativa`: preserva a progressão do raciocínio? Usa prosa para argumentativo, lista só para listagens genuínas? Proporcional à profundidade do conteúdo?
- `## O que fica` (quando presente): é genuinamente distinta da Narrativa? Tem voz interpretativa?
- `## Recursos`: links foram validados? Curadoria foi feita ou apenas listagem?

**Estrutura:**
- Seções presentes conforme template?
- Seções ausentes que deveriam estar?

---

## Passo 5: Apresentação da Crítica

Apresente a crítica de forma direta e acionável — aponte o trecho ou seção específica e explique o problema. Evite críticas genéricas.

Em seguida, pergunte ao usuário:

> "Quer entrar numa sessão de melhoria agora?"
>
> 1. **Sim — entrar na sessão de melhoria**
> 2. **Não — só a crítica**
> 3. **Criticar outro arquivo**

---

## Passo 6: Sessão de Melhoria (somente se o usuário escolheu "entrar na sessão")

**Natureza:** interativa, baseada exclusivamente no transcript e no resumo existente — sem pesquisa externa.

Após cada rodada de reescrita, pergunte:

> *"Já parece bom ou quer ajustar algo mais? Posso aprofundar [seção X] ou ajustar [aspecto Y]."*

**Execução:**

1. Preservar seções que passaram na crítica sem alteração
2. Reescrever seções com problemas usando o transcript como fonte — nunca inventar informação não presente no transcript
3. Curar links de `## Recursos` que estavam sem validação — se não puder confirmar via busca, marcar `(link não confirmado)`
4. Apresentar o resumo revisado completo, destacando o que mudou
5. Aguardar aprovação explícita antes de escrever
6. Escrever no arquivo após aprovação (substituição completa do conteúdo, preservando frontmatter)

---

## Regras de Comportamento

- Nunca escreve sem aprovação explícita
- Nunca inventa informação não presente no transcript
- Não faz pesquisa externa de conteúdo — apenas curadoria de links de Recursos (verificação de existência)
- Aborta com mensagem clara se cache ausente
- Opera somente em arquivos com `modelo: resumo` e `estado: finalizado`
- Preserva o frontmatter e o cabeçalho de proveniência intactos

## Arquivos de Referência

- `.agents/skills/criticar-url/scripts/listar_urls.py` — helper (listar)
- `docs/schemas/url-resumo.md` — **template e régua de qualidade**
- `docs/flows/processar-url.md` — contexto do ciclo de vida e spec de cache
- `.agents/skills/processar-url/scripts/temp/` — localização dos caches de transcript
