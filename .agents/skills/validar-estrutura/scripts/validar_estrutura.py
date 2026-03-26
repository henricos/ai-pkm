#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[4]
TOPICOS_PATH = ROOT / "sistema" / "indices" / "topicos.json"
GRUPOS_PATH = ROOT / "sistema" / "indices" / "grupos.json"
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
    parts = path.parts
    if not parts or not parts[0].startswith("_"):
        return None

    root_topic = parts[0][1:]
    if len(parts) >= 2 and parts[1].startswith("_"):
        return f"{root_topic}/{parts[1][1:]}"
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

    expected_root_dirs = {f"_{topic_id}" for topic_id in root_topics}
    actual_root_dirs = {
        path.name
        for path in ROOT.iterdir()
        if path.is_dir() and path.name.startswith("_") and path.name != "__inbox"
    }

    for missing in sorted(expected_root_dirs - actual_root_dirs):
        issues.append(Issue("erro", missing, "Tópico da taxonomia sem pasta correspondente na raiz."))

    for extra in sorted(actual_root_dirs - expected_root_dirs):
        issues.append(Issue("erro", extra, "Pasta de tópico não consta em topicos.json."))

    inbox = ROOT / "__inbox"
    if inbox.exists():
        inbox_visible = [item for item in inbox.iterdir() if item.name != ".gitkeep"]
        if not inbox_visible and not (inbox / ".gitkeep").exists():
            issues.append(Issue("erro", "__inbox", "Inbox vazia sem .gitkeep."))

    for topic_dir_name in expected_root_dirs & actual_root_dirs:
        topic_dir = ROOT / topic_dir_name
        visible = [item for item in topic_dir.iterdir() if item.name != ".gitkeep"]
        if not visible and not (topic_dir / ".gitkeep").exists():
            issues.append(Issue("erro", topic_dir_name, "Tópico raiz vazio sem .gitkeep."))

    expected_groups: list[dict[str, str]] = []
    topic_binary_files: set[Path] = set()

    for path in sorted(ROOT.glob("_*/**/*")):
        if not path.is_file() or path.name == ".gitkeep":
            continue
        if path.suffix == ".md":
            continue
        topic_binary_files.add(path)

    for md_path in sorted(ROOT.glob("_*/**/*.md")):
        relative = md_path.relative_to(ROOT)
        parts = relative.parts

        if parts[0] == "__inbox":
            continue

        check_markdown_for_embeds(md_path, issues)

        if len(parts) >= 3 and parts[1].startswith("_") and md_path.name == "_grupo.md":
            issues.append(Issue("erro", relative.as_posix(), "Grupo não pode existir dentro de subtópico."))

        if md_path.name == "_grupo.md":
            if len(parts) != 3:
                issues.append(Issue("erro", relative.as_posix(), "_grupo.md deve viver em _[topico]/[grupo]/_grupo.md."))
                continue

            root_topic_dir, group_dir_name, _ = parts
            if group_dir_name.startswith("_"):
                issues.append(Issue("erro", relative.as_posix(), "Grupo não pode usar prefixo _."))

            frontmatter, error = parse_frontmatter(md_path)
            if frontmatter is None:
                issues.append(Issue("erro", relative.as_posix(), error))
                continue

            missing_fields = [field for field in ("descricao", "topico") if field not in frontmatter]
            for field in missing_fields:
                issues.append(Issue("erro", relative.as_posix(), f"_grupo.md sem campo obrigatório `{field}`."))

            extra_temporal = sorted(TEMPORAL_GROUP_FIELDS & set(frontmatter))
            for field in extra_temporal:
                issues.append(Issue("erro", relative.as_posix(), f"Grupo não pode declarar campo temporal `{field}`."))

            expected_topic = root_topic_dir[1:]
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

        for field in ("descricao", "topico"):
            if field not in frontmatter:
                issues.append(Issue("erro", relative.as_posix(), f"Arquivo de conhecimento sem campo obrigatório `{field}`."))

        topic_value = frontmatter.get("topico")
        if topic_value and topic_value not in valid_topic_values:
            issues.append(Issue("erro", relative.as_posix(), f"Valor de `topico` inválido: `{topic_value}`."))

        expected_topic = expected_topic_from_path(relative)
        if topic_value and expected_topic and topic_value != expected_topic:
            issues.append(
                Issue(
                    "erro",
                    relative.as_posix(),
                    f"Valor de `topico` diverge do caminho: esperado `{expected_topic}`, encontrado `{topic_value}`.",
                )
            )

        # Verificação bidirecional: prefixo url_ × tipo: url
        has_url_prefix = md_path.name.startswith("url_")
        tipo_value = frontmatter.get("tipo")
        if has_url_prefix and tipo_value != "url":
            issues.append(
                Issue(
                    "erro",
                    relative.as_posix(),
                    f"Arquivo com prefixo `url_` deve ter `tipo: url` no frontmatter (encontrado: `tipo: {tipo_value}`).",
                )
            )
        if tipo_value == "url" and not has_url_prefix:
            issues.append(
                Issue(
                    "erro",
                    relative.as_posix(),
                    "Arquivo com `tipo: url` no frontmatter deve ter prefixo `url_` no nome do arquivo.",
                )
            )

        # Verificação de maturidade: obrigatório em tipo: nota, proibido em tipo: url
        maturidade_value = frontmatter.get("maturidade")
        VALID_MATURIDADE = {"rascunho", "maduro"}
        if tipo_value == "nota":
            if maturidade_value is None:
                issues.append(
                    Issue(
                        "erro",
                        relative.as_posix(),
                        "Arquivo `tipo: nota` sem campo obrigatório `maturidade`.",
                    )
                )
            elif maturidade_value not in VALID_MATURIDADE:
                issues.append(
                    Issue(
                        "erro",
                        relative.as_posix(),
                        f"Valor inválido para `maturidade`: `{maturidade_value}`. Valores permitidos: rascunho | maduro.",
                    )
                )
        if tipo_value == "url" and maturidade_value is not None:
            issues.append(
                Issue(
                    "erro",
                    relative.as_posix(),
                    "Arquivo `tipo: url` não deve conter o campo `maturidade`.",
                )
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
        topic_dir = ROOT / f"_{topic_dir_name}"
        if not topic_dir.exists():
            continue

        for child in sorted(topic_dir.iterdir()):
            if not child.is_dir() or not child.name.startswith("_"):
                continue
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
                "sistema/indices/grupos.json",
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
