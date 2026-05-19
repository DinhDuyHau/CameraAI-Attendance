from queue import Queue

frame_queue = Queue(maxsize=20)

FACE_DB = {}

active_faces = {
    "A": {},
    "B": {}
}

processed_frames = {
    "A": None,
    "B": None
}