"""App settings. Values come from environment variables (see .env.example)."""
import os
from dataclasses import dataclass, field
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]  # the backend/ folder


@dataclass
class Settings:
    # Where uploaded files live. Later this is replaced by Om's database lookup.
    upload_dir: Path = Path(os.getenv("UPLOAD_DIR", BASE_DIR / "data" / "uploads"))
    # Cleaned copies are saved here. Original files are never touched.
    cleaned_dir: Path = Path(os.getenv("CLEANED_DIR", BASE_DIR / "data" / "cleaned"))
    # The user's confirmed column choices (which column is revenue, date...)
    mapping_dir: Path = Path(os.getenv("MAPPING_DIR", BASE_DIR / "data" / "mappings"))
    cors_origins: list = field(
        default_factory=lambda: os.getenv("CORS_ORIGINS", "*").split(",")
    )


settings = Settings()
