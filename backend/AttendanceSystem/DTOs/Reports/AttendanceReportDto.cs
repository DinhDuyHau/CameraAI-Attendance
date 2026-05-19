namespace AttendanceSystem.DTOs.Reports
{
    public class AttendanceReportDto
    {
        public string EmployeeID { get; set; }
        public string FullName { get; set; }
        public string Department { get; set; }
        public string Position { get; set; }
        public DateTime WorkDate { get; set; }
        public int? CheckInCount { get; set; }
        public int? CheckOutCount { get; set; }
        public DateTime? FirstCheckIn { get; set; }
        public DateTime? LastCheckOut { get; set; }
        public int? TotalMinutesWorked { get; set; }
        public string Status { get; set; }
    }
}
