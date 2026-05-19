import cv2
import threading
import time
import numpy as np
from queue import Queue
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from insightface.app import FaceAnalysis
from pathlib import Path
import requests
from datetime import datetime, timezone, timedelta

# ================= CONFIG =================
# CAM_A = 0
CAM_A = "rtsp://admin:Cnsvn888@27.72.101.250:554/Streaming/Channels/101"
CAM_B = "rtsp://admin:Cnsvn888@27.72.101.250:10554/Streaming/Channels/101"
ATTENDANCE_API = "https://localhost:44321/api/attendancelogs"

FRAME_SKIP = 3
QUEUE_SIZE = 20
THRESHOLD = 0.8

# ================= INIT =================
app = FastAPI()
frame_queue = Queue(maxsize=QUEUE_SIZE)

# GPU init
face_app = FaceAnalysis(providers=["CUDAExecutionProvider"])
face_app.prepare(ctx_id=0, det_size=(640, 640))

# Fake DB (cache)
FACE_DB = {}  # {id: embedding}

# Tracking
tracking = {}
last_event = {}
active_faces = {"A": {}, "B": {}}  # lưu trạng thái khuôn mặt đang theo dõi

# ================= LOCK =================
faces_lock = threading.Lock()
tracking_lock = threading.Lock()
frames_lock = threading.Lock()

# ================= EMBEDDING =================
BASE_DIR = Path(__file__).resolve().parent.parent
EMPLOYEE_IMG_DIR = BASE_DIR / "images" / "employees"

@app.post("/register/{employee_id}")
def register_employee(employee_id: str):
    emp_dir = EMPLOYEE_IMG_DIR / employee_id / "photos"
    if not emp_dir.exists():
        raise HTTPException(status_code=404, detail="Employee folder not found")

    embeddings = []
    for img_file in emp_dir.glob("*.*"):
        if img_file.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
            continue

        img = cv2.imread(str(img_file))
        if img is None:
            continue

        faces = face_app.get(img)
        if not faces:
            continue

        face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]))
        embeddings.append(face.normed_embedding)

    if not embeddings:
        raise HTTPException(status_code=400, detail="No faces detected in photos")

    mean_emb = np.mean(embeddings, axis=0)
    FACE_DB[employee_id] = mean_emb.tolist()

    return {
        "employee_id": employee_id,
        "embeddings_saved": len(embeddings),
        "cache_size": len(FACE_DB)
    }

@app.post("/register_all")
def register_all():
    # Xóa cache cũ trước khi load lại
    FACE_DB.clear()

    count = 0
    for emp_dir in EMPLOYEE_IMG_DIR.glob("*"):
        if not emp_dir.is_dir():
            continue
        employee_id = emp_dir.name
        photos_dir = emp_dir / "photos"
        if not photos_dir.exists():
            continue

        embeddings = []
        for img_file in photos_dir.glob("*.*"):
            if img_file.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
                continue
            img = cv2.imread(str(img_file))
            if img is None:
                continue
            faces = face_app.get(img)
            if not faces:
                continue
            face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]))
            embeddings.append(face.normed_embedding)

        if embeddings:
            mean_emb = np.mean(embeddings, axis=0)
            FACE_DB[employee_id] = mean_emb.tolist()
            count += 1

    return {"employees_loaded": count, "cache_size": len(FACE_DB)}

# ================= CAMERA =================
class CameraWorker:
    def __init__(self, name, url):
        self.name = name
        self.url = url
        self.cap = cv2.VideoCapture(url)
        self.frame = None
        self.running = True
        threading.Thread(target=self._reader, daemon=True).start()

    def _reader(self):
        count = 0
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(2)
                self.cap.release()
                self.cap = cv2.VideoCapture(self.url)
                continue

            self.frame = frame
            count += 1
            if count % FRAME_SKIP != 0:
                continue
            if not frame_queue.full():
                frame_queue.put((self.name, frame))

# ================= IDENTIFY =================
def identify(emb):
    if not FACE_DB:
        return "Unknown", 0.0
    names = list(FACE_DB.keys())
    matrix = np.array(list(FACE_DB.values()))
    dists = np.linalg.norm(matrix - emb, axis=1)
    idx = np.argmin(dists)
    best_dist = dists[idx]
    confidence = round(best_dist, 2)
    if best_dist < THRESHOLD:
        return names[idx], confidence
    return "Unknown", 0.0

# ================= SEND LOG =================
def send_attendance_log(
    employee_id,
    camera_id,
    event_type,
    confidence=0.00
):
    ICT = timezone(timedelta(hours=7))  # Indochina Time UTC+7
    now_local = datetime.now(ICT).isoformat()
    payload = {
        "employeeID": employee_id,
        "cameraID": camera_id,
        "eventType": event_type,
        "eventTime": now_local,
        "confidenceScore": confidence,
        "createdAt": now_local,
        "createdBy": "system"
    }
    try:
        response = requests.post(
            ATTENDANCE_API,
            json=payload,
            verify=False,
            timeout=5
        )
        print(
            f"📤 SEND LOG: "
            f"{payload}"
        )
        print(
            f"✅ API STATUS: "
            f"{response.status_code}"
        )
    except Exception as ex:

        print(
            f"❌ SEND LOG ERROR: "
            f"{ex}"
        )
# ================= DIRECTION =================
def update_direction(cam, user):
    if user == "Unknown":
        return
    now = time.time()
    if user not in tracking:
        tracking[user] = {}
    with tracking_lock:
        tracking[user][cam] = now
    if "A" in tracking[user] and "B" in tracking[user]:
        diff = tracking[user]["B"] - tracking[user]["A"]
        if abs(diff) < 5:
            if user in last_event and now - last_event[user] < 20:
                return
            direction = "IN" if diff > 0 else "OUT"
            print(f"👉 {user} {direction}")
            with tracking_lock:
                last_event[user] = now
            tracking[user] = {}

# ================= GPU WORKER =================
processed_frames = {"A": None, "B": None}

def compute_iou(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxAArea = (boxA[2]-boxA[0]) * (boxA[3]-boxA[1])
    boxBArea = (boxB[2]-boxB[0]) * (boxB[3]-boxB[1])
    iou = interArea / float(boxAArea + boxBArea - interArea + 1e-6)
    return iou

def gpu_worker():
    while True:
        cam, frame = frame_queue.get()
        img = frame.copy()
        small = cv2.resize(img, (640, 640))
        faces = face_app.get(small)
        h, w = img.shape[:2]
        rw, rh = w / 640, h / 640

        for face in faces:
            box = face.bbox.astype(int)
            box[0] = int(box[0] * rw)
            box[2] = int(box[2] * rw)
            box[1] = int(box[1] * rh)
            box[3] = int(box[3] * rh)

            matched = None
            for fid, info in active_faces[cam].items():
                iou = compute_iou(box, info["bbox"])
                if iou > 0.3:
                    matched = info
                    with faces_lock:
                        info["bbox"] = box
                        info["last_seen"] = time.time()
                        center_x = int((box[0] + box[2]) / 2)
                        info["last_x"] = center_x
                    break

            if matched:
                # Nếu đã xác thực rồi
                # thì reuse luôn
                if matched["name"] != "Unknown":
                    name = matched["name"]
                    confidence = matched.get("confidence", 0.00)
                else:
                    name, confidence = identify(face.normed_embedding)
                    if name != "Unknown":
                        matched["name"] = name
                        matched["confidence"] = confidence
            else:
                name, confidence = identify(face.normed_embedding)
                center_x = int((box[0] + box[2]) / 2)
                with faces_lock:
                    active_faces[cam][id(face)] = {
                        "name": name,
                        "confidence": confidence,
                        "bbox": box,
                        "last_seen": time.time(),
                        # thời điểm bắt đầu detect
                        "first_seen": time.time(),
                        # đã gửi log chưa
                        "log_sent": False,
                        # tracking hướng
                        "start_x": center_x,
                        "last_x": center_x
                    }

            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(img, (box[0], box[1]), (box[2], box[3]), color, 2)
            cv2.putText(img, name, (box[0], box[1]-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        with faces_lock:
            current_faces = list(active_faces[cam].items())
        for fid, info in current_faces:
            # mất khỏi camera > 2 giây
            if time.time() - info["last_seen"] > 2.0:
                # chưa gửi log
                if not info["log_sent"]:
                    name = info["name"]
                    # chỉ xử lý nhân viên thật
                    if name != "Unknown":
                        movement = (
                            info["last_x"]
                            - info["start_x"]
                        )
                        # di chuyển đủ xa
                        if abs(movement) > 120:
                            # Camera A = IN
                            if cam == "A" and movement > 0:
                                print(f"✅ {name} IN")
                                send_attendance_log(
                                    employee_id=name,
                                    camera_id=1,
                                    event_type="IN",
                                    confidence=info.get("confidence", 0.00)
                                )
                                info["log_sent"] = True

                            # Camera B = OUT
                            elif cam == "B" and movement > 0:
                                print(f"✅ {name} OUT")
                                send_attendance_log(
                                    employee_id=name,
                                    camera_id=2,
                                    event_type="OUT",
                                    confidence=info.get("confidence", 0.00)
                                )
                                info["log_sent"] = True
                # xóa tracking
                with faces_lock:
                    if fid in active_faces[cam]:
                        del active_faces[cam][fid]

        with frames_lock:
            processed_frames[cam] = img

# ================= STREAM =================
def stream(cam):
    while True:
        with frames_lock:
            frame = processed_frames.get(cam)
        if frame is not None:
            _, buf = cv2.imencode(".jpg", frame)
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')
        time.sleep(0.03)

@app.get("/stream/cam01_a")
def stream_a():
    return StreamingResponse(stream("A"), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get("/stream/cam01_b")
def stream_b():
    return StreamingResponse(stream("B"), media_type='multipart/x-mixed-replace; boundary=frame')

# ================= START =================
camA = CameraWorker("A", CAM_A)
camB = CameraWorker("B", CAM_B)
threading.Thread(target=gpu_worker, daemon=True).start()

# ================= RUN =================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
