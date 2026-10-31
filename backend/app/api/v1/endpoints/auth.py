from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, decode_token
from app.schemas.auth import RegisterRequest
from app.schemas.tokens import RefreshTokenRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_200_OK)
def register_user(user: RegisterRequest):
    return {
        "message": "Registration data validated successfully",
        "email": user.email,
    }


@router.post("/refresh")
def refresh_access_token(request: RefreshTokenRequest):
    try:
        payload = decode_token(request.refresh_token, expected_type="refresh")
        subject = payload.get("sub")

        if not subject:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        return {
            "access_token": create_access_token(subject),
            "token_type": "bearer",
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
