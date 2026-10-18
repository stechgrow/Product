from fastapi import FastAPI

from app.api.v1.endpoints.auth import router as auth_router

app = FastAPI(title="Stechgrow API")

app.include_router(auth_router, prefix="/api/v1")


@app.get("/")
def home():
    return {"message": "Stechgrow backend is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}