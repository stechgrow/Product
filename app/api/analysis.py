"""Endpoints for the Data Analysis screen."""
from typing import Literal

import pandas as pd
from fastapi import APIRouter, Depends, Query

from app.schemas.analysis import AffectedRow, InsightsResponse, KpiResponse
from app.services import cleaning, insights as insight_service, kpis
from .deps import get_dataframe, get_mapping

router = APIRouter(prefix="/analysis", tags=["Data Analysis"])

GROWTH_LIMIT = 5.0  # +/-5% revenue change = Growth/Decline (threshold needs team-lead approval)


@router.get("/{dataset_id}/kpis", response_model=KpiResponse)
def analysis_kpis(period: Literal["all", "week", "month", "year"] = Query("all"),
                  df: pd.DataFrame = Depends(get_dataframe), mapping: dict = Depends(get_mapping)):
    """Revenue, Orders, Conversion Rate, Avg Order Value (+ change vs previous period)."""
    result = kpis.kpis_with_change(df, mapping, period)
    change = result["metrics"]["total_sales"]["change_percent"]
    status = None if change is None else "Growth" if change > GROWTH_LIMIT else "Decline" if change < -GROWTH_LIMIT else "Stable"
    return {"period": period, "period_note": result["period_note"], "business_status": status,
            "metrics": result["metrics"], "notes": result["notes"], "detected_columns": mapping}


@router.get("/{dataset_id}/insights", response_model=InsightsResponse)
def analysis_insights(df: pd.DataFrame = Depends(get_dataframe), mapping: dict = Depends(get_mapping)):
    """Top insights, problems & risks, growth opportunities (each with its evidence)."""
    return insight_service.build_insights(df, mapping)


@router.get("/{dataset_id}/affected", response_model=list[AffectedRow])
def affected_datasets(df: pd.DataFrame = Depends(get_dataframe)):
    """The 'Affected Datasets' table: issue, count, suggested fix (this file only)."""
    return [{"issue": c["name"], "count": c["issue_count"], "severity": c["severity"],
             "suggestion": c["suggestion"]}
            for c in cleaning.run_checks(df) if c["issue_count"] > 0]
