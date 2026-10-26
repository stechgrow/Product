import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def get_saas_dataset() -> pd.DataFrame:
    """Generates realistic B2B SaaS data with intentional anomalies matching Figma."""
    np.random.seed(42)
    n = 200
    
    start_date = datetime.now() - timedelta(days=60)
    dates = [start_date + timedelta(hours=i*7) for i in range(n)]
    
    plans = np.random.choice(["Plan A", "Plan B", "Plan Enterprise", "Plan Starter"], size=n, p=[0.3, 0.4, 0.15, 0.15])
    mrr = []
    churn = []
    
    for plan in plans:
        if plan == "Plan B":
            # Intentional decline and churn spike in Plan B (matching Figma)
            base_mrr = np.random.normal(3200, 300)
            is_churn = np.random.choice([0, 1], p=[0.72, 0.28])
        elif plan == "Plan Enterprise":
            base_mrr = np.random.normal(12000, 1500)
            is_churn = np.random.choice([0, 1], p=[0.95, 0.05])
        else:
            base_mrr = np.random.normal(1500, 200)
            is_churn = np.random.choice([0, 1], p=[0.88, 0.12])
        mrr.append(max(100.0, base_mrr))
        churn.append(is_churn)
        
    df = pd.DataFrame({
        "id": [f"SUB-{1000+i}" for i in range(n)],
        "date": dates,
        "plan": plans,
        "revenue": mrr,
        "churn": churn,
        "customer_tenure_months": np.random.randint(1, 48, size=n),
        "support_tickets": np.random.poisson(1.5, size=n)
    })
    
    # Introduce explicit anomalies for detection
    df.loc[15, "revenue"] = 45000.0   # Extreme revenue spike
    df.loc[45, "revenue"] = -250.0     # Negative revenue/chargeback anomaly
    df.loc[88, "revenue"] = 52000.0   # High-value outlier
    df.loc[120, "revenue"] = 80.0     # Deep sudden dip
    
    return df

def get_ecommerce_dataset() -> pd.DataFrame:
    """Generates realistic E-commerce retail transactions."""
    np.random.seed(101)
    n = 250
    start_date = datetime.now() - timedelta(days=30)
    dates = [start_date + timedelta(hours=i*3) for i in range(n)]
    
    categories = np.random.choice(["Apparel", "Electronics", "Home & Kitchen", "Accessories"], size=n)
    amounts = np.random.exponential(scale=1800, size=n) + 150
    
    df = pd.DataFrame({
        "order_id": [f"ORD-{5000+i}" for i in range(n)],
        "date": dates,
        "category": categories,
        "revenue": amounts,
        "cost": amounts * np.random.uniform(0.5, 0.85, size=n),
        "customer_id": np.random.choice([f"CUST-{j}" for j in range(40)], size=n) # High customer concentration
    })
    
    # Add anomalies
    df.loc[10, "revenue"] = 28500.0
    df.loc[95, "revenue"] = 34000.0
    return df

def get_sherly_eda_mock() -> dict:
    """Mock of Sherly's EDA profiling output."""
    return {
        "dataset_name": "Stechgrow_Design_Dataset",
        "row_count": 50000,
        "numeric_columns_count": 9,
        "categorical_columns_count": 7,
        "datetime_columns_count": 2,
        "missing_values_count": 320,
        "duplicate_rows_count": 14,
        "average_correlation": 0.64
    }
