from fastapi import FastAPI

from app.api.routes.datasets import router as datasets_router

app = FastAPI(title="Stechgrow dataset API", version="0.1.0")
app.include_router(datasets_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
