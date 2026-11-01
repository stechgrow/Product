"""Application entry point."""
from fastapi import FastAPI

app = FastAPI(
    title="StechGrow Product API",
    version="1.0.0"
)
@app.get("/")
async def root():
    return {
        "success": True,
        "message": "StechGrow Product API is running"
    }