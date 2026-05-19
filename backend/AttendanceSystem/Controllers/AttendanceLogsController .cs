using AttendanceSystem.DTOs;
using AttendanceSystem.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/attendancelogs")]
public class AttendanceLogsController : ControllerBase
{
    private readonly IAttendanceLogService _service;

    public AttendanceLogsController(IAttendanceLogService service)
    {
        _service = service;
    }

    // GET: api/attendancelogs
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _service.GetAllAsync();
        return Ok(data);
    }

    // GET: api/attendancelogs/paged?pageNumber=1&pageSize=10
    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        if (pageNumber <= 0 || pageSize <= 0)
            return BadRequest(new { message = "Invalid pagination parameters" });

        var (items, totalCount) = await _service.GetPagedAsync(pageNumber, pageSize);

        var response = new
        {
            pageNumber,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
            data = items
        };

        return Ok(response);
    }


    // GET: api/attendancelogs/5
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var log = await _service.GetByIdAsync(id);
        if (log == null)
            return NotFound(new { message = "AttendanceLog not found" });

        return Ok(log);
    }

    // POST: api/attendancelogs
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAttendanceLogDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var log = await _service.CreateAsync(dto);
        return Ok(log);
    }

    // PUT: api/attendancelogs/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AttendanceLogDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.UpdateAsync(id, dto);
        if (result == null)
            return NotFound(new { message = "AttendanceLog not found" });

        return Ok(new { message = "Updated successfully" });
    }

    // DELETE: api/attendancelogs/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound(new { message = "AttendanceLog not found" });

        return Ok(new { message = "Deleted successfully" });
    }
}
