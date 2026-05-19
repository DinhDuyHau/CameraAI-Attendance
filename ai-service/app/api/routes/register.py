import numpy as np

from fastapi import APIRouter
from fastapi import HTTPException

from app.core.globals import FACE_DB
from app.services.face_service import (
    load_employee,
    EMPLOYEE_IMG_DIR
)

from app.storage.face_db import (
    save_face
)

router = APIRouter()

@router.post("/register/{employee_id}")
def register_employee(employee_id: str):

    embeddings = load_employee(
        employee_id
    )

    if not embeddings:

        raise HTTPException(
            status_code=400,
            detail="No face found"
        )

    mean_emb = np.mean(
        embeddings,
        axis=0
    )

    save_face(
        employee_id,
        mean_emb.tolist()
    )

    return {
        "employee_id": employee_id,
        "embeddings": len(embeddings)
    }

@router.post("/register_all")
def register_all():

    count = 0

    for emp_dir in EMPLOYEE_IMG_DIR.glob("*"):

        if not emp_dir.is_dir():
            continue

        employee_id = emp_dir.name

        embeddings = load_employee(
            employee_id
        )

        if embeddings:

            mean_emb = np.mean(
                embeddings,
                axis=0
            )

            save_face(
                employee_id,
                mean_emb.tolist()
            )

            count += 1

    return {
        "employees_loaded": count
    }