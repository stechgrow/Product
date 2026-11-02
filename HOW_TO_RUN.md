# Stechgrow OS: Dashboard, EDA & Data Analysis backend

FastAPI + pandas. Same layers as the team backend: `api/` (endpoints), `services/` (logic),
`schemas/` (JSON shapes), `core/` (settings).

## Run it
```bash
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/make_sample_data.py                     # makes data/uploads/sample_sales.csv
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/docs and try any endpoint with `dataset_id = sample_sales.csv`.
Your own CSV/XLSX/JSON files go in `data/uploads/` (the file name is the dataset_id).

## Test it
```bash
pytest
```

## Endpoints
| Screen | Endpoint | Returns |
|---|---|---|
| Helper | `GET /datasets` | file names you can use as dataset_id |
| Column mapping | `GET /datasets/{id}/mapping` | for each role (revenue, date, country...): best column, confidence, status, up to 3 candidates, plus all columns for a dropdown |
| Column mapping | `PUT /datasets/{id}/mapping` body `{"mappings": {"revenue": "Total"}}` | user confirms/corrects a column (saved, used by every other endpoint). `null` = this file has none |
| Column mapping | `DELETE /datasets/{id}/mapping` | forget the user's choices, back to our guesses |
| EDA | `GET /eda/{id}` | summary + column details + correlation + anomalies in one call |
| EDA | `GET /eda/{id}/summary`, `/columns`, `/correlation`, `/anomalies` | each part separately |
| Data Analysis | `GET /analysis/{id}/kpis?period=all\|week\|month\|year` | Revenue, Orders, Conversion, AOV, change %, Growth/Stable/Decline |
| Data Analysis | `GET /analysis/{id}/insights` | top insights, problems, opportunities (each with evidence) |
| Data Analysis | `GET /analysis/{id}/affected` | Affected Datasets table: issue, count, severity, suggestion |
| Dashboard | `GET /dashboard/{id}?period=all\|week\|month\|year` | 4 KPI cards + 6 chart datasets |
| Cleaning | `GET /cleaning/{id}/report` | the 7 quality checks + 0-100 quality score (changes nothing) |
| Cleaning | `POST /cleaning/{id}/apply` | cleans a COPY, saves it in `data/cleaned/`, returns change log + before/after |

If a file can't support something (no sales column, no date column), that KPI is `null` or
that chart is listed under `unavailable` with a reason. Nothing is made up and nothing crashes.

## How column mapping works
Runs before the KPI/chart code. Each role gets a status:
`auto` (confidence 0.9+, safe), `review` (0.6-0.9, used but should be confirmed),
`unresolved` (only weak hints, e.g. a column called `Total`: NOT used until the user picks),
`not_found`, `confirmed` (the user chose it). The user's choice always wins.
`needs_confirmation` in the response lists the roles the frontend should ask about.
Choices are saved in `data/mappings/` for now (swap `services/mapping_store.py` for Om's database later).

## Plugging into the team backend
1. Copy `app/api/{eda,analysis,dashboard,cleaning,datasets,deps}.py` and the matching `schemas/` and `services/` files.
2. Add the `include_router` lines from `app/main.py` to the team's `main.py` (tell Shaury).
3. Change only `get_dataframe()` in `app/api/deps.py` to fetch the dataset through Om's DB / Athen's storage.
4. Mapping choices are stored by `services/mapping_store.py`: ask Om where they should live.
5. Add pandas, numpy, openpyxl to the team's `requirements.txt`.

## Decisions your lead should confirm
- Missing % is over all cells (not rows). Growth/Decline threshold is +/-5%.
- Without an order-id column, each row counts as one order. Conversion needs a visits column.
- Invalid-value rules are fixed ones (negative quantity/price/sales, age over 120).
