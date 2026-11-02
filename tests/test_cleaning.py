import pandas as pd

from app.services.cleaning import clean_dataset, quality_report, run_checks


def messy():
    return pd.DataFrame({
        "Country": ["India", "india ", "India", "USA", "USA", "USA", "UK", "UK"],
        "Price": ["1,200", "1,500", "900", "1,100", "800", "1,000", "700", "700"],
        "Units": [10, 20, 30, -5, 50, 60, 70, 70],
        "Sales": [100.0, None, 300.0, 400.0, 500.0, 600.0, 700.0, 700.0],
    })


def check(df, key):
    return next(c for c in run_checks(df) if c["key"] == key)


def test_checks_find_each_problem():
    df = messy()
    assert check(df, "duplicates")["issue_count"] == 1
    assert check(df, "missing_values")["issue_count"] == 1
    assert check(df, "type_format")["details"]["numbers_stored_as_text"] == ["Price"]
    assert check(df, "inconsistency")["issue_count"] >= 1
    assert check(df, "invalid_values")["details"]["by_column"] == {"Units": 1}


def test_cleaning_fixes_copy_and_keeps_original():
    df = messy()
    before = df.copy()
    cleaned, log = clean_dataset(df)
    pd.testing.assert_frame_equal(df, before)                 # original untouched
    assert len(cleaned) == 7                                  # duplicate removed
    assert cleaned["Sales"].isna().sum() == 0                 # blank filled
    assert pd.api.types.is_numeric_dtype(cleaned["Price"])    # text -> numbers
    assert set(cleaned["Country"]) == {"India", "USA", "UK"}  # variants merged
    assert any(e["step"] == "invalid_values" and e["action"] == "flagged" for e in log)
    assert all(e["reason"] for e in log)                      # every change has a reason


def test_quality_score_improves_after_cleaning():
    df = messy()
    cleaned, _ = clean_dataset(df)
    assert quality_report(cleaned)["quality_score"] > quality_report(df)["quality_score"]


def test_tiny_file_is_not_usable():
    assert quality_report(pd.DataFrame({"a": [1, 2]}))["usable"] is False


def test_all_null_column_does_not_crash():
    df = pd.DataFrame({"a": [None] * 6, "b": range(6)})
    cleaned, _ = clean_dataset(df)
    assert len(cleaned) == 6
