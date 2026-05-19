namespace AttendanceSystem.DTOs
{
    public class CreateAttendanceLogDto
    {
        public string EmployeeID { get; set; }
        public int CameraID { get; set; }
        public string EventType { get; set; }
        public DateTime EventTime { get; set; }
        public double ConfidenceScore { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
    }
}
