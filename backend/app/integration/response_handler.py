"""Response handling."""
from typing import Any


def success_response(
    data: Any = None,
    message: str = "Request successful"
):
    return {
        "success": True,
        "message": message,
        "data": data,
        "error": None
    }


def error_response(
    message: str,
    code: str = "BAD_REQUEST"
):
    return {
        "success": False,
        "message": message,
        "data": None,
        "error": {
            "code": code,
            "message": message
        }
    }