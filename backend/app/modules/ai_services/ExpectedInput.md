# AI Services - Expected Input

## Request shape

All endpoints accept JSON with:

- `records`: a non-empty list of objects.
- `columns.value_col`: required numeric metric column.
- `columns.date_col`: optional date column. It enables calendar-period analysis.
- `columns.dimension_col`: optional segment, region, product, or other grouping column.
- `columns.customer_col`: optional customer identifier column.
- `freq`: `D`, `W`, or `M`; defaults to `M`.
- `drop_last_period`: optional boolean; when true, the last calendar bucket is dropped.
- `use_llm`: optional boolean; defaults to true.
- `target_period`: optional period string on `/api/v1/ai/root-cause`; otherwise the latest period is used.

The caller supplies the column mapping. The service does not infer column names.

## Endpoints and minimum data

- `POST /api/v1/ai/anomalies`: six or more periods are needed for time-series checks. Row-level checks need at least 50 rows and more than one varying numeric column.
- `POST /api/v1/ai/recommendations`: six or more periods enable anomaly/trend recommendations; customer-frequency recommendations need at least four periods.
- `POST /api/v1/ai/opportunities`: requires `date_col` and `dimension_col`, and at least four periods.
- `POST /api/v1/ai/root-cause`: requires `date_col`, a target period, and its immediately preceding baseline period. `target_period` must be parseable using `freq`.

## Cleaning and periods

Values in `value_col` are converted to numbers; non-numeric and null values are dropped. Invalid dates are dropped. A null dimension becomes `"Unknown"`. Dates are grouped into calendar buckets such as `2025-12` for monthly frequency, not dashboard rolling windows.

## Environment

The optional LLM integration reads `LLM_PROVIDER` (default `gemini`), `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `LLM_MODEL`, and `LLM_TIMEOUT_S` (default `10`). No key is required when `use_llm` is false or when template fallback is acceptable.

## 422 cases

The API returns 422 for malformed Pydantic input, an empty records list, missing mapped columns, no valid rows after cleaning, missing endpoint-required columns, insufficient periods, or an invalid/missing root-cause target or baseline period.
