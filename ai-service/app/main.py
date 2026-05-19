from fastapi import FastAPI

from app.api.routes import (
    register,
    stream
)

from app.services.camera_service import (
    CameraWorker
)

from app.services.gpu_worker import (
    start_gpu_worker
)

from app.core.config import (
    CAM_A,
    CAM_B
)

app = FastAPI()

app.include_router(register.router)

app.include_router(stream.router)

camA = CameraWorker(
    "A",
    CAM_A
)

camB = CameraWorker(
    "B",
    CAM_B
)

start_gpu_worker()