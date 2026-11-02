"""Endpoint for the Dashboard screen."""
from typing import Literal

import pandas as pd
from fastapi import APIRouter, Depends, Query

from app.schemas.dashboard import DashboardResponse
from app.services import charts, kpis
from .deps import get_dataframe, get_mapping

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/{dataset_id}", response_model=DashboardResponse)
def dashboard(period: Literal["all", "week", "month", "year"] = Query("all"),
              df: pd.DataFrame = Depends(get_dataframe), mapping: dict = Depends(get_mapping)):
    """KPI cards + all 6 charts. 'period' is the 'Show dashboard by' dropdown."""
    result = kpis.kpis_with_change(df, mapping, period)
    chart_data, unavailable = charts.build_charts(result["current_df"], mapping)
    return {"period": period, "period_note": result["period_note"],
            "kpis": result["metrics"], "charts": chart_data, "unavailable": unavailable,
            "notes": result["notes"], "detected_columns": mapping}
