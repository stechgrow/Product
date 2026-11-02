"""Data-quality checks, quality score and cleaning.

Implements the 7 checks from the team head:
completeness, missing values, duplicates, type/format, inconsistency,
invalid values, outliers.

Golden rule: we DETECT first, then FIX ON A COPY and LOG every change.
The user's original data is never overwritten.
"""
import re

import numpy as np
import pandas as pd

from .profiling import column_kind
from .utils import as_datetime, clean_value, is_text_column, text_to_number

MIN_ROWS = 5                      # fewer rows than this = not really usable
ID_WORDS = {"id", "code", "phone", "zip", "pin", "mobile", "number"}   # never convert these to numbers
NON_NEGATIVE_WORDS = {"quantity", "qty", "units", "price", "sale", "sales", "revenue",
                      "amount", "cost", "cogs", "age"}                 # can't be below zero
# How much each check can take off the 0-100 quality score
WEIGHTS = {"completeness": 20, "missing_values": 25, "duplicates": 15, "type_format": 10,
           "inconsistency": 10, "invalid_values": 10, "outliers": 10}


def _tokens(name) -> set:
    return set(re.split(r"[^a-z0-9]+", str(name).lower()))


def _severity(count: int, share: float) -> str:
    if count == 0:
        return "ok"
    return "low" if share < 0.02 else "medium" if share < 0.1 else "high"


def _result(key, name, count, share, details, suggestion) -> dict:
    return {"key": key, "name": name, "issue_count": int(count), "share": float(min(share, 1.0)),
            "severity": _severity(count, share), "details": clean_value(details), "suggestion": suggestion}


# ---------------------------------------------------------------- helpers
def _variant_groups(series: pd.Series) -> list:
    """Find spellings of the same value, e.g. 'Mumbai', 'mumbai', 'MUMBAI '."""
    counts = series.dropna().astype(str).value_counts()  # most common first
    by_key = {}
    for raw, n in counts.items():
        key = re.sub(r"\s+", " ", raw.strip().lower())
        by_key.setdefault(key, []).append((raw, int(n)))
    return [
        {"canonical": items[0][0], "variants": [r for r, _ in items[1:]],
         "rows": sum(n for _, n in items[1:])}
        for items in by_key.values() if len(items) > 1
    ]


def find_outliers(df: pd.DataFrame) -> list:
    """Unusual numbers per column using the IQR rule (the box-plot rule)."""
    found = []
    for name in df.columns:
        if column_kind(df[name]) != "numeric" or df[name].dtype == bool:
            continue
        s = df[name].dropna()
        if len(s) < 8:      # too little data to judge
            continue
        q1, q3 = s.quantile(0.25), s.quantile(0.75)
        iqr = q3 - q1
        if iqr == 0:        # constant-ish column
            continue
        low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        bad = s[(s < low) | (s > high)]
        if len(bad):
            worst = bad.reindex(bad.abs().sort_values(ascending=False).index).head(3)
            found.append({"column": name, "count": int(len(bad)), "lower_bound": round(float(low), 4),
                          "upper_bound": round(float(high), 4), "examples": clean_value(list(worst.values))})
    return clean_value(found)


def find_anomaly_columns(df: pd.DataFrame) -> list:
    """Top Anomalies tab: ColumnDetail-compatible rows for columns that have outliers.

    The Figma Top Anomalies tab shows the SAME table columns as Dataset Details
    (Column, Datatype, Sample, Missing Values, Mean, Median) — filtered to only
    columns that contain IQR outliers.  This function returns that shape so the
    frontend can render both tabs from the same EDA endpoint without a second call.

    Each item also carries an 'outlier_count' field for the frontend badge.
    """
    from .profiling import column_details  # local import avoids circular reference
    outliers = find_outliers(df)           # compute once, reuse below
    outlier_map = {o["column"]: o["count"] for o in outliers}
    return [
        {**detail, "outlier_count": outlier_map[detail["column"]]}
        for detail in column_details(df)
        if detail["column"] in outlier_map
    ]


def _invalid_values(df: pd.DataFrame) -> dict:
    """Values that break basic rules (fixed rules; business rules need team-lead approval)."""
    out = {}
    for name in df.columns:
        if column_kind(df[name]) != "numeric" or df[name].dtype == bool:
            continue
        s, toks, n = df[name], _tokens(name), 0
        if toks & NON_NEGATIVE_WORDS:
            n += int((s < 0).sum())
        if "age" in toks:
            n += int((s > 120).sum())
        n += int(np.isinf(s.astype(float)).sum())
        if n:
            out[name] = n
    return out


# ----------------------------------------------------------------- checks
def check_completeness(df):
    rows, cols = df.shape
    miss = df.isna().mean()
    empty = [c for c in df.columns if miss[c] == 1.0]
    sparse = [c for c in df.columns if 0.5 < miss[c] < 1.0]
    has_numeric = any(column_kind(df[c]) == "numeric" for c in df.columns)
    problems = []
    if rows < MIN_ROWS:
        problems.append(f"only {rows} rows")
    if not has_numeric:
        problems.append("no numeric columns")
    usable = rows >= MIN_ROWS and len(empty) < cols
    share = 1.0 if not usable else (len(empty) + len(sparse)) / max(cols, 1)
    count = len(problems) + len(empty) + len(sparse)
    return _result("completeness", "Data completeness and structure", count, share,
                   {"usable": usable, "problems": problems, "empty_columns": empty,
                    "mostly_empty_columns": sparse},
                   "Check the file has enough rows and the columns you need.")


def check_missing(df):
    by_col = df.isna().sum()
    by_col = {c: int(n) for c, n in by_col.items() if n > 0}
    total = sum(by_col.values())
    cells = max(df.shape[0] * df.shape[1], 1)
    return _result("missing_values", "Missing values", total, total / cells,
                   {"by_column": by_col, "rows_with_missing": int(df.isna().any(axis=1).sum())},
                   "Fill numbers with the median, text with 'Unknown', or review the source.")


def check_duplicates(df):
    n = int(df.duplicated().sum())
    return _result("duplicates", "Duplicate records", n, n / max(len(df), 1),
                   {"duplicate_rows": n}, "Review duplicates, then remove repeated rows.")


def check_type_format(df):
    as_text_numbers, as_text_dates = [], []
    for name in df.columns:
        s = df[name]
        if not is_text_column(s) or s.dropna().empty or (_tokens(name) & ID_WORDS):
            continue
        if text_to_number(s.dropna()).notna().mean() >= 0.9:
            as_text_numbers.append(name)
        elif column_kind(s) == "datetime":
            as_text_dates.append(name)
    count = len(as_text_numbers) + len(as_text_dates)
    return _result("type_format", "Data type and format", count, count / max(df.shape[1], 1),
                   {"numbers_stored_as_text": as_text_numbers, "dates_stored_as_text": as_text_dates},
                   "Convert these columns to proper number/date types.")


def check_inconsistency(df):
    details, rows_hit, cat_cols = {}, 0, 0
    for name in df.columns:
        if not is_text_column(df[name]) or column_kind(df[name]) != "categorical":
            continue
        cat_cols += 1
        groups = _variant_groups(df[name])
        if groups:
            details[name] = groups[:5]
            rows_hit += sum(g["rows"] for g in groups)
    share = rows_hit / max(len(df) * max(cat_cols, 1), 1)
    return _result("inconsistency", "Data inconsistency", rows_hit, share, details,
                   "Merge spelling variants (case, spaces) into one standard value.")


def check_invalid(df):
    bad = _invalid_values(df)
    total = sum(bad.values())
    num_cols = max(sum(column_kind(df[c]) == "numeric" for c in df.columns), 1)
    return _result("invalid_values", "Invalid values", total, total / max(len(df) * num_cols, 1),
                   {"by_column": bad}, "Review these values manually: they break basic rules.")


def check_outliers(df):
    found = find_outliers(df)
    total = sum(f["count"] for f in found)
    cells = max(df.select_dtypes(include="number").notna().sum().sum(), 1)
    return _result("outliers", "Outliers and anomalies", total, total / cells,
                   {"by_column": {f["column"]: f for f in found}},
                   "Check whether these unusual values are real or typing mistakes.")


def run_checks(df: pd.DataFrame) -> list:
    return [check_completeness(df), check_missing(df), check_duplicates(df), check_type_format(df),
            check_inconsistency(df), check_invalid(df), check_outliers(df)]


def quality_score(checks: list) -> float:
    """100 minus penalties. A check loses its full weight once 20% of the data is affected."""
    score = 100.0
    for c in checks:
        score -= WEIGHTS[c["key"]] * min(1.0, c["share"] / 0.2)
    return round(max(score, 0.0), 1)


def quality_report(df: pd.DataFrame) -> dict:
    checks = run_checks(df)
    usable = next(c for c in checks if c["key"] == "completeness")["details"]["usable"]
    return {"quality_score": quality_score(checks), "usable": usable, "checks": checks}


def quality_metrics(df: pd.DataFrame) -> dict:
    """Small before/after summary."""
    return {"rows": int(len(df)), "columns": int(df.shape[1]),
            "missing_cells": int(df.isna().sum().sum()),
            "duplicate_rows": int(df.duplicated().sum()),
            "quality_score": quality_score(run_checks(df))}


# --------------------------------------------------------------- cleaning
def clean_dataset(df: pd.DataFrame):
    """Fix what is safe to fix, on a COPY. Returns (cleaned_df, change_log)."""
    out = df.copy()
    log = []

    def add(step, column, action, rows, reason, examples=None):
        log.append({"step": step, "column": column, "action": action, "rows_affected": int(rows),
                    "reason": reason, "example_rows": [int(i) for i in (list(examples) if examples is not None else [])][:5]})

    # 1) Tidy text: trim spaces, then merge spelling variants
    for name in list(out.columns):
        if not is_text_column(out[name]):
            continue
        s = out[name]
        stripped = s.where(s.isna(), s.astype(str).str.strip())
        trimmed = (stripped != s) & s.notna()
        if trimmed.any():
            add("trim_spaces", name, "fixed", trimmed.sum(), "Removed extra spaces around text.",
                out.index[trimmed])
        out[name] = stripped
        if column_kind(out[name]) == "categorical":
            mapping = {v: g["canonical"] for g in _variant_groups(out[name]) for v in g["variants"]}
            if mapping:
                hit = out[name].isin(list(mapping))
                add("inconsistency", name, "fixed", hit.sum(),
                    "Merged spelling variants into the most common form (" +
                    ", ".join(f"'{k}'->'{v}'" for k, v in list(mapping.items())[:3]) + ").",
                    out.index[hit])
                out[name] = out[name].replace(mapping)

    # 2) Numbers/dates stored as text -> real types
    for name in list(out.columns):
        s = out[name]
        if not is_text_column(s) or s.dropna().empty or (_tokens(name) & ID_WORDS):
            continue
        nums = text_to_number(s)
        if nums.notna().sum() / s.notna().sum() >= 0.9:
            failed = int(s.notna().sum() - nums.notna().sum())
            add("type_format", name, "fixed", nums.notna().sum(),
                "Converted text to numbers." + (f" {failed} value(s) could not be read and were left blank." if failed else ""))
            out[name] = nums
        elif column_kind(s) == "datetime":
            out[name] = as_datetime(s)
            add("type_format", name, "fixed", out[name].notna().sum(), "Converted text to dates.")

    # 3) Exact duplicate rows
    dup = out.duplicated()
    if dup.any():
        add("duplicates", None, "removed", dup.sum(), "Removed rows that repeat an earlier row exactly.",
            out.index[dup])
        out = out.loc[~dup]

    # 4) Missing values (only where a safe default exists)
    for name in out.columns:
        s = out[name]
        n = int(s.isna().sum())
        if n == 0:
            continue
        if n / len(out) > 0.5:
            add("missing_values", name, "skipped", n, "More than half is empty, so it was not guessed.", out.index[s.isna()])
        elif column_kind(s) == "numeric" and s.dtype != bool:
            median = s.median()
            add("missing_values", name, "fixed", n,
                f"Filled blanks with the median ({clean_value(median)}). Check this is okay for the column.", out.index[s.isna()])
            out[name] = s.fillna(median)
        elif is_text_column(s):
            add("missing_values", name, "fixed", n, "Filled blanks with 'Unknown'.", out.index[s.isna()])
            out[name] = s.fillna("Unknown")
        else:
            add("missing_values", name, "skipped", n, "Dates are never guessed, so blanks were left.", out.index[s.isna()])

    # 5) Flag (do NOT change) values that might be real but look wrong
    for name, n in _invalid_values(out).items():
        add("invalid_values", name, "flagged", n, "Breaks a basic rule (e.g. negative). Left unchanged: review manually.")
    for f in find_outliers(out):
        add("outliers", f["column"], "flagged", f["count"], "Unusual values. Left unchanged because they may be real.")
    return out, log
