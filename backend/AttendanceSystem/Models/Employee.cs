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

        // 🔥 Thêm mới
        public string? Phone { get; set; }
        public string? Email { get; set; }

        public string? AvatarPath { get; set; }

        public bool Status { get; set; } = true;

        // 🔥 Navigation (quan trọng)
        public ICollection<FaceEmbedding>? FaceEmbeddings { get; set; }
    }
}