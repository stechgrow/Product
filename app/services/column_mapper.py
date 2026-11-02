"""Column Mapping & Semantic Detection layer: 'which column means what?'

Runs BEFORE the KPI/chart code. For every business role (revenue, date, country...)
it finds candidate columns, scores each one, and decides:

  auto         confidence >= 0.9  -> safe to use
  review       0.6 - 0.9          -> used for now, but the user should confirm
  unresolved   only weak guesses  -> NOT used; user must pick (e.g. a column called 'Total')
  not_found    nothing plausible  -> that KPI/chart shows 'not available'
  confirmed    the user chose it  -> confidence 1.0 (comes from saved overrides)

The user's choices ("overrides") always win over the guesses.
"""
import re

import pandas as pd

from .profiling import column_kind

ACCEPT_AT = 0.6     # below this a guess is only shown as a candidate, never used
AUTO_AT = 0.9       # at/above this no confirmation is needed

# role -> required column type, strong keywords (best first), weak keywords (hints only)
ROLE_RULES = {
    "revenue":  {"kinds": ["numeric"],     "keywords": ["revenue", "sales", "total sales", "amount", "turnover", "gross sales"],
                 "weak": ["total", "value", "income"]},
    "profit":   {"kinds": ["numeric"],     "keywords": ["profit"], "weak": ["net", "earnings", "income"]},
    "units":    {"kinds": ["numeric"],     "keywords": ["units sold", "units", "quantity", "qty"],
                 "weak": ["count", "volume", "pieces"]},
    "discount": {"kinds": ["numeric"],     "keywords": ["discount"], "weak": ["promo", "rebate", "offer"]},
    "visits":   {"kinds": ["numeric"],     "keywords": ["visits", "sessions", "visitors", "traffic"],
                 "weak": ["views", "users"]},
    "year":     {"kinds": ["numeric"],     "keywords": ["year"], "exact_only": True},
    "country":  {"kinds": ["categorical", "other"], "keywords": ["country", "nation"], "weak": ["location", "geo"]},
    "product":  {"kinds": ["categorical", "other"], "keywords": ["product", "item", "sku"],
                 "weak": ["description", "model"]},
    "segment":  {"kinds": ["categorical", "other"], "keywords": ["segment", "category"],
                 "weak": ["type", "group", "class"]},
    "order_id": {"kinds": ["numeric", "categorical", "other"],
                 "keywords": ["order id", "order no", "order number", "invoice"],
                 "weak": ["id", "transaction", "ref"]},
    "date":     {"kinds": ["datetime"],    "keywords": ["date", "day", "time"],
                 "weak": ["period", "created", "timestamp"]},
}


def _normalize(name: str) -> str:
    """'Units_Sold ' -> 'units sold'"""
    return re.sub(r"[^a-z0-9]+", " ", str(name).lower()).strip()


def _score(name: str, rule: dict):
    """How well does this column NAME fit the role? Returns (confidence, keyword_rank)."""
    kws = rule["keywords"]
    for i, kw in enumerate(kws):          # exact name match
        if name == kw:
            return 0.95, i
    if not rule.get("exact_only"):
        for i, kw in enumerate(kws):      # keyword appears inside the name
            if kw in name:
                return 0.7, i
    for i, kw in enumerate(rule.get("weak", [])):   # vague hint only
        if kw == name or kw in name:
            return 0.4, i
    return 0.0, 0


def analyze_columns(df: pd.DataFrame) -> dict:
    """Guess every role. Returns {role: {column, confidence, status, candidates}}."""
    kinds = {c: column_kind(df[c]) for c in df.columns}
    names = {c: _normalize(c) for c in df.columns}
    position = {c: i for i, c in enumerate(df.columns)}
    result, used = {}, set()

    for role, rule in ROLE_RULES.items():
        scored = []
        for c in df.columns:
            if kinds[c] not in rule["kinds"]:
                continue
            conf, rank = _score(names[c], rule)
            if conf > 0:
                scored.append((conf, rank, position[c], c))
        scored.sort(key=lambda t: (-t[0], t[1], t[2]))   # best confidence, best keyword, left-most
        candidates = [{"column": c, "confidence": conf} for conf, _, _, c in scored[:3]]

        chosen = next(((conf, c) for conf, _, _, c in scored if conf >= ACCEPT_AT and c not in used), None)
        if chosen:
            conf, column = chosen
            used.add(column)
            status = "auto" if conf >= AUTO_AT else "review"
            result[role] = {"column": column, "confidence": conf, "status": status, "candidates": candidates}
        elif candidates:
            result[role] = {"column": None, "confidence": 0.0, "status": "unresolved", "candidates": candidates}
        else:
            result[role] = {"column": None, "confidence": 0.0, "status": "not_found", "candidates": []}
    return result


def apply_overrides(analysis: dict, overrides: dict) -> dict:
    """The user's choices win. {role: 'ColumnName'} sets it, {role: None} says 'we don't have this'."""
    merged = {role: dict(info) for role, info in analysis.items()}
    for role, column in (overrides or {}).items():
        if role not in merged:
            continue
        if column is None:
            merged[role].update(column=None, confidence=0.0, status="not_found")
        else:
            merged[role].update(column=column, confidence=1.0, status="confirmed")
    return merged


def to_mapping(analysis: dict) -> dict:
    """Flat {role: {column, confidence, status}} for the roles that have a column.
    This is the shape kpis.py / charts.py / insights.py already use."""
    return {role: {"column": i["column"], "confidence": i["confidence"], "status": i["status"]}
            for role, i in analysis.items() if i["column"]}


def detect_columns(df: pd.DataFrame, overrides: dict = None) -> dict:
    """One call: guess + apply the user's saved choices."""
    return to_mapping(apply_overrides(analyze_columns(df), overrides or {}))


def describe_mapping(df: pd.DataFrame, overrides: dict = None) -> dict:
    """Everything a 'confirm your columns' screen needs."""
    roles = apply_overrides(analyze_columns(df), overrides or {})
    return {
        "roles": roles,
        "columns": [{"column": c, "kind": column_kind(df[c])} for c in df.columns],  # for dropdowns
        "needs_confirmation": [r for r, i in roles.items() if i["status"] in ("review", "unresolved")],
    }


def check_override(df: pd.DataFrame, role: str, column) -> str:
    """Error message if the user's choice is invalid, else None."""
    if role not in ROLE_RULES:
        return f"Unknown role '{role}'. Valid roles: {', '.join(ROLE_RULES)}"
    if column is None:
        return None
    if column not in df.columns:
        return f"Column '{column}' does not exist in this file"
    kind = column_kind(df[column])
    if kind not in ROLE_RULES[role]["kinds"]:
        return f"'{column}' is a {kind} column, but '{role}' needs: {', '.join(ROLE_RULES[role]['kinds'])}"
    return None


def col(mapping: dict, role: str):
    """Shortcut: the column name for a role, or None if not detected."""
    item = mapping.get(role)
    return item["column"] if item else None
