import logging
from fastapi import APIRouter, HTTPException

from app.modules.ai_services import anomaly, opportunities, recommendations, root_cause
from app.modules.ai_services.common import InsufficientDataError, prepare
from app.modules.ai_services.schemas import (AnomalyResponse, DatasetPayload,
                                              OpportunityResponse, RCARequest,
                                              RCAResponse, RecommendationResponse)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/ai", tags=["AI Services"])
# TODO: add Depends(get_current_user) once Rohita's auth is merged


def _guard(fn):
    try:
        return fn()
    except InsufficientDataError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        logger.exception("AI service failure")
        raise HTTPException(status_code=500, detail="AI analysis failed")  # no stack trace to client


@router.post("/anomalies", response_model=AnomalyResponse)
def anomalies(p: DatasetPayload):
    def run():
        df, dropped = prepare(p)
        items, notes = anomaly.detect(df, p.columns, p.freq)
        return {"anomalies": items, "rows_dropped": dropped, "notes": notes}
    return _guard(run)


@router.post("/recommendations", response_model=RecommendationResponse)
def recs(p: DatasetPayload):
    def run():
        df, _ = prepare(p)
        items, notes = recommendations.build(df, p.columns, p.freq, p.use_llm)
        return {"recommendations": items, "notes": notes}
    return _guard(run)


@router.post("/opportunities", response_model=OpportunityResponse)
def opps(p: DatasetPayload):
    def run():
        df, _ = prepare(p)
        items, notes = opportunities.detect(df, p.columns, p.freq)
        return {"opportunities": items, "notes": notes}
    return _guard(run)


@router.post("/root-cause", response_model=RCAResponse)
def rca(p: RCARequest):
    def run():
        df, _ = prepare(p)
        return root_cause.analyze(df, p.columns, p.freq, p.target_period, p.use_llm)
    return _guard(run)