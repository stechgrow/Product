import pytest
from pydantic import ValidationError

from app.schemas.auth import RegisterRequest


def test_valid_registration_data():
    data = RegisterRequest(
        email="test@example.com",
        password="password123"
    )

    assert data.email == "test@example.com"
    assert data.password == "password123"


def test_invalid_email():
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="not-an-email",
            password="password123"
        )


def test_short_password():
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="test@example.com",
            password="short"
        )