---
name: processar-url
description: "Processa arquivos `url_` com `estado: rascunho`, fazendo extração ou resumo do conteúdo conforme o `modelo` definido na triagem. Marca `estado: finalizado` ao concluir e pode melhorar o nome do arquivo quando fizer sentido."
command: /processar-url
---

# SKILL: Processar URL

## Instruções de Execução do Agente

Esta skill implementa o fluxo **Processar URL** descrito em `docs/flows/processar-url.md`. Ela usa o helper local `scripts/processar_url.py` para validar o ambiente, listar itens pendentes, detectar o tipo real da URL e coletar o texto-base do processamento. **NUNCA modifique um arquivo sem aprovação explícita do usuário.**

---

### Passo 0: Validar e preparar ambiente

1. Verifique se `uv` está disponível:
   ```bash
   uv --version
   ```
2. Execute a validação completa:
   ```bash
   uv --directory .agents/skills/processar-url/scripts run python processar_url.py validar-ambiente --json
   ```
3. Interprete o resultado:
   - **`erros_fatais`** → aborte antes de qualquer fetch e mostre as instruções ao usuário.
   - **`auto_corrigiveis`** → corrija automaticamente antes de prosseguir:
     - *Chromium ausente* → execute: `uv --directory .agents/skills/processar-url/scripts run playwright install chromium`
     - *`temp/` ausente* → crie a pasta: `mkdir -p .agents/skills/processar-url/scripts/temp`
   - **`avisos`** → apenas informe ao usuário, sem bloquear.

Nota: `.venv/` e dependências Python não precisam de ação manual. O `uv run` cria e sincroniza o ambiente automaticamente na primeira invocação do helper.

Pré-requisitos fatais (exigem ação manual do usuário):
- `uv` no PATH
- `pyproject.toml` em `.agents/skills/processar-url/scripts/`
- `ffmpeg` no PATH

---

### Passo 1: Buscar URLs pendentes

1. Liste os arquivos pendentes pelo helper:
   ```bash
   uv --directory .agents/skills/processar-url/scripts run python processar_url.py listar-pendentes --json
   ```
   O helper usa glob `url_*.md` em `pkm/*/` e filtra por `estado: rascunho`.
2. Para cada arquivo encontrado, confirme que `estado` é `rascunho`.
3. Se não houver URLs pendentes, informe o usuário e encerre:

> *"Nenhuma URL com `estado: rascunho` encontrada. Nada a processar."*

---

### Passo 2: Apresentar URLs pendentes

Apresente os arquivos encontrados em tabela:

```text
| # | Arquivo | Modelo | URL |
|---|---|---|---|
| 1 | tecnologia/url_guia-fine-tuning.md | extrato | https://... |
| 2 | saude/url_artigo-jejum.md | resumo | https://... |
```

Apresente uma única pergunta integrando escopo e decisão de cache:

**Quando houver pelo menos um item com cache:**

> *Encontradas X URL(s) pendentes — como prosseguir?*
>
> 1. **Processar todas — aproveitando cache** *(recomendado)*
> 2. **Processar todas — do zero** *(ignora cache, busca dados frescos)*
> 3. **Escolher específicas**
> 4. **Cancelar**

**Quando nenhum item tiver cache:**

> *Encontradas X URL(s) pendentes — como prosseguir?*
>
> 1. **Processar todas** *(recomendado)*
> 2. **Escolher específicas**
> 3. **Cancelar**

---

### Passo 3: Processar cada URL

Para cada arquivo selecionado:

#### 3.1 Inspeção obrigatória

1. Detecte o tipo real da URL antes de processar:
   ```bash
   uv --directory .agents/skills/processar-url/scripts run python processar_url.py inspecionar --arquivo CAMINHO --json
   ```
2. Confirme a estratégia com base no tipo detectado:
   - `web` -> `requests` + `trafilatura` -> `readability-lxml` -> `Playwright`
   - `youtube` -> `youtube-transcript-api` -> `yt-dlp` subtitles -> `yt-dlp` + `faster-whisper`
   - `instagram` / `tiktok` -> `yt-dlp` metadata (caption como complemento) + `yt-dlp` subtitles -> `yt-dlp` + `faster-whisper`
   - `pdf` -> `Docling` -> `PyMuPDF` (fallback)
3. Se o tipo vier como `nao_suportado`, não baixe o recurso. Informe ao usuário que o formato está fora do escopo do fluxo.
4. Se `modelo` for incompatível com o tipo detectado (ex: `extrato` em vídeo), interrompa o item e proponha conversão para `resumo` antes de prosseguir. **`extrato` é válido apenas para `web` e `pdf` — nunca para YouTube, Instagram ou TikTok.**

#### 3.2 Coleta do texto-base

1. Execute a coleta pelo helper:
   ```bash
   uv --directory .agents/skills/processar-url/scripts run python processar_url.py coletar --arquivo CAMINHO --json
   ```
   Se o usuário escolheu "Forçar reprocessamento", adicione a flag:
   ```bash
   uv --directory .agents/skills/processar-url/scripts run python processar_url.py coletar --arquivo CAMINHO --forcar-reprocessamento --json
   ```
2. O helper retorna:
   - `tipo_detectado`
   - `origem_texto` — `html`, `pdf`, `nativo`, `subtitle`, `caption`, `asr`
   - `estrategia`
   - `metadados`
   - `texto_base` — conteúdo principal (transcrição, texto extraído)
   - `texto_complementar` — descrição/caption do vídeo (quando disponível, separado do texto_base)
   - `idioma_detectado` — idioma autodetectado pelo Whisper (quando `origem_texto == "asr"`)
   - `metadados.autores` — nome do criador no formato `"Nome de Exibição (handle)"` quando handle e nome forem distintos após normalização, ou somente o nome de exibição limpo; emojis sempre removidos; presente para YouTube, Instagram, TikTok quando disponível nos metadados do yt-dlp
   - `preview`
   - `avisos`
   - `etapas_cache` — etapas que reutilizaram cache (ex: `["audio", "transcript"]`). Se não estiver vazio, exibir nota: *(cache aproveitado: audio, transcript)*
3. A transcrição preserva o idioma original do áudio. Tradução para `pt-BR` ocorre apenas no resumo elaborado pela IA, nunca na transcrição.

**Prioridade de áudio:** para vídeos (YouTube, Instagram, TikTok), o `texto_base` é sempre a transcrição do áudio (subtitle ou ASR). A caption/descrição do post é apenas `texto_complementar`. O resumo é elaborado a partir do áudio — nunca somente da descrição/caption.

**Distinção YouTube vs Instagram/TikTok:**
- **YouTube:** transcrições prontas são frequentemente disponíveis (`youtube-transcript-api` ou `yt-dlp subtitles`) e já representam o áudio. O download de áudio + ASR via Whisper ocorre apenas como último recurso.
- **Instagram/TikTok:** transcrições raramente existem. Download de áudio + ASR é o caminho padrão. `yt-dlp subtitles` é tentado primeiro, mas espera-se que falhe na maioria dos casos.

#### 3.3 Formato `extrato`

1. Só prossiga se `tipo_detectado` for `web` ou `pdf`.
2. Gere o cabeçalho padronizado (ver spec em `docs/flows/processar-url.md`, seção "Cabeçalho do arquivo"):
   - `# Título` derivado do título original da fonte ou gerado a partir do conteúdo
   - Bloco blockquote com `**Autores:**`, `**Plataforma:**`, `**Publicado em:**` e `**Original:**`
   - Campos `Autores` e `Publicado em` omitidos silenciosamente se ausentes no frontmatter
   - `Plataforma` inferida da URL conforme lista fixa na spec; fallback `Web`
   - `Original` no formato `[url](url)`
3. Insira o cabeçalho antes do conteúdo extraído.
4. Use `texto_base` como conteúdo a inserir após o cabeçalho.
5. Preserve Markdown limpo, sem menus, rodapés, navegação ou anúncios.

#### 3.4 Formato `resumo`

Use `texto_base` e `metadados` para elaborar um resumo em `pt-BR`.

**Cabeçalho (obrigatório, antes de qualquer seção):**

Gere o cabeçalho padronizado conforme spec em `docs/flows/processar-url.md`, seção "Cabeçalho do arquivo":
- `# Título` derivado do título original da fonte ou gerado a partir do conteúdo
- Bloco blockquote com os campos de proveniência na ordem: `**Autores:**` → `**Plataforma:**` → `**Publicado em:**` → `**Original:**`
- `Autores` e `Publicado em` omitidos silenciosamente se ausentes no frontmatter
- `Plataforma` inferida da URL conforme lista fixa na spec; fallback `Web`
- `Original` no formato `[url](url)`

**Estrutura do corpo:** ver `docs/schemas/url-resumo.md` — fonte de verdade para seções (`## Síntese`, `## Narrativa`, `## O que fica`, `## Recursos`) e regras de escrita.

##### 3.4.1 Notas específicas — web/PDF

- Use `texto_base` como fonte principal do resumo.
- Preserve a estrutura argumentativa do original na Narrativa.

##### 3.4.2 Notas específicas — vídeo

- Use `texto_base` (transcrição do áudio — prioridade absoluta) e `texto_complementar` como fontes.
- **Não** persista transcrição integral no arquivo final.

##### 3.4.3 Busca e validação proativa de URLs — Recursos

Etapa **obrigatória** para todos os resumos:

1. Ao elaborar o resumo, identificar ativamente cada ferramenta, site, projeto, perfil ou referência citada — mesmo que mencionada de passagem
2. Para cada recurso identificado: fazer busca web para localizar o link oficial ou mais representativo
3. Validar que o link encontrado realmente corresponde ao recurso (conferir nome, descrição, contexto)
4. Se houver dúvida sobre qual link é o correto, perguntar ao usuário antes de registrar
5. Registrar no formato:
   - `- **Nome do recurso** — descrição de uma linha + link validado`
   - Se link não puder ser confirmado: `- **Nome do recurso** — descrição de uma linha (link não confirmado)`

#### 3.5 Conteúdo existente

Se o arquivo já tiver conteúdo abaixo do frontmatter, pergunte ao usuário se deseja:

1. substituir o conteúdo existente
2. adicionar abaixo do existente
3. pular este arquivo

#### 3.6 Preview e atualização

1. Mostre uma prévia curta antes de salvar.
2. Após aprovação:
   - insira o conteúdo abaixo do frontmatter
   - atualize `estado` para `finalizado`
   - se `metadados.autores` estiver presente e o frontmatter não contiver o campo `autores`, adicione-o ao frontmatter como **lista YAML** — ex: `autores: ["Nome (handle)"]` — antes de salvar

#### 3.7 Melhorar o nome do arquivo

Se a extração ou o resumo revelarem um nome melhor do que o definido na triagem, proponha a renomeação do arquivo antes de salvar a versão final. Ao renomear, preserve obrigatoriamente o prefixo `url_` e siga a convenção em `docs/pkm-naming.md`. Só renomeie com aprovação explícita do usuário.

---

### Passo 4: Tratamento de erros

Se a URL não for acessível ou o conteúdo principal não puder ser obtido, informe o usuário e ofereça: pular, manter `estado: rascunho`, ou cancelar.

---

### Passo 5: Resumo final

> **Processamento concluído.** X URL(s) processada(s), Y pulada(s), Z com erro.

Sugira: *"Use `/commit-push` para registrar as alterações no histórico Git."*

---

## Regras de Comportamento

- **Nunca altere campos do frontmatter além de `estado` e `autores`** — `autores` só é gravado quando detectado nos metadados e ausente do frontmatter. Exceto se o usuário aprovar uma melhoria de nome que exija renomeação do arquivo.
- **Preserve o frontmatter existente.**
- **Aprovação obrigatória antes de salvar.**
- **Idioma:** `pt-BR`.
- **Gestão de ambiente:** `uv` é obrigatório para esse fluxo.
- **Temporários:** artefatos intermediários são mantidos em `.agents/skills/processar-url/scripts/temp/` para cache e debug; nomeados como `{slug}-{sufixo}.{extensao}` (ex: `url_foo-audio.mp3`, `url_foo-transcript.txt`); nunca persistidos no Git.
- **Escopo estrito:** formatos não suportados devem ser recusados sem download.
- **Vídeos:** prioridade absoluta para transcrição de áudio; nunca resumir apenas pela caption/descrição; nunca persistir transcrição integral na base final.
- **Sem logs** — fase 1.

## Arquivos de Referência

- `docs/flows/processar-url.md` — especificação do fluxo
- `docs/schemas/url-resumo.md` — **template do corpo para `modelo: resumo`**
- `docs/pkm-naming.md` — **convenção de nomenclatura** (prefixo `url_`, padrão autor-título)
- `docs/schemas/frontmatter-item.md` — esquema de frontmatter de itens de conhecimento
- `docs/pkm-structure.md` — estrutura do repositório
- `scripts/processar_url.py` — helper Python do fluxo
