"""Response shapes for the Data Analysis screen."""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from .common import DetectedColumns, KpiMetric


class KpiResponse(BaseModel):
    period: str
    period_note: Optional[str] = None
    business_status: Optional[str] = None     # Growth / Stable / Decline (needs a date column)
    metrics: Dict[str, KpiMetric]
    notes: List[str]
    detected_columns: DetectedColumns


class Finding(BaseModel):
    key: str
    statement: str
    evidence: Dict[str, Any]
    limitations: Optional[str] = None


class InsightsResponse(BaseModel):
    insights: List[Finding]
    problems: List[Finding]
    opportunities: List[Finding]
    unavailable: List[str]


class AffectedRow(BaseModel):
    issue: str
    count: int
    severity: str
    suggestion: str
