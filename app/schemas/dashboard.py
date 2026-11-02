"""Response shapes for the Dashboard screen."""
from typing import Dict, List, Optional

from pydantic import BaseModel

from .common import DetectedColumns, GroupedChart, KpiMetric, ShareChart


class DashboardCharts(BaseModel):
    sales_by_product: Optional[ShareChart] = None
    sales_by_product_yearly: Optional[GroupedChart] = None
    discounted_brands: Optional[ShareChart] = None
    sales_by_country: Optional[ShareChart] = None
    sales_by_country_yearly: Optional[GroupedChart] = None
    sales_by_segment: Optional[ShareChart] = None


class DashboardResponse(BaseModel):
    period: str
    period_note: Optional[str] = None
    kpis: Dict[str, KpiMetric]
    charts: DashboardCharts
    unavailable: Dict[str, str]               # chart name -> why it can't be drawn
    notes: List[str]
    detected_columns: DetectedColumns
