"""Local JSON storage for the MVP."""

import json
from pathlib import Path
from typing import Any

from app.core.config import STORAGE_DIR


def save(dataset_id: str, rows: list[dict[str, Any]], metadata: dict[str, Any]) -> None:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    (STORAGE_DIR / f"{dataset_id}.json").write_text(json.dumps(rows, default=str), encoding="utf-8")
    (STORAGE_DIR / f"{dataset_id}.meta.json").write_text(json.dumps(metadata), encoding="utf-8")


def get_rows(dataset_id: str) -> list[dict[str, Any]] | None:
    path = STORAGE_DIR / f"{dataset_id}.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


def history() -> list[dict[str, Any]]:
    if not STORAGE_DIR.exists():
        return []
    return [json.loads(path.read_text(encoding="utf-8")) for path in STORAGE_DIR.glob("*.meta.json")]
