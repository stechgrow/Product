import pytest
import pandas as pd
import numpy as np
from app.modules.risk_health_advisory.risk_engine import RiskDetectionEngine
from app.modules.risk_health_advisory.fixtures.mock_data import get_saas_dataset

def test_zscore_outlier_detection():
    # Normal data with one extreme outlier
    data = pd.Series([100.0, 102.0, 98.0, 101.0, 99.0, 100.0, 5000.0])
    outliers, scores = RiskDetectionEngine.detect_outliers_zscore(data, threshold=3.0)
    assert len(outliers) == len(data)
    assert outliers[-1] == True  # The 5000 value is an outlier
    assert outliers[0] == False  # Normal values are not outliers

def test_iqr_outlier_detection():
    data = pd.Series([10.0, 12.0, 11.0, 13.0, 12.0, 100.0])
    outliers, lower, upper = RiskDetectionEngine.detect_outliers_iqr(data)
    assert outliers[-1] == True
    assert outliers[0] == False
    assert upper > lower

def test_risk_engine_empty_and_edge_cases():
    # Empty series
    empty_series = pd.Series([], dtype=float)
    outliers, scores = RiskDetectionEngine.detect_outliers_zscore(empty_series)
    assert len(outliers) == 0

    # Constant values
    const_series = pd.Series([50.0, 50.0, 50.0, 50.0, 50.0])
    outliers, scores = RiskDetectionEngine.detect_outliers_zscore(const_series)
    assert not any(outliers)

def test_evaluate_risks_saas():
    df = get_saas_dataset()
    risks = RiskDetectionEngine.evaluate_risks(df)
    assert len(risks) >= 2
    # Verify severity badges are valid
    for r in risks:
        assert r.severity in ["High", "Medium", "Low"]
        assert "₹" in r.business_impact_formatted

def test_generate_timeseries_spline():
    df = get_saas_dataset()
    chart_30d = RiskDetectionEngine.generate_timeseries_spline(df, metric="revenue", time_range="30D")
    assert len(chart_30d.points) == 30
    assert any(p.is_anomaly for p in chart_30d.points)

    chart_14d = RiskDetectionEngine.generate_timeseries_spline(df, metric="revenue", time_range="14D")
    assert len(chart_14d.points) == 14
