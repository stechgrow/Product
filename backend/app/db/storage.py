from pathlib import Path
from uuid import uuid4

DATA_DIR = Path("data")


def save_dataset(file, filename):
    dataset_id = uuid4()
    folder = DATA_DIR / str(dataset_id)
    folder.mkdir(parents=True, exist_ok=True)

    file_path = folder / Path(filename).name

    with open(file_path, "wb") as output:
        while chunk := file.read(1024 * 1024):
            output.write(chunk)

    return dataset_id, str(file_path)


def delete_dataset_file(path):
    file_path = Path(path)

    if file_path.exists():
        file_path.unlink()
        file_path.parent.rmdir()
