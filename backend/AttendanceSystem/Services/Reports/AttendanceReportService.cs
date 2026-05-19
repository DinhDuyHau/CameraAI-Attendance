using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using AttendanceSystem.Data;
using AttendanceSystem.DTOs.Reports;

namespace AttendanceSystem.Services.Reports
{
    public class AttendanceReportService
    {
        private readonly AppDbContext _context;

        public AttendanceReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AttendanceReportDto>> GetAttendanceReport(
            DateTime startDate,
            DateTime endDate,
            string? employeeId = null,
            string? department = null)
        {
            var startParam = new SqlParameter("@StartDate", startDate);
            var endParam = new SqlParameter("@EndDate", endDate);
            var empParam = new SqlParameter("@EmployeeID", employeeId ?? (object)DBNull.Value);
            var depParam = new SqlParameter("@Department", department ?? (object)DBNull.Value);

            var result = await _context.Database
                .SqlQueryRaw<AttendanceReportDto>(
                    "EXEC dbo.sp_AttendanceReport @StartDate, @EndDate, @EmployeeID, @Department",
                    startParam, endParam, empParam, depParam)
                .ToListAsync();

            return result;
        }
    }
}
