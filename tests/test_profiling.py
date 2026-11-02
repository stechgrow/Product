import pandas as pd

from app.services.column_mapper import detect_columns
from app.services.profiling import column_details, correlation_matrix, dataset_summary


def test_summary_counts(sample_df):
    s = dataset_summary(sample_df)
    assert s["total_rows"] == 5 and s["total_columns"] == 6
    assert s["numeric_columns"] == 3 and s["datetime_columns"] == 1
    assert s["categorical_columns"] == 2
    assert s["missing_cells"] == 0 and s["duplicate_rows"] == 0


def test_column_stats(sample_df):
    sales = next(c for c in column_details(sample_df) if c["column"] == "Sales")
    assert sales["mean"] == 300 and sales["median"] == 300
    assert sales["min"] == 100 and sales["max"] == 500


def test_text_column_has_no_mean(sample_df):
    country = next(c for c in column_details(sample_df) if c["column"] == "Country")
    assert country["mean"] is None


def test_correlation_matrix_shape(sample_df):
    corr = correlation_matrix(sample_df)
    assert corr["labels"] == ["Sales", "Profit", "Units"]
    assert corr["matrix"][0][0] == 1.0


def test_single_row_and_text_only_do_not_crash():
    one = pd.DataFrame({"a": [1], "b": ["x"]})
    assert dataset_summary(one)["total_rows"] == 1
    assert correlation_matrix(one) == {"labels": [], "matrix": []}


def test_column_detection(sample_df):
    m = detect_columns(sample_df)
    assert m["revenue"]["column"] == "Sales" and m["date"]["column"] == "Date"
    assert m["country"]["column"] == "Country" and m["product"]["column"] == "Product"
