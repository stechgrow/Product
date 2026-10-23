from sqlalchemy.orm import Session
from app.db.models import Dataset


def create_dataset(db: Session, user_id, name, filename, path, size=None):
    dataset = Dataset(
        user_id=user_id,
        dataset_name=name,
        original_filename=filename,
        storage_path=path,
        file_size_bytes=size
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset


def get_dataset(db: Session, dataset_id, user_id):
    return db.query(Dataset).filter_by(dataset_id=dataset_id,user_id=user_id).first()


def get_user_datasets(db: Session, user_id):
    return db.query(Dataset).filter_by(user_id=user_id).order_by(Dataset.created_at.desc()).all()


def update_dataset_status(db: Session, dataset, status):
    dataset.processing_status = status
    db.commit()
    db.refresh(dataset)
    return dataset


def delete_dataset(db: Session, dataset):
    db.delete(dataset)
    db.commit()
