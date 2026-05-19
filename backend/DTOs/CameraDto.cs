namespace AttendanceSystem.DTOs
{
    public class CameraDto
    {
        public string CameraName { get; set; }
        public int DoorID { get; set; }
        public string ZoneType { get; set; }

        public string? RTSP { get; set; }
        public string? Location { get; set; }
    }
}
