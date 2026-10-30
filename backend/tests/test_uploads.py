import json

import pytest
from fastapi import HTTPException

from app.services.ingestion import columns, parse_csv, parse_json, validate_extension


def make_file(tmp_path, name, content):
    path = tmp_path / name
    path.write_bytes(content)
    return path


def test_valid_csv(tmp_path):
    rows = parse_csv(make_file(tmp_path, "people.csv", b"name,age\nAda,25\n"))
    assert rows == [{"name": "Ada", "age": "25"}]


def test_empty_file_is_rejected(tmp_path):
    with pytest.raises(HTTPException, match="header"):
        parse_csv(make_file(tmp_path, "empty.csv", b""))


def test_bad_headers_are_rejected(tmp_path):
    with pytest.raises(HTTPException, match="header"):
        parse_csv(make_file(tmp_path, "bad.csv", b",\nAda,25\n"))


def test_unsupported_extension_is_rejected():
    with pytest.raises(HTTPException) as error:
        validate_extension(".pdf")
    assert error.value.status_code == 415


def test_malformed_json_is_rejected(tmp_path):
    with pytest.raises(HTTPException, match="malformed"):
        parse_json(make_file(tmp_path, "bad.json", b'{"data": ['))


def test_valid_json(tmp_path):
    source = json.dumps([{"name": "Ada", "score": 10}]).encode()
    assert parse_json(make_file(tmp_path, "data.json", source)) == [{"name": "Ada", "score": 10}]


def test_column_information(tmp_path):
    rows = parse_csv(make_file(tmp_path, "people.csv", b"name,age,active\nAda,25,true\n"))
    assert columns(rows) == [
        {"name": "name", "inferred_type": "string", "null_count": 0},
        {"name": "age", "inferred_type": "integer", "null_count": 0},
        {"name": "active", "inferred_type": "boolean", "null_count": 0},
    ]
