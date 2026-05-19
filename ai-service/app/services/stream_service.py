import cv2
import time

from app.core.globals import (
    processed_frames
)

from app.core.locks import (
    frames_lock
)

def stream_generator(cam):

    while True:

        with frames_lock:

            frame = processed_frames.get(cam)

        if frame is not None:

            _, buffer = cv2.imencode(
                ".jpg",
                frame
            )

            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n'
                + buffer.tobytes()
                + b'\r\n'
            )

        time.sleep(0.03)