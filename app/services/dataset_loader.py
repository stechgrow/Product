"""Reads an uploaded file (CSV, Excel, JSON) into a pandas table (DataFrame)."""
from pathlib import Path

import pandas as pd

# File types the upload team (Athen) said they support
SUPPORTED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json"}

# Only these count as "blank". By default pandas also treats the words "None" and
# "NA" as blank, which would wrongly empty real categories (e.g. Discount Band = None).
BLANK_VALUES = ["", "#N/A", "N/A", "NULL", "null", "NaN", "nan"]


class DatasetLoadError(Exception):
    """Raised when a file is unsupported, unreadable or empty."""


class DatasetNotFoundError(DatasetLoadError):
    """Raised when the file does not exist."""


def load_dataset(path) -> pd.DataFrame:
    """Load a file from disk and return it as a DataFrame."""
    path = Path(path)

    # 1. Basic checks before we even try to read
    if not path.exists():
        raise DatasetNotFoundError(f"File not found: {path.name}")
    ext = path.suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise DatasetLoadError(f"Unsupported file type: {ext}")

    # 2. Read using the right pandas function for the file type
    try:
        if ext == ".csv":
            df = pd.read_csv(path, keep_default_na=False, na_values=BLANK_VALUES)
        elif ext in {".xlsx", ".xls"}:
            df = pd.read_excel(path, keep_default_na=False, na_values=BLANK_VALUES)
        else:
            df = pd.read_json(path)
    except Exception as exc:  # corrupted file, bad encoding, etc.
        raise DatasetLoadError(f"Could not read {path.name}: {exc}") from exc

    # 3. An empty file can't be analysed
    if df.empty:
        raise DatasetLoadError("The file has no data rows or no columns")

    # Tidy column names: remove accidental spaces around them
    df.columns = [str(c).strip() for c in df.columns]
    return df
