import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "Stechgrow OS Backend"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # AI / LLM Configuration (supports GEMINI_API_KEY, GROQ_API_KEY, etc.)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Storage directories
    BASE_DIR: Path = BASE_DIR
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    
    # Currency
    DEFAULT_CURRENCY: str = "₹"

settings = Settings()
