using AttendanceSystem.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Camera
{
    [Key]
    public int CameraID { get; set; }

    [Required]
    [MaxLength(100)]
    public string CameraName { get; set; }
    public int? DoorID { get; set; }
    [Required]
    [Column(TypeName = "char(1)")]
    public string ZoneType { get; set; }
    public string? RTSP { get; set; }
    public string? IPAddress { get; set; }
    public string? Location { get; set; }

    public bool Status { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // Navigation
    [ForeignKey("DoorID")]
    public Door? Door { get; set; }
}