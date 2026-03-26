#!/usr/bin/env python3
"""Helper da skill /criticar-url — lista arquivos url_ com formato: resumo elegíveis para crítica.

Uso:
    uv --directory .agents/skills/criticar-url/scripts run python listar_urls.py listar --json
    uv --directory .agents/skills/criticar-url/scripts run python listar_urls.py listar --arquivo _topico/url_slug.md --json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import yaml


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_DIR = SCRIPT_DIR.parents[3]
CACHE_DIR = REPO_DIR / ".agents" / "skills" / "processar-url" / "scripts" / "temp"


class ErroHelper(RuntimeError):
    pass


# ---------------------------------------------------------------------------
# Frontmatter
# ---------------------------------------------------------------------------

def parsear_frontmatter(path: Path) -> dict[str, Any]:
    texto = path.read_text(encoding="utf-8")
    if not texto.startswith("---\n"):
        return {}
    partes = texto.split("---\n", 2)
    if len(partes) < 3:
        return {}
    fm = yaml.safe_load(partes[1]) or {}
    return fm if isinstance(fm, dict) else {}


# ---------------------------------------------------------------------------
# Lógica de negócio
# ---------------------------------------------------------------------------

def validar_arquivo(path: Path) -> dict[str, Any] | None:
    """Retorna entrada se o arquivo é elegível, None caso contrário."""
    fm = parsear_frontmatter(path)
    if fm.get("tipo") != "url":
        return None
    if fm.get("formato") != "resumo":
        return None
    if fm.get("processado") is not True:
        return None

    slug = path.stem
    cache = CACHE_DIR / f"{slug}-transcript.txt"
    return {
        "arquivo": path.relative_to(REPO_DIR).as_posix(),
        "slug": slug,
        "tem_cache": cache.exists(),
    }


def listar_todos() -> list[dict[str, Any]]:
    itens: list[dict[str, Any]] = []
    for arquivo in sorted(REPO_DIR.glob("_*/**/url_*.md")):
        if arquivo.name == "_grupo.md":
            continue
        entrada = validar_arquivo(arquivo)
        if entrada:
            itens.append(entrada)
    return itens


# ---------------------------------------------------------------------------
# Comandos
# ---------------------------------------------------------------------------

def comando_listar(args: argparse.Namespace) -> int:
    if args.arquivo:
        path = REPO_DIR / args.arquivo
        if not path.exists():
            raise ErroHelper(f"Arquivo não encontrado: {args.arquivo}")
        entrada = validar_arquivo(path)
        if entrada is None:
            raise ErroHelper(
                f"{args.arquivo} não atende aos critérios: tipo: url, formato: resumo, processado: true."
            )
        resultado = {"ok": True, "itens": [entrada]}
    else:
        itens = listar_todos()
        resultado = {"ok": True, "itens": itens}

    print(json.dumps(resultado, ensure_ascii=False, indent=2))
    return 0


# ---------------------------------------------------------------------------
# Parser e main
# ---------------------------------------------------------------------------

def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Helper da skill criticar-url: lista arquivos url_ elegíveis para crítica."
    )
    subparsers = parser.add_subparsers(dest="comando", required=True)

    listar = subparsers.add_parser(
        "listar",
        help="Lista arquivos url_ com formato: resumo e processado: true, indicando presença de cache.",
    )
    listar.add_argument(
        "--arquivo",
        default=None,
        help="Valida um arquivo específico em vez de varrer o repositório.",
    )
    listar.set_defaults(func=comando_listar)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = construir_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except ErroHelper as exc:
        print(json.dumps({"ok": False, "erro": str(exc)}, ensure_ascii=False, indent=2))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
