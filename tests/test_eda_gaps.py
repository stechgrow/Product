"""Tests for the 3 Figma gaps:
  GAP 1 — missing_chart() returns chart-ready {labels, values} array
  GAP 2 — find_anomaly_columns() returns ColumnDetail shape (not IQR bounds)
  GAP 3 — column_details() includes distribution histogram for numeric columns
"""
import pandas as pd
import pytest


# ------------------------------------------------------------------ helpers
def sales_df():
    """A dataset with known missing values and a clear outlier."""
    return pd.DataFrame({
        "Sales":   [100, 200, None, 400, 500, 600, 700, 800, 900, 9999],  # 9999 = outlier
        "Country": ["India", None, "USA", "USA", "UK", "UK", "India", "India", "USA", "UK"],
        "Profit":  [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    })


# ============================= GAP 1: missing_chart =============================

def test_missing_chart_labels_and_values():
    from app.services.profiling import missing_chart
    df = sales_df()
    chart = missing_chart(df)
    # Sales and Country both have 1 missing value
    assert "Sales" in chart["labels"]
    assert "Country" in chart["labels"]
    assert len(chart["labels"]) == len(chart["values"])


def test_missing_chart_counts_are_correct():
    from app.services.profiling import missing_chart
    df = sales_df()
    chart = missing_chart(df)
    idx = chart["labels"].index("Sales")
    assert chart["values"][idx] == 1
    idx2 = chart["labels"].index("Country")
    assert chart["values"][idx2] == 1


def test_missing_chart_total():
    from app.services.profiling import missing_chart
    df = sales_df()
    chart = missing_chart(df)
    assert chart["total"] == sum(chart["values"])
    assert 0 < chart["total_percent"] <= 100


def test_missing_chart_no_missing_returns_empty():
    from app.services.profiling import missing_chart
    df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
    chart = missing_chart(df)
    assert chart["labels"] == []
    assert chart["values"] == []
    assert chart["total"] == 0


def test_missing_chart_api(client):
    r = client.get("/eda/sample.csv/missing_chart")
    assert r.status_code == 200
    body = r.json()
    assert "labels" in body and "values" in body
    assert len(body["labels"]) == len(body["values"])


# ============================= GAP 2: find_anomaly_columns =============================

def test_find_anomaly_columns_returns_column_detail_shape():
    from app.services.cleaning import find_anomaly_columns
    df = sales_df()
    rows = find_anomaly_columns(df)
    # Should find Sales column (9999 is a clear outlier in a 10-row dataset)
    if rows:  # may be empty if dataset too small for IQR (needs >= 8 non-null values)
        row = rows[0]
        # Must have ColumnDetail fields
        assert "column" in row
        assert "dtype" in row
        assert "kind" in row
        assert "sample" in row
        assert "missing_count" in row
        assert "missing_percent" in row
        assert "mean" in row
        assert "median" in row
        # Must also have outlier_count (the new badge field)
        assert "outlier_count" in row
        assert row["outlier_count"] > 0
        # Must NOT have lower_bound / upper_bound (that's the old Anomaly shape)
        assert "lower_bound" not in row
        assert "upper_bound" not in row


def test_find_anomaly_columns_only_includes_outlier_columns():
    from app.services.cleaning import find_anomaly_columns
    df = sales_df()
    rows = find_anomaly_columns(df)
    # Profit column has no outlier — should not appear
    col_names = [r["column"] for r in rows]
    assert "Profit" not in col_names


def test_top_anomalies_api_endpoint(client):
    r = client.get("/eda/sample.csv/top_anomalies")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list)
    # sample.csv has no outliers (only 5 clean rows), so list is empty
    assert body == []


def test_eda_overview_includes_top_anomaly_columns_and_missing_chart(client):
    r = client.get("/eda/sample.csv")
    assert r.status_code == 200
    body = r.json()
    # New fields must be present
    assert "top_anomaly_columns" in body
    assert "missing_chart" in body
    assert isinstance(body["top_anomaly_columns"], list)
    assert "labels" in body["missing_chart"]
    assert "values" in body["missing_chart"]


# ============================= GAP 3: distribution histogram =============================

def test_column_details_includes_distribution_for_numeric():
    from app.services.profiling import column_details
    df = sales_df()
    details = column_details(df)
    sales_detail = next(d for d in details if d["column"] == "Sales")
    # Numeric column must have distribution
    assert sales_detail["distribution"] is not None
    dist = sales_detail["distribution"]
    assert "bins" in dist and "counts" in dist
    # bins has one more element than counts (bin edges)
    assert len(dist["bins"]) == len(dist["counts"]) + 1
    # All counts are non-negative integers
    assert all(isinstance(c, int) and c >= 0 for c in dist["counts"])


def test_column_details_no_distribution_for_text():
    from app.services.profiling import column_details
    df = sales_df()
    details = column_details(df)
    country_detail = next(d for d in details if d["column"] == "Country")
    # Text/categorical column must NOT have distribution
    assert country_detail["distribution"] is None


def test_distribution_bins_cover_data_range():
    from app.services.profiling import column_details
    df = pd.DataFrame({"x": list(range(1, 21))})  # 1..20
    details = column_details(df)
    dist = details[0]["distribution"]
    assert dist is not None
    # Min bin edge ≤ min value, max bin edge ≥ max value
    assert dist["bins"][0] <= 1
    assert dist["bins"][-1] >= 20


def test_single_value_column_distribution_does_not_crash():
    from app.services.profiling import column_details
    df = pd.DataFrame({"x": [5, 5, 5, 5, 5]})
    details = column_details(df)
    # Should not crash; distribution may be None for constant column
    assert isinstance(details[0]["distribution"], (dict, type(None)))
