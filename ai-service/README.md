project/
│
├── app/
│   │
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── globals.py
│   │   └── locks.py
│   │
│   ├── api/
│   │   └── routes/
│   │       ├── register.py
│   │       └── stream.py
│   │
│   ├── services/
│   │   ├── camera_service.py
│   │   ├── face_service.py
│   │   ├── attendance_service.py
│   │   ├── tracking_service.py
│   │   ├── gpu_worker.py
│   │   └── stream_service.py
│   │
│   ├── storage/
│   │   └── face_db.py
│   │
│   └── images/
│       └── employees/
│
├── requirements.txt
└── run.py

uvicorn app.main:app --reload