#!/usr/bin/env python3
from __future__ import annotations

import argparse
import ast
import html
import importlib
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib import parse as urllib_parse
from urllib.parse import urlparse


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_DIR = SCRIPT_DIR.parents[3]
ROOT_DIR = REPO_DIR
TEMP_DIR = SCRIPT_DIR / "temp"
VENV_DIR = SCRIPT_DIR / ".venv"
VENV_PYTHON = VENV_DIR / "bin" / "python"
PYPROJECT_PATH = SCRIPT_DIR / "pyproject.toml"
UV_LOCK_PATH = SCRIPT_DIR / "uv.lock"
PENDENTE_GLOB = "pkm/*/**/*.md"
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
DEPENDENCIAS_PYTHON = {
    "docling": "docling",
    "faster_whisper": "faster-whisper",
    "fitz": "PyMuPDF",
    "playwright": "playwright",
    "readability": "readability-lxml",
    "requests": "requests",
    "trafilatura": "trafilatura",
    "youtube_transcript_api": "youtube-transcript-api",
    "yt_dlp": "yt-dlp",
}
FORMATOS_BINARIOS_NAO_SUPORTADOS = {
    ".7z",
    ".aac",
    ".ai",
    ".avi",
    ".csv",
    ".doc",
    ".docx",
    ".epub",
    ".gz",
    ".heic",
    ".jpeg",
    ".jpg",
    ".json",
    ".key",
    ".m4a",
    ".mkv",
    ".mov",
    ".mp3",
    ".mp4",
    ".odp",
    ".ods",
    ".odt",
    ".pages",
    ".png",
    ".ppt",
    ".pptx",
    ".rar",
    ".svg",
    ".tar",
    ".txt",
    ".wav",
    ".webm",
    ".xls",
    ".xlsx",
    ".xml",
    ".zip",
}
CONTENT_TYPES_NAO_SUPORTADOS = (
    "audio/",
    "image/",
    "video/",
    "application/zip",
    "application/octet-stream",
    "application/vnd.",
)
CONTENT_TYPES_WEB = (
    "text/",
    "application/xhtml+xml",
    "application/xml",
)
SUBTITLE_LANGS = ["pt-BR", "pt", "en", "en-US"]
ASR_MODEL = os.environ.get("PKM_PROCESSAR_URL_ASR_MODEL", "small")


class HtmlTextoParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.partes: list[str] = []

    def handle_data(self, data: str) -> None:
        texto = data.strip()
        if texto:
            self.partes.append(texto)

    def texto(self) -> str:
        return "\n".join(self.partes)


@dataclass
class ItemPendente:
    arquivo: Path
    url: str
    modelo: str


@dataclass
class ResultadoColeta:
    texto_base: str
    origem_texto: str
    texto_complementar: str | None
    idioma_detectado: str | None
    metadados: dict[str, Any]
    avisos: list[str]
    etapas_cache: list[str] = field(default_factory=list)


@dataclass
class ResultadoProcessamento:
    arquivo: str
    url: str
    tipo_detectado: str
    modelo: str
    origem_texto: str | None
    estrategia: list[str]
    metadados: dict[str, Any]
    texto_base: str
    texto_complementar: str | None
    idioma_detectado: str | None
    preview: str
    avisos: list[str]
    etapas_cache: list[str] = field(default_factory=list)


class ErroProcessamento(RuntimeError):
    pass


def normalizar_espacos(texto: str) -> str:
    return re.sub(r"\n{3,}", "\n\n", texto.strip())


def preview_texto(texto: str, limite: int = 280) -> str:
    texto_limpo = re.sub(r"\s+", " ", texto).strip()
    if len(texto_limpo) <= limite:
        return texto_limpo
    return f"{texto_limpo[: limite - 3].rstrip()}..."


def remover_aspas(texto: str) -> str:
    if len(texto) >= 2 and texto[0] == texto[-1] and texto[0] in {'"', "'"}:
        return texto[1:-1]
    return texto


def parsear_valor_frontmatter(valor: str) -> Any:
    if not valor:
        return ""
    valor = valor.strip()
    if valor.startswith("[") and valor.endswith("]"):
        try:
            return ast.literal_eval(valor)
        except (SyntaxError, ValueError):
            return valor
    if valor in {"true", "false"}:
        return valor == "true"
    if valor in {"null", "~"}:
        return None
    return remover_aspas(valor)


def separar_frontmatter(texto: str) -> tuple[dict[str, Any], str]:
    linhas = texto.splitlines()
    if not linhas or linhas[0].strip() != "---":
        raise ErroProcessamento("Arquivo sem frontmatter YAML no topo.")

    fim_frontmatter = None
    for indice in range(1, len(linhas)):
        if linhas[indice].strip() == "---":
            fim_frontmatter = indice
            break

    if fim_frontmatter is None:
        raise ErroProcessamento("Frontmatter sem delimitador de fechamento.")

    dados: dict[str, Any] = {}
    for linha in linhas[1:fim_frontmatter]:
        conteudo = linha.strip()
        if not conteudo or conteudo.startswith("#") or ":" not in conteudo:
            continue
        chave, valor = conteudo.split(":", 1)
        dados[chave.strip()] = parsear_valor_frontmatter(valor)

    corpo = "\n".join(linhas[fim_frontmatter + 1 :]).lstrip("\n")
    return dados, corpo


def carregar_item(arquivo: Path) -> ItemPendente:
    conteudo = arquivo.read_text(encoding="utf-8")
    frontmatter, _ = separar_frontmatter(conteudo)
    url = frontmatter.get("url")
    modelo = frontmatter.get("modelo")

    if not url or not modelo:
        raise ErroProcessamento(f"{arquivo} nao possui url e modelo validos.")

    estado = frontmatter.get("estado", "rascunho")
    if estado == "finalizado":
        raise ErroProcessamento(f"{arquivo} ja esta finalizado.")

    return ItemPendente(
        arquivo=arquivo,
        url=str(url),
        modelo=str(modelo),
    )


def listar_arquivos_pendentes() -> list[ItemPendente]:
    itens: list[ItemPendente] = []
    for arquivo in REPO_DIR.glob(PENDENTE_GLOB):
        if arquivo.name == "_grupo.md" or not arquivo.name.startswith("url_"):
            continue
        try:
            item = carregar_item(arquivo)
        except ErroProcessamento:
            continue
        itens.append(item)
    return sorted(itens, key=lambda item: item.arquivo.as_posix())


def obter_content_type_por_head(url: str) -> str | None:
    requisicao = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT},
        method="HEAD",
    )
    try:
        with urllib.request.urlopen(requisicao, timeout=15) as resposta:
            return resposta.headers.get_content_type()
    except (urllib.error.URLError, ValueError):
        return None


def detectar_tipo_url(url: str, content_type: str | None = None) -> str:
    parsed = urlparse(url)
    dominio = parsed.netloc.lower()
    if dominio.startswith("www."):
        dominio = dominio[4:]
    caminho = parsed.path.lower()

    if parsed.scheme not in {"http", "https"}:
        return "nao_suportado"
    if dominio in {"youtube.com", "m.youtube.com", "youtu.be"} or dominio.endswith(".youtube.com"):
        return "youtube"
    if dominio == "instagram.com" or dominio.endswith(".instagram.com"):
        return "instagram"
    if dominio == "tiktok.com" or dominio.endswith(".tiktok.com"):
        return "tiktok"
    if caminho.endswith(".pdf") or content_type == "application/pdf":
        return "pdf"
    if any(caminho.endswith(ext) for ext in FORMATOS_BINARIOS_NAO_SUPORTADOS):
        return "nao_suportado"
    if content_type:
        if content_type == "application/pdf":
            return "pdf"
        if content_type.startswith(CONTENT_TYPES_WEB):
            return "web"
        if content_type.startswith(CONTENT_TYPES_NAO_SUPORTADOS):
            return "nao_suportado"
    return "web"


def acao_compativel(tipo_detectado: str, modelo: str) -> bool:
    if modelo == "resumo":
        return tipo_detectado in {"web", "pdf", "youtube", "instagram", "tiktok"}
    if modelo == "extrato":
        return tipo_detectado in {"web", "pdf"}
    return False


def estrategia_por_tipo(tipo_detectado: str) -> list[str]:
    if tipo_detectado == "web":
        return ["requests", "trafilatura", "readability-lxml", "playwright"]
    if tipo_detectado == "pdf":
        return ["requests", "Docling", "PyMuPDF (fallback)"]
    if tipo_detectado == "youtube":
        return ["youtube-transcript-api", "yt-dlp subtitles", "yt-dlp + faster-whisper"]
    if tipo_detectado in {"instagram", "tiktok"}:
        return ["yt-dlp metadata", "yt-dlp subtitles", "yt-dlp + faster-whisper"]
    return []


def python_no_venv() -> Path | None:
    if VENV_PYTHON.exists():
        return VENV_PYTHON
    return None


def _modulo_instalado_no_venv(python_venv: Path, modulo: str) -> bool:
    comando = [
        str(python_venv),
        "-c",
        (
            "import importlib.util, sys; "
            f"sys.exit(0 if importlib.util.find_spec('{modulo}') else 1)"
        ),
    ]
    return subprocess.run(comando, capture_output=True, text=True).returncode == 0


def _playwright_browser_ok_no_venv(python_venv: Path) -> bool:
    comando = [
        str(python_venv),
        "-c",
        (
            "from playwright.sync_api import sync_playwright\n"
            "with sync_playwright() as p:\n"
            "    import pathlib, sys\n"
            "    caminho = pathlib.Path(p.chromium.executable_path)\n"
            "    sys.exit(0 if caminho.exists() else 1)\n"
        ),
    ]
    return subprocess.run(comando, capture_output=True, text=True).returncode == 0


def instrucoes_ambiente() -> list[str]:
    return [
        "Instale o uv: curl -LsSf https://astral.sh/uv/install.sh | sh",
        "Instale o ffmpeg no Ubuntu: sudo apt update && sudo apt install -y ffmpeg",
    ]


def _python_esta_na_venv(python_venv: Path) -> bool:
    executavel_atual = Path(sys.executable)
    prefixo_atual = Path(sys.prefix)
    venv_resolvida = VENV_DIR.resolve()
    candidatos = [
        executavel_atual.parent.resolve(),
        prefixo_atual.resolve(),
    ]
    if os.environ.get("VIRTUAL_ENV"):
        candidatos.append(Path(os.environ["VIRTUAL_ENV"]).resolve())
    return any(candidato == venv_resolvida for candidato in candidatos)


def validar_ambiente() -> dict[str, Any]:
    erros_fatais: list[str] = []
    auto_corrigiveis: list[str] = []
    avisos: list[str] = []

    if shutil.which("uv") is None:
        erros_fatais.append("uv nao encontrado no PATH.")
        return {
            "ok": False,
            "erros_fatais": erros_fatais,
            "auto_corrigiveis": auto_corrigiveis,
            "avisos": avisos,
            "instrucoes": instrucoes_ambiente(),
        }

    if not PYPROJECT_PATH.exists():
        erros_fatais.append("pyproject.toml da skill nao encontrado em .agents/skills/processar-url/scripts.")
    if not UV_LOCK_PATH.exists():
        avisos.append("uv.lock da skill nao encontrado; a sincronizacao perde reprodutibilidade.")

    if shutil.which("ffmpeg") is None:
        erros_fatais.append("ffmpeg nao encontrado no PATH.")

    if not TEMP_DIR.exists():
        auto_corrigiveis.append("temp/ da skill ausente; criar a pasta antes de prosseguir.")

    python_venv = python_no_venv()
    if python_venv is None:
        avisos.append(
            ".venv/ da skill ausente; sera criada automaticamente pelo proximo `uv run`."
        )
    else:
        faltantes = [
            pacote
            for modulo, pacote in DEPENDENCIAS_PYTHON.items()
            if not _modulo_instalado_no_venv(python_venv, modulo)
        ]
        if faltantes:
            avisos.append(
                f"Dependencias ausentes no .venv ({', '.join(faltantes)}); "
                "serao instaladas automaticamente pelo proximo `uv run`."
            )
        if _modulo_instalado_no_venv(python_venv, "playwright") and not _playwright_browser_ok_no_venv(
            python_venv
        ):
            auto_corrigiveis.append(
                "Chromium do Playwright nao esta instalado; executar "
                "`uv --directory .agents/skills/processar-url/scripts run playwright install chromium`."
            )

    if python_venv is not None and not _python_esta_na_venv(python_venv):
        avisos.append(
            "O script atual nao esta rodando dentro da .venv da skill; prefira "
            "`uv --directory .agents/skills/processar-url/scripts run python processar_url.py ...`."
        )

    return {
        "ok": not erros_fatais,
        "erros_fatais": erros_fatais,
        "auto_corrigiveis": auto_corrigiveis,
        "avisos": avisos,
        "instrucoes": instrucoes_ambiente(),
    }


def garantir_texto_util(texto: str, minimo_caracteres: int = 280) -> bool:
    return len(re.sub(r"\s+", " ", texto).strip()) >= minimo_caracteres


def importar_modulo(nome: str, pacote: str):
    spec = importlib.util.find_spec(nome)
    if spec is None:
        raise ErroProcessamento(
            "Dependencia ausente no interpretador atual: "
            f"{pacote}. Rode o script com "
            "`uv --directory .agents/skills/processar-url/scripts run python processar_url.py ...` "
            "apos sincronizar o ambiente da skill."
        )
    return importlib.import_module(nome)


def baixar_conteudo_http(url: str) -> tuple[str, str | None]:
    requests = importar_modulo("requests", "requests")
    resposta = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
    resposta.raise_for_status()
    content_type = resposta.headers.get("Content-Type")
    return resposta.text, content_type


def html_para_texto(html_bruto: str) -> str:
    parser = HtmlTextoParser()
    parser.feed(html.unescape(html_bruto))
    return normalizar_espacos(parser.texto())


def extrair_web(
    url: str,
    slug: str,
    forcar: bool = False,
    etapas_cache: list[str] | None = None,
) -> tuple[str, str, dict[str, Any]]:
    transcript_path = TEMP_DIR / f"{slug}-transcript.txt"
    documento_path = TEMP_DIR / f"{slug}-documento.html"

    # Verificar cache de transcript
    if not forcar and transcript_path.exists():
        conteudo_cache = transcript_path.read_text(encoding="utf-8").strip()
        if garantir_texto_util(conteudo_cache):
            if etapas_cache is not None:
                etapas_cache.append("transcript")
            return conteudo_cache, "html", {}

    html_bruto, content_type = baixar_conteudo_http(url)

    # Salvar HTML bruto para debug e cache
    documento_path.write_text(html_bruto, encoding="utf-8")

    trafilatura = importar_modulo("trafilatura", "trafilatura")
    texto = trafilatura.extract(
        html_bruto,
        output_format="markdown",
        include_links=True,
        include_comments=False,
        favor_precision=True,
    )
    if texto and garantir_texto_util(texto):
        texto_final = normalizar_espacos(texto)
        transcript_path.write_text(texto_final, encoding="utf-8")
        return texto_final, "html", {"content_type": content_type}

    readability = importar_modulo("readability", "readability-lxml")
    document = readability.Document(html_bruto)
    resumo_html = document.summary(html_partial=True)
    texto_readability = trafilatura.extract(
        resumo_html,
        output_format="markdown",
        include_links=True,
        include_comments=False,
        favor_precision=True,
    )
    if texto_readability and garantir_texto_util(texto_readability):
        titulo = document.short_title() or document.title()
        texto_final = normalizar_espacos(texto_readability)
        transcript_path.write_text(texto_final, encoding="utf-8")
        return texto_final, "html", {
            "content_type": content_type,
            "titulo_detectado": titulo,
        }

    playwright = importar_modulo("playwright.sync_api", "playwright")
    with playwright.sync_playwright() as engine:
        browser = engine.chromium.launch(headless=True)
        page = browser.new_page(user_agent=USER_AGENT)
        page.goto(url, wait_until="networkidle", timeout=45_000)
        renderizado = page.content()
        browser.close()

    texto_renderizado = trafilatura.extract(
        renderizado,
        output_format="markdown",
        include_links=True,
        include_comments=False,
        favor_precision=True,
    )
    if texto_renderizado and garantir_texto_util(texto_renderizado):
        texto_final = normalizar_espacos(texto_renderizado)
        transcript_path.write_text(texto_final, encoding="utf-8")
        return texto_final, "html", {
            "content_type": content_type,
            "renderizado_por": "playwright",
        }

    document = readability.Document(renderizado)
    texto_final = html_para_texto(document.summary(html_partial=True))
    if garantir_texto_util(texto_final):
        texto_final = normalizar_espacos(texto_final)
        transcript_path.write_text(texto_final, encoding="utf-8")
        return texto_final, "html", {
            "content_type": content_type,
            "renderizado_por": "playwright",
            "titulo_detectado": document.short_title() or document.title(),
        }

    raise ErroProcessamento("Nao foi possivel extrair texto principal limpo da pagina.")


def _extrair_video_id_youtube(url: str) -> str | None:
    parsed = urlparse(url)
    dominio = parsed.netloc.lower().removeprefix("www.")
    if dominio == "youtu.be":
        return parsed.path.lstrip("/") or None
    if dominio.endswith("youtube.com"):
        if parsed.path == "/watch":
            parametros = urllib_parse.parse_qs(parsed.query)
            return parametros.get("v", [None])[0]
        partes = [parte for parte in parsed.path.split("/") if parte]
        if len(partes) >= 2 and partes[0] in {"embed", "shorts", "live"}:
            return partes[1]
    return None


def _executar_yt_dlp(args: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    comando = [sys.executable, "-m", "yt_dlp", *args]
    resultado = subprocess.run(comando, cwd=cwd, capture_output=True, text=True)
    if resultado.returncode != 0:
        mensagem = resultado.stderr.strip() or resultado.stdout.strip() or "Falha desconhecida no yt-dlp."
        raise ErroProcessamento(mensagem)
    return resultado


def _carregar_metadata_yt_dlp(url: str) -> dict[str, Any]:
    resultado = _executar_yt_dlp(["--dump-single-json", "--skip-download", url])
    return json.loads(resultado.stdout)


def _escolher_arquivo_mais_recente(pasta: Path, extensoes: tuple[str, ...]) -> Path | None:
    candidatos = [arquivo for arquivo in pasta.iterdir() if arquivo.suffix.lower() in extensoes]
    if not candidatos:
        return None
    return max(candidatos, key=lambda arquivo: arquivo.stat().st_mtime)


def _texto_de_vtt(caminho: Path) -> str:
    linhas: list[str] = []
    for linha in caminho.read_text(encoding="utf-8", errors="ignore").splitlines():
        conteudo = linha.strip()
        if not conteudo:
            continue
        if conteudo.startswith("WEBVTT"):
            continue
        if "-->" in conteudo:
            continue
        if re.fullmatch(r"\d+", conteudo):
            continue
        linhas.append(conteudo)
    return normalizar_espacos("\n".join(linhas))


def _baixar_subtitles_yt_dlp(
    url: str,
    slug: str,
    forcar: bool = False,
    etapas_cache: list[str] | None = None,
) -> str | None:
    if not forcar:
        arquivo_cache = _arquivo_cache(slug, "subtitles")
        if arquivo_cache is not None:
            texto = _texto_de_vtt(arquivo_cache)
            if garantir_texto_util(texto, minimo_caracteres=120):
                if etapas_cache is not None:
                    etapas_cache.append("subtitles")
                return texto
    _executar_yt_dlp(
        [
            "--skip-download",
            "--write-subs",
            "--write-auto-subs",
            "--sub-format",
            "vtt",
            "--sub-langs",
            ",".join(SUBTITLE_LANGS),
            "--output",
            str(TEMP_DIR / f"{slug}-subtitles.%(ext)s"),
            url,
        ]
    )
    # yt-dlp pode inserir código de idioma no nome (ex: {slug}-subtitles.en.vtt); buscar por glob
    candidatos = []
    for ext in (".vtt", ".srv1", ".srv2", ".srv3"):
        candidatos.extend(TEMP_DIR.glob(f"{slug}-subtitles*{ext}"))
    if not candidatos:
        return None
    arquivo_baixado = max(candidatos, key=lambda f: f.stat().st_mtime)
    # Renomear para o nome canônico sem código de idioma
    destino = TEMP_DIR / f"{slug}-subtitles{arquivo_baixado.suffix}"
    if arquivo_baixado != destino:
        arquivo_baixado.rename(destino)
        arquivo_baixado = destino
    texto = _texto_de_vtt(arquivo_baixado)
    return texto if garantir_texto_util(texto, minimo_caracteres=120) else None


def _baixar_audio_yt_dlp(
    url: str,
    slug: str,
    forcar: bool = False,
    etapas_cache: list[str] | None = None,
) -> Path:
    cache_path = TEMP_DIR / f"{slug}-audio.mp3"
    if not forcar and cache_path.exists():
        if etapas_cache is not None:
            etapas_cache.append("audio")
        return cache_path
    _executar_yt_dlp(
        [
            "--extract-audio",
            "--audio-format",
            "mp3",
            "--output",
            str(TEMP_DIR / f"{slug}-audio.%(ext)s"),
            url,
        ]
    )
    if cache_path.exists():
        return cache_path
    # Fallback: yt-dlp produziu outro formato
    candidatos = [f for f in TEMP_DIR.glob(f"{slug}-audio*") if f.suffix in (".mp3", ".m4a", ".wav", ".webm", ".opus")]
    if not candidatos:
        raise ErroProcessamento("yt-dlp nao gerou arquivo de audio para transcricao.")
    return max(candidatos, key=lambda f: f.stat().st_mtime)


def _transcrever_audio(
    caminho_audio: Path,
    slug: str,
    forcar: bool = False,
    etapas_cache: list[str] | None = None,
) -> tuple[str, str | None]:
    """Retorna (texto, idioma_detectado). idioma_detectado é None quando lido do cache."""
    cache_path = TEMP_DIR / f"{slug}-transcript.txt"
    if not forcar and cache_path.exists():
        texto = cache_path.read_text(encoding="utf-8")
        if garantir_texto_util(texto, minimo_caracteres=120):
            if etapas_cache is not None:
                etapas_cache.append("transcript")
            return texto, None
    faster_whisper = importar_modulo("faster_whisper", "faster-whisper")
    modelo = faster_whisper.WhisperModel(ASR_MODEL, device="cpu", compute_type="int8")
    segmentos, info = modelo.transcribe(str(caminho_audio), vad_filter=True)
    idioma_detectado = info.language
    partes = [segmento.text.strip() for segmento in segmentos if segmento.text.strip()]
    texto = normalizar_espacos("\n".join(partes))
    if not garantir_texto_util(texto, minimo_caracteres=120):
        raise ErroProcessamento("Transcricao local retornou texto insuficiente.")
    cache_path.write_text(texto, encoding="utf-8")
    return texto, idioma_detectado


def _extrair_texto_complementar(metadata: dict[str, Any]) -> str | None:
    descricao = str(metadata.get("description", "")).strip()
    if descricao and len(descricao) > 10:
        return normalizar_espacos(descricao)
    return None


def _remover_emojis(texto: str) -> str:
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002500-\U00002BFF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"
        "\U0001FA00-\U0001FA6F"
        "\U0001FA70-\U0001FAFF"
        "\U00002300-\U000023FF"
        "]+",
        flags=re.UNICODE,
    )
    return emoji_pattern.sub("", texto).strip()


def _extrair_metadados_normalizados(metadata: dict[str, Any], video_id: str | None = None) -> dict[str, Any]:
    resultado: dict[str, Any] = {}
    if video_id:
        resultado["video_id"] = video_id

    def _campo(c: str) -> str:
        return str(metadata.get(c, "")).strip()

    def _eh_handle_valido(t: str) -> bool:
        """Handle: sem espaços, não-numérico, comprimento razoável (≤ 64)."""
        return bool(t) and " " not in t and not t.lstrip("@").isdigit() and len(t) <= 64

    # Display name: primeiro candidato com espaço (nome humano legível)
    # YouTube: uploader="IBM Technology"; TikTok: channel="Jens Heitmann"; Instagram: uploader="Make Money..."
    nome_display_bruto = ""
    for campo in ("uploader", "channel", "creator", "artist"):
        v = _campo(campo)
        if v and " " in v:
            nome_display_bruto = v
            break
    if not nome_display_bruto:
        # fallback: qualquer candidato não-numérico (ex: TikTok onde uploader é o handle)
        for campo in ("uploader", "channel", "creator", "artist"):
            v = _campo(campo)
            if v and _eh_handle_valido(v):
                nome_display_bruto = v
                break

    # Handle: primeiro candidato sem espaços, não-numérico, comprimento ≤ 64
    # YouTube: uploader_id="@IBMTechnology"; Instagram: channel="mikemeansbusiness_ai"; TikTok: uploader="jensheitmann_"
    handle_bruto = ""
    for campo in ("uploader_id", "channel", "uploader"):
        v = _campo(campo)
        if _eh_handle_valido(v):
            handle_bruto = v
            break

    nome_limpo = _remover_emojis(nome_display_bruto)
    handle_limpo = handle_bruto

    # Deduplicação simples: suprimir handle apenas quando idêntico ao nome (lowercase, sem @)
    if nome_limpo and handle_limpo:
        if nome_limpo.lower() == handle_limpo.lstrip("@").lower():
            resultado["autores"] = nome_limpo
        else:
            resultado["autores"] = f"{nome_limpo} ({handle_limpo})"
    elif nome_limpo:
        resultado["autores"] = nome_limpo
    elif handle_limpo:
        resultado["autores"] = handle_limpo

    for chave in ("title", "upload_date", "duration", "view_count", "like_count"):
        if chave in metadata:
            resultado[chave] = metadata[chave]
    return resultado


def coletar_youtube(url: str, slug: str, forcar: bool = False) -> ResultadoColeta:
    avisos: list[str] = []
    etapas_cache: list[str] = []
    video_id = _extrair_video_id_youtube(url)
    metadata: dict[str, Any] = {}
    texto_complementar: str | None = None

    # Carregar metadata para texto_complementar
    try:
        metadata = _carregar_metadata_yt_dlp(url)
        texto_complementar = _extrair_texto_complementar(metadata)
    except ErroProcessamento as exc:
        avisos.append(f"yt-dlp metadata falhou: {exc}")

    # Tentar youtube-transcript-api
    if video_id:
        # Verificar cache de transcrição nativa
        if not forcar:
            cache_path = TEMP_DIR / f"{slug}-transcript.txt"
            if cache_path.exists():
                texto_cache = cache_path.read_text(encoding="utf-8")
                if garantir_texto_util(texto_cache, minimo_caracteres=120):
                    etapas_cache.append("transcript")
                    return ResultadoColeta(
                        texto_base=texto_cache,
                        origem_texto="nativo",
                        texto_complementar=texto_complementar,
                        idioma_detectado=None,
                        metadados=_extrair_metadados_normalizados(metadata, video_id),
                        avisos=avisos,
                        etapas_cache=etapas_cache,
                    )
        try:
            modulo = importar_modulo("youtube_transcript_api", "youtube-transcript-api")
            api = getattr(modulo, "YouTubeTranscriptApi")
            if hasattr(api, "get_transcript"):
                trechos = api.get_transcript(video_id, languages=SUBTITLE_LANGS)
            else:
                cliente = api()
                trechos = cliente.fetch(video_id, languages=SUBTITLE_LANGS)
            partes = []
            for trecho in trechos:
                if isinstance(trecho, dict):
                    texto = trecho.get("text", "")
                else:
                    texto = getattr(trecho, "text", "")
                if texto:
                    partes.append(texto.strip())
            texto = normalizar_espacos("\n".join(partes))
            if garantir_texto_util(texto, minimo_caracteres=120):
                (TEMP_DIR / f"{slug}-transcript.txt").write_text(texto, encoding="utf-8")
                return ResultadoColeta(
                    texto_base=texto,
                    origem_texto="nativo",
                    texto_complementar=texto_complementar,
                    idioma_detectado=None,
                    metadados=_extrair_metadados_normalizados(metadata, video_id),
                    avisos=avisos,
                    etapas_cache=etapas_cache,
                )
        except Exception as exc:  # noqa: BLE001
            avisos.append(f"youtube-transcript-api falhou: {exc}")

    # Tentar subtitles via yt-dlp
    if metadata:
        try:
            texto_sub = _baixar_subtitles_yt_dlp(url, slug, forcar=forcar, etapas_cache=etapas_cache)
        except ErroProcessamento as exc:
            texto_sub = None
            avisos.append(f"yt-dlp subtitles falhou: {exc}")
        if texto_sub:
            return ResultadoColeta(
                texto_base=texto_sub,
                origem_texto="subtitle",
                texto_complementar=texto_complementar,
                idioma_detectado=None,
                metadados=_extrair_metadados_normalizados(metadata, video_id),
                avisos=avisos,
                etapas_cache=etapas_cache,
            )

    # Fallback: ASR
    arquivo_audio = _baixar_audio_yt_dlp(url, slug, forcar=forcar, etapas_cache=etapas_cache)
    texto_asr, idioma_detectado = _transcrever_audio(arquivo_audio, slug, forcar=forcar, etapas_cache=etapas_cache)
    return ResultadoColeta(
        texto_base=texto_asr,
        origem_texto="asr",
        texto_complementar=texto_complementar,
        idioma_detectado=idioma_detectado,
        metadados=_extrair_metadados_normalizados(metadata, video_id),
        avisos=avisos,
        etapas_cache=etapas_cache,
    )


def coletar_video_social(url: str, slug: str, forcar: bool = False) -> ResultadoColeta:
    avisos: list[str] = []
    etapas_cache: list[str] = []
    metadata = _carregar_metadata_yt_dlp(url)

    # Caption como texto_complementar (nunca como texto_base)
    texto_complementar = _extrair_texto_complementar(metadata)

    # Tentar subtitles primeiro
    try:
        texto_sub = _baixar_subtitles_yt_dlp(url, slug, forcar=forcar, etapas_cache=etapas_cache)
    except ErroProcessamento as exc:
        texto_sub = None
        avisos.append(f"Subtitles do yt-dlp falharam: {exc}")
    if texto_sub:
        return ResultadoColeta(
            texto_base=texto_sub,
            origem_texto="subtitle",
            texto_complementar=texto_complementar,
            idioma_detectado=None,
            metadados=_extrair_metadados_normalizados(metadata),
            avisos=avisos,
            etapas_cache=etapas_cache,
        )

    # Fallback: baixar áudio + transcrever
    try:
        arquivo_audio = _baixar_audio_yt_dlp(url, slug, forcar=forcar, etapas_cache=etapas_cache)
        texto_asr, idioma_detectado = _transcrever_audio(arquivo_audio, slug, forcar=forcar, etapas_cache=etapas_cache)
        return ResultadoColeta(
            texto_base=texto_asr,
            origem_texto="asr",
            texto_complementar=texto_complementar,
            idioma_detectado=idioma_detectado,
            metadados=_extrair_metadados_normalizados(metadata),
            avisos=avisos,
            etapas_cache=etapas_cache,
        )
    except ErroProcessamento as exc_asr:
        avisos.append(f"Transcricao de audio falhou: {exc_asr}")

    # Fallback de emergência: caption como texto_base
    if texto_complementar and garantir_texto_util(texto_complementar, minimo_caracteres=120):
        avisos.append("Usando caption como texto_base (fallback de emergencia: audio e subtitles falharam).")
        return ResultadoColeta(
            texto_base=texto_complementar,
            origem_texto="caption",
            texto_complementar=None,
            idioma_detectado=None,
            metadados=_extrair_metadados_normalizados(metadata),
            avisos=avisos,
            etapas_cache=etapas_cache,
        )

    raise ErroProcessamento(
        "Nao foi possivel obter texto do video: subtitles, audio e caption falharam."
    )


def extrair_pdf(
    url: str,
    slug: str,
    forcar: bool = False,
    etapas_cache: list[str] | None = None,
) -> tuple[str, str, dict[str, Any]]:
    destino = TEMP_DIR / f"{slug}-documento.pdf"
    transcript_path = TEMP_DIR / f"{slug}-transcript.txt"

    # Verificar cache de transcript
    if not forcar and transcript_path.exists():
        conteudo_cache = transcript_path.read_text(encoding="utf-8").strip()
        if garantir_texto_util(conteudo_cache):
            if etapas_cache is not None:
                etapas_cache.append("transcript")
            return conteudo_cache, "pdf", {}

    # Baixar PDF se necessário
    if forcar or not destino.exists():
        requests = importar_modulo("requests", "requests")
        with requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=60, stream=True) as resposta:
            resposta.raise_for_status()
            with destino.open("wb") as arquivo:
                for bloco in resposta.iter_content(chunk_size=64 * 1024):
                    if bloco:
                        arquivo.write(bloco)
    elif etapas_cache is not None:
        etapas_cache.append("documento")

    # Tentar Docling primeiro
    try:
        docling = importar_modulo("docling.document_converter", "docling")
        converter = docling.DocumentConverter()
        resultado = converter.convert(str(destino))
        texto = resultado.document.export_to_markdown()
        if texto and garantir_texto_util(texto):
            texto_final = normalizar_espacos(texto)
            transcript_path.write_text(texto_final, encoding="utf-8")
            return texto_final, "pdf", {"extrator": "docling"}
    except Exception:
        pass

    # Fallback: PyMuPDF
    fitz = importar_modulo("fitz", "PyMuPDF")
    documento = fitz.open(destino)
    paginas = [pagina.get_text("text") for pagina in documento]
    texto = normalizar_espacos("\n\n".join(paginas))
    if not garantir_texto_util(texto):
        raise ErroProcessamento("PDF sem texto util extraivel. OCR nao faz parte da v1.")
    transcript_path.write_text(texto, encoding="utf-8")
    return texto, "pdf", {"paginas": len(documento), "extrator": "pymupdf"}


def inspecionar_item(item: ItemPendente) -> dict[str, Any]:
    content_type = obter_content_type_por_head(item.url)
    tipo_detectado = detectar_tipo_url(item.url, content_type=content_type)
    return {
        "arquivo": item.arquivo.as_posix(),
        "url": item.url,
        "tipo_detectado": tipo_detectado,
        "modelo": item.modelo,
        "content_type": content_type,
        "acao_compativel": acao_compativel(tipo_detectado, item.modelo),
        "estrategia": estrategia_por_tipo(tipo_detectado),
    }


def _arquivo_cache(slug: str, tipo: str) -> Path | None:
    if tipo == "audio":
        candidato = TEMP_DIR / f"{slug}-audio.mp3"
        return candidato if candidato.exists() else None
    if tipo == "subtitles":
        for ext in (".vtt", ".srv1", ".srv2", ".srv3"):
            candidato = TEMP_DIR / f"{slug}-subtitles{ext}"
            if candidato.exists():
                return candidato
        return None
    if tipo == "transcript":
        candidato = TEMP_DIR / f"{slug}-transcript.txt"
        return candidato if candidato.exists() else None
    if tipo == "documento":
        candidato = TEMP_DIR / f"{slug}-documento.pdf"
        return candidato if candidato.exists() else None
    return None


def _listar_arquivos_cache(slug: str) -> list[str]:
    return [tipo for tipo in ("audio", "subtitles", "transcript", "documento") if _arquivo_cache(slug, tipo) is not None]


def coletar_item(item: ItemPendente, forcar: bool = False) -> ResultadoProcessamento:
    inspecao = inspecionar_item(item)
    tipo_detectado = inspecao["tipo_detectado"]
    if tipo_detectado == "nao_suportado":
        raise ErroProcessamento("Formato nao suportado por este fluxo.")
    if not inspecao["acao_compativel"]:
        raise ErroProcessamento(
            f"O modelo `{item.modelo}` nao e compativel com URLs do tipo `{tipo_detectado}`."
        )

    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    slug = item.arquivo.stem

    if tipo_detectado == "web":
        etapas_cache_web: list[str] = []
        texto_base, origem_texto, metadados = extrair_web(item.url, slug, forcar=forcar, etapas_cache=etapas_cache_web)
        coleta = ResultadoColeta(
            texto_base=texto_base,
            origem_texto=origem_texto,
            texto_complementar=None,
            idioma_detectado=None,
            metadados=metadados,
            avisos=[],
            etapas_cache=etapas_cache_web,
        )
    elif tipo_detectado == "pdf":
        etapas_cache: list[str] = []
        texto_base, origem_texto, metadados = extrair_pdf(item.url, slug, forcar=forcar, etapas_cache=etapas_cache)
        coleta = ResultadoColeta(
            texto_base=texto_base,
            origem_texto=origem_texto,
            texto_complementar=None,
            idioma_detectado=None,
            metadados=metadados,
            avisos=[],
            etapas_cache=etapas_cache,
        )
    elif tipo_detectado == "youtube":
        coleta = coletar_youtube(item.url, slug, forcar=forcar)
    elif tipo_detectado in {"instagram", "tiktok"}:
        coleta = coletar_video_social(item.url, slug, forcar=forcar)
    else:
        raise ErroProcessamento("Tipo de URL nao suportado pelo coletor.")

    return ResultadoProcessamento(
        arquivo=item.arquivo.as_posix(),
        url=item.url,
        tipo_detectado=tipo_detectado,
        modelo=item.modelo,
        origem_texto=coleta.origem_texto,
        estrategia=estrategia_por_tipo(tipo_detectado),
        metadados=coleta.metadados,
        texto_base=coleta.texto_base,
        texto_complementar=coleta.texto_complementar,
        idioma_detectado=coleta.idioma_detectado,
        preview=preview_texto(coleta.texto_base),
        avisos=coleta.avisos,
        etapas_cache=coleta.etapas_cache,
    )


def imprimir_saida(dados: Any, json_output: bool) -> int:
    if json_output:
        print(json.dumps(dados, ensure_ascii=False, indent=2))
        return 0
    if isinstance(dados, dict):
        for chave, valor in dados.items():
            print(f"{chave}: {valor}")
        return 0
    if isinstance(dados, list):
        for item in dados:
            print(json.dumps(item, ensure_ascii=False))
        return 0
    print(dados)
    return 0


def comando_validar_ambiente(args: argparse.Namespace) -> int:
    resultado = validar_ambiente()
    return imprimir_saida(resultado, args.json)


def comando_listar_pendentes(args: argparse.Namespace) -> int:
    itens = listar_arquivos_pendentes()
    dados = [
        {
            "arquivo": item.arquivo.as_posix(),
            "url": item.url,
            "modelo": item.modelo,
            "tem_cache": bool(_listar_arquivos_cache(item.arquivo.stem)),
            "arquivos_cache": _listar_arquivos_cache(item.arquivo.stem),
        }
        for item in itens
    ]
    return imprimir_saida(dados, args.json)


def _resolver_arquivo(caminho: str) -> Path:
    arquivo = Path(caminho)
    if not arquivo.is_absolute():
        arquivo = REPO_DIR / arquivo
    return arquivo.resolve()


def comando_inspecionar(args: argparse.Namespace) -> int:
    arquivo = _resolver_arquivo(args.arquivo)
    item = carregar_item(arquivo)
    dados = inspecionar_item(item)
    return imprimir_saida(dados, args.json)


def comando_coletar(args: argparse.Namespace) -> int:
    ambiente = validar_ambiente()
    if not ambiente["ok"]:
        if args.json:
            print(json.dumps(ambiente, ensure_ascii=False, indent=2))
        else:
            print("Ambiente invalido para processamento:")
            for erro in ambiente["erros_fatais"]:
                print(f"- {erro}")
            print("")
            print("Instrucoes:")
            for instrucao in ambiente["instrucoes"]:
                print(f"- {instrucao}")
        return 2

    arquivo = _resolver_arquivo(args.arquivo)
    item = carregar_item(arquivo)
    forcar = getattr(args, "forcar_reprocessamento", False)
    resultado = coletar_item(item, forcar=forcar)
    return imprimir_saida(asdict(resultado), args.json)


def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Ferramenta auxiliar da skill processar-url para validar ambiente e coletar conteudo base."
    )
    subparsers = parser.add_subparsers(dest="comando", required=True)

    validar = subparsers.add_parser("validar-ambiente", help="Verifica uv, .venv, dependencias e temp da skill.")
    validar.add_argument("--json", action="store_true", help="Emite resultado em JSON.")
    validar.set_defaults(func=comando_validar_ambiente)

    listar = subparsers.add_parser("listar-pendentes", help="Lista arquivos url_ com estado: rascunho.")
    listar.add_argument("--json", action="store_true", help="Emite resultado em JSON.")
    listar.set_defaults(func=comando_listar_pendentes)

    inspecionar = subparsers.add_parser(
        "inspecionar",
        help="Detecta tipo de URL e pipeline planejado para um arquivo especifico.",
    )
    inspecionar.add_argument("--arquivo", required=True, help="Caminho do arquivo Markdown com frontmatter.")
    inspecionar.add_argument("--json", action="store_true", help="Emite resultado em JSON.")
    inspecionar.set_defaults(func=comando_inspecionar)

    coletar = subparsers.add_parser(
        "coletar",
        help="Executa o pipeline de coleta para obter o texto base de um arquivo especifico.",
    )
    coletar.add_argument("--arquivo", required=True, help="Caminho do arquivo Markdown com frontmatter.")
    coletar.add_argument("--json", action="store_true", help="Emite resultado em JSON.")
    coletar.add_argument(
        "--forcar-reprocessamento",
        action="store_true",
        help="Ignora arquivos de cache e reprocessa tudo do zero.",
    )
    coletar.set_defaults(func=comando_coletar)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = construir_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except ErroProcessamento as exc:
        if getattr(args, "json", False):
            print(json.dumps({"ok": False, "erro": str(exc)}, ensure_ascii=False, indent=2))
        else:
            print(f"Erro: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
