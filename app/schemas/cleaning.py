"""Response shapes for data-quality and cleaning."""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class CheckResult(BaseModel):
    key: str
    name: str
    issue_count: int
    share: float
    severity: str                  # ok / low / medium / high
    details: Dict[str, Any]
    suggestion: str


class QualityReport(BaseModel):
    quality_score: float           # 0-100
    usable: bool
    checks: List[CheckResult]


class QualityMetrics(BaseModel):
    rows: int
    columns: int
    missing_cells: int
    duplicate_rows: int
    quality_score: float


class ChangeLogEntry(BaseModel):
    step: str
    column: Optional[str] = None
    action: str                    # fixed / removed / flagged / skipped
    rows_affected: int
    reason: str
    example_rows: List[int]


class CleanResponse(BaseModel):
    before: QualityMetrics
    after: QualityMetrics
    change_log: List[ChangeLogEntry]
    cleaned_file: str
