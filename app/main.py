"""Starts the app and plugs in all the routers.

Run:  uvicorn app.main:app --reload     then open http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import analysis, cleaning, dashboard, datasets, eda
from app.core.config import settings

settings.upload_dir.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Stechgrow OS - Dashboard, EDA & Data Analysis backend", version="0.1.0")

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins,
                   allow_methods=["*"], allow_headers=["*"])

# One line per module: this is where Shaury integrates it with the other routers
for module in (datasets, eda, analysis, dashboard, cleaning):
    app.include_router(module.router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


@app.exception_handler(Exception)
async def unexpected_error(request: Request, exc: Exception):
    """Last safety net: unexpected calculation errors return clean JSON, not a crash."""
    return JSONResponse(status_code=500, content={"detail": "Could not analyse this dataset."})
