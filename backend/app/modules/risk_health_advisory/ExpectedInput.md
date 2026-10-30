# Risk, Business Health, Advisory & Reports — Expected Input Contract

**Module Owner**: Sven Tuscano  
**Module Directory**: `backend/app/modules/risk_health_advisory/`  
**Target Consumers**: Om Thakur (Database/Persistence), Sherly (EDA & Profiling)

---

## 1. Upstream Data Dependencies
This module evaluates business risk, health, and strategic recommendations from clean tabular datasets provided by:
1. **Om Thakur (`modules/datasets/`)**: Clean persisted records or Pandas DataFrame representing the uploaded dataset.
2. **Sherly (`modules/eda/`)**: Column profiling summaries, descriptive statistics (mean, median, std, min, max), missing-value counts, and correlation matrix.

*Note: For standalone development or when upstream modules are offline, this module automatically falls back to its built-in realistic mock fixtures (`fixtures/mock_data.py`).*

---

## 2. Expected Dataset Schema & Columns
The engine supports diverse tabular datasets (E-commerce, SaaS, Retail, Logistics). To perform calculations, it expects:

### Numeric Metric Columns (At least 1 required)
- Preferred column names: `revenue`, `amount`, `sales`, `price`, `margin`, `profit`, `mrr`, `arr`, `cost`, `units`.
- Data type: `float64` or `int64`.
- Purpose: Used for Z-score and IQR anomaly detection, revenue concentration, and estimated business impact calculations.

### Date / Time Column (Optional, but unlocks time-series spline)
- Preferred column names: `date`, `timestamp`, `created_at`, `month`, `order_date`.
- Data type: `datetime64[ns]` or ISO-8601 string.
- Purpose: Used to plot the 30D/14D spline area chart and detect trend momentum / sudden drops.

### Entity / Customer / Product Column (Optional, unlocks concentration analysis)
- Preferred column names: `customer_id`, `client`, `product`, `plan`, `subscription_tier`, `segment`, `category`.
- Data type: `string` or `category`.
- Purpose: Used to calculate Pareto 80/20 concentration, churn risk, and entity-specific anomalies (e.g. "Subscription Plan B").

---

## 3. API Request Payloads

### `GET /api/v1/risk-health/summary`
- **Query Parameters**:
  - `dataset_id` (optional `str`): ID of the persisted dataset. If omitted, uses default active/sample dataset.
  - `sample_name` (optional `str`): `saas` or `ecommerce` for quick testing.

### `GET /api/v1/risk-health/timeseries`
- **Query Parameters**:
  - `dataset_id` (optional `str`)
  - `metric` (optional `str`, default: `revenue`): Target metric (`revenue`, `churn`, `conversion`, `acquisition`).
  - `time_range` (optional `str`, default: `30D`): `30D` or `14D`.

### `GET /api/v1/risk-health/questionnaire`
- **Query Parameters**:
  - `dataset_id` (optional `str`)

### `POST /api/v1/risk-health/questionnaire/submit`
- **Request Body**:
  ```json
  {
    "dataset_id": "optional-id",
    "answers": {
      "business_model": "b2b_saas",
      "growth_stage": "scaling",
      "primary_focus": "profitability",
      "target_margin": 65
    }
  }
  ```

---

## 4. Handling of Edge Cases & Fallback Behavior
- **Missing Values**: Columns with null values are automatically imputed using median (numeric) or mode (categorical) during risk calculation; high missingness (>15%) triggers a `Data Quality` advisory card.
- **Empty Dataset (< 5 rows)**: Returns an informative status `INSUFFICIENT_DATA` with a safe baseline score rather than raising an unhandled exception.
- **Missing Dates**: If no date column is present, the time-series endpoint synthesizes indexed sequential steps with clear metadata.
