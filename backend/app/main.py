from fastapi import FastAPI, Depends

from app.api.v1.endpoints.auth import router as auth_router
from app.core.dependencies import get_current_user_subject

app = FastAPI(title="Stechgrow API")

app.include_router(auth_router, prefix="/api/v1")


@app.get("/")
def home():
    return {"message": "Stechgrow backend is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/v1/auth/me")
def get_current_user(
    subject: str = Depends(get_current_user_subject),
):
    return {"subject": subject}
