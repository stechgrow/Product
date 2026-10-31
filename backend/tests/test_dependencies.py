import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.core.dependencies import get_current_user_subject
from app.core.security import create_access_token, create_refresh_token


def test_valid_access_token_returns_subject(monkeypatch):
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-at-least-32-characters-long")
    token = create_access_token("user-123")
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )

    assert get_current_user_subject(credentials) == "user-123"


def test_missing_token_is_rejected():
    with pytest.raises(HTTPException) as exc:
        get_current_user_subject(None)

    assert exc.value.status_code == 401


def test_refresh_token_is_rejected_as_access_token(monkeypatch):
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-at-least-32-characters-long")
    token = create_refresh_token("user-123")
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )

    with pytest.raises(HTTPException) as exc:
        get_current_user_subject(credentials)

    assert exc.value.status_code == 401


def test_invalid_token_is_rejected(monkeypatch):
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-at-least-32-characters-long")
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="not-a-valid-token",
    )

    with pytest.raises(HTTPException) as exc:
        get_current_user_subject(credentials)

    assert exc.value.status_code == 401
