"""Response shapes for the Automated EDA screen."""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class Distribution(BaseModel):
    """Histogram data for a numeric column — powers the sparkline/bar charts in the Figma."""
    bins: List[float]    # bin edges (len = counts + 1)
    counts: List[int]   # number of values in each bin


class EDASummary(BaseModel):
    total_rows: int
    total_columns: int
    numeric_columns: int
    categorical_columns: int
    datetime_columns: int
    other_columns: int
    numeric_mean: Optional[float] = None
    numeric_median: Optional[float] = None
    average_correlation: Optional[float] = None
    missing_cells: int
    missing_percent: float
    rows_with_missing: int
    duplicate_rows: int


class ColumnDetail(BaseModel):
    column: str
    dtype: str
    kind: str
    sample: Optional[str] = None
    missing_count: int
    missing_percent: float
    mean: Optional[float] = None
    median: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    std: Optional[float] = None
    distribution: Optional[Distribution] = None   # GAP 3: histogram for numeric columns


class TopAnomalyColumn(ColumnDetail):
    """Same shape as ColumnDetail + outlier_count badge (Figma Top Anomalies tab)."""
    outlier_count: int = 0


class MissingChart(BaseModel):
    """Chart-ready data for the EDA missing-values line/area chart."""
    labels: List[str]    # column names that have missing values
    values: List[int]    # missing count for each column
    total: int
    total_percent: float


class CorrelationMatrix(BaseModel):
    labels: List[str]
    matrix: List[List[Optional[float]]]


class Anomaly(BaseModel):
    """Raw IQR outlier stats — kept for the /anomalies sub-endpoint."""
    column: str
    count: int
    lower_bound: float
    upper_bound: float
    examples: List[Optional[float]]


class EDAOverview(BaseModel):
    summary: EDASummary
    columns: List[ColumnDetail]            # Dataset Details tab
    top_anomaly_columns: List[TopAnomalyColumn]  # GAP 2: Top Anomalies tab (same shape)
    missing_chart: MissingChart            # GAP 1: line chart data
    correlation: CorrelationMatrix
    anomalies: List[Anomaly]               # raw IQR stats (kept for internal use)
