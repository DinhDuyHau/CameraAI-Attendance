using AttendanceSystem.DTOs;
using AttendanceSystem.Models;

namespace AttendanceSystem.Services.Interfaces
{
    public interface IDoorService
    {
        Task<List<Door>> GetAllAsync();
        Task<Door?> GetByIdAsync(int id);

        Task<Door> CreateAsync(DoorDto dto);
        Task<bool> UpdateAsync(int id, DoorDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
