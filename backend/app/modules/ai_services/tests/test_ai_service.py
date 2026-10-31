import pandas as pd
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.modules.ai_services.router import router
app = FastAPI()
app.include_router(router)
client = TestClient(app)


def make_records():
    recs, months = [], pd.period_range("2025-01", "2025-12", freq="M")
    for i, m in enumerate(months):
        for region, base in [("North", 1000), ("South", 800)]:
            val = base * (1 + 0.01 * i)
            if region == "South" and m == months[-1]:
                val *= 0.6                      # 40% drop
            for k in range(5):
                recs.append({"date": f"{m}-{10+k:02d}", "region": region,
                             "amount": val / 5, "customer": f"{region}-{k}"})
    return recs


def payload(**extra):
    return {"records": make_records(), "use_llm": False,
            "columns": {"value_col": "amount", "date_col": "date",
                        "dimension_col": "region", "customer_col": "customer"}, **extra}


def test_anomaly_detects_south_drop():
    r = client.post("/api/v1/ai/anomalies", json=payload())
    assert r.status_code == 200
    hits = [a for a in r.json()["anomalies"] if a["series"] == "South" and a["period"] == "2025-12"]
    assert hits and hits[0]["deviation_pct"] < -30


def test_rca_ranks_south_first_and_value_effect():
    r = client.post("/api/v1/ai/root-cause", json=payload())
    body = r.json()
    assert r.status_code == 200
    assert body["drivers"][0]["factor"] == "region=South"
    assert abs(body["volume_effect"]) < 1e-6            # order count constant
    assert body["total_change"] == pytest.approx(body["volume_effect"] + body["value_effect"], abs=0.05)


def test_recommendations_include_risk():
    r = client.post("/api/v1/ai/recommendations", json=payload())
    assert r.status_code == 200
    assert any(x["category"] == "risk" for x in r.json()["recommendations"])


def test_opportunities_insufficient_data_422():
    p = payload()
    p["records"] = p["records"][:1]
    assert client.post("/api/v1/ai/opportunities", json=p).status_code == 422


def test_missing_column_422():
    p = payload()
    p["columns"]["value_col"] = "nope"
    assert client.post("/api/v1/ai/anomalies", json=p).status_code == 422


def test_empty_records_validation_error():
    p = payload()
    p["records"] = []
    assert client.post("/api/v1/ai/anomalies", json=p).status_code == 422