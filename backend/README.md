# Stechgrow dataset upload backend

A small Python/FastAPI backend for the internship task: accept a dataset, validate it, convert it into a consistent format, and make it ready for the analysis layer.

## What this MVP does

- Uploads one **CSV, XLS, XLSX, or JSON** file at `POST /api/datasets`.
- Checks the extension, a **25 MB** file limit, empty files, malformed data, UTF-8 CSV/JSON text, and missing or duplicate headers.
- Converts every valid file to the same internal format: a `list` of row dictionaries, then saves it as JSON.
- Generates a UUID for each upload. A client filename is shown in the response but is never used as a server path.
- Returns a frontend-friendly result: status, dataset ID, row count, column information, warnings, and useful error messages.
- Lists saved uploads for the “Previously uploaded documents” table and returns normalized rows for analysis.
- Includes automated tests for valid files and common failure cases.

## Folder structure

```text
backend/
├── app/
│   ├── main.py                      # Creates the FastAPI application
│   ├── api/routes/datasets.py        # HTTP upload/history/data endpoints
│   ├── core/config.py                # Allowed formats, size limit, storage path
│   ├── services/ingestion.py         # Validation, parsing, column information
│   ├── repositories/datasets.py      # Local JSON save/read functions
│   └── schemas/dataset.py            # Response shape displayed in /docs
├── data/datasets/                    # Local data created during development
├── tests/test_uploads.py             # Validation and parsing tests
└── requirements.txt                  # Python packages
```

## Setup and run

Open PowerShell in the `backend` folder, then run:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will run at `http://127.0.0.1:8000`.

- Open `http://127.0.0.1:8000/docs` for the easiest way to upload a test file.
- Open `http://127.0.0.1:8000/health` to confirm that the service is running.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/datasets` | Upload and validate one file. The multipart field must be named `file`. |
| `GET` | `/api/datasets` | Return saved-upload metadata for the history table. |
| `GET` | `/api/datasets/{dataset_id}` | Return normalized rows for analysis. |
| `GET` | `/health` | Return `{"status": "ok"}`. |

### Upload example

```powershell
curl.exe -X POST http://127.0.0.1:8000/api/datasets -F "file=@C:\path\to\customers.csv"
```

A successful upload returns `201 Created` with this shape:

```json
{
  "dataset_id": "server-generated-uuid",
  "status": "ready",
  "original_filename": "customers.csv",
  "format": "csv",
  "size_bytes": 32,
  "row_count": 2,
  "columns": [
    {"name": "age", "inferred_type": "integer", "null_count": 0}
  ],
  "warnings": [],
  "uploaded_at": "2026-10-25T10:00:00+00:00"
}
```

Errors have one predictable shape:

```json
{"detail": {"message": "Only CSV, XLS, XLSX, and JSON files are supported."}}
```

Use the message directly in the frontend’s validation/error state. Typical status codes are `413` for an oversized file, `415` for an unsupported extension, `422` for invalid content, and `404` for an unknown dataset ID.

## Frontend integration notes

1. Let the user browse or drag a single file, then send it in `FormData` using the field name `file`.
2. Do not manually set the `Content-Type` header; the browser supplies the multipart boundary.
3. Show upload progress with Axios/XHR if the frontend needs a percentage.
4. On success, display the returned row count, columns, and warnings. Save `dataset_id` for later analysis requests.
5. On error, display `response.data.detail.message` and allow the user to choose another file.
6. Refresh `GET /api/datasets` to show the upload-history table.

## Test the project

```powershell
pytest -q
```

The tests cover valid CSV/JSON parsing, empty files, invalid headers, malformed JSON, unsupported formats, and column information.

## Important MVP limits

- The design image mentions 1 GB, but this local starter intentionally uses **25 MB**. Larger files need confirmed infrastructure: object storage, background jobs, and memory limits.
- Data is stored as local JSON under `data/datasets`. This is suitable for learning and demonstration only. A real deployment should use the storage approach approved by the lead.
- Link imports and Drive/Dropbox/AWS/Azure buttons are not implemented because they require approved OAuth/API credentials. Do not accept arbitrary URLs as a shortcut.
