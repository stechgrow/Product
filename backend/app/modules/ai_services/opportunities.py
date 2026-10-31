import numpy as np
import pandas as pd

from .common import InsufficientDataError, segment_pivot, r
from app.modules.ai_services.schemas import ColumnMap


def detect(df: pd.DataFrame, cm: ColumnMap, freq: str) -> tuple[list[dict], list[str]]:
    if not (cm.date_col and cm.dimension_col):
        raise InsufficientDataError("Opportunity detection needs date_col and dimension_col")
    pv = segment_pivot(df, cm, freq)
    if len(pv) < 4:
        raise InsufficientDataError("Need at least 4 periods of data")

    notes = ["Cost-saving opportunities need a cost column and are not covered yet"]
    w = min(3, len(pv) // 2)
    recent, prior = pv.iloc[-w:].sum(), pv.iloc[-2 * w:-w].sum()
    growth = ((recent - prior) / prior.replace(0, np.nan)).fillna(0)
    share = pv.sum() / pv.sum().sum()

    repeat = None
    if cm.customer_col:
        g = df.groupby([cm.dimension_col, cm.customer_col]).size().reset_index(name="n")
        repeat = g.groupby(cm.dimension_col)["n"].apply(lambda s: (s >= 2).mean())
    else:
        notes.append("No customer_col: repeat-purchase analysis skipped")
    med_repeat = repeat.median() if repeat is not None else None

    out = []
    for seg in pv.columns:
        y = pv[seg].iloc[-6:].values.astype(float)
        slope, icpt = np.polyfit(np.arange(len(y)), y, 1)
        forecast = max(0.0, slope * len(y) + icpt)       # naive linear next-period forecast
        gr, sh = float(growth[seg]), float(share[seg])
        rep = float(repeat.get(seg, np.nan)) if repeat is not None else None
        rep_gap = max(0.0, med_repeat - rep) if rep is not None and not np.isnan(rep) else 0.0

        ev = {"growth_pct": r(gr * 100), "share_pct": r(sh * 100),
              "repeat_rate_pct": r(rep * 100) if rep is not None else None,
              "peer_median_repeat_pct": r(med_repeat * 100) if med_repeat is not None else None,
              "forecast_next_period": r(forecast), "periods_compared": w}

        if gr >= 0.10 and rep_gap >= 0.05:
            typ = "rising_demand_low_retention"
            score = 50 * min(gr, 1) + 30 * min(rep_gap * 2, 1) + 20 * min(sh * 3, 1)
            msg = f"{seg}: demand up {gr*100:.0f}% but repeat rate trails peers; improve retention."
        elif gr >= 0.20:
            typ = "high_growth"
            score = 70 * min(gr, 1) + 30 * min(sh * 3, 1)
            msg = f"{seg}: growing {gr*100:.0f}%; consider scaling investment."
        elif gr <= -0.10 and sh >= 0.15:
            typ = "recovery"
            score = 60 * min(abs(gr), 1) + 40 * min(sh * 3, 1)
            ev["value_at_risk"] = r(prior[seg] - recent[seg])
            msg = f"{seg}: large segment down {abs(gr)*100:.0f}%; recovering it is a revenue opportunity."
        else:
            continue
        out.append({"segment": str(seg), "type": typ, "score": r(score, 1), "summary": msg, "evidence": ev})

    out.sort(key=lambda x: x["score"], reverse=True)
    if not out:
        notes.append("No segment met opportunity thresholds")
    return out[:10], notes