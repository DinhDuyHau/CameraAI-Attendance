using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceSystem.Models
{
    public class FaceEmbedding : BaseEntity
    {
        [Key]
        public long Id { get; set; }

        public string EmployeeID { get; set; }

        public byte[] Embedding { get; set; }

        public string? ImagePath { get; set; }

        public int Version { get; set; } = 1;

        [ForeignKey("EmployeeID")]
        public Employee Employee { get; set; }
    }
}