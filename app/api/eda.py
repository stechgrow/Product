"""Endpoints for the Automated Exploratory Data Analysis screen."""
import pandas as pd
from fastapi import APIRouter, Depends

from app.schemas.eda import (
    Anomaly, ColumnDetail, CorrelationMatrix, EDAOverview,
    EDASummary, MissingChart, TopAnomalyColumn,
)
from app.services import cleaning, profiling
from .deps import get_dataframe

router = APIRouter(prefix="/eda", tags=["EDA"])


@router.get("/{dataset_id}", response_model=EDAOverview)
def eda_overview(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    """Everything the Automated EDA screen needs in one call.

    Returns:
      - summary          → Data Summary card + Numeric/Categorical/Datetime counts
      - columns          → Dataset Details tab (all columns)
      - top_anomaly_columns → Top Anomalies tab (same shape, filtered to outlier columns)
      - missing_chart    → Missing Values line/area chart data
      - correlation      → Heatmap labels + matrix
      - anomalies        → Raw IQR outlier stats (for internal use / badges)
    """
    return {
        "summary": profiling.dataset_summary(df),
        "columns": profiling.column_details(df),
        "top_anomaly_columns": cleaning.find_anomaly_columns(df),
        "missing_chart": profiling.missing_chart(df),
        "correlation": profiling.correlation_matrix(df),
        "anomalies": cleaning.find_outliers(df),
    }


@router.get("/{dataset_id}/summary", response_model=EDASummary)
def eda_summary(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    return profiling.dataset_summary(df)


@router.get("/{dataset_id}/columns", response_model=list[ColumnDetail])
def eda_columns(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    return profiling.column_details(df)


@router.get("/{dataset_id}/missing_chart", response_model=MissingChart)
def eda_missing_chart(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    """Chart-ready data for the EDA missing-values line/area chart.
    Returns {labels, values, total, total_percent} sorted by most-missing first.
    """
    return profiling.missing_chart(df)


@router.get("/{dataset_id}/top_anomalies", response_model=list[TopAnomalyColumn])
def eda_top_anomalies(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    """Top Anomalies tab: same ColumnDetail shape but only for columns with outliers.
    Each row also carries outlier_count so the frontend can show a badge.
    """
    return cleaning.find_anomaly_columns(df)


@router.get("/{dataset_id}/correlation", response_model=CorrelationMatrix)
def eda_correlation(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    return profiling.correlation_matrix(df)


@router.get("/{dataset_id}/anomalies", response_model=list[Anomaly])
def eda_anomalies(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    """Raw IQR outlier stats per column (lower_bound, upper_bound, examples)."""
    return cleaning.find_outliers(df)
