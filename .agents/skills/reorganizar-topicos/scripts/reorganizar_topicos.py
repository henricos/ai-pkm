#!/usr/bin/env python3
"""Helper da skill /reorganizar-topicos — executa operações de reorganização em lote.

Uso:
    uv --directory .agents/skills/reorganizar-topicos/scripts run python reorganizar_topicos.py \
        executar --payload '<json>' --json

Tipos de operação aceitos no payload (array de objetos):
    {"tipo": "criar_pasta", "caminho": "_topico/sub/"}
    {"tipo": "criar_gitkeep", "caminho": "_topico/sub/"}
    {"tipo": "mover", "origem": "_topico/arq.md", "destino": "_topico/sub/arq.md"}
    {"tipo": "atualizar_frontmatter", "arquivo": "_topico/sub/arq.md", "campos": {"topico": "novo"}}
    {"tipo": "atualizar_topicos_json", "conteudo": [...]}
    {"tipo": "atualizar_grupos_json_entrada", "entrada": {"caminho": "...", "descricao": "...", "topico": "..."}}
    {"tipo": "remover_grupos_json_entrada", "caminho": "_topico/sub/"}
    {"tipo": "remover_pasta_vazia", "caminho": "_topico/vazia/"}
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path
from typing import Any

import yaml


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_DIR = SCRIPT_DIR.parents[3]
GRUPOS_PATH = REPO_DIR / "sistema" / "indices" / "grupos.json"
TOPICOS_PATH = REPO_DIR / "sistema" / "indices" / "topicos.json"


class ErroHelper(RuntimeError):
    pass


# ---------------------------------------------------------------------------
# Frontmatter
# ---------------------------------------------------------------------------

def ler_partes(path: Path) -> tuple[dict[str, Any], str]:
    """Retorna (frontmatter_dict, corpo) ou ({}, texto_completo) se sem frontmatter."""
    texto = path.read_text(encoding="utf-8")
    if not texto.startswith("---\n"):
        return {}, texto
    partes = texto.split("---\n", 2)
    if len(partes) < 3:
        return {}, texto
    fm = yaml.safe_load(partes[1]) or {}
    corpo = partes[2]
    return (fm if isinstance(fm, dict) else {}), corpo


def escrever_partes(path: Path, frontmatter: dict[str, Any], corpo: str) -> None:
    yaml_str = yaml.dump(frontmatter, allow_unicode=True, default_flow_style=False, sort_keys=False)
    path.write_text(f"---\n{yaml_str}---\n{corpo}", encoding="utf-8")


# ---------------------------------------------------------------------------
# Grupos
# ---------------------------------------------------------------------------

def carregar_grupos() -> list[dict[str, Any]]:
    if not GRUPOS_PATH.exists():
        return []
    with GRUPOS_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, list) else []


def salvar_grupos(grupos: list[dict[str, Any]]) -> None:
    grupos_ordenados = sorted(grupos, key=lambda g: g.get("caminho", ""))
    GRUPOS_PATH.write_text(
        json.dumps(grupos_ordenados, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# Operações individuais
# ---------------------------------------------------------------------------

def op_criar_pasta(op: dict[str, Any]) -> dict[str, Any]:
    caminho = op.get("caminho", "")
    pasta = REPO_DIR / caminho
    pasta.mkdir(parents=True, exist_ok=True)
    return {"tipo": "criar_pasta", "caminho": caminho, "ok": True}


def op_criar_gitkeep(op: dict[str, Any]) -> dict[str, Any]:
    caminho = op.get("caminho", "")
    gitkeep = REPO_DIR / caminho / ".gitkeep"
    gitkeep.parent.mkdir(parents=True, exist_ok=True)
    gitkeep.write_text("", encoding="utf-8")
    return {"tipo": "criar_gitkeep", "caminho": caminho, "ok": True}


def op_mover(op: dict[str, Any]) -> dict[str, Any]:
    origem_rel = op.get("origem", "")
    destino_rel = op.get("destino", "")
    origem = REPO_DIR / origem_rel
    destino = REPO_DIR / destino_rel

    if not origem.exists():
        raise ErroHelper(f"mover: origem não encontrada: {origem_rel}")

    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(origem), str(destino))
    return {"tipo": "mover", "origem": origem_rel, "destino": destino_rel, "ok": True}


def op_atualizar_frontmatter(op: dict[str, Any]) -> dict[str, Any]:
    arquivo_rel = op.get("arquivo", "")
    campos = op.get("campos", {})
    arquivo = REPO_DIR / arquivo_rel

    if not arquivo.exists():
        raise ErroHelper(f"atualizar_frontmatter: arquivo não encontrado: {arquivo_rel}")
    if not campos:
        return {"tipo": "atualizar_frontmatter", "arquivo": arquivo_rel, "ok": True, "aviso": "nenhum campo informado"}

    fm, corpo = ler_partes(arquivo)
    fm.update(campos)
    escrever_partes(arquivo, fm, corpo)
    return {"tipo": "atualizar_frontmatter", "arquivo": arquivo_rel, "campos": campos, "ok": True}


def op_atualizar_topicos_json(op: dict[str, Any]) -> dict[str, Any]:
    conteudo = op.get("conteudo")
    if conteudo is None:
        raise ErroHelper("atualizar_topicos_json: campo 'conteudo' ausente.")
    TOPICOS_PATH.write_text(
        json.dumps(conteudo, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return {"tipo": "atualizar_topicos_json", "ok": True}


def op_atualizar_grupos_json_entrada(op: dict[str, Any]) -> dict[str, Any]:
    entrada = op.get("entrada", {})
    caminho = entrada.get("caminho", "")
    if not caminho:
        raise ErroHelper("atualizar_grupos_json_entrada: campo 'entrada.caminho' ausente.")
    grupos = carregar_grupos()
    grupos = [g for g in grupos if g.get("caminho") != caminho]
    grupos.append(entrada)
    salvar_grupos(grupos)
    return {"tipo": "atualizar_grupos_json_entrada", "caminho": caminho, "ok": True}


def op_remover_grupos_json_entrada(op: dict[str, Any]) -> dict[str, Any]:
    caminho = op.get("caminho", "")
    if not caminho:
        raise ErroHelper("remover_grupos_json_entrada: campo 'caminho' ausente.")
    grupos = carregar_grupos()
    grupos_novos = [g for g in grupos if g.get("caminho") != caminho]
    salvar_grupos(grupos_novos)
    removido = len(grupos) != len(grupos_novos)
    return {"tipo": "remover_grupos_json_entrada", "caminho": caminho, "ok": True, "removido": removido}


def op_remover_pasta_vazia(op: dict[str, Any]) -> dict[str, Any]:
    caminho = op.get("caminho", "")
    pasta = REPO_DIR / caminho
    if not pasta.exists():
        return {"tipo": "remover_pasta_vazia", "caminho": caminho, "ok": True, "aviso": "pasta já inexistente"}
    arquivos = list(pasta.iterdir())
    nao_gitkeep = [a for a in arquivos if a.name != ".gitkeep"]
    if nao_gitkeep:
        raise ErroHelper(
            f"remover_pasta_vazia: pasta não está vazia (arquivos além de .gitkeep): {[a.name for a in nao_gitkeep]}"
        )
    shutil.rmtree(str(pasta))
    return {"tipo": "remover_pasta_vazia", "caminho": caminho, "ok": True}


HANDLERS: dict[str, Any] = {
    "criar_pasta": op_criar_pasta,
    "criar_gitkeep": op_criar_gitkeep,
    "mover": op_mover,
    "atualizar_frontmatter": op_atualizar_frontmatter,
    "atualizar_topicos_json": op_atualizar_topicos_json,
    "atualizar_grupos_json_entrada": op_atualizar_grupos_json_entrada,
    "remover_grupos_json_entrada": op_remover_grupos_json_entrada,
    "remover_pasta_vazia": op_remover_pasta_vazia,
}


# ---------------------------------------------------------------------------
# Comando
# ---------------------------------------------------------------------------

def comando_executar(args: argparse.Namespace) -> int:
    try:
        payload: list[dict[str, Any]] = json.loads(args.payload)
    except json.JSONDecodeError as exc:
        raise ErroHelper(f"Payload JSON inválido: {exc}") from exc

    if not isinstance(payload, list):
        raise ErroHelper("Payload deve ser um array JSON de operações.")

    resultados: list[dict[str, Any]] = []
    for i, op in enumerate(payload):
        tipo = op.get("tipo", "")
        handler = HANDLERS.get(tipo)
        if handler is None:
            resultados.append({"tipo": tipo, "ok": False, "erro": f"Tipo de operação desconhecido: {tipo!r}"})
            continue
        try:
            resultado = handler(op)
            resultados.append(resultado)
        except ErroHelper as exc:
            resultados.append({"tipo": tipo, "ok": False, "erro": str(exc), "indice": i})

    total = len(resultados)
    sucessos = sum(1 for r in resultados if r.get("ok"))
    saida = {
        "ok": sucessos == total,
        "total": total,
        "sucessos": sucessos,
        "falhas": total - sucessos,
        "resultados": resultados,
    }
    print(json.dumps(saida, ensure_ascii=False, indent=2))
    return 0 if saida["ok"] else 1


# ---------------------------------------------------------------------------
# Parser e main
# ---------------------------------------------------------------------------

def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Helper da skill reorganizar-topicos: executa operações de reorganização em lote."
    )
    subparsers = parser.add_subparsers(dest="comando", required=True)

    executar = subparsers.add_parser(
        "executar",
        help="Executa um array JSON de operações de reorganização.",
    )
    executar.add_argument(
        "--payload",
        required=True,
        help="Array JSON de operações a executar.",
    )
    executar.set_defaults(func=comando_executar)

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
