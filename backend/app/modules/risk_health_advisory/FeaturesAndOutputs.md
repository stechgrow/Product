# Risk, Business Health, Advisory & Reports — Features & Output Contracts

**Module Owner**: Sven Tuscano  
**Module Directory**: `backend/app/modules/risk_health_advisory/`  
**Target Consumers**: Riona Chettiar (Risk Detection & Business Health Screen), Alciya Anand Dodti (Advisory Recommendation Screen), Shaury Tiwari (Integration)

---

## 1. Features & Calculations Provided

1. **Performance Score (0–100)**: Composite health score calculated across 4 stability dimensions. Outputs status band (`Stable`, `Moderate`, `Critical`) and trend delta `%`.
2. **Anomaly Detection**: Modified Z-score and IQR anomaly detection on numeric metrics, returning counts partitioned by severity (`High`, `Medium`, `Low`).
3. **Business Stability Breakdown**: 4-bar dimensional metrics (`Revenue`, `Customers`, `Stable/Operational`, `Offline Sales/Channels`) with progress percentages.
4. **Time-Series Spline with Milestones & View Modes**: Metric points with flagged anomaly dots for `Revenue`, `Customer churn`, `Conversion`, and `Acquisition`, with toggles for `Risk Score`, `Revenue Impact`, and `Churn Pattern`.
5. **Categorized Risk Register**: Table items with risk source, metric name, direction (`↑` / `↓`), severity badge (`High` / `Medium`), and formatted currency impact (e.g. `Estimated- ₹ 3,754`).
6. **AI Narrative Insight**: Contextual diagnosis explaining root causes (e.g. *"Revenue decline observed in Subscription Plan B, correlation with increased churn in Segment B"*).
7. **Two-Phase Interactive AI Questionnaire**: Generates 3–5 tailored business questions and synthesizes customized strategic playbooks when answered.
8. **Advisory & Playbook Hub**: Critical action count, opportunity count, potential impact (`₹1.2M`), and 2×2 card grid with checklists and implementation timelines.
9. **Direct Dataset Ingestion**: `POST /api/v1/risk-health/upload-analyze` allows uploading raw CSV/Excel/JSON files for instant live analysis.
10. **Multi-Format Export Engine**: Downloadable executive PDF via ReportLab and structured audit CSV export.

---

## 2. API Response Payloads (OpenAPI Ready)

### A. Risk & Business Health Summary
`GET /api/v1/risk-health/summary`
```json
{
  "status": "success",
  "data": {
    "performance_score": 78,
    "performance_status": "Stable",
    "trend_delta_pct": 4.8,
    "total_anomalies": 13,
    "high_severity_count": 4,
    "medium_severity_count": 6,
    "low_severity_count": 3,
    "customer_retention_rate": 87,
    "retention_status": "Stable",
    "ai_confidence_pct": 94,
    "ai_confidence_label": "High",
    "stability": {
      "overall_pct": 72,
      "status_label": "Moderate",
      "revenue_pct": 69,
      "customers_pct": 75,
      "operational_pct": 53,
      "channel_pct": 80
    }
  }
}
```

### B. Time-Series Spline Chart
`GET /api/v1/risk-health/timeseries?metric=revenue&time_range=30D&mode=standard`
- **Supported `metric` values**: `revenue`, `churn` (`customer churn`), `conversion`, `acquisition`.
- **Supported `mode` values**: `standard`, `risk_score`, `revenue_impact`, `churn_pattern`.
```json
{
  "status": "success",
  "data": {
    "metric": "revenue",
    "time_range": "30D",
    "points": [
      {"step": 1, "label": "Day 1", "value": 75.0, "is_anomaly": false},
      {"step": 10, "label": "Day 10", "value": 80.0, "is_anomaly": true, "severity": "High"},
      {"step": 20, "label": "Day 20", "value": 240.0, "is_anomaly": true, "severity": "Medium"},
      {"step": 30, "label": "Day 30", "value": 192.0, "is_anomaly": false}
    ],
    "unit": "₹"
  }
}
```

### C. Direct Dataset Upload & Analysis
`POST /api/v1/risk-health/upload-analyze` (Multipart Form File)
```json
{
  "status": "success",
  "message": "Dataset 'orders.csv' successfully ingested and analyzed.",
  "data": {
    "dataset_id": "upload_1",
    "filename": "orders.csv",
    "row_count": 500,
    "column_count": 6,
    "summary": { "performance_score": 82, "...": "..." },
    "total_risks_found": 3,
    "potential_impact": "₹1.2M"
  }
}
```

### D. Export Endpoints
- `GET /api/v1/reports/pdf`: Returns binary `application/pdf` streamed attachment.
- `GET /api/v1/reports/csv`: Returns structured `text/csv` attachment containing the health KPI header, detected risks register, and advisory playbooks.

---

## 3. UI Component Mapping for Frontend Developers

### For Riona Chettiar (`Risk Detection & Business Health` Screen)
| Figma UI Element | API Field Source | Notes |
| :--- | :--- | :--- |
| **Performance Score** | `data.performance_score`, `data.performance_status` | e.g. `78`, Badge: `Stable` |
| **Anomalies Detected** | `data.total_anomalies`, `high_severity_count`, `medium_severity_count` | Badges: `4 High`, `6 Medium` |
| **Customer Retention** | `data.customer_retention_rate`, `retention_status` | e.g. `87% Stable` |
| **AI Confidence** | `data.ai_confidence_pct`, `ai_confidence_label` | e.g. `94% 4 High` |
| **Business Stability** | `data.stability.overall_pct`, `status_label` | e.g. `72% Moderate` |
| **Stability Bars** | `revenue_pct`, `customers_pct`, `operational_pct`, `channel_pct` | Horizontal progress bars |
| **Spline Chart** | `/api/v1/risk-health/timeseries` -> `data.points` | Orange dots for `is_anomaly = true` |
| **Risk Table** | `/api/v1/risk-health/risks` -> `data[]` | Render rows with file icon, trend arrow, severity badge |
| **AI Insight Card** | `/api/v1/risk-health/ai-insight` | Displays headline, narrative paragraph |

### For Alciya Anand Dodti (`Advisory` Screen)
| Figma UI Element | API Field Source | Notes |
| :--- | :--- | :--- |
| **Critical Actions** | `data.overview.critical_actions` | Red warning triangle icon |
| **Opportunities** | `data.overview.opportunities` | Yellow lightbulb icon |
| **Completed** | `data.overview.completed` | Green checkmark icon |
| **Potential Impact** | `data.overview.potential_impact_formatted` | e.g. `₹1.2M` |
| **Immediate Action Required** | Header badge above grid | Fixed status badge |
| **Category Filter** | Query param `category=...` | Filters cards by category |
| **Advisory Cards** | `data.cards[]` | 2x2 grid with checklist & timeline |
