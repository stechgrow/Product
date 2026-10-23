from fastapi import FastAPI
from app.api.v1.endpoints.datasets import router as datasets_router

app = FastAPI()

app.include_router(datasets_router, prefix="/api")