import io
import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.modules.risk_health_advisory.risk_engine import RiskDetectionEngine
from app.modules.risk_health_advisory.advisory_engine import AdvisoryEngine

client = TestClient(app)

def test_currency_string_cleaning():
    dirty_series = pd.Series(["₹1,500.50", "$2,400", "  950.0  ", "invalid", None, "₹ -250.0"])
    cleaned = RiskDetectionEngine.clean_numeric_series(dirty_series)
    assert len(cleaned) == 4
    assert 1500.50 in cleaned.values
    assert 2400.0 in cleaned.values
    assert -250.0 in cleaned.values

def test_extreme_and_zero_variance():
    # All identical numbers (zero variance)
    flat_series = pd.Series([100.0] * 50)
    outliers, zscores = RiskDetectionEngine.detect_outliers_zscore(flat_series)
    assert not any(outliers)
    assert all(z == 0.0 for z in zscores)

    # Extreme value
    spike_series = pd.Series([10.0, 11.0, 12.0, 10.0, 11.0, 1e9])
    outliers, zscores = RiskDetectionEngine.detect_outliers_zscore(spike_series)
    assert outliers[-1] == True

def test_timeseries_all_metrics_and_modes():
    df = pd.DataFrame({
        "revenue": [100.0, 150.0, 200.0] * 10,
        "churn": [0, 1, 0] * 10
    })
    # Churn metric
    churn_data = RiskDetectionEngine.generate_timeseries_spline(df, metric="churn", time_range="30D")
    assert churn_data.unit == "%"
    assert len(churn_data.points) == 30

    # Conversion metric
    conv_data = RiskDetectionEngine.generate_timeseries_spline(df, metric="conversion", time_range="14D")
    assert conv_data.unit == "%"
    assert len(conv_data.points) == 14

    # Acquisition metric
    acq_data = RiskDetectionEngine.generate_timeseries_spline(df, metric="acquisition", time_range="30D")
    assert acq_data.unit == "users"

    # Modes
    risk_mode = RiskDetectionEngine.generate_timeseries_spline(df, metric="revenue", view_mode="risk_score")
    assert risk_mode.unit == "pts"

    impact_mode = RiskDetectionEngine.generate_timeseries_spline(df, metric="revenue", view_mode="revenue_impact")
    assert impact_mode.unit == "₹"

def test_csv_upload_and_analyze_endpoint():
    csv_content = b"order_id,revenue,customer_id,churn\nORD-1,1500,CUST-A,0\nORD-2,28000,CUST-B,1\nORD-3,1400,CUST-A,0\nORD-4,1600,CUST-C,0\n"
    response = client.post(
        "/api/v1/risk-health/upload-analyze",
        files={"file": ("my_custom_data.csv", csv_content, "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert "dataset_id" in data
    assert data["row_count"] == 4
    assert data["column_count"] == 4
    assert "summary" in data

def test_empty_file_upload_error():
    empty_content = b""
    response = client.post(
        "/api/v1/risk-health/upload-analyze",
        files={"file": ("empty.csv", empty_content, "text/csv")}
    )
    assert response.status_code == 400

def test_csv_report_export_endpoint():
    response = client.get("/api/v1/reports/csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    text = response.text
    assert "STECHGROW OS" in text
    assert "DETECTED RISKS" in text
    assert "ADVISORY PLAYBOOK" in text

def test_questionnaire_customization_reordering():
    df = pd.DataFrame({"revenue": [1000.0] * 20})
    # When enterprise is priority, concentration card moves first
    enterprise_hub = AdvisoryEngine.generate_advisory_hub(
        df, user_answers={"q_strategic_priority": "enterprise"}
    )
    assert "Customer Concentration" in enterprise_hub.cards[0].title

    # When profitability is priority, plan B revenue card is included
    profit_hub = AdvisoryEngine.generate_advisory_hub(
        df, user_answers={"q_strategic_priority": "profitability"}
    )
    assert any("Subscription Plan B" in c.title for c in profit_hub.cards)
