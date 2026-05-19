using System.ComponentModel.DataAnnotations;

namespace AttendanceSystem.Models
{
    public class Door
    {
        public int DoorID { get; set; }
        public string DoorName { get; set; }
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
