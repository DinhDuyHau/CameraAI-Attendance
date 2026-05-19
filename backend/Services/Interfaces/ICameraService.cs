using AttendanceSystem.DTOs;
using AttendanceSystem.Models;

namespace AttendanceSystem.Services.Interfaces
{
    public interface ICameraService
    {
        Task<List<Camera>> GetAllAsync();
        Task<Camera?> GetByIdAsync(int id);

        Task<Camera> CreateAsync(CameraDto dto);
        Task<bool> UpdateAsync(int id, CameraDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
