using AttendanceSystem.Data;
using AttendanceSystem.DTOs;
using AttendanceSystem.Models;
using AttendanceSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class CameraService : ICameraService
{
    private readonly AppDbContext _context;

    public CameraService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Camera>> GetAllAsync()
    {
        return await _context.Cameras
            .Include(x => x.Door)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<Camera?> GetByIdAsync(int id)
    {
        return await _context.Cameras.FindAsync(id);
    }

    public async Task<Camera> CreateAsync(CameraDto dto)
    {
        // validate ZoneType
        if (dto.ZoneType != "A" && dto.ZoneType != "B")
            throw new Exception("ZoneType must be A or B");

        var cam = new Camera
        {
            CameraName = dto.CameraName,
            DoorID = dto.DoorID,
            ZoneType = dto.ZoneType,
            RTSP = dto.RTSP,
            Location = dto.Location,
            CreatedAt = DateTime.Now,
            Status = true
        };

        _context.Cameras.Add(cam);
        await _context.SaveChangesAsync();

        return cam;
    }

    public async Task<bool> UpdateAsync(int id, CameraDto dto)
    {
        var cam = await _context.Cameras.FindAsync(id);
        if (cam == null) return false;

        cam.CameraName = dto.CameraName;
        cam.DoorID = dto.DoorID;
        cam.ZoneType = dto.ZoneType;
        cam.RTSP = dto.RTSP;
        cam.Location = dto.Location;
        cam.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var cam = await _context.Cameras.FindAsync(id);
        if (cam == null) return false;

        _context.Cameras.Remove(cam);
        await _context.SaveChangesAsync();

        return true;
    }
}