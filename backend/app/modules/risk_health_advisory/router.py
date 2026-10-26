import io
import pandas as pd
from fastapi import APIRouter, Query, Response, UploadFile, File, HTTPException
from typing import Optional, List, Dict, Any
from app.core.contracts import APIResponse
from app.modules.risk_health_advisory.fixtures.mock_data import (
    get_saas_dataset, get_ecommerce_dataset, get_sherly_eda_mock
)
from app.modules.risk_health_advisory.schemas import (
    RiskHealthSummary, TimeSeriesData, RiskItem, AIInsight,
    BusinessQuestionnaire, QuestionnaireSubmission, AdvisoryHubData
)
from app.modules.risk_health_advisory.risk_engine import RiskDetectionEngine
from app.modules.risk_health_advisory.health_engine import BusinessHealthEngine
from app.modules.risk_health_advisory.ai_profiler import AIProfilerService
from app.modules.risk_health_advisory.advisory_engine import AdvisoryEngine
from app.modules.risk_health_advisory.report_engine import ReportEngine

router = APIRouter(prefix="/api/v1", tags=["Risk, Business Health & Advisory"])

# In-memory dataset cache for active session / uploaded datasets
_uploaded_datasets: Dict[str, pd.DataFrame] = {}
_active_user_answers: Dict[str, Any] = {}
_active_dataset_id: str = "saas"

def resolve_dataset(sample_name: Optional[str] = "saas") -> pd.DataFrame:
    """Resolves dataset from uploaded cache or sample fixtures."""
    global _active_dataset_id
    key = sample_name or _active_dataset_id
    if key in _uploaded_datasets:
        return _uploaded_datasets[key]
    if key == "ecommerce":
        return get_ecommerce_dataset()
    return get_saas_dataset()

# ----------------- File Upload & Custom Dataset Ingestion -----------------

@router.post("/risk-health/upload-analyze", response_model=APIResponse[Dict[str, Any]])
async def upload_and_analyze_dataset(file: UploadFile = File(...)):
    """Uploads a raw CSV/XLSX/JSON file and immediately runs full risk, health, and advisory analysis."""
    global _active_dataset_id
    filename = file.filename or "uploaded_dataset.csv"
    contents = await file.read()
    
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        elif filename.endswith(".json"):
            df = pd.read_json(io.BytesIO(contents))
        else:
            # Attempt CSV parsing by default
            df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse dataset: {str(e)}")

    if len(df) == 0:
        raise HTTPException(status_code=422, detail="Dataset contains 0 rows.")

    dataset_id = f"upload_{len(_uploaded_datasets) + 1}"
    _uploaded_datasets[dataset_id] = df
    _active_dataset_id = dataset_id

    # Compute immediate insights
    eda = {
        "missing_values_count": int(df.isnull().sum().sum()),
        "duplicate_rows_count": int(df.duplicated().sum())
    }
    summary = BusinessHealthEngine.compute_summary(df, eda)
    risks = RiskDetectionEngine.evaluate_risks(df, dataset_name=filename, eda_stats=eda)
    advisory = AdvisoryEngine.generate_advisory_hub(df, eda_stats=eda, user_answers=_active_user_answers)
    
    return APIResponse(
        message=f"Dataset '{filename}' successfully ingested and analyzed.",
        data={
            "dataset_id": dataset_id,
            "filename": filename,
            "row_count": len(df),
            "column_count": len(df.columns),
            "summary": summary.model_dump(),
            "total_risks_found": len(risks),
            "potential_impact": advisory.overview.potential_impact_formatted
        }
    )

# ----------------- Risk & Business Health Endpoints -----------------

@router.get("/risk-health/summary", response_model=APIResponse[RiskHealthSummary])
def get_risk_health_summary(sample_name: Optional[str] = Query(None)):
    """Returns top 4 KPI cards and 4-bar Business Stability breakdown (Figma Screen 1)."""
    df = resolve_dataset(sample_name)
    eda = get_sherly_eda_mock()
    summary = BusinessHealthEngine.compute_summary(df, eda)
    return APIResponse(data=summary)

@router.get("/risk-health/timeseries", response_model=APIResponse[TimeSeriesData])
def get_timeseries_spline(
    metric: str = Query("revenue", description="Metric: revenue, churn, conversion, acquisition"),
    time_range: str = Query("30D", description="Time window: 30D or 14D"),
    mode: str = Query("standard", description="View mode: standard, risk_score, revenue_impact, churn_pattern"),
    sample_name: Optional[str] = Query(None)
):
    """Returns the spline area chart points with anomaly milestone dots (Figma Screen 1)."""
    df = resolve_dataset(sample_name)
    chart_data = RiskDetectionEngine.generate_timeseries_spline(
        df, metric=metric, time_range=time_range, view_mode=mode
    )
    return APIResponse(data=chart_data)

@router.get("/risk-health/risks", response_model=APIResponse[List[RiskItem]])
def get_detected_risks(sample_name: Optional[str] = Query(None)):
    """Returns the detected risk register table with severity badges and business impact (Figma Screen 1)."""
    df = resolve_dataset(sample_name)
    eda = get_sherly_eda_mock()
    risks = RiskDetectionEngine.evaluate_risks(df, eda_stats=eda)
    return APIResponse(data=risks)

@router.get("/risk-health/ai-insight", response_model=APIResponse[AIInsight])
async def get_ai_insight(sample_name: Optional[str] = Query(None)):
    """Returns the contextual AI narrative insight card."""
    df = resolve_dataset(sample_name)
    insight = await AIProfilerService.synthesize_narrative_insight(df, _active_user_answers)
    return APIResponse(data=insight)

# ----------------- Two-Phase AI Questionnaire Endpoints -----------------

@router.get("/risk-health/questionnaire", response_model=APIResponse[BusinessQuestionnaire])
def get_business_questionnaire(sample_name: Optional[str] = Query(None)):
    """Pre-scans data, infers business domain, and returns 3-5 tailored business questions."""
    df = resolve_dataset(sample_name)
    questionnaire = AIProfilerService.generate_questionnaire(df)
    return APIResponse(data=questionnaire)

@router.post("/risk-health/questionnaire/submit", response_model=APIResponse[AIInsight])
async def submit_business_questionnaire(submission: QuestionnaireSubmission):
    """Submits answers to customize the business diagnostic and updates recommendations."""
    global _active_user_answers
    _active_user_answers.update(submission.answers)
    df = resolve_dataset(submission.dataset_id)
    custom_insight = await AIProfilerService.synthesize_narrative_insight(df, _active_user_answers)
    return APIResponse(
        message="Business profile updated and recommendations customized successfully.",
        data=custom_insight
    )

# ----------------- Advisory Hub Endpoints -----------------

@router.get("/advisory/cards", response_model=APIResponse[AdvisoryHubData])
def get_advisory_cards(
    category: Optional[str] = Query("all", description="Category filter: all, revenue, data quality, operational"),
    sample_name: Optional[str] = Query(None)
):
    """Returns top 4 summary metric cards and 2x2 grid of Advisory Cards (Figma Screen 2)."""
    df = resolve_dataset(sample_name)
    eda = get_sherly_eda_mock()
    advisory_data = AdvisoryEngine.generate_advisory_hub(
        df=df,
        eda_stats=eda,
        user_answers=_active_user_answers,
        category_filter=category
    )
    return APIResponse(data=advisory_data)

# ----------------- Reports & Export Endpoints -----------------

@router.get("/reports/summary", response_model=APIResponse[Dict[str, Any]])
def get_executive_report_summary(sample_name: Optional[str] = Query(None)):
    """Returns structured JSON executive audit report."""
    df = resolve_dataset(sample_name)
    eda = get_sherly_eda_mock()
    summary = BusinessHealthEngine.compute_summary(df, eda)
    risks = RiskDetectionEngine.evaluate_risks(df, eda_stats=eda)
    advisory = AdvisoryEngine.generate_advisory_hub(df, eda, _active_user_answers)
    report = ReportEngine.compile_executive_summary(summary, advisory, risks)
    return APIResponse(data=report)

@router.get("/reports/csv")
def export_csv_report(sample_name: Optional[str] = Query(None)):
    """Generates and streams a downloadable structured CSV audit report."""
    df = resolve_dataset(sample_name)
    eda = get_sherly_eda_mock()
    summary = BusinessHealthEngine.compute_summary(df, eda)
    risks = RiskDetectionEngine.evaluate_risks(df, eda_stats=eda)
    advisory = AdvisoryEngine.generate_advisory_hub(df, eda, _active_user_answers)
    csv_text = ReportEngine.generate_csv_report(summary, advisory, risks)
    
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="stechgrow_health_audit.csv"'}
    )

@router.get("/reports/pdf")
def export_pdf_report(sample_name: Optional[str] = Query(None)):
    """Generates and streams a downloadable executive PDF report."""
    df = resolve_dataset(sample_name)
    eda = get_sherly_eda_mock()
    summary = BusinessHealthEngine.compute_summary(df, eda)
    advisory = AdvisoryEngine.generate_advisory_hub(df, eda, _active_user_answers)
    pdf_bytes = ReportEngine.generate_pdf_report(summary, advisory)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="stechgrow_business_health_report.pdf"'}
    )
