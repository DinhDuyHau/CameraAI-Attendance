using AttendanceSystem.Data;
using AttendanceSystem.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace AttendanceSystem.Services
{
    public class EmailService : IEmailService
    {
        private readonly AppDbContext _context;
        public EmailService(AppDbContext context)
        {
            _context = context;
        }
        public async Task SendEmailAsync(string position, string employeeId, DateTime EventTime, string location, string status)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC SendEmployeeAlert @p0, @p1, @p2, @p3, @p4",
                parameters: new object[] { position, employeeId, EventTime, location, status }
            );
        }
    }
}
