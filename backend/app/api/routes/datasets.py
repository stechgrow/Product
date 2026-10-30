import shutil
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, UploadFile, status

from app.core.config import MAX_FILE_SIZE
from app.repositories.datasets import get_rows, history, save
from app.schemas.dataset import UploadResult
from app.services.ingestion import columns, fail, parse_csv, parse_json, parse_xls, parse_xlsx, validate_extension

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


@router.post("", response_model=UploadResult, status_code=status.HTTP_201_CREATED)
async def upload_dataset(file: UploadFile = File(...)) -> dict[str, Any]:
    extension = Path(file.filename or "").suffix.lower()
    validate_extension(extension)

    folder = Path(tempfile.mkdtemp())
    temporary_file = folder / "upload"
    size = 0
    try:
        with temporary_file.open("wb") as destination:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    fail("The file is larger than the 25 MB limit.", 413)
                destination.write(chunk)
        if not size:
            fail("The uploaded file is empty.")

        parser = {".csv": parse_csv, ".xls": parse_xls, ".xlsx": parse_xlsx, ".json": parse_json}[extension]
        rows = parser(temporary_file)
        dataset_id = str(uuid.uuid4())
        result = {
            "dataset_id": dataset_id,
            "status": "ready",
            "original_filename": Path(file.filename or "upload").name,
            "format": extension[1:],
            "size_bytes": size,
            "row_count": len(rows),
            "columns": columns(rows),
            "warnings": ["The file has headers but no data rows."] if not rows else [],
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        }
        save(dataset_id, rows, result)
        return result
    finally:
        await file.close()
        shutil.rmtree(folder, ignore_errors=True)


@router.get("")
def upload_history() -> list[dict[str, Any]]:
    return history()


@router.get("/{dataset_id}")
def get_dataset(dataset_id: str) -> dict[str, Any]:
    rows = get_rows(dataset_id)
    if rows is None:
        fail("Dataset not found.", 404)
    return {"dataset_id": dataset_id, "rows": rows}
