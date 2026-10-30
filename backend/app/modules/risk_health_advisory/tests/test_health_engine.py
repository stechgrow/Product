import pytest
import pandas as pd
from app.modules.risk_health_advisory.health_engine import BusinessHealthEngine
from app.modules.risk_health_advisory.fixtures.mock_data import get_saas_dataset, get_sherly_eda_mock

def test_health_engine_score_bounds():
    df = get_saas_dataset()
    eda = get_sherly_eda_mock()
    summary = BusinessHealthEngine.compute_summary(df, eda)
    
    assert 0 <= summary.performance_score <= 100
    assert summary.performance_status in ["Stable", "Moderate", "Critical"]
    assert summary.total_anomalies == summary.high_severity_count + summary.medium_severity_count + summary.low_severity_count
    assert 0 <= summary.customer_retention_rate <= 100

def test_stability_breakdown_metrics():
    df = get_saas_dataset()
    summary = BusinessHealthEngine.compute_summary(df)
    stab = summary.stability
    
    assert 0 <= stab.overall_pct <= 100
    assert 0 <= stab.revenue_pct <= 100
    assert 0 <= stab.customers_pct <= 100
    assert 0 <= stab.operational_pct <= 100
    assert 0 <= stab.channel_pct <= 100
    assert stab.status_label in ["Stable", "Moderate", "Critical"]
