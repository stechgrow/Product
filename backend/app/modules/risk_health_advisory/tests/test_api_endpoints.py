import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_risk_health_summary_endpoint():
    response = client.get("/api/v1/risk-health/summary?sample_name=saas")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert "performance_score" in payload["data"]
    assert "stability" in payload["data"]

def test_timeseries_endpoint():
    response = client.get("/api/v1/risk-health/timeseries?metric=revenue&time_range=30D")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["data"]["points"]) == 30

def test_risks_table_endpoint():
    response = client.get("/api/v1/risk-health/risks")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["data"]) >= 2
    assert "severity" in payload["data"][0]

def test_ai_insight_endpoint():
    response = client.get("/api/v1/risk-health/ai-insight")
    assert response.status_code == 200
    payload = response.json()
    assert "narrative" in payload["data"]

def test_questionnaire_flow():
    # 1. Fetch questionnaire
    q_resp = client.get("/api/v1/risk-health/questionnaire")
    assert q_resp.status_code == 200
    q_data = q_resp.json()
    assert len(q_data["data"]["questions"]) >= 2

    # 2. Submit answers
    sub_resp = client.post(
        "/api/v1/risk-health/questionnaire/submit",
        json={"answers": {"q_churn_driver": "pricing"}}
    )
    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()
    assert "narrative" in sub_data["data"]

def test_advisory_cards_endpoint():
    response = client.get("/api/v1/advisory/cards?category=all")
    assert response.status_code == 200
    payload = response.json()
    assert "overview" in payload["data"]
    assert "cards" in payload["data"]
    assert payload["data"]["overview"]["critical_actions"] == 3

def test_reports_summary_endpoint():
    response = client.get("/api/v1/reports/summary")
    assert response.status_code == 200
    payload = response.json()
    assert "performance_score" in payload["data"]
    assert "advisory_cards" in payload["data"]

def test_reports_pdf_download_endpoint():
    response = client.get("/api/v1/reports/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000  # Valid non-empty PDF bytes

def test_demo_page_endpoint():
    response = client.get("/demo")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Stechgrow" in response.text
