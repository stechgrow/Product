from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


class ColumnMap(BaseModel):
    value_col: str                       # numeric metric (revenue, sales...)
    date_col: Optional[str] = None
    dimension_col: Optional[str] = None  # region / segment / product
    customer_col: Optional[str] = None


class DatasetPayload(BaseModel):
    records: list[dict[str, Any]] = Field(..., min_length=1)
    columns: ColumnMap
    freq: Literal["D", "W", "M"] = "M"
    drop_last_period: bool = False       # set True if the last period is incomplete
    use_llm: bool = True


class RCARequest(DatasetPayload):
    target_period: Optional[str] = None  # e.g. "2025-12"; defaults to latest


class AnomalyItem(BaseModel):
    kind: Literal["time_series", "row_outlier"]
    series: str
    period: Optional[str] = None
    observed: Optional[float] = None
    expected: Optional[float] = None
    deviation_pct: Optional[float] = None
    robust_z: Optional[float] = None
    severity: Literal["medium", "high"]
    summary: str
    evidence: dict[str, Any] = {}


class AnomalyResponse(BaseModel):
    anomalies: list[AnomalyItem]
    rows_dropped: int
    notes: list[str] = []


class Recommendation(BaseModel):
    title: str
    category: str
    priority: Literal["low", "medium", "high"]
    action: str
    evidence: dict[str, Any]
    explanation: str
    explanation_source: Literal["llm", "template"]


class RecommendationResponse(BaseModel):
    recommendations: list[Recommendation]
    notes: list[str] = []


class Opportunity(BaseModel):
    segment: str
    type: str
    score: float
    summary: str
    evidence: dict[str, Any]


class OpportunityResponse(BaseModel):
    opportunities: list[Opportunity]
    notes: list[str] = []


class Driver(BaseModel):
    factor: str
    contribution: float
    share_of_change_pct: Optional[float]
    evidence: dict[str, Any]


class RCAResponse(BaseModel):
    target_period: str
    baseline_period: str
    baseline_total: float
    target_total: float
    total_change: float
    total_change_pct: Optional[float]
    volume_effect: float
    value_effect: float
    drivers: list[Driver]
    explanation: str
    explanation_source: Literal["llm", "template"]
    notes: list[str] = []