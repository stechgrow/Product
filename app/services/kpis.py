"""KPI cards: totals (sales, profit, units...) and change vs the previous period."""
import pandas as pd

from .column_mapper import col
from .utils import as_datetime, clean_value

PERIOD_DAYS = {"week": 7, "month": 30, "year": 365}


def apply_period(df: pd.DataFrame, mapping: dict, period: str):
    """Cut the data to the chosen period.

    Returns (current_rows, previous_rows_or_None, note_or_None).
    Periods are counted back from the LATEST date in the file (not today),
    so old files still work.
    """
    if period == "all":
        return df, None, None
    date_col = col(mapping, "date")
    if not date_col:
        return df, None, "No date column found, so the period filter was not applied."

    dates = as_datetime(df[date_col])
    end = dates.max()
    if pd.isna(end):
        return df, None, "Dates could not be read, so the period filter was not applied."

    days = pd.Timedelta(days=PERIOD_DAYS[period])
    start = end - days
    current = df[(dates > start) & (dates <= end)]
    previous = df[(dates > start - days) & (dates <= start)]
    return current, previous, None


def compute_totals(df: pd.DataFrame, mapping: dict) -> dict:
    """The raw KPI numbers. A KPI is None when the file can't support it."""
    rev, profit, units = col(mapping, "revenue"), col(mapping, "profit"), col(mapping, "units")
    country, order_id, visits = col(mapping, "country"), col(mapping, "order_id"), col(mapping, "visits")

    total_sales = df[rev].sum() if rev else None
    # Orders: unique order ids if we have them, otherwise each row counts as one order
    orders = (df[order_id].nunique() if order_id else len(df)) if len(df) else 0
    visits_total = df[visits].sum() if visits else 0
    return {
        "total_sales": total_sales,
        "total_profit": df[profit].sum() if profit else None,
        "total_units": df[units].sum() if units else None,
        "countries": df[country].nunique() if country else None,
        "orders": orders,
        "avg_order_value": (total_sales / orders) if (rev and orders) else None,
        # Conversion needs visits data, which most company files don't have
        "conversion_rate": (orders / visits_total * 100) if (visits and visits_total) else None,
    }


def _pct_change(current, previous):
    if current is None or previous in (None, 0) or pd.isna(previous):
        return None
    return round((current - previous) / abs(previous) * 100, 2)


def kpis_with_change(df: pd.DataFrame, mapping: dict, period: str = "all") -> dict:
    """KPI values for the period, plus % change vs the previous period."""
    current, previous, note = apply_period(df, mapping, period)
    now = compute_totals(current, mapping)
    before = compute_totals(previous, mapping) if previous is not None and len(previous) else None

    metrics = {
        name: {
            "value": clean_value(value),
            "change_percent": _pct_change(value, before[name]) if before else None,
        }
        for name, value in now.items()
    }
    notes = []
    if not col(mapping, "order_id"):
        notes.append("No order id column found, so each row is counted as one order.")
    return {"metrics": clean_value(metrics), "period_note": note, "notes": notes, "current_df": current}
