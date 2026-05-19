using AttendanceSystem.Data;
using AttendanceSystem.DTOs;
using AttendanceSystem.Models;
using AttendanceSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class DoorService : IDoorService
{
    private readonly AppDbContext _context;

    public DoorService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Door>> GetAllAsync()
    {
        return await _context.Doors
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<Door?> GetByIdAsync(int id)
    {
        return await _context.Doors.FindAsync(id);
    }

    public async Task<Door> CreateAsync(DoorDto dto)
    {
        var door = new Door
        {
            DoorName = dto.DoorName,
            Description = dto.Description,
            CreatedAt = DateTime.Now
        };

        _context.Doors.Add(door);
        await _context.SaveChangesAsync();

        return door;
    }

    public async Task<bool> UpdateAsync(int id, DoorDto dto)
    {
        var door = await _context.Doors.FindAsync(id);
        if (door == null) return false;

        door.DoorName = dto.DoorName;
        door.Description = dto.Description;
        door.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var door = await _context.Doors.FindAsync(id);
        if (door == null) return false;

        _context.Doors.Remove(door);
        await _context.SaveChangesAsync();

        return true;
    }
}