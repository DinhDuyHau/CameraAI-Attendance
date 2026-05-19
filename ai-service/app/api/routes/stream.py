from fastapi import APIRouter

from fastapi.responses import (
    StreamingResponse
)

from app.services.stream_service import (
    stream_generator
)

router = APIRouter()

@router.get("/stream/cam01_a")
def stream_a():

    return StreamingResponse(
        stream_generator("A"),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.get("/stream/cam01_b")
def stream_b():

    return StreamingResponse(
        stream_generator("B"),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )