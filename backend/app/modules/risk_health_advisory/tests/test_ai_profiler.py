import asyncio
import pandas as pd
from app.modules.risk_health_advisory.ai_profiler import AIProfilerService
from app.modules.risk_health_advisory.fixtures.mock_data import get_saas_dataset, get_ecommerce_dataset

def test_domain_inference():
    saas_df = get_saas_dataset()
    domain = AIProfilerService.infer_domain(saas_df)
    assert "SaaS" in domain

    ecom_df = get_ecommerce_dataset()
    domain_ecom = AIProfilerService.infer_domain(ecom_df)
    assert "Commerce" in domain_ecom

def test_questionnaire_generation():
    df = get_saas_dataset()
    q = AIProfilerService.generate_questionnaire(df)
    assert len(q.questions) >= 2
    for question in q.questions:
        assert len(question.options) >= 2
        assert question.id != ""

def test_narrative_insight_offline_synthesis():
    df = get_saas_dataset()
    insight = asyncio.run(AIProfilerService.synthesize_narrative_insight(df, answers={"q_churn_driver": "pricing"}))
    assert "Subscription Plan B" in insight.headline or "Subscription Plan B" in insight.narrative
    assert insight.affected_segment is not None
