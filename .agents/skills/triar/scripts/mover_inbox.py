#!/usr/bin/env python3
"""Helper da skill /triar — move itens da __inbox/ para o destino com frontmatter.

Uso:
    python3 mover_inbox.py '<json>'

Onde <json> é uma lista de objetos com os campos descritos na SKILL.md.
"""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_DIR = SCRIPT_DIR.parents[3]


# ---------------------------------------------------------------------------
# Operações por tipo
# ---------------------------------------------------------------------------

def mover_markdown(item: dict) -> dict:
    """Escreve frontmatter + corpo no destino e remove a origem."""
    origem = REPO_DIR / item["origem"]
    destino = REPO_DIR / item["destino"]
    frontmatter = item["frontmatter"].strip()

    if not origem.exists():
        return _erro(item["origem"], f"arquivo não encontrado: {origem}")

    corpo = origem.read_text(encoding="utf-8")
    conteudo_final = f"---\n{frontmatter}\n---\n\n{corpo.lstrip()}"

    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(conteudo_final, encoding="utf-8")
    origem.unlink()

    return _ok(item["origem"], item["destino"])


def mover_binario(item: dict) -> dict:
    """Move o binário para o destino e cria o sidecar .md adjacente."""
    origem = REPO_DIR / item["origem"]
    destino = REPO_DIR / item["destino"]
    sidecar_destino = REPO_DIR / item["sidecar_destino"]
    sidecar_frontmatter = item["sidecar_frontmatter"].strip()

    if not origem.exists():
        return _erro(item["origem"], f"arquivo não encontrado: {origem}")

    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(origem), str(destino))

    sidecar_conteudo = f"---\n{sidecar_frontmatter}\n---\n"
    sidecar_destino.write_text(sidecar_conteudo, encoding="utf-8")

    return _ok(item["origem"], item["destino"])


# ---------------------------------------------------------------------------
# Helpers de resultado
# ---------------------------------------------------------------------------

def _ok(origem: str, destino: str) -> dict:
    return {"origem": origem, "status": "ok", "destino": destino}


def _erro(origem: str, mensagem: str) -> dict:
    return {"origem": origem, "status": "erro", "mensagem": mensagem}


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"erro": "uso: mover_inbox.py '<json>'"}, ensure_ascii=False))
        sys.exit(1)

    try:
        itens: list[dict] = json.loads(sys.argv[1])
    except json.JSONDecodeError as e:
        print(json.dumps({"erro": f"JSON inválido: {e}"}, ensure_ascii=False))
        sys.exit(1)

    resultados = []
    for item in itens:
        try:
            tipo = item.get("tipo", "markdown")
            if tipo == "binario":
                resultados.append(mover_binario(item))
            else:
                resultados.append(mover_markdown(item))
        except Exception as e:  # noqa: BLE001
            resultados.append(_erro(item.get("origem", "?"), str(e)))

    print(json.dumps(resultados, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
