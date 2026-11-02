"""Helper endpoints: list files, and the column-mapping (guess + user confirmation) layer."""
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException

from app.core.config import settings
from app.schemas.mapping import MappingResponse, MappingUpdate
from app.services import mapping_store
from app.services.column_mapper import check_override, describe_mapping
from .deps import get_dataframe

router = APIRouter(prefix="/datasets", tags=["Datasets & Column Mapping"])


@router.get("")
def list_datasets():
    """File names you can use as dataset_id."""
    files = sorted(p.name for p in settings.upload_dir.glob("*") if p.is_file() and p.name != ".gitkeep")
    return {"datasets": files}


@router.get("/{dataset_id}/mapping", response_model=MappingResponse)
def get_column_mapping(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    """Our guess for each role (revenue, date, country...) with confidence and candidates,
    after applying anything the user already confirmed."""
    return describe_mapping(df, mapping_store.load(dataset_id))


@router.put("/{dataset_id}/mapping", response_model=MappingResponse)
def confirm_column_mapping(dataset_id: str, body: MappingUpdate, df: pd.DataFrame = Depends(get_dataframe)):
    """The user confirms or corrects columns. Saved, and used by every other endpoint."""
    for role, column in body.mappings.items():
        error = check_override(df, role, column)
        if error:
            raise HTTPException(status_code=422, detail=error)
    overrides = mapping_store.load(dataset_id)
    overrides.update(body.mappings)
    mapping_store.save(dataset_id, overrides)
    return describe_mapping(df, overrides)


@router.delete("/{dataset_id}/mapping", response_model=MappingResponse)
def reset_column_mapping(dataset_id: str, df: pd.DataFrame = Depends(get_dataframe)):
    """Forget the user's choices and go back to our guesses."""
    mapping_store.clear(dataset_id)
    return describe_mapping(df, {})
