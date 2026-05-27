using System.ComponentModel.DataAnnotations;

namespace AttendanceSystem.Models
{
    public class Employee : BaseEntity
    {
        [Key]
        public string EmployeeID { get; set; }

        public string? FullName { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? AvatarPath { get; set; }
        public bool Monitor { get; set; } = false;
        public bool Status { get; set; } = true;

        public ICollection<FaceEmbedding>? FaceEmbeddings { get; set; }
    }
}