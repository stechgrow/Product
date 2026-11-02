"""Response shapes shared by several screens."""
from typing import Dict, List, Optional

from pydantic import BaseModel


class DetectedColumn(BaseModel):
    column: str
    confidence: float
    status: Optional[str] = None     # auto / review / confirmed


class KpiMetric(BaseModel):
    value: Optional[float] = None            # None = not available for this file
    change_percent: Optional[float] = None   # vs previous period, None if unknown


class ShareChart(BaseModel):                 # pie / gauge charts
    labels: List[str]
    values: List[Optional[float]]
    percent: List[float]


class Series(BaseModel):
    name: str
    values: List[Optional[float]]


class GroupedChart(BaseModel):               # bar / line charts by year
    categories: List[str]
    series: List[Series]


DetectedColumns = Dict[str, DetectedColumn]
