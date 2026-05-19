import cv2
import time
import threading

from app.core.config import FRAME_SKIP
from app.core.globals import frame_queue

class CameraWorker:

    def __init__(self, name, url):

        self.name = name

        self.url = url

        self.cap = cv2.VideoCapture(url)

        self.running = True

        threading.Thread(
            target=self.reader,
            daemon=True
        ).start()

    def reader(self):

        count = 0

        while self.running:

            ret, frame = self.cap.read()

            if not ret:

                print(
                    f"Reconnect {self.name}"
                )

                time.sleep(2)

                self.cap.release()

                self.cap = cv2.VideoCapture(
                    self.url
                )

                continue

            count += 1

            if count % FRAME_SKIP != 0:
                continue

            if not frame_queue.full():

                frame_queue.put(
                    (self.name, frame)
                )