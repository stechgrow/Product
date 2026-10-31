import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from .common import MIN_PERIODS, segment_pivot, total_series, r
from app.modules.ai_services.schemas import ColumnMap

Z_THRESHOLD = 3.5
PCT_THRESHOLD = 30.0


def _scan(s: pd.Series, label: str) -> list[dict]:
    if len(s) < MIN_PERIODS:
        return []
    med = s.median()
    mad = (s - med).abs().median()
    scale = mad / 0.6745 if mad > 0 else s.std(ddof=0)
    base = s.shift(1).rolling(6, min_periods=3).mean()
    out = []
    for i in range(len(s)):
        b, val = base.iloc[i], s.iloc[i]
        if pd.isna(b) or b == 0:
            continue
        pct = (val - b) / abs(b) * 100
        z = (val - med) / scale if scale > 0 else 0.0
        if abs(z) >= Z_THRESHOLD or (abs(pct) >= PCT_THRESHOLD and abs(z) >= 2):
            direction = "dropped" if pct < 0 else "spiked"
            out.append({
                "kind": "time_series", "series": label, "period": str(s.index[i]),
                "observed": r(val), "expected": r(b), "deviation_pct": r(pct),
                "robust_z": r(z),
                "severity": "high" if abs(z) >= 5 or abs(pct) >= 50 else "medium",
                "summary": f"{label} {direction} {abs(pct):.0f}% vs its trailing average in {s.index[i]}",
                "evidence": {"method": "robust_z + trailing_mean", "median": r(med)},
            })
    return out


def _row_outliers(df: pd.DataFrame, top_n: int = 10) -> list[dict]:
    num = df.drop(columns=["_period"], errors="ignore").select_dtypes(include="number")
    num = num.loc[:, num.nunique() > 1]
    if len(num) < 50 or num.shape[1] == 0:
        return []
    X = num.fillna(num.median())
    model = IsolationForest(n_estimators=200, contamination="auto", random_state=42).fit(X)
    scores = -model.score_samples(X)          # higher = more anomalous
    flagged = model.predict(X) == -1
    order = np.argsort(-scores)
    out = []
    for pos in order:
        if not flagged[pos]:
            continue
        row = df.drop(columns=["_period"], errors="ignore").iloc[pos]
        out.append({
            "kind": "row_outlier", "series": "row", "period": None,
            "severity": "high" if scores[pos] > 0.65 else "medium",
            "summary": f"Row {int(df.index[pos])} is an unusual combination of numeric values",
            "evidence": {"method": "isolation_forest", "score": r(scores[pos], 3),
                         "row": json.loads(row.to_json(date_format="iso"))},
        })
        if len(out) >= top_n:
            break
    return out


def detect(df: pd.DataFrame, cm: ColumnMap, freq: str) -> tuple[list[dict], list[str]]:
    items, notes = [], []
    if cm.date_col:
        total = total_series(df, cm, freq)
        if len(total) < MIN_PERIODS:
            notes.append(f"Only {len(total)} periods; need {MIN_PERIODS}+ for time-series checks")
        items += _scan(total, "Total")
        if cm.dimension_col and len(total) >= MIN_PERIODS:
            pv = segment_pivot(df, cm, freq)
            for seg in pv.columns:
                items += _scan(pv[seg], str(seg))
    else:
        notes.append("No date_col given: time-series checks skipped")

    rows = _row_outliers(df)
    if not rows:
        notes.append("Row-level Isolation Forest skipped or found nothing (needs 50+ rows with numeric columns)")
    items += rows
    items.sort(key=lambda x: abs(x.get("robust_z") or 0), reverse=True)
    return items[:25], notes