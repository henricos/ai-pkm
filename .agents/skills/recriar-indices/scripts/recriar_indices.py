#!/usr/bin/env python3
"""Helper da skill /recriar-indices — varre _grupo.md e reconstrói grupos.json.

Uso:
    uv --directory .agents/skills/recriar-indices/scripts run python recriar_indices.py escanear --json
    uv --directory .agents/skills/recriar-indices/scripts run python recriar_indices.py salvar --json
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
PKM_DIR = REPO_DIR / "pkm"
GRUPOS_PATH = REPO_DIR / "index" / "grupos.json"


class ErroHelper(RuntimeError):
    pass


# ---------------------------------------------------------------------------
# Frontmatter
# ---------------------------------------------------------------------------

def parsear_frontmatter(path: Path) -> dict[str, Any]:
    texto = path.read_text(encoding="utf-8")
    if not texto.startswith("---\n"):
        raise ErroHelper(f"{path}: sem frontmatter YAML.")
    partes = texto.split("---\n", 2)
    if len(partes) < 3:
        raise ErroHelper(f"{path}: frontmatter incompleto.")
    fm = yaml.safe_load(partes[1]) or {}
    if not isinstance(fm, dict):
        raise ErroHelper(f"{path}: frontmatter deve ser um objeto YAML.")
    return fm


# ---------------------------------------------------------------------------
# Lógica de negócio
# ---------------------------------------------------------------------------

def escanear_grupos() -> list[dict[str, Any]]:
    """Varre pkm/*/ buscando _grupo.md e retorna array de entradas."""
    grupos: list[dict[str, Any]] = []
    for arquivo in sorted(PKM_DIR.glob("*/**/_grupo.md")):
        try:
            fm = parsear_frontmatter(arquivo)
        except ErroHelper:
            continue
        descricao = fm.get("descricao")
        if not descricao:
            continue
        caminho = arquivo.parent.relative_to(REPO_DIR).as_posix() + "/"
        # topico é derivado do caminho: pkm/<topico>/...
        partes = caminho.split("/")
        topico = partes[1] if len(partes) > 1 else ""
        entrada: dict[str, Any] = {
            "caminho": caminho,
            "descricao": str(descricao),
            "topico": topico,
        }
        grupos.append(entrada)
    return grupos


def carregar_atual() -> list[dict[str, Any]]:
    if not GRUPOS_PATH.exists():
        return []
    with GRUPOS_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, list) else []


def calcular_diff(
    atual: list[dict[str, Any]],
    novo: list[dict[str, Any]],
) -> dict[str, Any]:
    caminhos_atual = {e["caminho"]: e for e in atual}
    caminhos_novo = {e["caminho"]: e for e in novo}

    adicionados = [c for c in caminhos_novo if c not in caminhos_atual]
    removidos = [c for c in caminhos_atual if c not in caminhos_novo]
    modificados = [
        c for c in caminhos_novo
        if c in caminhos_atual and caminhos_novo[c] != caminhos_atual[c]
    ]

    return {
        "adicionados": adicionados,
        "removidos": removidos,
        "modificados": modificados,
    }


# ---------------------------------------------------------------------------
# Comandos
# ---------------------------------------------------------------------------

def comando_escanear(args: argparse.Namespace) -> int:
    novo = escanear_grupos()
    atual = carregar_atual()
    diff = calcular_diff(atual, novo)
    resultado = {
        "ok": True,
        "atual": atual,
        "novo": novo,
        "diff": diff,
    }
    print(json.dumps(resultado, ensure_ascii=False, indent=2))
    return 0


def comando_salvar(args: argparse.Namespace) -> int:
    novo = escanear_grupos()
    GRUPOS_PATH.write_text(
        json.dumps(novo, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    resultado = {"ok": True, "total": len(novo), "caminho": str(GRUPOS_PATH.relative_to(REPO_DIR))}
    print(json.dumps(resultado, ensure_ascii=False, indent=2))
    return 0


# ---------------------------------------------------------------------------
# Parser e main
# ---------------------------------------------------------------------------

def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Helper da skill recriar-indices: varre _grupo.md e reconstrói grupos.json."
    )
    subparsers = parser.add_subparsers(dest="comando", required=True)

    escanear = subparsers.add_parser(
        "escanear",
        help="Varre o repositório e retorna o diff entre estado atual e novo (sem escrever).",
    )
    escanear.set_defaults(func=comando_escanear)

    salvar = subparsers.add_parser(
        "salvar",
        help="Varra o repositório e sobrescreve index/grupos.json.",
    )
    salvar.set_defaults(func=comando_salvar)

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
