using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceSystem.Models
{
    public class AttendanceLog : BaseEntity
    {
        public int AttendanceLogID { get; set; }
        public string EmployeeID { get; set; }
        public int CameraID { get; set; }
        public string EventType { get; set; } // In, Out...
        public DateTime EventTime { get; set; }
        public double? ConfidenceScore { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }

        // Navigation properties
        public Employee Employee { get; set; }
        public Camera Camera { get; set; }
    }
}
