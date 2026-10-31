# AI Services - Features and Outputs

## Endpoints

- `POST /api/v1/ai/anomalies`: robust z-scores and trailing-mean percentage changes, plus row-level Isolation Forest outliers.
- `POST /api/v1/ai/recommendations`: rule-based anomaly follow-up, declining-segment, concentration-risk, and customer-frequency actions.
- `POST /api/v1/ai/opportunities`: segment growth, retention gaps, share, and a simple next-period forecast.
- `POST /api/v1/ai/root-cause`: period-over-period total, volume/value attribution, and ranked dimension drivers.

All numbers are computed by Python code. The optional LLM only explains those numbers and cannot calculate or add facts.

## Real synthetic responses

The following examples were generated from the module test fixture (January-December 2025, North/South, with a South drop in December) and `use_llm: false`.

### `/api/v1/ai/anomalies`

```json
{"anomalies":[{"kind":"time_series","series":"South","period":"2025-12","observed":532.8,"expected":860.0,"deviation_pct":-38.05,"robust_z":-8.52,"severity":"high","summary":"South dropped 38% vs its trailing average in 2025-12","evidence":{"method":"robust_z + trailing_mean","median":836.0}}],"rows_dropped":0,"notes":[]}
```

### `/api/v1/ai/recommendations`

```json
{"recommendations":[{"title":"Investigate drop in South","category":"risk","priority":"high","action":"Review South for 2025-12: check pricing, stock, campaigns and data issues.","evidence":{"series":"South","period":"2025-12","deviation_pct":-38.05},"explanation":"South dropped 38% vs its trailing average in 2025-12.","explanation_source":"template"}],"notes":[]}
```

### `/api/v1/ai/opportunities`

```json
{"opportunities":[{"segment":"South","type":"recovery","score":46.6,"summary":"South: large segment down 11%; recovering it is a revenue opportunity.","evidence":{"growth_pct":-11.03,"share_pct":43.56,"value_at_risk":283.2,"periods_compared":3}}],"notes":["Cost-saving opportunities need a cost column and are not covered yet"]}
```

### `/api/v1/ai/root-cause`

```json
{"target_period":"2025-12","baseline_period":"2025-11","baseline_total":1980.0,"target_total":1642.8,"total_change":-337.2,"total_change_pct":-17.03,"volume_effect":0.0,"value_effect":-337.2,"drivers":[{"factor":"region=South","contribution":-347.2,"share_of_change_pct":102.97}],"explanation":"Total changed -337 (-17.0%) from 2025-11 to 2025-12. Order volume effect: 0; average order value effect: -337. Largest segment driver: region=South (-347).","explanation_source":"template","notes":["Statistical attribution, not proof of causation"]}
```

`explanation_source` is `llm` when a configured provider returns text, and `template` when LLM use is disabled, unconfigured, empty, invalid, or fails. The LLM only explains numbers computed by code.
