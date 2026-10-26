import pytest
import pandas as pd
from app.modules.risk_health_advisory.advisory_engine import AdvisoryEngine
from app.modules.risk_health_advisory.fixtures.mock_data import get_saas_dataset, get_sherly_eda_mock

def test_advisory_hub_generation():
    df = get_saas_dataset()
    eda = get_sherly_eda_mock()
    hub = AdvisoryEngine.generate_advisory_hub(df, eda_stats=eda)
    
    assert hub.overview.critical_actions == 3
    assert hub.overview.opportunities == 7
    assert hub.overview.completed == 12
    assert "₹1.2M" in hub.overview.potential_impact_formatted
    assert len(hub.cards) >= 4

def test_advisory_cards_structure():
    df = get_saas_dataset()
    hub = AdvisoryEngine.generate_advisory_hub(df)
    
    for card in hub.cards:
        assert card.title != ""
        assert card.category_badge in ["Revenue", "Data Quality", "Operational", "Cost"]
        assert len(card.recommended_actions) >= 2
        assert "₹" in card.estimated_impact_text or "%" in card.estimated_impact_text
        assert "week" in card.timeline_text.lower() or "month" in card.timeline_text.lower() or "day" in card.timeline_text.lower()

def test_advisory_category_filtering():
    df = get_saas_dataset()
    rev_hub = AdvisoryEngine.generate_advisory_hub(df, category_filter="revenue")
    assert all(c.category_badge == "Revenue" for c in rev_hub.cards)
