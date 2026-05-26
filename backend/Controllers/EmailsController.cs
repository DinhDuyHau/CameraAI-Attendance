using AttendanceSystem.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using AttendanceSystem.DTOs;

[Route("api/[controller]")]
[ApiController]
public class EmailsController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailsController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> SendEmail([FromBody] EmailRequest request)
    {
        await _emailService.SendEmailAsync(
            request.Position,
            request.EmployeeId,
            request.EventTime,
            request.Location,
            request.Status
        );
        return Ok("Email alert sent.");
    }
}
