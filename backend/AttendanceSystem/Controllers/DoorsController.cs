using AttendanceSystem.DTOs;
using AttendanceSystem.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/doors")]
public class DoorsController : ControllerBase
{
    private readonly IDoorService _service;

    public DoorsController(IDoorService service)
    {
        _service = service;
    }

    // GET: api/doors
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _service.GetAllAsync();
        return Ok(data);
    }

    // GET: api/doors/5
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var door = await _service.GetByIdAsync(id);
        if (door == null)
            return NotFound(new { message = "Door not found" });

        return Ok(door);
    }

    // POST: api/doors
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DoorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var door = await _service.CreateAsync(dto);
        return Ok(door);
    }

    // PUT: api/doors/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] DoorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.UpdateAsync(id, dto);
        if (!result)
            return NotFound(new { message = "Door not found" });

        return Ok(new { message = "Updated successfully" });
    }

    // DELETE: api/doors/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound(new { message = "Door not found" });

        return Ok(new { message = "Deleted successfully" });
    }
}