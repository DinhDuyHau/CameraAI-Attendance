using AttendanceSystem.Models;
using AttendanceSystem.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AttendanceSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _service;
        public EmployeesController(IEmployeeService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var employee = await _service.GetByIdAsync(id);
            if (employee == null) return NotFound();
            return Ok(employee);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateEmployeeDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.EmployeeID }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, CreateEmployeeDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPost("upload-avatar/{id}")]
        public async Task<IActionResult> UploadAvatar(string id, IFormFile file)
        {
            var avatarPath = await _service.UploadAvatarAsync(id, file);
            if (avatarPath == null) return NotFound();

            return Ok(new { message = "Avatar uploaded successfully", avatarPath });
        }

        [HttpPost("upload-photos/{id}")]
        public async Task<IActionResult> UploadPhotos(string id, List<IFormFile> files)
        {
            var success = await _service.UploadPhotosAsync(id, files);
            if (!success) return NotFound();

            return Ok(new { message = "Photos uploaded successfully" });
        }

    }
}
