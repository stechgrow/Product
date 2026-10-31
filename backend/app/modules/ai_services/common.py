import pandas as pd
from app.modules.ai_services.schemas import DatasetPayload, ColumnMap

MIN_PERIODS = 6


class InsufficientDataError(ValueError):
    """Raised when input can't support the requested analysis (-> HTTP 422)."""


def prepare(payload: DatasetPayload) -> tuple[pd.DataFrame, int]:
    cm = payload.columns
    df = pd.DataFrame(payload.records)
    for c in (cm.date_col, cm.value_col, cm.dimension_col, cm.customer_col):
        if c and c not in df.columns:
            raise InsufficientDataError(f"Column '{c}' not found in records")

    n0 = len(df)
    df[cm.value_col] = pd.to_numeric(df[cm.value_col], errors="coerce")
    df = df.dropna(subset=[cm.value_col])

    if cm.date_col:
        df[cm.date_col] = pd.to_datetime(df[cm.date_col], errors="coerce")
        df = df.dropna(subset=[cm.date_col])
        df["_period"] = df[cm.date_col].dt.to_period(payload.freq)
        if payload.drop_last_period and not df.empty:
            df = df[df["_period"] < df["_period"].max()]
    if cm.dimension_col:
        df[cm.dimension_col] = df[cm.dimension_col].fillna("Unknown").astype(str)

    if df.empty:
        raise InsufficientDataError("No valid rows left after cleaning")
    return df, n0 - len(df)


def total_series(df: pd.DataFrame, cm: ColumnMap, freq: str) -> pd.Series:
    s = df.groupby("_period")[cm.value_col].sum().sort_index()
    return s.reindex(pd.period_range(s.index.min(), s.index.max(), freq=freq), fill_value=0)


def segment_pivot(df: pd.DataFrame, cm: ColumnMap, freq: str) -> pd.DataFrame:
    pv = df.pivot_table(index="_period", columns=cm.dimension_col,
                        values=cm.value_col, aggfunc="sum", fill_value=0).sort_index()
    return pv.reindex(pd.period_range(pv.index.min(), pv.index.max(), freq=freq), fill_value=0)


def r(x, n=2):
    return None if x is None or pd.isna(x) else round(float(x), n)