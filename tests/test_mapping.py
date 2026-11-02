"""Column mapping: confidence, candidates, user confirmation."""
import pandas as pd

from app.core.config import settings
from app.services.column_mapper import analyze_columns, detect_columns
from app.services.kpis import kpis_with_change


def vague_df():
    # 'Total' could be revenue, but nothing proves it
    return pd.DataFrame({"Total": [10, 20, 30, 40, 50], "Country": list("ABABA")})


def test_exact_name_is_auto(sample_df):
    r = analyze_columns(sample_df)["revenue"]
    assert (r["column"], r["status"], r["confidence"]) == ("Sales", "auto", 0.95)


def test_partial_name_needs_review():
    df = pd.DataFrame({"Total_Sales_INR": [1, 2, 3, 4, 5]})
    r = analyze_columns(df)["revenue"]
    assert r["column"] == "Total_Sales_INR" and r["status"] == "review"


def test_vague_name_is_not_assumed_to_be_revenue():
    r = analyze_columns(vague_df())["revenue"]
    assert r["column"] is None and r["status"] == "unresolved"
    assert r["candidates"][0]["column"] == "Total"          # offered, but not used
    m = kpis_with_change(vague_df(), detect_columns(vague_df()))["metrics"]
    assert m["total_sales"]["value"] is None                # so no made-up KPI


def test_nothing_plausible_is_not_found():
    assert analyze_columns(pd.DataFrame({"x": [1, 2, 3]}))["revenue"]["status"] == "not_found"


def test_user_override_wins():
    df = vague_df()
    m = detect_columns(df, {"revenue": "Total"})
    assert m["revenue"] == {"column": "Total", "confidence": 1.0, "status": "confirmed"}
    assert kpis_with_change(df, m)["metrics"]["total_sales"]["value"] == 150


def test_override_none_removes_a_role(sample_df):
    assert "discount" not in detect_columns(sample_df, {"discount": None})
    assert "revenue" not in detect_columns(sample_df, {"revenue": None})


def test_tie_prefers_better_keyword():
    df = pd.DataFrame({"Gross Sales": [1, 2, 3], "Revenue": [4, 5, 6], "Sales": [7, 8, 9]})
    assert analyze_columns(df)["revenue"]["column"] == "Revenue"


# ------------------------------------------------------------------ API
def _upload_vague(client):
    (settings.upload_dir / "vague.csv").write_text(vague_df().to_csv(index=False))


def test_get_mapping_lists_roles_and_dropdown_columns(client):
    body = client.get("/datasets/sample.csv/mapping").json()
    assert body["roles"]["revenue"]["column"] == "Sales"
    assert {"column": "Sales", "kind": "numeric"} in body["columns"]
    assert body["needs_confirmation"] == []


def test_confirm_mapping_changes_dashboard_and_persists(client):
    _upload_vague(client)
    assert client.get("/datasets/vague.csv/mapping").json()["needs_confirmation"] == ["revenue"]
    assert client.get("/dashboard/vague.csv").json()["kpis"]["total_sales"]["value"] is None

    r = client.put("/datasets/vague.csv/mapping", json={"mappings": {"revenue": "Total"}})
    assert r.status_code == 200 and r.json()["roles"]["revenue"]["status"] == "confirmed"
    assert (settings.mapping_dir / "vague.csv.json").exists()           # remembered
    assert client.get("/dashboard/vague.csv").json()["kpis"]["total_sales"]["value"] == 150


def test_reset_goes_back_to_guess(client):
    _upload_vague(client)
    client.put("/datasets/vague.csv/mapping", json={"mappings": {"revenue": "Total"}})
    r = client.delete("/datasets/vague.csv/mapping")
    assert r.json()["roles"]["revenue"]["status"] == "unresolved"


def test_bad_choices_are_rejected(client):
    put = lambda m: client.put("/datasets/sample.csv/mapping", json={"mappings": m})
    assert put({"nonsense": "Sales"}).status_code == 422       # unknown role
    assert put({"revenue": "Nope"}).status_code == 422         # column not in file
    assert put({"revenue": "Country"}).status_code == 422      # text column can't be revenue
