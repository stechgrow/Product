"""Endpoints for data quality and cleaning."""
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends

from app.core.config import settings
from app.schemas.cleaning import CleanResponse, QualityReport
from app.services import cleaning
from .deps import get_dataframe

router = APIRouter(prefix="/cleaning", tags=["Data Cleaning"])


@router.get("/{dataset_id}/report", response_model=QualityReport)
def quality_report(df: pd.DataFrame = Depends(get_dataframe)):
    """The 7 checks + a 0-100 quality score. Changes nothing."""
    return cleaning.quality_report(df)


@router.post("/{dataset_id}/apply", response_model=CleanResponse)
def apply_cleaning(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    """Clean a COPY, save it separately, and return the change log + before/after."""
    cleaned, log = cleaning.clean_dataset(df)
    settings.cleaned_dir.mkdir(parents=True, exist_ok=True)
    out_name = f"{Path(dataset_id).stem}_cleaned.csv"
    cleaned.to_csv(settings.cleaned_dir / out_name, index=False)
    return {"before": cleaning.quality_metrics(df), "after": cleaning.quality_metrics(cleaned),
            "change_log": log, "cleaned_file": out_name}
