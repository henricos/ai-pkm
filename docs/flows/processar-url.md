## Processar URL

**Skill:** `/processar-url`

**Quando usar:** Quando houver arquivos `url_` com `estado: rascunho` em pastas `pkm/[topico]/...`.

**Escopo suportado:**
- páginas web comuns (`web`)
- YouTube
- Instagram
- TikTok
- PDF

**Fora de escopo:** qualquer outro binário, download direto ou formato não previsto. Nesses casos, o fluxo deve abortar o item com mensagem explícita de formato não suportado, sem baixar o binário.

**Passo 0 — validação e preparo do ambiente:**

Pré-requisitos fatais (exigem ação manual; o fluxo aborta com instrução clara):
- `uv` no `PATH`
- `pyproject.toml` em `.agents/skills/processar-url/scripts/`
- `ffmpeg` no `PATH`

Pré-requisitos auto-corrigíveis (o fluxo resolve automaticamente antes de prosseguir):
- `.venv/` e dependências Python → `uv run` cria e sincroniza automaticamente na primeira invocação do helper
- `Chromium` do Playwright → o agente executa `uv --directory .agents/skills/processar-url/scripts run playwright install chromium`
- `temp/` da skill → o agente ou o script cria a pasta se ausente

Se algum pré-requisito fatal faltar, o fluxo aborta antes de processar URLs e apresenta instruções claras de instalação.

**O que faz:**
- busca arquivos com prefixo `url_` e `estado: rascunho` em `pkm/*/` (glob: `url_*.md`)
- detecta o tipo real de cada URL antes de processar
- valida se `modelo` é compatível com o tipo detectado
- executa a cadeia de coleta adequada ao tipo
- para `modelo: url-extrato`, gera conteúdo limpo em Markdown
- para `modelo: url-resumo`, coleta texto-base e metadados para a IA gerar um resumo autoral em `pt-BR`

**Cadeias de fallback:**
- `web` -> `requests` + `trafilatura` -> `readability-lxml` -> `Playwright` + reextração
- `youtube` -> `youtube-transcript-api` -> `yt-dlp` subtitles -> `yt-dlp` + `faster-whisper`
- `instagram` / `tiktok` -> `yt-dlp` metadata (caption como complemento) + `yt-dlp` subtitles -> `yt-dlp` + `faster-whisper`
- `pdf` -> download controlado + `PyMuPDF`

**Regras de ação:**
- `modelo: url-extrato` só é permitido para `web` e `pdf` — nunca para vídeos (YouTube, Instagram, TikTok)
- `modelo: url-resumo` é permitido para `web`, `pdf`, `youtube`, `instagram` e `tiktok`
- se uma URL de vídeo vier com `modelo: url-extrato`, o fluxo deve interromper e propor conversão para `url-resumo`

**Prioridade de áudio para vídeos:**
- Para vídeos (YouTube, Instagram, TikTok), o `texto_base` é sempre a transcrição do áudio (subtitle ou ASR via Whisper)
- A caption/descrição do post é apenas `texto_complementar`
- O resumo é elaborado a partir do áudio — nunca somente da descrição do post

**Distinção YouTube vs Instagram/TikTok:**
- **YouTube:** transcrições prontas são frequentemente disponíveis (via `youtube-transcript-api` ou `yt-dlp subtitles`) e já representam o áudio. Download de áudio + ASR ocorre apenas como último recurso, quando nenhuma transcrição está disponível.
- **Instagram/TikTok:** transcrições raramente existem nessas plataformas. O download de áudio + ASR via Whisper é o caminho padrão. `yt-dlp subtitles` é tentado primeiro, mas espera-se que falhe na maioria dos casos. Caption/descrição do post é apenas complemento, nunca substituto do áudio.

**Cabeçalho do arquivo** (aplicável a todos os tipos e formatos):

Todo arquivo processado pelo fluxo — independente de `modelo: url-extrato` ou `modelo: url-resumo` — deve iniciar com um cabeçalho padronizado composto por título H1 e bloco de proveniência em blockquote:

```markdown
# Título da Postagem

> **Autores:** Nome do Autor
> **Plataforma:** YouTube
> **Publicado em:** 2026-03
> **Original:** [https://youtube.com/watch?v=...](https://youtube.com/watch?v=...)
```

Regras:
- `# Título` sempre presente — derivado do título original da fonte ou gerado a partir do conteúdo
- `**Autores:**` exibe o valor do campo `autores` do frontmatter, quando presente. O campo deve ser preenchido durante o processamento: o helper extrai nome de exibição (`uploader`/`channel`) e handle de conta (`uploader_id`) dos metadados do yt-dlp, remove emojis do nome de exibição e combina ambos no formato `"Nome de Exibição (handle)"` quando os dois existirem e forem distintos após normalização; quando equivalentes ou apenas um disponível, usa somente o nome de exibição limpo. A skill grava esse valor no frontmatter se o campo ainda não existir. Omitido silenciosamente se `autores` ausente no frontmatter.
- `**Plataforma:**` sempre presente — inferida da URL conforme lista fixa abaixo; fallback: `Web`
- `**Publicado em:**` omitido silenciosamente se `data_publicacao` ausente no frontmatter; exibido no formato presente no frontmatter (`YYYY`, `YYYY-MM` ou `YYYY-MM-DD`)
- `**Original:**` sempre presente — formato `[url](url)` para garantir clicabilidade universal
- Ordem dos campos: Autores → Plataforma → Publicado em → Original

Lista fixa de plataformas (inferência por padrão de URL):

| Padrão na URL | Label |
|---|---|
| `youtube.com`, `youtu.be` | `YouTube` |
| `tiktok.com` | `TikTok` |
| `instagram.com` | `Instagram` |
| `substack.com` | `Substack` |
| `github.com` | `GitHub` |
| `twitter.com`, `x.com` | `X` |
| `linkedin.com` | `LinkedIn` |
| `medium.com` | `Medium` |
| `reddit.com` | `Reddit` |
| `arxiv.org` | `arXiv` |
| `open.spotify.com` | `Spotify` |
| URL termina em `.pdf` ou tipo detectado como PDF | `PDF` |
| qualquer outro | `Web` |

**Estrutura do resumo** (aplicável a todos os tipos com `modelo: url-resumo`):

Ver `models/url-resumo.md` — fonte de verdade para estrutura de seções e regras de escrita do corpo de arquivos `modelo: url-resumo`.

**Temporários:**
- artefatos intermediários são gravados em `.agents/skills/processar-url/scripts/temp/` com nomenclatura canônica `{slug}-{sufixo}.{extensao}`
- sufixos definidos por tipo:

| Tipo | Artefato bruto | Texto limpo |
|---|---|---|
| Vídeo (YouTube/Instagram/TikTok) | `-audio.mp3` | `-transcript.txt` (ASR ou legenda) |
| Web | `-documento.html` (HTML bruto) | `-transcript.txt` (texto extraído) |
| PDF | `-documento.pdf` | `-transcript.txt` (texto extraído) |

- sufixos adicionais para vídeo: `-subtitles.vtt` (ou `.srv1/2/3`) quando legendas nativas disponíveis
- os arquivos são **mantidos** entre execuções para cache e debug; nunca removidos automaticamente
- o cache é verificado automaticamente antes de cada etapa custosa; `--forcar-reprocessamento` bypassa o cache e recria todos os artefatos
- para **todos os tipos**: se `{slug}-transcript.txt` existir e tiver texto útil, o conteúdo é reutilizado sem nova chamada de rede ou processamento
- para **web**: o HTML bruto é salvo em `{slug}-documento.html` imediatamente após o download; o texto limpo é salvo em `{slug}-transcript.txt` após extração bem-sucedida (trafilatura/readability/playwright)
- para **PDF**: o arquivo é salvo em `{slug}-documento.pdf` e o texto extraído (Docling/PyMuPDF) em `{slug}-transcript.txt`
- a pasta `temp/` deve conter `.gitkeep` e permanecer ignorada pelo Git (nenhum artefato de cache é persistido no repositório)

**Após o processamento:**
- atualiza `estado` para `finalizado`
- informa a origem do texto usado (`html`, `pdf`, `nativo`, `subtitle`, `caption`, `asr`)
- inclui `texto_complementar` (descrição/caption) quando disponível, separado do `texto_base`
- inclui `idioma_detectado` quando a origem for `asr` (autodetecção do Whisper)
- transcrição preserva o idioma original; tradução para `pt-BR` ocorre apenas no resumo pela IA
- pode melhorar o nome do arquivo quando a extração ou o resumo revelarem um slug mais adequado; ao renomear, preserva o prefixo `url_` e segue a convenção em `docs/pkm-naming.md`
- grava `autores` no frontmatter quando `metadados.autores` estiver disponível e o campo ainda não existir no arquivo
