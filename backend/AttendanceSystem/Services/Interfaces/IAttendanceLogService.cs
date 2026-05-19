using AttendanceSystem.DTOs;
using AttendanceSystem.Models;

namespace AttendanceSystem.Services.Interfaces
{
    public interface IAttendanceLogService
    {
        Task<IEnumerable<AttendanceLog>> GetAllAsync();
        Task<(IEnumerable<AttendanceLogDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<AttendanceLog?> GetByIdAsync(int id);
        Task<AttendanceLog> CreateAsync(CreateAttendanceLogDto dto);
        Task<AttendanceLog?> UpdateAsync(int id, AttendanceLogDto dto);
        Task<bool> DeleteAsync(int id);
    }

}
