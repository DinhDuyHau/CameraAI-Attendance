import requests

from datetime import datetime
from datetime import timezone
from datetime import timedelta

from app.core.config import ATTENDANCE_API

def send_attendance_log(
    employee_id,
    camera_id,
    event_type,
    confidence=0.0
):

    ict = timezone(
        timedelta(hours=7)
    )

    now_local = datetime.now(
        ict
    ).isoformat()

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

        print(response.status_code)

    except Exception as ex:

        print(ex)