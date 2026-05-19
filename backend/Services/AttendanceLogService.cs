using AttendanceSystem.Data;
using AttendanceSystem.DTOs;
using AttendanceSystem.Models;
using AttendanceSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class AttendanceLogService : IAttendanceLogService
{
    private readonly AppDbContext _context;
    public AttendanceLogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AttendanceLog>> GetAllAsync()
    {
        return await _context.AttendanceLogs
            .Include(l => l.Employee)
            .Include(l => l.Camera)
            .ToListAsync();
    }

    public async Task<(IEnumerable<AttendanceLogDto> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize)
    {
        var query = _context.AttendanceLogs.AsQueryable();

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.EventTime)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AttendanceLogDto
            {
                EmployeeID = x.EmployeeID,
                CameraID = x.CameraID,
                EventType = x.EventType,
                EventTime = x.EventTime,
                ConfidenceScore = x.ConfidenceScore
            })
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<AttendanceLog?> GetByIdAsync(int id) =>
        await _context.AttendanceLogs.FindAsync(id);

    public async Task<AttendanceLog> CreateAsync(CreateAttendanceLogDto dto)
    {
        var log = new AttendanceLog
        {
            EmployeeID = dto.EmployeeID,
            CameraID = dto.CameraID,
            EventType = dto.EventType,
            EventTime = dto.EventTime,
            ConfidenceScore = dto.ConfidenceScore,
            CreatedAt = dto.CreatedAt,
            CreatedBy = dto.CreatedBy,
        };

        _context.AttendanceLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }


    public async Task<AttendanceLog?> UpdateAsync(int id, AttendanceLogDto dto)
    {
        var existing = await _context.AttendanceLogs.FindAsync(id);
        if (existing == null) return null;

        existing.EmployeeID = dto.EmployeeID;
        existing.CameraID = dto.CameraID;
        existing.EventType = dto.EventType;
        existing.EventTime = dto.EventTime;
        existing.ConfidenceScore = dto.ConfidenceScore;
        existing.UpdatedAt = DateTime.Now;
        existing.UpdatedBy = "system";

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var log = await _context.AttendanceLogs.FindAsync(id);
        if (log == null) return false;

        _context.AttendanceLogs.Remove(log);
        await _context.SaveChangesAsync();
        return true;
    }
}

