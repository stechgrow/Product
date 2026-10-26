from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Traceability Schema -----------------

class TraceabilityMetadata(BaseModel):
    dataset_name: str = "Stechgrow_Design_Dataset"
    rows_evaluated: int = 200
    metrics_used: List[str] = Field(default_factory=lambda: ["revenue", "churn", "plan"])
    is_insufficient_data: bool = False
    confidence_score: float = 0.94
    formula_used: str = "Modified Z-Score (MAD) + Tukey 1.5 IQR"
    threshold_applied: float = 3.0
    data_warning: Optional[str] = None

# ----------------- Risk & Business Health Schemas -----------------

class StabilityBreakdown(BaseModel):
    overall_pct: int = Field(default=72, description="Overall business stability percentage")
    status_label: str = Field(default="Moderate", description="Stability band label: Stable, Moderate, Critical")
    revenue_pct: int = Field(default=69, description="Revenue dimension stability percentage")
    customers_pct: int = Field(default=75, description="Customer dimension stability percentage")
    operational_pct: int = Field(default=53, description="Operational stability percentage")
    channel_pct: int = Field(default=80, description="Offline / Sales channel stability percentage")

class RiskHealthSummary(BaseModel):
    performance_score: int = Field(default=78, description="Composite Performance Score 0-100")
    performance_status: str = Field(default="Stable", description="Status band: Stable, Moderate, Critical, Insufficient Data")
    trend_delta_pct: float = Field(default=4.8, description="Trend growth delta percentage e.g. +4.8%")
    
    total_anomalies: int = Field(default=13, description="Total detected anomalies count")
    high_severity_count: int = Field(default=4, description="High severity anomaly count")
    medium_severity_count: int = Field(default=6, description="Medium severity anomaly count")
    low_severity_count: int = Field(default=3, description="Low severity anomaly count")
    
    customer_retention_rate: int = Field(default=87, description="Customer retention rate percentage")
    retention_status: str = Field(default="Stable", description="Retention status: Stable, Warning, Critical")
    
    ai_confidence_pct: int = Field(default=94, description="Model analysis confidence percentage")
    ai_confidence_label: str = Field(default="High", description="Confidence band: High, Moderate")
    
    stability: StabilityBreakdown = Field(default_factory=StabilityBreakdown)
    traceability: TraceabilityMetadata = Field(default_factory=TraceabilityMetadata)

class TimeSeriesPoint(BaseModel):
    step: int
    label: str
    value: float
    is_anomaly: bool = False
    severity: Optional[str] = None
    note: Optional[str] = None

class TimeSeriesData(BaseModel):
    metric: str = "revenue"
    time_range: str = "30D"
    points: List[TimeSeriesPoint]
    unit: str = "₹"
    current_value: float = 192.0
    traceability: Optional[TraceabilityMetadata] = None

class RiskItem(BaseModel):
    id: str
    risk_type: str = "Financial"
    dataset_name: str = "Stechgrow_Design_Dataset"
    metric_name: str
    trend_direction: str = "up"  # up | down
    severity: str = "High"       # High | Medium | Low
    business_impact_formatted: str = "Estimated- ₹ 3,754"
    details: Optional[str] = None
    traceability_evidence: Optional[Dict[str, Any]] = None

class AIInsight(BaseModel):
    headline: str
    narrative: str
    affected_segment: Optional[str] = None
    recommended_adjustment: Optional[str] = None
    confidence_pct: int = 94

# ----------------- Questionnaire & Customization Schemas -----------------

class QuestionOption(BaseModel):
    label: str
    value: str

class ProfilingQuestion(BaseModel):
    id: str
    question_text: str
    context: str
    options: List[QuestionOption]
    default_value: Optional[str] = None

class BusinessQuestionnaire(BaseModel):
    inferred_domain: str = "B2B SaaS"
    confidence: float = 0.94
    questions: List[ProfilingQuestion]

class QuestionnaireSubmission(BaseModel):
    dataset_id: Optional[str] = None
    answers: Dict[str, Any]

# ----------------- Advisory & Playbook Schemas -----------------

class AdvisoryOverview(BaseModel):
    critical_actions: int = 3
    opportunities: int = 7
    completed: int = 12
    potential_impact_formatted: str = "₹1.2M"

class AdvisoryCard(BaseModel):
    id: str
    title: str
    impact_badge: str = "High Impact"
    category_badge: str = "Revenue"  # Revenue | Data Quality | Operational | Cost
    description: str
    recommended_actions: List[str]
    estimated_impact_text: str
    timeline_text: str
    traceability_source: Optional[str] = None

class AdvisoryHubData(BaseModel):
    overview: AdvisoryOverview = Field(default_factory=AdvisoryOverview)
    cards: List[AdvisoryCard]
    traceability: Optional[TraceabilityMetadata] = None
