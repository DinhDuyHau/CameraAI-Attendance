export interface Door {
  doorID: number;
  doorName: string;
  description: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface Camera {
  cameraID: number;
  cameraName: string;
  doorID: number;
  zoneType: string;
  rtsp: string;
  ipAddress: string | null;
  location: string;
  status: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  door: Door | null;
}

export interface AttendanceLog {
  attendanceLogID: number;
  employeeID: string;
  cameraID: number;
  eventType: string;
  eventTime: string;
  confidenceScore: number;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  employee: Employee;
  camera: Camera;
}

export type Page = 'dashboard' | 'live' | 'employees' | 'reports' | 'logs' | 'devices' | 'settings';

export interface Employee {
  employeeID: string;
  fullName: string;
  department: string;
  position: string;
  phone?: string;
  email?: string;
  avatarPath: string;
  faceEmbeddings: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface Alert {
  id: string;
  type: 'intrusion' | 'latency' | 'report';
  title: string;
  description: string;
  time: string;
  location: string;
}
