from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_valid_data():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )

    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


def test_register_invalid_email():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "invalid-email",
            "password": "password123"
        }
    )

    assert response.status_code == 422


def test_register_short_password():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "short"
        }
    )

    assert response.status_code == 422