"""Edge-case tests: things that should not crash the API."""
import pandas as pd
import pytest

from app.services.cleaning import clean_dataset, quality_report
from app.services.column_mapper import detect_columns
from app.services.kpis import kpis_with_change
from app.services.profiling import column_details, correlation_matrix, dataset_summary
from app.services.insights import build_insights
from app.services.charts import build_charts


def test_single_row():
    df = pd.DataFrame({"a": [42], "b": ["hello"]})
    s = dataset_summary(df)
    assert s["total_rows"] == 1
    assert correlation_matrix(df) == {"labels": [], "matrix": []}


def test_single_column():
    df = pd.DataFrame({"x": [1, 2, 3, 4, 5]})
    s = dataset_summary(df)
    assert s["total_columns"] == 1
    assert correlation_matrix(df) == {"labels": [], "matrix": []}


def test_all_null_column():
    df = pd.DataFrame({"empty": [None] * 10, "ok": range(10)})
    details = column_details(df)
    empty_col = next(d for d in details if d["column"] == "empty")
    assert empty_col["missing_count"] == 10
    assert empty_col["sample"] is None


def test_mixed_types_column():
    df = pd.DataFrame({"mixed": [1, "two", 3, None, 5, 6, 7, 8, 9, 10]})
    # Should not crash
    s = dataset_summary(df)
    assert s["total_rows"] == 10


def test_negative_values():
    df = pd.DataFrame({"Sales": [-100, 200, 300, 400, 500, 600]})
    report = quality_report(df)
    # Should flag negative sales as invalid
    invalid = next(c for c in report["checks"] if c["key"] == "invalid_values")
    assert invalid["issue_count"] >= 1


def test_huge_outlier():
    df = pd.DataFrame({"value": [1, 2, 3, 4, 5, 6, 7, 8, 9, 1000000]})
    report = quality_report(df)
    outlier_check = next(c for c in report["checks"] if c["key"] == "outliers")
    assert outlier_check["issue_count"] >= 1


def test_missing_date_column_kpis():
    df = pd.DataFrame({"Sales": [1, 2, 3, 4, 5]})
    mapping = detect_columns(df)
    result = kpis_with_change(df, mapping, "week")
    assert result["period_note"] is not None  # Should explain why period wasn't applied
    assert result["metrics"]["total_sales"]["value"] == 15  # Full data returned


def test_text_only_file_insights():
    df = pd.DataFrame({"name": list("ABCDE"), "city": list("XYZWV")})
    mapping = detect_columns(df)
    result = build_insights(df, mapping)
    # No revenue column means most insights are unavailable
    assert len(result["unavailable"]) > 0


def test_text_only_file_charts():
    df = pd.DataFrame({"name": list("ABCDE"), "city": list("XYZWV")})
    mapping = detect_columns(df)
    charts, unavailable = build_charts(df, mapping)
    assert len(charts) == 0
    assert len(unavailable) > 0


def test_duplicate_rows_cleaning():
    df = pd.DataFrame({
        "a": [1, 1, 2, 3, 4, 5],
        "b": ["x", "x", "y", "z", "w", "v"],
    })
    cleaned, log = clean_dataset(df)
    assert len(cleaned) == 5  # One duplicate removed
    dup_entries = [e for e in log if e["step"] == "duplicates"]
    assert len(dup_entries) == 1


def test_unsupported_period_does_not_crash():
    """Period filtering with all valid periods should work."""
    df = pd.DataFrame({"Sales": [100, 200, 300, 400, 500],
                        "Date": pd.date_range("2025-01-01", periods=5)})
    mapping = detect_columns(df)
    for period in ("all", "week", "month", "year"):
        result = kpis_with_change(df, mapping, period)
        assert "metrics" in result
