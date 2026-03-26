#!/usr/bin/env python3
"""Helper da skill /criar-grupo — cria pasta, .gitkeep, _grupo.md e atualiza grupos.json.

Uso:
    uv --directory .agents/skills/criar-grupo/scripts run python criar_grupo.py \
        verificar --slug meu-grupo --topico tecnologia --json

    uv --directory .agents/skills/criar-grupo/scripts run python criar_grupo.py \
        criar --slug meu-grupo --topico tecnologia --descricao "Minha desc" --json
"""
from __future__ import annotations

import argparse
import json
import sys
import unicodedata
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
# Utilidades
# ---------------------------------------------------------------------------

def normalizar_slug(slug: str) -> str:
    """Remove acentos e garante kebab-case ASCII."""
    nfkd = unicodedata.normalize("NFKD", slug)
    ascii_str = "".join(c for c in nfkd if not unicodedata.combining(c))
    return ascii_str.lower().replace(" ", "-")


def carregar_grupos() -> list[dict[str, Any]]:
    if not GRUPOS_PATH.exists():
        return []
    with GRUPOS_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, list) else []


def salvar_grupos(grupos: list[dict[str, Any]]) -> None:
    GRUPOS_PATH.write_text(
        json.dumps(grupos, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# Comandos
# ---------------------------------------------------------------------------

def comando_verificar(args: argparse.Namespace) -> int:
    slug = normalizar_slug(args.slug)
    topico = args.topico

    pasta_grupo = PKM_DIR / topico / f"_{slug}"
    colisao = pasta_grupo.exists()

    resultado = {
        "ok": True,
        "slug_normalizado": slug,
        "topico": topico,
        "caminho_proposto": f"pkm/{topico}/_{slug}/",
        "colisao": colisao,
    }
    print(json.dumps(resultado, ensure_ascii=False, indent=2))
    return 0


def comando_criar(args: argparse.Namespace) -> int:
    slug = normalizar_slug(args.slug)
    topico = args.topico
    descricao = args.descricao

    pasta_topico = PKM_DIR / topico
    if not pasta_topico.exists():
        raise ErroHelper(f"Tópico não encontrado: pkm/{topico}/. Consulte index/topicos.json.")

    pasta_grupo = pasta_topico / f"_{slug}"
    if pasta_grupo.exists():
        raise ErroHelper(f"Já existe uma pasta com este slug: {pasta_grupo.relative_to(REPO_DIR)}")

    # Criar estrutura
    pasta_grupo.mkdir(parents=True)
    (pasta_grupo / ".gitkeep").write_text("", encoding="utf-8")

    # Montar frontmatter
    fm: dict[str, Any] = {"descricao": descricao}
    yaml_str = yaml.dump(fm, allow_unicode=True, default_flow_style=False, sort_keys=False)
    grupo_md = pasta_grupo / "_grupo.md"
    grupo_md.write_text(f"---\n{yaml_str}---\n", encoding="utf-8")

    # Atualizar grupos.json
    grupos = carregar_grupos()
    caminho = f"pkm/{topico}/_{slug}/"
    entrada: dict[str, Any] = {"caminho": caminho, "descricao": descricao, "topico": topico}
    # Remove entrada existente se houver (idempotente)
    grupos = [g for g in grupos if g.get("caminho") != caminho]
    grupos.append(entrada)
    grupos.sort(key=lambda g: g["caminho"])
    salvar_grupos(grupos)

    resultado = {
        "ok": True,
        "caminho": caminho,
        "arquivos_criados": [
            f"pkm/{topico}/_{slug}/.gitkeep",
            f"pkm/{topico}/_{slug}/_grupo.md",
        ],
        "grupos_json_atualizado": True,
    }
    print(json.dumps(resultado, ensure_ascii=False, indent=2))
    return 0


# ---------------------------------------------------------------------------
# Parser e main
# ---------------------------------------------------------------------------

def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Helper da skill criar-grupo: cria estrutura de grupo e atualiza índice."
    )
    subparsers = parser.add_subparsers(dest="comando", required=True)

    verificar = subparsers.add_parser(
        "verificar",
        help="Normaliza o slug e verifica se já existe colisão no tópico.",
    )
    verificar.add_argument("--slug", required=True, help="Slug proposto para o grupo.")
    verificar.add_argument("--topico", required=True, help="ID do tópico (ex: tecnologia).")
    verificar.set_defaults(func=comando_verificar)

    criar = subparsers.add_parser(
        "criar",
        help="Cria diretório, .gitkeep, _grupo.md e insere entrada no grupos.json.",
    )
    criar.add_argument("--slug", required=True, help="Slug do grupo.")
    criar.add_argument("--topico", required=True, help="ID do tópico (ex: tecnologia).")
    criar.add_argument("--descricao", required=True, help="Descrição do grupo.")
    criar.set_defaults(func=comando_criar)

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
