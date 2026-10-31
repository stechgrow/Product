import pandas as pd

from .common import InsufficientDataError, r
from .llm import explain
from app.modules.ai_services.schemas import ColumnMap


def analyze(df: pd.DataFrame, cm: ColumnMap, freq: str, target_period, use_llm: bool) -> dict:
    if not cm.date_col:
        raise InsufficientDataError("Root cause analysis needs date_col")
    periods = set(df["_period"])
    try:
        target = pd.Period(target_period, freq=freq) if target_period else max(periods)
    except Exception:
        raise InsufficientDataError(f"Invalid target_period '{target_period}'")
    baseline = target - 1
    if target not in periods:
        raise InsufficientDataError(f"No data for target period {target}")
    if baseline not in periods:
        raise InsufficientDataError(f"No data for baseline period {baseline}")

    cur, base = df[df["_period"] == target], df[df["_period"] == baseline]
    v = cm.value_col
    t1, t0 = cur[v].sum(), base[v].sum()
    n1, n0 = len(cur), len(base)
    aov1, aov0 = (t1 / n1 if n1 else 0), (t0 / n0 if n0 else 0)
    delta = t1 - t0
    volume_effect = (n1 - n0) * aov0
    value_effect = (aov1 - aov0) * n1          # volume + value == delta exactly

    drivers, notes = [], ["Statistical attribution, not proof of causation"]
    if cm.dimension_col:
        d = cm.dimension_col
        s1, s0 = cur.groupby(d)[v].sum(), base.groupby(d)[v].sum()
        c1, c0 = cur.groupby(d).size(), base.groupby(d).size()
        for seg in s1.index.union(s0.index):
            seg_delta = s1.get(seg, 0) - s0.get(seg, 0)
            sn1, sn0 = int(c1.get(seg, 0)), int(c0.get(seg, 0))
            sa1 = s1.get(seg, 0) / sn1 if sn1 else 0
            sa0 = s0.get(seg, 0) / sn0 if sn0 else 0
            drivers.append({
                "factor": f"{d}={seg}", "contribution": r(seg_delta),
                "share_of_change_pct": r(seg_delta / delta * 100) if delta else None,
                "evidence": {"baseline": r(s0.get(seg, 0)), "target": r(s1.get(seg, 0)),
                             "orders_baseline": sn0, "orders_target": sn1,
                             "avg_order_value_baseline": r(sa0), "avg_order_value_target": r(sa1)},
            })
        drivers.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        drivers = drivers[:8]
    else:
        notes.append("No dimension_col: only volume vs value split available")

    pct = (delta / abs(t0) * 100) if t0 else None
    fallback = (f"Total changed {delta:,.0f} ({pct:.1f}%) from {baseline} to {target}. "
                if pct is not None else f"Total changed {delta:,.0f}. ")
    fallback += f"Order volume effect: {volume_effect:,.0f}; average order value effect: {value_effect:,.0f}."
    if drivers:
        fallback += f" Largest segment driver: {drivers[0]['factor']} ({drivers[0]['contribution']:,.0f})."

    text, src = explain({"baseline": str(baseline), "target": str(target), "total_change": r(delta),
                         "total_change_pct": r(pct), "volume_effect": r(volume_effect),
                         "value_effect": r(value_effect), "top_drivers": drivers[:3]}, fallback, use_llm)
    return {
        "target_period": str(target), "baseline_period": str(baseline),
        "baseline_total": r(t0), "target_total": r(t1), "total_change": r(delta),
        "total_change_pct": r(pct), "volume_effect": r(volume_effect), "value_effect": r(value_effect),
        "drivers": drivers, "explanation": text, "explanation_source": src, "notes": notes,
    }