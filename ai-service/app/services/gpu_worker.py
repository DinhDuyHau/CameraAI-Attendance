import cv2
import time
import threading

from app.core.config import DETECT_SIZE

from app.core.globals import (
    frame_queue,
    active_faces,
    processed_frames
)

from app.core.locks import (
    faces_lock,
    frames_lock
)

from app.services.face_service import (
    detect_faces,
    identify_face
)

from app.services.tracking_service import (
    compute_iou
)

from app.services.attendance_service import (
    send_attendance_log
)

def gpu_worker():
    while True:
        cam, frame = frame_queue.get()
        img = frame.copy()

        small = cv2.resize(img, (DETECT_SIZE, DETECT_SIZE))
        faces = detect_faces(small)

        h, w = img.shape[:2]
        rw, rh = w / DETECT_SIZE, h / DETECT_SIZE

        for face in faces:
            box = face.bbox.astype(int)
            box[0] = int(box[0] * rw)
            box[1] = int(box[1] * rh)
            box[2] = int(box[2] * rw)
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
                if matched["name"] != "Unknown":
                    name = matched["name"]
                    confidence = matched.get("confidence", 0.0)
                else:
                    # Nhận diện lại nếu trước đó là Unknown
                    name, confidence = identify_face(face.normed_embedding)
                    if name != "Unknown":
                        matched["name"] = name
                        matched["confidence"] = confidence
            else:
                name, confidence = identify_face(face.normed_embedding)

                center_x = int((box[0] + box[2]) / 2)
                with faces_lock:
                    active_faces[cam][id(face)] = {
                        "name": name,
                        "confidence": confidence,
                        "bbox": box,
                        "last_seen": time.time(),
                        "first_seen": time.time(),
                        "log_sent": False,
                        "start_x": center_x,
                        "last_x": center_x
                    }

            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(img, (box[0], box[1]), (box[2], box[3]), color, 2)
            cv2.putText(img, name, (box[0], box[1]-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        # xử lý mất khuôn mặt và gửi log giữ nguyên
        current_faces = list(active_faces[cam].items())
        for fid, info in current_faces:
            if time.time() - info["last_seen"] > 2:
                if not info["log_sent"]:
                    movement = info["last_x"] - info["start_x"]
                    if abs(movement) > 50 and info["name"] != "Unknown":
                        if cam == "A" and movement > 0:
                            print(f"✅ {info['name']} IN")
                            send_attendance_log(
                                employee_id=info["name"],
                                camera_id=1,
                                event_type="IN",
                                confidence=info.get("confidence", 0.0)
                            )
                            info["log_sent"] = True
                        elif cam == "B" and movement > 0:
                            print(f"✅ {info['name']} OUT")
                            send_attendance_log(
                                employee_id=info["name"],
                                camera_id=2,
                                event_type="OUT",
                                confidence=info.get("confidence", 0.0)
                            )
                            info["log_sent"] = True
                with faces_lock:
                    if fid in active_faces[cam]:
                        del active_faces[cam][fid]

        with frames_lock:
            processed_frames[cam] = img

def start_gpu_worker():

    threading.Thread(
        target=gpu_worker,
        daemon=True
    ).start()