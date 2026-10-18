from fastapi import APIRouter, status

from app.schemas.auth import RegisterRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_200_OK)
def register_user(user: RegisterRequest):
    return {
        "message": "Registration data validated successfully",
        "email": user.email
    }