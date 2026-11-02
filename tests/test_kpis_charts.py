import pandas as pd

from app.services.charts import build_charts
from app.services.column_mapper import detect_columns
from app.services.kpis import kpis_with_change


def test_kpi_totals(sample_df):
    m = kpis_with_change(sample_df, detect_columns(sample_df))["metrics"]
    assert m["total_sales"]["value"] == 1500
    assert m["total_profit"]["value"] == 380
    assert m["total_units"]["value"] == 150
    assert m["countries"]["value"] == 3
    assert m["avg_order_value"]["value"] == 300      # 1500 / 5 rows
    assert m["conversion_rate"]["value"] is None     # no visits column


def test_period_change(sample_df):
    # latest date 2025-03-10. Last 30 days = Feb 10, Feb 20, Mar 10 = 300+400+500 = 1200
    # The 30 days before = Jan 10, Jan 20 = 100+200 = 300  ->  +300%
    m = kpis_with_change(sample_df, detect_columns(sample_df), "month")["metrics"]
    assert m["total_sales"]["value"] == 1200
    assert m["total_sales"]["change_percent"] == 300.0


def test_period_without_date_is_not_applied():
    df = pd.DataFrame({"Sales": [1, 2, 3]})
    r = kpis_with_change(df, detect_columns(df), "week")
    assert r["period_note"] and r["metrics"]["total_sales"]["value"] == 6


def test_charts(sample_df):
    charts, unavailable = build_charts(sample_df, detect_columns(sample_df))
    assert charts["sales_by_product"]["labels"] == ["Alpha", "Beta"]
    assert charts["sales_by_product"]["values"] == [900, 600]
    assert charts["sales_by_product"]["percent"] == [60.0, 40.0]
    assert "discounted_brands" in unavailable        # no discount column
    assert "sales_by_segment" in unavailable
