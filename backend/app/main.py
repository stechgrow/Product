from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, FileResponse
from app.core.config import settings

# Initialize FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Stechgrow OS Modular Intelligence Engine — Risk Detection, Business Health, Advisory & Reports",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Register Module Routers -----------------
# 1. Sven Tuscano's Core Module: Risk Detection, Business Health, Advisory & Reports
from app.modules.risk_health_advisory.router import router as risk_health_router
app.include_router(risk_health_router)

# Mount Static Demo Harness
DEMO_STATIC_DIR = Path(__file__).resolve().parent / "modules" / "risk_health_advisory" / "demo_harness" / "static"
if DEMO_STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(DEMO_STATIC_DIR)), name="static")

@app.get("/", include_in_schema=False)
def root():
    """Redirects root to the interactive visual demo harness."""
    return RedirectResponse(url="/demo")

@app.get("/demo", include_in_schema=False)
def demo_page():
    """Serves the standalone browser demonstration testbed."""
    index_file = DEMO_STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Demo harness index.html not found"}

@app.get("/health", tags=["Health"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "active_modules": [
            "risk_health_advisory (Sven Tuscano)"
        ]
    }
