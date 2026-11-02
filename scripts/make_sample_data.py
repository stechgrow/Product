"""Makes a messy, Financial-Sample-style file so you can try every endpoint.

Run from the backend/ folder:  python scripts/make_sample_data.py
Creates data/uploads/sample_sales.csv with deliberate problems:
duplicates, blanks, spelling variants, a negative quantity and an outlier.
"""
from pathlib import Path

import numpy as np
import pandas as pd

rng = np.random.default_rng(42)
n = 600
dates = pd.to_datetime("2024-01-01") + pd.to_timedelta(rng.integers(0, 730, n), unit="D")
df = pd.DataFrame({
    "Date": dates.strftime("%Y-%m-%d"),
    "Segment": rng.choice(["Government", "Midmarket", "Enterprise"], n),
    "Country": rng.choice(["India", "USA", "Canada", "Germany", "France"], n),
    "Product": rng.choice(["Carretera", "Paseo", "VTT", "Velo", "Amarilla"], n),
    "Units Sold": rng.integers(100, 3000, n),
})
df["Sales"] = (df["Units Sold"] * rng.uniform(5, 20, n)).round(2)
df["Profit"] = (df["Sales"] * rng.uniform(0.05, 0.3, n)).round(2)
df["Discounts"] = np.where(rng.random(n) < 0.3, (df["Sales"] * 0.1).round(2), 0)

# --- inject real-world mess ---
df.loc[rng.choice(n, 25, replace=False), "Sales"] = np.nan          # blanks
df.loc[rng.choice(n, 10, replace=False), "Country"] = "india "      # spelling variants
df.loc[rng.choice(n, 8, replace=False), "Product"] = "PASEO"
df.loc[5, "Units Sold"] = -50                                        # invalid
df.loc[7, "Sales"] = 5_000_000                                       # outlier
df = pd.concat([df, df.iloc[:12]], ignore_index=True)                # duplicates

out = Path(__file__).resolve().parents[1] / "data" / "uploads" / "sample_sales.csv"
out.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(out, index=False)
print(f"Saved {len(df)} rows to {out}")
