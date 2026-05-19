using AttendanceSystem.Models;

public interface IEmployeeService
{
    Task<List<Employee>> GetAllAsync();
    Task<Employee?> GetByIdAsync(string id);

    Task<Employee> CreateAsync(CreateEmployeeDto dto);
    Task<Employee?> UpdateAsync(string id, CreateEmployeeDto dto);

    Task<bool> DeleteAsync(string id);

    Task<string?> UploadAvatarAsync(string id, IFormFile file);
    Task<bool> UploadPhotosAsync(string id, List<IFormFile> files);
}