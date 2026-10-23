
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import get_user_datasets, create_dataset
from app.db.storage import save_dataset

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.get("/")
def list_datasets(user_id: UUID, db: Session = Depends(get_db)):
    datasets = get_user_datasets(db, user_id)

    return [
        {
            "dataset_id": str(d.dataset_id),
            "name": d.dataset_name,
            "filename": d.original_filename,
            "size": d.file_size_bytes,
            "status": d.processing_status,
            "created_at": d.created_at,
        }
        for d in datasets
    ]


@router.post("/", status_code=201)
def upload_dataset(
    user_id: UUID = Form(...),
    dataset_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename or Path(file.filename).suffix.lower() != ".csv":
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is missing")

    dataset_id, storage_path = save_dataset(file.file, file.filename)
    file_size = Path(storage_path).stat().st_size

    try:
        dataset = create_dataset(
            db=db,
            user_id=user_id,
            name=dataset_name,
            filename=Path(file.filename).name,
            path=storage_path,
            size=file_size,
        )
    except Exception:
        Path(storage_path).unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Could not save dataset metadata")
    finally:
        file.file.close()

    return {
        "dataset_id": str(dataset.dataset_id),
        "name": dataset.dataset_name,
        "filename": dataset.original_filename,
        "size": dataset.file_size_bytes,
        "status": dataset.processing_status,
    }
