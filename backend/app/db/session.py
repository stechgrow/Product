import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH, override=True)

DB_URL = os.getenv("DB_URL")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# print("Env file exists:", ENV_PATH.is_file())
# print("DB_URL loaded:", DB_URL is not None)

if not DB_URL:
    raise RuntimeError(f"DB_URL not found")

class Base(DeclarativeBase):
    pass

engine = create_engine(
    DB_URL,
    connect_args={
        "user": DB_USER,
        "password": DB_PASSWORD,
    },
    pool_pre_ping=True,
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
