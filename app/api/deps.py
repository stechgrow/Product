"""Shared dependency: turns a dataset_id into a pandas table.

TODAY: dataset_id is a file name inside data/uploads/.
LATER:  replace the body with a lookup through Om's database/Athen's upload
        (everything else in the project stays the same).
"""
from pathlib import Path

import pandas as pd
from fastapi import Depends, HTTPException

from app.core.config import settings
from app.services import mapping_store
from app.services.column_mapper import detect_columns
from app.services.dataset_loader import DatasetLoadError, DatasetNotFoundError, load_dataset


def get_dataframe(dataset_id: str) -> pd.DataFrame:
    # Block path tricks like '../secret.csv'
    if Path(dataset_id).name != dataset_id:
        raise HTTPException(status_code=400, detail="Invalid dataset id")
    try:
        return load_dataset(settings.upload_dir / dataset_id)
    except DatasetNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except DatasetLoadError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


def get_mapping(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)) -> dict:
    """Which column means what: our guess, overridden by anything the user confirmed."""
    return detect_columns(df, mapping_store.load(dataset_id))
