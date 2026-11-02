"""Response/request shapes for column mapping."""
from typing import Dict, List, Optional

from pydantic import BaseModel


class Candidate(BaseModel):
    column: str
    confidence: float


class RoleMapping(BaseModel):
    column: Optional[str] = None     # None = not decided yet / not found
    confidence: float
    status: str                      # auto / review / unresolved / not_found / confirmed
    candidates: List[Candidate]      # up to 3 possible columns, best first


class ColumnInfo(BaseModel):
    column: str
    kind: str                        # numeric / categorical / datetime / other


class MappingResponse(BaseModel):
    roles: Dict[str, RoleMapping]
    columns: List[ColumnInfo]        # every column, for a dropdown on the confirm screen
    needs_confirmation: List[str]    # roles the user should look at


class MappingUpdate(BaseModel):
    # {"revenue": "Total"} sets it, {"discount": null} means "this file has none"
    mappings: Dict[str, Optional[str]]
