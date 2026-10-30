"""Small validation and parsing functions used by the upload route."""

import csv
import json
from datetime import date, datetime
from pathlib import Path
from typing import Any

import openpyxl
from fastapi import HTTPException

from app.core.config import ALLOWED_EXTENSIONS

try:
    import xlrd
except ImportError:
    xlrd = None


def fail(message: str, status_code: int = 422) -> None:
    raise HTTPException(status_code=status_code, detail={"message": message})


def validate_extension(extension: str) -> None:
    if extension not in ALLOWED_EXTENSIONS:
        fail("Only CSV, XLS, XLSX, and JSON files are supported.", 415)


def headers(values: list[Any]) -> list[str]:
    names = [str(value).strip() if value is not None else "" for value in values]
    if not names or not any(names):
        fail("The file must have a header row.")
    if any(not name for name in names) or len(names) != len(set(names)):
        fail("Column headers must be present and unique.")
    return names


def parse_csv(path: Path) -> list[dict[str, Any]]:
    try:
        with path.open(encoding="utf-8-sig", newline="") as source:
            reader = csv.DictReader(source)
            names = headers(reader.fieldnames or [])
            rows = []
            for row_number, row in enumerate(reader, start=2):
                if None in row:
                    fail(f"Row {row_number} has more values than the header row.")
                if any(value.strip() for value in row.values() if value):
                    rows.append({name: row.get(name, "") for name in names})
            return rows
    except UnicodeDecodeError:
        fail("CSV files must use UTF-8 encoding.")
    except csv.Error:
        fail("The CSV file cannot be read.")


def parse_xlsx(path: Path) -> list[dict[str, Any]]:
    try:
        values = openpyxl.load_workbook(path, read_only=True, data_only=True).active.iter_rows(values_only=True)
        names = headers(list(next(values, [])))
        rows = []
        for row in values:
            if any(value not in (None, "") for value in row):
                rows.append({name: value.isoformat() if isinstance(value, (date, datetime)) else value
                             for name, value in zip(names, row)})
        return rows
    except HTTPException:
        raise
    except Exception:
        fail("The XLSX file cannot be read.")


def parse_xls(path: Path) -> list[dict[str, Any]]:
    if xlrd is None:
        fail("XLS support needs the xlrd package installed on the server.", 501)
    try:
        sheet = xlrd.open_workbook(path).sheet_by_index(0)
        names = headers(sheet.row_values(0) if sheet.nrows else [])
        return [dict(zip(names, sheet.row_values(index))) for index in range(1, sheet.nrows)]
    except HTTPException:
        raise
    except Exception:
        fail("The XLS file cannot be read.")


def parse_json(path: Path) -> list[dict[str, Any]]:
    try:
        content = json.loads(path.read_text(encoding="utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        fail("The JSON file is malformed or not UTF-8.")
    if isinstance(content, dict):
        content = content.get("data")
    if not isinstance(content, list) or not all(isinstance(row, dict) for row in content):
        fail("JSON must be an array of objects, or an object with a data array.")
    names = headers(list(dict.fromkeys(key for row in content for key in row)))
    return [{name: row.get(name) for name in names} for row in content]


def columns(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not rows:
        return []
    result = []
    for name in rows[0]:
        values = [row.get(name) for row in rows]
        filled = [value for value in values if value not in (None, "")]
        if filled and all(str(value).lower() in {"true", "false"} for value in filled):
            kind = "boolean"
        elif filled and all(str(value).lstrip("+-").isdigit() for value in filled):
            kind = "integer"
        else:
            kind = "string"
        result.append({"name": name, "inferred_type": kind,
                       "null_count": sum(value in (None, "") for value in values)})
    return result
