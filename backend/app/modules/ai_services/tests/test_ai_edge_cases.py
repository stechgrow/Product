
import sys
import types

import pytest

import pandas as pd
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.modules.ai_services import llm
from app.modules.ai_services.common import MIN_PERIODS
from app.modules.ai_services.router import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)


def make_records():
    recs, months = [], pd.period_range("2025-01", "2025-12", freq="M")
    for i, m in enumerate(months):
        for region, base in [("North", 1000), ("South", 800)]:
            val = base * (1 + 0.01 * i)
            for k in range(5):
                recs.append({"date": f"{m}-{10 + k:02d}", "region": region,
                             "amount": val / 5, "customer": f"{region}-{k}"})
    return recs


def payload(**extra):
    return {"records": make_records(), "use_llm": False,
            "columns": {"value_col": "amount", "date_col": "date",
                        "dimension_col": "region", "customer_col": "customer"}, **extra}

@pytest.fixture(autouse=True)
def clean_llm_env(monkeypatch):
    for k in ("GEMINI_API_KEY", "ANTHROPIC_API_KEY", "LLM_PROVIDER", "LLM_MODEL"):
        monkeypatch.delenv(k, raising=False)

ENDPOINTS = ["anomalies", "recommendations", "opportunities", "root-cause"]


def make_records_n(n_months):
    recs = []
    for i, m in enumerate(pd.period_range("2025-01", periods=n_months, freq="M")):
        for region, base in [("North", 1000), ("South", 800)]:
            for k in range(5):
                recs.append({"date": f"{m}-{10 + k:02d}", "region": region,
                             "amount": base * (1 + 0.01 * i) / 5,
                             "customer": f"{region}-{k}"})
    return recs


# ---------- Boundary cases: just below / at / just above MIN_PERIODS ----------

@pytest.mark.parametrize("n", [MIN_PERIODS - 1, MIN_PERIODS, MIN_PERIODS + 1])
@pytest.mark.parametrize("endpoint", ENDPOINTS)
def test_period_boundary_never_crashes(endpoint, n):
    p = payload()
    p["records"] = make_records_n(n)
    r = client.post(f"/api/v1/ai/{endpoint}", json=p)
    assert r.status_code in (200, 422)
    if r.status_code == 422:
        assert "detail" in r.json()


# ---------- Dirty / missing data ----------

def test_dirty_rows_are_dropped_not_crashing():
    p = payload()
    recs = p["records"]
    recs[0]["amount"] = "abc"
    recs[1]["amount"] = None
    recs[2]["amount"] = ""
    recs[3]["date"] = "not-a-date"
    r = client.post("/api/v1/ai/anomalies", json=p)
    assert r.status_code == 200
    assert r.json()["rows_dropped"] >= 4


def test_all_values_non_numeric_422():
    p = payload()
    for rec in p["records"]:
        rec["amount"] = "abc"
    assert client.post("/api/v1/ai/anomalies", json=p).status_code == 422


def test_null_dimension_values_do_not_crash():
    p = payload()
    for rec in p["records"][:3]:
        rec["region"] = None
    assert client.post("/api/v1/ai/anomalies", json=p).status_code == 200


@pytest.mark.parametrize("endpoint", ENDPOINTS)
@pytest.mark.parametrize("drop", ["date_col", "dimension_col", "customer_col"])
def test_optional_columns_missing_never_crashes(endpoint, drop):
    p = payload()
    p["columns"].pop(drop)
    r = client.post(f"/api/v1/ai/{endpoint}", json=p)
    assert r.status_code in (200, 422)


def test_invalid_freq_422():
    p = payload()
    p["freq"] = "Y"
    assert client.post("/api/v1/ai/anomalies", json=p).status_code == 422


def test_missing_columns_object_422():
    p = payload()
    p.pop("columns")
    assert client.post("/api/v1/ai/anomalies", json=p).status_code == 422


# ---------- LLM failure / fallback ----------

def _fake_anthropic(monkeypatch, text=None, error=None):
    monkeypatch.setenv("LLM_PROVIDER", "anthropic")

    class _Messages:
        def create(self, **kwargs):
            if error:
                raise error
            return types.SimpleNamespace(
                content=[types.SimpleNamespace(type="text", text=text)])

    class _Client:
        def __init__(self, **kwargs):
            self.messages = _Messages()

    fake = types.ModuleType("anthropic")
    fake.Anthropic = _Client
    monkeypatch.setitem(sys.modules, "anthropic", fake)


def test_explain_no_key_uses_template(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert llm.explain({"a": 1}, "fallback text") == ("fallback text", "template")


def test_explain_use_llm_false_skips_api(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    _fake_anthropic(monkeypatch, text="should not be used")
    assert llm.explain({"a": 1}, "fallback text", use_llm=False) == ("fallback text", "template")


def test_explain_api_error_falls_back(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    _fake_anthropic(monkeypatch, error=RuntimeError("timeout"))
    assert llm.explain({"a": 1}, "fallback text") == ("fallback text", "template")


def test_explain_empty_reply_falls_back(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    _fake_anthropic(monkeypatch, text="   ")
    assert llm.explain({"a": 1}, "fallback text") == ("fallback text", "template")


def test_explain_success_returns_llm_text(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    _fake_anthropic(monkeypatch, text="Sales fell in the South region.")
    assert llm.explain({"a": 1}, "fallback text") == ("Sales fell in the South region.", "llm")


def test_rca_endpoint_template_when_no_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    r = client.post("/api/v1/ai/root-cause", json=payload(use_llm=True))
    assert r.status_code == 200
    assert r.json()["explanation_source"] == "template"


def test_recommendations_endpoint_template_when_no_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    r = client.post("/api/v1/ai/recommendations", json=payload(use_llm=True))
    assert r.status_code == 200
    assert all(x["explanation_source"] == "template" for x in r.json()["recommendations"])


def _fake_gemini(monkeypatch, text=None, error=None):
    monkeypatch.setenv("LLM_PROVIDER", "gemini")
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("LLM_MODEL", "test-model")

    class _Models:
        def generate_content(self, **kwargs):
            if error:
                raise error
            return types.SimpleNamespace(text=text)

    class _Client:
        def __init__(self, **kwargs):
            self.models = _Models()

    gtypes = types.ModuleType("google.genai.types")
    gtypes.HttpOptions = lambda **kw: None
    gtypes.GenerateContentConfig = lambda **kw: None
    genai = types.ModuleType("google.genai")
    genai.Client = _Client
    genai.types = gtypes
    google = types.ModuleType("google")
    google.genai = genai
    monkeypatch.setitem(sys.modules, "google", google)
    monkeypatch.setitem(sys.modules, "google.genai", genai)
    monkeypatch.setitem(sys.modules, "google.genai.types", gtypes)


def test_gemini_success_returns_llm_text(monkeypatch):
    _fake_gemini(monkeypatch, text="South dropped sharply in December.")
    assert llm.explain({"a": 1}, "fallback text") == ("South dropped sharply in December.", "llm")


def test_gemini_error_falls_back(monkeypatch):
    _fake_gemini(monkeypatch, error=RuntimeError("quota exceeded"))
    assert llm.explain({"a": 1}, "fallback text") == ("fallback text", "template")


def test_gemini_empty_reply_falls_back(monkeypatch):
    _fake_gemini(monkeypatch, text="")
    assert llm.explain({"a": 1}, "fallback text") == ("fallback text", "template")


def test_gemini_missing_model_falls_back(monkeypatch):
    _fake_gemini(monkeypatch, text="x")
    monkeypatch.delenv("LLM_MODEL")
    assert llm.explain({"a": 1}, "fallback text") == ("fallback text", "template")