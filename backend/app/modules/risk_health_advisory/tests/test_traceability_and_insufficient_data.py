import pytest
import pandas as pd
from fastapi.testclient import TestClient
from app.main import app
from app.modules.risk_health_advisory.risk_engine import RiskDetectionEngine
from app.modules.risk_health_advisory.health_engine import BusinessHealthEngine
from app.modules.risk_health_advisory.advisory_engine import AdvisoryEngine

client = TestClient(app)

def test_insufficient_data_guard_2_rows():
    df_2rows = pd.DataFrame({"revenue": [100.0, 200.0]})
    
    # 1. Health engine returns Insufficient Data status
    summary = BusinessHealthEngine.compute_summary(df_2rows)
    assert summary.performance_status == "Insufficient Data"
    assert summary.performance_score == 0
    assert summary.total_anomalies == 0
    assert summary.traceability.is_insufficient_data == True
    assert "Insufficient data" in summary.traceability.data_warning

    # 2. Risk engine returns empty list of risks
    risks = RiskDetectionEngine.evaluate_risks(df_2rows)
    assert len(risks) == 0

    # 3. Advisory hub returns informative guidance card
    adv = AdvisoryEngine.generate_advisory_hub(df_2rows)
    assert adv.overview.critical_actions == 0
    assert "Insufficient Data" in adv.cards[0].title
    assert adv.traceability.is_insufficient_data == True

def test_empty_dataframe_0_rows():
    df_empty = pd.DataFrame(columns=["revenue", "date", "customer_id"])
    summary = BusinessHealthEngine.compute_summary(df_empty)
    assert summary.traceability.is_insufficient_data == True
    assert summary.total_anomalies == 0

def test_non_numeric_dataframe_only_text():
    df_text = pd.DataFrame({
        "client_name": ["Alice", "Bob", "Charlie", "David", "Eve"],
        "comments": ["Great service", "Too expensive", "Bug in UI", "Renewing contract", "Support slow"]
    })
    # Should not crash with ValueError or KeyError
    summary = BusinessHealthEngine.compute_summary(df_text)
    assert summary.performance_score >= 0
    risks = RiskDetectionEngine.evaluate_risks(df_text)
    assert isinstance(risks, list)

def test_traceability_on_normal_risks():
    df = pd.DataFrame({
        "revenue": [100.0, 105.0, 95.0, 102.0, 98.0, 5000.0, 101.0],
        "customer_id": ["A", "B", "C", "D", "E", "F", "G"]
    })
    risks = RiskDetectionEngine.evaluate_risks(df)
    assert len(risks) > 0
    # Confirm traceability evidence is attached
    for r in risks:
        if r.traceability_evidence:
            assert "formula" in r.traceability_evidence

def test_custom_threshold_filtering():
    df = pd.DataFrame({
        "revenue": [100.0, 102.0, 98.0, 101.0, 99.0, 350.0, 1000.0]
    })
    # With strict threshold (2.5), more anomalies are found
    risks_strict = RiskDetectionEngine.evaluate_risks(df, threshold=2.5)
    # With relaxed threshold (5.0), fewer or only extreme anomalies are found
    risks_relaxed = RiskDetectionEngine.evaluate_risks(df, threshold=5.0)
    assert len(risks_strict) >= len(risks_relaxed)

def test_api_summary_with_traceability():
    response = client.get("/api/v1/risk-health/summary?sample_name=saas")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "traceability" in data
    assert data["traceability"]["rows_evaluated"] > 0
    assert data["traceability"]["confidence_score"] > 0.90
