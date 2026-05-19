import cv2
import numpy as np

from pathlib import Path

from insightface.app import FaceAnalysis

from app.core.config import THRESHOLD
from app.storage.face_db import get_face_db

face_app = FaceAnalysis(
    providers=["CUDAExecutionProvider"]
)

face_app.prepare(
    ctx_id=0,
    det_size=(640, 640)
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

EMPLOYEE_IMG_DIR = BASE_DIR / "images" / "employees"

def detect_faces(frame):

    return face_app.get(frame)

def identify_face(embedding):

    face_db = get_face_db()

    if not face_db:
        return "Unknown", 0.0

    names = list(face_db.keys())

    matrix = np.array(
        list(face_db.values())
    )

    dists = np.linalg.norm(
        matrix - embedding,
        axis=1
    )

    idx = np.argmin(dists)

    best_dist = dists[idx]

    confidence = round(best_dist, 2)

    if best_dist < THRESHOLD:
        return names[idx], confidence

    return "Unknown", 0.0

def load_employee(employee_id):

    emp_dir = (
        EMPLOYEE_IMG_DIR /
        employee_id /
        "photos"
    )

    embeddings = []

    for img_file in emp_dir.glob("*.*"):

        if img_file.suffix.lower() not in [
            ".jpg",
            ".jpeg",
            ".png"
        ]:
            continue

        img = cv2.imread(str(img_file))

        if img is None:
            continue

        faces = detect_faces(img)

        if not faces:
            continue

        face = max(
            faces,
            key=lambda f:
            (f.bbox[2]-f.bbox[0]) *
            (f.bbox[3]-f.bbox[1])
        )

        embeddings.append(
            face.normed_embedding
        )

    return embeddings