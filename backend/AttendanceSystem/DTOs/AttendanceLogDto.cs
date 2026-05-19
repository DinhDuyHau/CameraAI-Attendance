namespace AttendanceSystem.DTOs
{
    public class AttendanceLogDto
    {
        public string EmployeeID { get; set; }
        public int CameraID { get; set; }
        public string EventType { get; set; } // In, Out...
        public DateTime EventTime { get; set; }
        public double? ConfidenceScore { get; set; }
    }
}
