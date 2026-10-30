from pathlib import Path

ALLOWED_EXTENSIONS = {".csv", ".xls", ".xlsx", ".json"}
# Keep the first version small enough to run safely on a laptop.
# Raise this only after the team chooses object storage/background processing.
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
STORAGE_DIR = Path(__file__).resolve().parents[2] / "data" / "datasets"
