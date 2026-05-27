using Microsoft.EntityFrameworkCore;
using AttendanceSystem.Models;

namespace AttendanceSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<FaceEmbedding> FaceEmbeddings { get; set; }
        public DbSet<Door> Doors { get; set; }
        public DbSet<Camera> Cameras { get; set; }
        public DbSet<AttendanceLog> AttendanceLogs { get; set; }
        public DbSet<SendingEmail> SendingEmails { get; set; }
    }
}
