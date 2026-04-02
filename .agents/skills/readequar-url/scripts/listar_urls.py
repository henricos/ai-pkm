#!/usr/bin/env python3
"""Helper da skill /readequar-url — lista arquivos url_ com modelo: url-resumo elegíveis para readequação.

Helper auto-suficiente — sem arquivos externos de dependências.

Regras para manutenção:
- Dependências de terceiros instaladas em `scripts/.venv` (criado automaticamente).
  Nunca usar pip global. O site-packages do venv é injetado em sys.path antes do import.
- Importar dependências de terceiros sob demanda, nunca incondicionalmente no topo.
- Toda instalação emite log em stderr antes de executar (ex: "[helper] instalando pyyaml...").
- Stdlib primeiro: só recorrer a terceiros quando a implementação própria tiver custo alto.

Uso:
    python3 .agents/skills/readequar-url/scripts/listar_urls.py listar --json
    python3 .agents/skills/readequar-url/scripts/listar_urls.py listar --arquivo pkm/topico/url_slug.md --json
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

# ── bootstrap ──────────────────────────────────────────────────────────────
_VENV = Path(__file__).resolve().parent / ".venv"


def _garantir_yaml() -> None:
    try:
        import yaml  # noqa: F401
        return
    except ImportError:
        pass
    if not _VENV.exists():
        print("[helper] criando .venv...", file=sys.stderr)
        subprocess.run([sys.executable, "-m", "venv", str(_VENV)], check=True)
    print("[helper] instalando pyyaml...", file=sys.stderr)
    subprocess.run([str(_VENV / "bin" / "pip"), "install", "pyyaml", "--quiet"], check=True)
    site_pkgs = next((_VENV / "lib").glob("python*/site-packages"))
    sys.path.insert(0, str(site_pkgs))


_garantir_yaml()
# ── fim bootstrap ───────────────────────────────────────────────────────────

import yaml  # noqa: E402


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_DIR = SCRIPT_DIR.parents[3]


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
    if fm.get("modelo") != "url-resumo":
        return None
    if fm.get("estado") != "finalizado":
        return None

    return {
        "arquivo": path.relative_to(REPO_DIR).as_posix(),
        "slug": path.stem,
    }


def listar_todos() -> list[dict[str, Any]]:
    pkm_dir = REPO_DIR / "pkm"
    itens: list[dict[str, Any]] = []
    for arquivo in sorted(pkm_dir.glob("*/**/url_*.md")):
        rel = arquivo.relative_to(pkm_dir)
        if rel.parts[0] == "__inbox":
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
                f"{args.arquivo} não atende aos critérios: modelo: url-resumo, estado: finalizado."
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
        description="Helper da skill readequar-url: lista arquivos url_ elegíveis para readequação."
    )
    subparsers = parser.add_subparsers(dest="comando", required=True)

    listar = subparsers.add_parser(
        "listar",
        help="Lista arquivos url_ com modelo: url-resumo e estado: finalizado.",
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
