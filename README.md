# Stechgrow OS Analytics Backend

## Overview

This is a **FastAPI** based analytics backend for the Stechgrow OS project.  It loads a handful of CSV/XLSX datasets, runs a few exploratory‑data‑analysis (EDA) routines, calculates key performance indicators (KPIs) and exposes everything through a clean, documented REST API.

I built this as a personal side‑project to get comfortable with FastAPI, Pydantic models and basic data‑science pipelines in Python.  The goal was to have a lightweight service that can be dropped into a larger micro‑service architecture or run locally for quick data insights.

---

## Features

- **Dataset discovery** – automatically lists the files that live under `data/`.
- **EDA summary** – returns row/column counts, missing‑value statistics, simple numeric summaries and a correlation overview.
- **KPI engine** – computes total sales, profit, units sold, orders, average order value, etc., for any uploaded dataset.
- **Swagger UI** – interactive documentation at `http://localhost:8000/docs`.
- **Typed schemas** – Pydantic models guarantee request/response validation.
- **Unit tests** – basic coverage for all router endpoints.

---

## Architecture

```
backend/
├─ app/
│  ├─ api/          # FastAPI routers (analysis, cleaning, eda, etc.)
│  ├─ core/         # Configuration handling
│  ├─ schemas/      # Pydantic request/response models
│  ├─ services/     # Business logic (data loading, profiling, KPI calc)
│  └─ main.py       # FastAPI entry point
├─ data/             # Sample CSV / XLSX files (ignored by Git)
├─ tests/            # pytest suite for the API
├─ requirements.txt  # Minimal dependencies
└─ README.md         # <-- you are reading it!
```

---

## Setup & Run Locally

1. **Clone the repo** (or copy the folder you already have).
2. **Create a virtual environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # on Windows
   ```
3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the server**
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   The API will be reachable at `http://127.0.0.1:8000`.

---

## API Endpoints (quick reference)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Simple health‑check, returns `{"status":"ok"}` |
| `GET` | `/datasets` | Lists available dataset filenames |
| `GET` | `/eda/{dataset}/summary` | Returns a JSON summary of the chosen dataset (rows, columns, missing values, etc.) |
| `GET` | `/analysis/{dataset}/kpis` | Calculates business KPIs for the dataset |
| `GET` | `/docs` | Swagger UI – you can try every endpoint directly from the browser |

---

## Testing

Run the test suite with:
```bash
pytest -q
```
All tests live under `tests/` and cover the health check, dataset listing and a few EDA/KPI scenarios.

---


