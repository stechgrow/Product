from datetime import datetime

from pydantic import BaseModel


class ColumnInfo(BaseModel):
    name: str
    inferred_type: str
    null_count: int


class UploadResult(BaseModel):
    dataset_id: str
    status: str
    original_filename: str
    format: str
    size_bytes: int
    row_count: int
    columns: list[ColumnInfo]
    warnings: list[str]
    uploaded_at: datetime
