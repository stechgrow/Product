"""Shared test setup: a tiny dataset where we KNOW the right answers."""
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


@pytest.fixture
def sample_df():
    # Totals we can check by hand: sales 1500, profit 380, units 150, 3 countries
    return pd.DataFrame({
        "Date": ["2025-01-10", "2025-01-20", "2025-02-10", "2025-02-20", "2025-03-10"],
        "Country": ["India", "India", "USA", "USA", "UK"],
        "Product": ["Alpha", "Beta", "Alpha", "Beta", "Alpha"],
        "Sales": [100, 200, 300, 400, 500],
        "Profit": [20, 50, 60, 100, 150],
        "Units": [10, 20, 30, 40, 50],
    })


@pytest.fixture
def client(tmp_path, sample_df, monkeypatch):
    """API client whose upload folder is a temporary folder with sample.csv inside."""
    monkeypatch.setattr(settings, "upload_dir", tmp_path / "uploads")
    monkeypatch.setattr(settings, "cleaned_dir", tmp_path / "cleaned")
    monkeypatch.setattr(settings, "mapping_dir", tmp_path / "mappings")
    settings.upload_dir.mkdir()
    sample_df.to_csv(settings.upload_dir / "sample.csv", index=False)
    return TestClient(app)
