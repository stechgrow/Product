"""Chart-ready data for the Dashboard screen. Same JSON shape every time."""
import pandas as pd

from .column_mapper import col
from .utils import as_datetime, clean_value


def share_chart(df: pd.DataFrame, group_col: str, value_col: str, top_n: int = 6) -> dict:
    """Pie/gauge data: total per group, plus each group's % share."""
    totals = df.groupby(group_col)[value_col].sum().sort_values(ascending=False)
    if len(totals) > top_n:  # too many slices -> lump the tail into 'Other'
        other = totals.iloc[top_n:].sum()
        totals = pd.concat([totals.head(top_n), pd.Series({"Other": other})])
    grand = totals.sum()
    return {
        "labels": [str(i) for i in totals.index],
        "values": [clean_value(v) for v in totals.values],
        "percent": [round(float(v) / grand * 100, 2) if grand else 0.0 for v in totals.values],
    }


def get_year_series(df: pd.DataFrame, mapping: dict):
    """A 'year' for every row: from the date column, or a column literally named Year."""
    date_col, year_col = col(mapping, "date"), col(mapping, "year")
    if date_col:
        return as_datetime(df[date_col]).dt.year
    if year_col:
        return df[year_col]
    return None


def grouped_by_year_chart(df, group_col, value_col, years, top_n: int = 6) -> dict:
    """Bar/line data: x = groups (product/country), one series per year."""
    tmp = pd.DataFrame({"group": df[group_col].astype(str), "year": years, "value": df[value_col]})
    tmp = tmp.dropna(subset=["year", "value"])
    tmp["year"] = tmp["year"].astype(int)
    top = tmp.groupby("group")["value"].sum().nlargest(top_n).index
    pivot = tmp[tmp["group"].isin(top)].pivot_table(
        index="group", columns="year", values="value", aggfunc="sum", fill_value=0
    )
    return {
        "categories": [str(g) for g in pivot.index],
        "series": [
            {"name": str(year), "values": [clean_value(v) for v in pivot[year].values]}
            for year in pivot.columns
        ],
    }


def build_charts(df: pd.DataFrame, mapping: dict):
    """All 6 dashboard charts. Returns (charts, unavailable_reasons)."""
    rev, product = col(mapping, "revenue"), col(mapping, "product")
    country, segment, discount = col(mapping, "country"), col(mapping, "segment"), col(mapping, "discount")
    years = get_year_series(df, mapping)

    charts, unavailable = {}, {}

    def need(name, ok, reason):
        if not ok:
            unavailable[name] = reason
        return ok

    if need("sales_by_product", rev and product, "needs a sales column and a product column"):
        charts["sales_by_product"] = share_chart(df, product, rev)
    if need("sales_by_product_yearly", rev and product and years is not None,
            "needs sales, product and a date/year column"):
        charts["sales_by_product_yearly"] = grouped_by_year_chart(df, product, rev, years)
    if need("discounted_brands", rev and product and discount,
            "needs sales, product and a discount column"):
        charts["discounted_brands"] = share_chart(df[df[discount] > 0], product, rev)
    if need("sales_by_country", rev and country, "needs a sales column and a country column"):
        charts["sales_by_country"] = share_chart(df, country, rev)
    if need("sales_by_country_yearly", rev and country and years is not None,
            "needs sales, country and a date/year column"):
        charts["sales_by_country_yearly"] = grouped_by_year_chart(df, country, rev, years)
    if need("sales_by_segment", rev and segment, "needs a sales column and a segment column"):
        charts["sales_by_segment"] = share_chart(df, segment, rev)
    return charts, unavailable
