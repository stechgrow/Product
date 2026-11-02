"""Evidence-based findings for the Data Analysis screen.

Every finding carries the numbers behind it ('evidence') and, when the data
is thin, a 'limitations' note. The 'statement' is a plain draft sentence;
the AI engineer can reword it later.
"""
import pandas as pd

from .charts import get_year_series
from .cleaning import quality_report
from .column_mapper import col
from .utils import as_datetime, clean_value


def _item(key, statement, evidence, limitations=None):
    return {"key": key, "statement": statement, "evidence": clean_value(evidence), "limitations": limitations}


def _top_share(df, group_col, value_col):
    totals = df.groupby(group_col)[value_col].sum().sort_values(ascending=False)
    grand = totals.sum()
    top = totals.index[0]
    return str(top), round(float(totals.iloc[0] / grand * 100), 1) if grand else 0.0, totals.head(3)


def build_insights(df: pd.DataFrame, mapping: dict) -> dict:
    rev, profit = col(mapping, "revenue"), col(mapping, "profit")
    product, country, date = col(mapping, "product"), col(mapping, "country"), col(mapping, "date")
    insights, problems, opportunities, unavailable = [], [], [], []

    # ---- Top insights
    for key, group, label in (("top_product", product, "product"), ("top_country", country, "country")):
        if rev and group:
            top, share, top3 = _top_share(df, group, rev)
            insights.append(_item(key, f"{top} is the top {label} by sales ({share}% of total).",
                                  {"top": top, "share_percent": share, "top3": top3.to_dict()}))
        else:
            unavailable.append(f"{key} (needs sales and {label} columns)")

    if rev and date:
        d = as_datetime(df[date])
        daily = df.groupby(d.dt.date)[rev].sum()
        weekend = pd.to_datetime(daily.index).dayofweek >= 5
        if len(daily) >= 14 and weekend.any() and (~weekend).any():
            we, wd = daily[weekend].mean(), daily[~weekend].mean()
            diff = round((we - wd) / wd * 100, 1) if wd else None
            if diff is not None:
                word = "lower" if diff < 0 else "higher"
                insights.append(_item("weekend_vs_weekday", f"Weekend sales are {abs(diff)}% {word} than weekdays.",
                                      {"weekend_avg": we, "weekday_avg": wd, "difference_percent": diff},
                                      f"Based on {len(daily)} distinct days of data."))
        else:
            unavailable.append("weekend_vs_weekday (needs at least 14 distinct days incl. weekdays and weekends)")
    else:
        unavailable.append("weekend_vs_weekday (needs sales and date columns)")

    # ---- Problems & risks (from the data-quality checks)
    for c in quality_report(df)["checks"]:
        if c["severity"] in ("medium", "high"):
            problems.append(_item(c["key"], f"{c['name']}: {c['issue_count']} issue(s) found.",
                                  {"count": c["issue_count"], "severity": c["severity"]}))

    # ---- Growth opportunities
    if rev and profit and product:
        g = df.groupby(product)[[rev, profit]].sum()
        g = g[g[rev] > 0]
        if len(g):
            margin = (g[profit] / g[rev] * 100).sort_values(ascending=False)
            opportunities.append(_item("best_margin_product",
                                       f"{margin.index[0]} has the best profit margin ({round(margin.iloc[0], 1)}%).",
                                       {"product": margin.index[0], "margin_percent": margin.iloc[0]}))
    else:
        unavailable.append("best_margin_product (needs sales, profit and product columns)")

    years = get_year_series(df, mapping)
    if rev and product and years is not None and years.nunique() >= 2:
        t = pd.DataFrame({"p": df[product], "y": years, "v": df[rev]}).dropna()
        prev, last = sorted(t["y"].unique())[-2:]  # the two most recent years
        pivot = t.pivot_table(index="p", columns="y", values="v", aggfunc="sum")
        pivot = pivot[pivot[prev] > 0].dropna(subset=[last, prev])
        if len(pivot):
            growth = ((pivot[last] - pivot[prev]) / pivot[prev] * 100).sort_values(ascending=False)
            opportunities.append(_item("fastest_growing_product",
                                       f"{growth.index[0]} grew fastest ({round(growth.iloc[0], 1)}%) from {int(prev)} to {int(last)}.",
                                       {"product": growth.index[0], "growth_percent": growth.iloc[0]},
                                       f"Compares only {int(prev)} and {int(last)}."))
    else:
        unavailable.append("fastest_growing_product (needs sales, product and 2+ years)")

    return {"insights": insights, "problems": problems, "opportunities": opportunities,
            "unavailable": unavailable}
