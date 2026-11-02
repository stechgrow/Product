"""Small helpers shared by all the services."""
import numpy as np
import pandas as pd
from pandas.api import types as pdt


def clean_value(value):
    """Make any value JSON-safe: numpy -> Python, NaN/inf -> None, recurse into dict/list."""
    if isinstance(value, dict):
        return {str(k): clean_value(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [clean_value(v) for v in value]
    if value is None or value is pd.NaT or value is pd.NA:
        return None
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if isinstance(value, np.generic):  # numpy number -> normal Python number
        value = value.item()
    if isinstance(value, float) and (np.isnan(value) or np.isinf(value)):
        return None
    return value


def as_datetime(series: pd.Series) -> pd.Series:
    """Return the column as real dates (unparseable values become NaT)."""
    if pdt.is_datetime64_any_dtype(series):
        return series
    return pd.to_datetime(series, errors="coerce", format="mixed")


def is_text_column(series: pd.Series) -> bool:
    """True for columns that hold text (not numbers, dates or booleans)."""
    if pdt.is_numeric_dtype(series) or pdt.is_datetime64_any_dtype(series) or pdt.is_bool_dtype(series):
        return False
    return pdt.is_object_dtype(series) or pdt.is_string_dtype(series)


def text_to_number(series: pd.Series) -> pd.Series:
    """Convert text like '₹1,200' or '45%' to numbers. Failures become NaN."""
    cleaned = series.astype(str).str.replace(r"[₹$€£,%\s]", "", regex=True)
    cleaned = cleaned.where(series.notna())  # keep real blanks as blanks
    return pd.to_numeric(cleaned, errors="coerce")
