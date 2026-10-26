from datetime import datetime, timezone
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    """Standard API response envelope for all Stechgrow OS modules."""
    status: str = "success"
    message: str = "Operation completed successfully"
    data: T
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Optional[dict[str, Any]] = None

class ErrorResponse(BaseModel):
    """Standard error response model."""
    status: str = "error"
    error_code: str
    message: str
    details: Optional[Any] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
