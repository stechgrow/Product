import numpy as np
import pandas as pd

from . import anomaly
from .common import MIN_PERIODS, segment_pivot, r
from .llm import explain
from app.modules.ai_services.schemas import ColumnMap


def _rec(title, category, priority, action, evidence, fallback, use_llm):
    safe = {k: v for k, v in evidence.items() if k != "top_customers"}
    return {"title": title, "category": category, "priority": priority, "action": action,
            "evidence": evidence, "explanation": fallback, "explanation_source": "template",
            "_findings": {"title": title, "action": action, "evidence": safe}}


def build(df: pd.DataFrame, cm: ColumnMap, freq: str, use_llm: bool) -> tuple[list[dict], list[str]]:
    recs, notes = [], []
    anomalies, a_notes = anomaly.detect(df, cm, freq)
    notes += a_notes

    # 1) Anomaly follow-up (drops only)
    for a in [x for x in anomalies if x["kind"] == "time_series" and (x["deviation_pct"] or 0) < 0][:3]:
        recs.append(_rec(
            f"Investigate drop in {a['series']}", "risk", a["severity"],
            f"Review {a['series']} for {a['period']}: check pricing, stock, campaigns and data issues.",
            a, a["summary"] + ".", use_llm))

    # 2) Declining segments (trend slope)
    if cm.date_col and cm.dimension_col:
        pv = segment_pivot(df, cm, freq)
        if len(pv) >= MIN_PERIODS:
            tail = pv.iloc[-6:]
            x = np.arange(len(tail))
            for seg in tail.columns:
                y = tail[seg].values.astype(float)
                if y.mean() <= 0:
                    continue
                slope_pct = np.polyfit(x, y, 1)[0] / y.mean() * 100
                if slope_pct <= -5:
                    recs.append(_rec(
                        f"Reverse the decline in {seg}", "growth", "high" if slope_pct <= -10 else "medium",
                        f"Review pricing, promotions and sales coverage for {seg}.",
                        {"segment": str(seg), "trend_pct_per_period": r(slope_pct), "periods_used": len(tail)},
                        f"{seg} is trending down about {abs(slope_pct):.1f}% per period.", use_llm))

        # 3) Concentration risk
        tot = pv.sum()
        share = tot / tot.sum() if tot.sum() > 0 else tot
        if len(share) > 1 and share.max() > 0.5:
            seg = str(share.idxmax())
            recs.append(_rec(
                f"Reduce dependence on {seg}", "risk", "medium",
                f"{seg} drives over half of the total; diversify or protect this segment.",
                {"segment": seg, "share_pct": r(share.max() * 100)},
                f"{seg} accounts for {share.max()*100:.0f}% of total value.", use_llm))

    # 4) Customers with declining purchase frequency
    if cm.date_col and cm.customer_col:
        periods = sorted(df["_period"].unique())
        if len(periods) >= 4:
            w = min(3, len(periods) // 2)
            recent_p, prior_p = periods[-w:], periods[-2 * w:-w]
            rc = df[df["_period"].isin(recent_p)].groupby(cm.customer_col).size()
            pc = df[df["_period"].isin(prior_p)].groupby(cm.customer_col).size()
            pc = pc[pc >= 2]
            if len(pc):
                recent = rc.reindex(pc.index, fill_value=0)
                declined = pc[recent <= pc * 0.5]
                if len(declined) > 0:
                    pct = len(declined) / len(pc) * 100
                    recs.append(_rec(
                        "Follow up with customers buying less often", "retention",
                        "high" if pct >= 30 else "medium",
                        "Prioritise outreach to customers whose purchase frequency halved or worse.",
                        {"customers_declined": int(len(declined)), "customers_compared": int(len(pc)),
                         "pct_declined": r(pct),
                         "top_customers": [str(c) for c in declined.sort_values(ascending=False).index[:10]]},
                        f"{len(declined)} of {len(pc)} previously active customers cut purchases by 50%+.",
                        use_llm))
        else:
            notes.append("Need 4+ periods for customer frequency analysis")

    if not recs:
        notes.append("No rule-based triggers fired; data may be stable or insufficient")
    order = {"high": 0, "medium": 1, "low": 2}
    recs.sort(key=lambda x: order[x["priority"]])
    recs = recs[:10]
    for i, rec in enumerate(recs):
        findings = rec.pop("_findings")
        if use_llm and i < 3:        # only the top 3 get an LLM explanation
            rec["explanation"], rec["explanation_source"] = explain(findings, rec["explanation"], use_llm)
    return recs, notes