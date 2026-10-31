# AI Services - Rules and Assumptions

Every threshold below is currently **pending approval by team lead/Sven**.

## Rule thresholds

- `MIN_PERIODS = 6` for time-series anomaly checks.
- Anomaly robust z threshold is `3.5`; percentage-change threshold is `30%`; the trailing mean uses a six-period window with at least three observations.
- Anomaly severity is high at absolute z-score `>= 5` or absolute percentage change `>= 50%`; otherwise it is medium. At most 25 anomalies are returned.
- Row outlier detection requires `50+` rows, uses 200 Isolation Forest estimators, automatic contamination, and random state 42; at most 10 row outliers are returned.
- Recommendation trends use the last six periods and trigger at slope `<= -5%` per period; `<= -10%` is high priority.
- Concentration risk triggers when the largest segment share is `> 50%`.
- Customer-frequency analysis needs four periods, compares customers with at least two prior purchases, and treats a `50%` or greater frequency reduction as declined.
- Recommendations are capped at 10; only the top 3 may call `explain()`.
- Opportunities compare a three-period recent window with the preceding three-period window. Triggers are growth `>= 10%` with a repeat-rate gap `>= 5%`, growth `>= 20%`, or decline `<= -10%` where share is `>= 15%`; at most 10 are returned.
- Root-cause drivers are capped at the top 8.
- LLM explanations are limited to three sentences and 1024 output tokens. Timeout defaults to 10 seconds.

## Limitations and assumptions

- The caller supplies the column mapping.
- Duplicate rows are not removed and formats are not normalised.
- Nothing is stored by this service.
- Results are statistical associations, not causes.
- A live LLM call was verified only on `/api/v1/ai/root-cause`.
- The free Gemini tier may use inputs to improve Google's models; never send real customer data.
- Cost-saving opportunities are not covered.
- Dashboard rolling windows may differ from these calendar periods.
- LLM failures fall back to template text; explanations must use only facts computed by the service.
