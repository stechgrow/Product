"""Remembers the user's column choices, one small JSON file per dataset.

TODAY: files in data/mappings/.   LATER: swap these 3 functions to save in Om's database.
"""
import json
from pathlib import Path as _Path

from app.core.config import settings


def _path(dataset_id: str):
    safe_id = _Path(dataset_id).name
    return settings.mapping_dir / f"{safe_id}.json"


def load(dataset_id: str) -> dict:
    """Saved choices like {'revenue': 'Total', 'discount': None}. Empty if none/corrupt."""
    try:
        data = json.loads(_path(dataset_id).read_text())
        return data if isinstance(data, dict) else {}
    except (FileNotFoundError, ValueError):
        return {}


def save(dataset_id: str, overrides: dict) -> None:
    settings.mapping_dir.mkdir(parents=True, exist_ok=True)
    _path(dataset_id).write_text(json.dumps(overrides, indent=2))


def clear(dataset_id: str) -> None:
    _path(dataset_id).unlink(missing_ok=True)
