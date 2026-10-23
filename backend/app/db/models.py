
import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger, CheckConstraint, DateTime, ForeignKey,
    String, Text, func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),primary_key=True,server_default=func.gen_random_uuid())
    user_email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    user_password: Mapped[str] = mapped_column(Text, nullable=False)

    datasets: Mapped[list["Dataset"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Dataset(Base):
    __tablename__ = "datasets"

    __table_args__ = (
        CheckConstraint(
            "upload_status IN ('pending', 'uploading', 'completed', 'failed')",
            name="valid_upload_status"
        ),
        CheckConstraint(
            "processing_status IN ('pending', 'processing', 'completed', 'failed')",
            name="valid_processing_status"
        ),
    )

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    dataset_name: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    original_filename: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_format: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="csv"
    )
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger)
    row_count: Mapped[int | None] = mapped_column(BigInteger)

    columns_metadata: Mapped[dict | list | None] = mapped_column(JSONB)

    upload_status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="pending")
    processing_status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="pending")

    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="datasets")
