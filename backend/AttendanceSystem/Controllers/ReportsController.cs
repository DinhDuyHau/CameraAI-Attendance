using Microsoft.AspNetCore.Mvc;
using AttendanceSystem.Services.Reports;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AttendanceReportService _attendanceReportService;

    public ReportsController(AttendanceReportService attendanceReportService)
    {
        _attendanceReportService = attendanceReportService;
    }

    [HttpGet("attendance")]
    public async Task<IActionResult> GetAttendanceReport(
    [FromQuery] DateTime startDate,
    [FromQuery] DateTime endDate,
    [FromQuery] string? employeeId = null,
    [FromQuery] string? department = null)
    {
        var report = await _attendanceReportService.GetAttendanceReport(startDate, endDate, employeeId, department);
        return Ok(report);
    }

}
