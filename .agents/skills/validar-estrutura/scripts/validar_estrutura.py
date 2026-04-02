#!/usr/bin/env python3
"""Helper da skill /validar-estrutura — valida coerência estrutural do repositório PKM.

Helper auto-suficiente — sem arquivos externos de dependências.

Regras para manutenção:
- Dependências de terceiros instaladas em `scripts/.venv` (criado automaticamente).
  Nunca usar pip global. O site-packages do venv é injetado em sys.path antes do import.
- Importar dependências de terceiros sob demanda, nunca incondicionalmente no topo.
- Toda instalação emite log em stderr antes de executar (ex: "[helper] instalando pyyaml...").
- Stdlib primeiro: só recorrer a terceiros quando a implementação própria tiver custo alto.

Uso:
    python3 .agents/skills/validar-estrutura/scripts/validar_estrutura.py
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from dataclasses import dataclass
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


ROOT = Path(__file__).resolve().parents[4]
PKM_DIR = ROOT / "pkm"
TOPICOS_PATH = ROOT / "index" / "topicos.json"
GRUPOS_PATH = ROOT / "index" / "grupos.json"
TEMPORAL_GROUP_FIELDS = {"deadline", "status", "data_inicio"}
EMBED_PATTERNS = (
    re.compile(r"!\[\[[^\]]+\]\]"),
    re.compile(r"!\[[^\]]*\]\([^)]+\)"),
)


@dataclass
class Issue:
    kind: str
    path: str
    message: str


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def parse_frontmatter(path: Path) -> tuple[dict[str, Any] | None, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return None, "Arquivo sem frontmatter YAML no início."

    parts = text.split("---\n", 2)
    if len(parts) < 3:
        return None, "Frontmatter YAML incompleto."

    try:
        frontmatter = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError as exc:
        return None, f"Frontmatter YAML inválido: {exc}"

    if not isinstance(frontmatter, dict):
        return None, "Frontmatter deve ser um objeto YAML."

    return frontmatter, ""


def parse_skill_frontmatter(path: Path) -> tuple[dict[str, Any] | None, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return None, "SKILL.md sem frontmatter YAML no início."

    parts = text.split("\n---\n", 1)
    if len(parts) < 2:
        return None, "Frontmatter YAML de SKILL.md incompleto."

    frontmatter_text = parts[0][4:]

    try:
        frontmatter = yaml.safe_load(frontmatter_text) or {}
    except yaml.YAMLError as exc:
        return None, f"Frontmatter YAML inválido em SKILL.md: {exc}"

    if not isinstance(frontmatter, dict):
        return None, "Frontmatter de SKILL.md deve ser um objeto YAML."

    return frontmatter, ""


def expected_topic_from_path(path: Path) -> str | None:
    """Infere o valor esperado do campo `topico` a partir do caminho (relativo a ROOT).

    Estrutura nova: pkm/TOPICO/_GRUPO/arquivo.md ou pkm/TOPICO/_SUBTOPICO/arquivo.md
    - Grupos têm _grupo.md na pasta → arquivo pertence ao tópico raiz.
    - Subtópicos não têm _grupo.md → arquivo pertence a topico/subtopico.
    """
    parts = path.parts  # relative to ROOT
    if len(parts) < 2 or parts[0] != "pkm":
        return None

    root_topic = parts[1]
    if root_topic.startswith(("_", ".")):
        return None  # __inbox, hidden dirs

    # Check if there's a _* dir at level 2 (could be subtopic or group)
    if len(parts) >= 4 and parts[2].startswith("_"):
        second_dir = PKM_DIR / parts[1] / parts[2]
        # Groups have _grupo.md → file belongs to root topic
        if (second_dir / "_grupo.md").exists():
            return root_topic
        else:
            # Subtopic → return topico/subtopico (strip _ prefix)
            return f"{root_topic}/{parts[2][1:]}"

    return root_topic


def relative_dir(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    return rel if rel.endswith("/") else f"{rel}/"


def is_sidecar(path: Path) -> bool:
    return path.name.endswith(".md") and len(path.suffixes) >= 2 and path.name != "_grupo.md"


def paired_binary_path(md_path: Path) -> Path:
    return md_path.with_name(md_path.name[:-3])


def check_markdown_for_embeds(path: Path, issues: list[Issue]) -> None:
    text = path.read_text(encoding="utf-8")
    for pattern in EMBED_PATTERNS:
        if pattern.search(text):
            issues.append(
                Issue(
                    "erro",
                    path.relative_to(ROOT).as_posix(),
                    "Embeddings de binários em Markdown não são permitidos.",
                )
            )
            return


def main() -> int:
    issues: list[Issue] = []
    topic_data = load_json(TOPICOS_PATH)
    groups_index = load_json(GRUPOS_PATH)

    for skill_path in sorted((ROOT / ".agents" / "skills").glob("*/SKILL.md")):
        frontmatter, error = parse_skill_frontmatter(skill_path)
        relative = skill_path.relative_to(ROOT).as_posix()
        if frontmatter is None:
            issues.append(Issue("erro", relative, error))
            continue

        for field in ("name", "description", "command"):
            if field not in frontmatter:
                issues.append(Issue("erro", relative, f"SKILL.md sem campo obrigatório `{field}`."))

    root_topics: dict[str, dict[str, str]] = {}
    valid_topic_values: set[str] = set()
    for entry in topic_data:
        topic_id = entry["id"]
        root_topics[topic_id] = {sub["id"]: sub["descricao"] for sub in entry.get("subtopicos", [])}
        valid_topic_values.add(topic_id)
        for subtopic_id in root_topics[topic_id]:
            valid_topic_values.add(f"{topic_id}/{subtopic_id}")

    expected_root_dirs = {topic_id for topic_id in root_topics}
    actual_root_dirs = {
        path.name
        for path in PKM_DIR.iterdir()
        if path.is_dir() and not path.name.startswith(("_", "."))
    }

    for missing in sorted(expected_root_dirs - actual_root_dirs):
        issues.append(Issue("erro", missing, "Tópico da taxonomia sem pasta correspondente em pkm/."))

    for extra in sorted(actual_root_dirs - expected_root_dirs):
        issues.append(Issue("erro", extra, "Pasta de tópico não consta em topicos.json."))

    inbox = PKM_DIR / "__inbox"
    if inbox.exists():
        inbox_visible = [item for item in inbox.iterdir() if item.name != ".gitkeep"]
        if not inbox_visible and not (inbox / ".gitkeep").exists():
            issues.append(Issue("erro", "pkm/__inbox", "Inbox vazia sem .gitkeep."))

    for topic_dir_name in expected_root_dirs & actual_root_dirs:
        topic_dir = PKM_DIR / topic_dir_name
        visible = [item for item in topic_dir.iterdir() if item.name != ".gitkeep"]
        if not visible and not (topic_dir / ".gitkeep").exists():
            issues.append(Issue("erro", topic_dir_name, "Tópico raiz vazio sem .gitkeep."))

    expected_groups: list[dict[str, str]] = []
    topic_binary_files: set[Path] = set()

    for path in sorted(PKM_DIR.glob("*/**/*")):
        rel = path.relative_to(PKM_DIR)
        if ".git" in rel.parts:
            continue
        if rel.parts[0] == "__inbox":
            continue
        if not path.is_file() or path.name == ".gitkeep":
            continue
        if path.suffix == ".md":
            continue
        topic_binary_files.add(path)

    for md_path in sorted(PKM_DIR.glob("*/**/*.md")):
        relative = md_path.relative_to(ROOT)
        parts = relative.parts
        # parts: ("pkm", topic_or_inbox, ...)

        if parts[1] == "__inbox":
            continue

        check_markdown_for_embeds(md_path, issues)

        if md_path.name == "_grupo.md":
            # Valid position: pkm/TOPICO/_GRUPO/_grupo.md (exactly 4 parts)
            if len(parts) != 4:
                issues.append(Issue("erro", relative.as_posix(), "_grupo.md deve viver em pkm/[topico]/_[grupo]/_grupo.md."))
                continue

            _, root_topic_dir, group_dir_name, _ = parts
            if not group_dir_name.startswith("_"):
                issues.append(Issue("erro", relative.as_posix(), "Pasta de grupo deve usar prefixo _."))

            frontmatter, error = parse_frontmatter(md_path)
            if frontmatter is None:
                issues.append(Issue("erro", relative.as_posix(), error))
                continue

            missing_fields = [field for field in ("descricao",) if field not in frontmatter]
            for field in missing_fields:
                issues.append(Issue("erro", relative.as_posix(), f"_grupo.md sem campo obrigatório `{field}`."))

            extra_temporal = sorted(TEMPORAL_GROUP_FIELDS & set(frontmatter))
            for field in extra_temporal:
                issues.append(Issue("erro", relative.as_posix(), f"Grupo não pode declarar campo temporal `{field}`."))

            expected_topic = root_topic_dir  # topic has no _ prefix
            actual_topic = frontmatter.get("topico")
            if actual_topic and actual_topic != expected_topic:
                issues.append(
                    Issue(
                        "erro",
                        relative.as_posix(),
                        f"Topico do grupo diverge do caminho: esperado `{expected_topic}`, encontrado `{actual_topic}`.",
                    )
                )

            group_entry = {
                "caminho": relative_dir(md_path.parent),
                "descricao": frontmatter.get("descricao", ""),
                "topico": frontmatter.get("topico", expected_topic),
            }
            if "ambito" in frontmatter:
                group_entry["ambito"] = frontmatter["ambito"]
            expected_groups.append(group_entry)
            continue

        if is_sidecar(md_path):
            binary_path = paired_binary_path(md_path)
            if not binary_path.exists():
                issues.append(Issue("erro", relative.as_posix(), "Sidecar sem arquivo binário correspondente."))
                continue

        frontmatter, error = parse_frontmatter(md_path)
        if frontmatter is None:
            issues.append(Issue("erro", relative.as_posix(), error))
            continue

        # Verificação de estado: obrigatório em todo arquivo de conhecimento
        estado_value = frontmatter.get("estado")
        VALID_ESTADO = {"rascunho", "finalizado"}
        if estado_value is None:
            issues.append(Issue("erro", relative.as_posix(), "Arquivo de conhecimento sem campo obrigatório `estado`."))
        elif estado_value not in VALID_ESTADO:
            issues.append(
                Issue(
                    "erro",
                    relative.as_posix(),
                    f"Valor inválido para `estado`: `{estado_value}`. Valores permitidos: rascunho | finalizado.",
                )
            )

        # Verificação de url: obrigatório em arquivos url_, proibido nos demais
        has_url_prefix = md_path.name.startswith("url_")
        url_value = frontmatter.get("url")
        if has_url_prefix and not url_value:
            issues.append(
                Issue("erro", relative.as_posix(), "Arquivo com prefixo `url_` deve ter campo `url` no frontmatter.")
            )
        if not has_url_prefix and url_value:
            issues.append(
                Issue("erro", relative.as_posix(), "Arquivo sem prefixo `url_` não deve ter campo `url` no frontmatter.")
            )

    for binary_path in sorted(topic_binary_files):
        relative = binary_path.relative_to(ROOT)
        expected_sidecar = binary_path.with_name(f"{binary_path.name}.md")
        if not expected_sidecar.exists():
            issues.append(
                Issue(
                    "erro",
                    relative.as_posix(),
                    "Arquivo binário de conhecimento sem sidecar obrigatório.",
                )
            )

    for topic_dir_name, subtopics in root_topics.items():
        topic_dir = PKM_DIR / topic_dir_name
        if not topic_dir.exists():
            continue

        for child in sorted(topic_dir.iterdir()):
            if not child.is_dir() or not child.name.startswith("_"):
                continue
            # Distinguish groups from subtopics: groups have _grupo.md
            if (child / "_grupo.md").exists():
                continue  # it's a group, not a subtopic
            subtopic_name = child.name[1:]
            if subtopic_name not in subtopics:
                issues.append(
                    Issue(
                        "erro",
                        child.relative_to(ROOT).as_posix(),
                        "Subtópico não consta em topicos.json para o tópico pai.",
                    )
                )

            nested_taxonomy_dirs = [item for item in child.iterdir() if item.is_dir() and item.name.startswith("_")]
            for nested in nested_taxonomy_dirs:
                issues.append(
                    Issue(
                        "erro",
                        nested.relative_to(ROOT).as_posix(),
                        "Terceiro nível taxonômico não é permitido.",
                    )
                )

    expected_groups_sorted = sorted(expected_groups, key=lambda item: item["caminho"])
    actual_groups_sorted = sorted(groups_index, key=lambda item: item["caminho"])
    if expected_groups_sorted != actual_groups_sorted:
        issues.append(
            Issue(
                "erro",
                "index/grupos.json",
                "Índice divergente do frontmatter dos arquivos _grupo.md.",
            )
        )

    if issues:
        print("Falhas encontradas:")
        for issue in issues:
            print(f"- [{issue.kind}] {issue.path}: {issue.message}")
        print(f"\nTotal: {len(issues)} problema(s).")
        return 1

    print("OK: estrutura, taxonomia, sidecars, frontmatter e índice de grupos estão coerentes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
