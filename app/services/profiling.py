"""EDA profiling: the numbers behind the Automated EDA screen.

Every function takes a pandas DataFrame and returns plain Python
dicts/lists, so FastAPI can send them straight back as JSON.
"""
import numpy as np
import pandas as pd
from pandas.api import types as pdt

from .utils import clean_value


def column_kind(series: pd.Series) -> str:
    """Classify a column as numeric, datetime, categorical or other."""
    if pdt.is_bool_dtype(series):
        return "other"
    if pdt.is_numeric_dtype(series):
        return "numeric"
    if pdt.is_datetime64_any_dtype(series):
        return "datetime"

    # Text columns: check if they secretly hold dates (e.g. "2026-05-12")
    values = series.dropna().astype(str).head(100)
    if len(values) > 0:
        mostly_digits = values.str.fullmatch(r"\d+(\.\d+)?").mean() > 0.5
        if not mostly_digits:
            parsed = pd.to_datetime(values, errors="coerce", format="mixed")
            if parsed.notna().mean() >= 0.9:
                return "datetime"

    # Few distinct values = category (country, segment). Many = free text/ID.
    unique = series.nunique(dropna=True)
    if unique <= 50 or unique / max(len(series), 1) <= 0.5:
        return "categorical"
    return "other"


def dataset_summary(df: pd.DataFrame) -> dict:
    """Top cards: rows, columns, type counts, missing values, duplicates."""
    rows, cols = df.shape
    kinds = [column_kind(df[c]) for c in df.columns]
    missing_cells = int(df.isna().sum().sum())
    total_cells = rows * cols

    # Numeric card extras
    num_cols = df.select_dtypes(include="number")
    numeric_mean = round(float(num_cols.mean().mean()), 4) if num_cols.shape[1] > 0 else None
    numeric_median = round(float(num_cols.median().mean()), 4) if num_cols.shape[1] > 0 else None
    # Average correlation: mean of upper triangle (excluding diagonal)
    avg_corr = None
    if num_cols.shape[1] >= 2:
        corr = num_cols.corr()
        mask = np.triu(np.ones(corr.shape, dtype=bool), k=1)
        upper = corr.values[mask]
        upper = upper[~np.isnan(upper)]
        if len(upper) > 0:
            avg_corr = round(float(upper.mean()), 4)

    return {
        "total_rows": rows,
        "total_columns": cols,
        "numeric_columns": kinds.count("numeric"),
        "categorical_columns": kinds.count("categorical"),
        "datetime_columns": kinds.count("datetime"),
        "other_columns": kinds.count("other"),  # keeps the counts adding up
        "numeric_mean": numeric_mean,
        "numeric_median": numeric_median,
        "average_correlation": avg_corr,
        "missing_cells": missing_cells,
        "missing_percent": round(missing_cells / total_cells * 100, 2) if total_cells else 0.0,
        "rows_with_missing": int(df.isna().any(axis=1).sum()),
        "duplicate_rows": int(df.duplicated().sum()),
    }


def column_details(df: pd.DataFrame) -> list:
    """Dataset Details table: one row per column.

    Includes a 'distribution' histogram for numeric columns so the frontend
    can render the sparkline/bar charts visible in the Figma Numeric Columns card.
    """
    details = []
    for name in df.columns:
        col = df[name]
        kind = column_kind(col)
        missing = int(col.isna().sum())
        non_null = col.dropna()
        is_num = kind == "numeric"

        # Distribution histogram (GAP 3): numeric columns only, up to 10 bins
        distribution = None
        if is_num and len(non_null) >= 2:
            try:
                counts, bin_edges = np.histogram(non_null.astype(float), bins=min(10, len(non_null)))
                distribution = {
                    "bins": [round(float(b), 4) for b in bin_edges.tolist()],
                    "counts": [int(c) for c in counts.tolist()],
                }
            except Exception:
                distribution = None  # never crash profiling

        details.append({
            "column": name,
            "dtype": str(col.dtype),
            "kind": kind,
            "sample": str(non_null.iloc[0]) if len(non_null) else None,
            "missing_count": missing,
            "missing_percent": round(missing / len(df) * 100, 2) if len(df) else 0.0,
            # mean/median only make sense for numbers, otherwise None
            "mean": clean_value(col.mean()) if is_num else None,
            "median": clean_value(col.median()) if is_num else None,
            "min": clean_value(col.min()) if is_num else None,
            "max": clean_value(col.max()) if is_num else None,
            "std": clean_value(col.std()) if is_num else None,
            "distribution": distribution,
        })
    return details


def missing_chart(df: pd.DataFrame) -> dict:
    """Chart-ready data for the EDA missing-values line chart.

    The Figma EDA screen shows a line/area chart where x = column names
    and y = number of missing values. Only columns that actually have
    missing values are included (to keep the chart readable).

    Returns:
        {
          "labels": ["Column A", "Column C"],   # columns with any missing
          "values": [70, 45],                   # missing count per column
          "total": 115,
          "total_percent": 0.6                  # over all cells
        }
    """
    by_col = df.isna().sum()
    # Only include columns that actually have missing values
    missing_cols = [(col, int(n)) for col, n in by_col.items() if n > 0]
    # Sort by most missing first — makes the chart more informative
    missing_cols.sort(key=lambda x: -x[1])
    total = sum(n for _, n in missing_cols)
    total_cells = max(df.shape[0] * df.shape[1], 1)
    return {
        "labels": [col for col, _ in missing_cols],
        "values": [n for _, n in missing_cols],
        "total": total,
        "total_percent": round(total / total_cells * 100, 2),
    }


def correlation_matrix(df: pd.DataFrame) -> dict:
    """Heatmap data: how strongly each pair of numeric columns moves together."""
    numeric = df.select_dtypes(include="number")
    if numeric.shape[1] < 2:  # need at least 2 columns to compare
        return {"labels": [], "matrix": []}

    corr = numeric.corr()
    return {
        "labels": list(corr.columns),
        # NaN (e.g. a constant column) becomes None so JSON doesn't break
        "matrix": [[clean_value(v) for v in row] for row in corr.values],
    }
