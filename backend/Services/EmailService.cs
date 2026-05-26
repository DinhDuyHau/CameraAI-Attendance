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
        public async Task SendEmailAsync(string position, string message)
        {
            var sending = await _context.SendingEmails
                .FirstOrDefaultAsync(s => s.Position == position);

            if (sending == null) return;

            var employeeIds = sending.EmployeeIDs.Split(',')
                .Select(id => id.Trim())
                .ToList();

            var recipients = await _context.Employees
                .Where(e => employeeIds.Contains(e.EmployeeID))
                .Select(e => e.Email)
                .ToListAsync();

            if (!recipients.Any()) return;

            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential("luongthaiha01@gmail.com", "gyqe mssi bxhi zzdt"),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress("luongthaiha01@gmail.com", "Attendance System"),
                Subject = $"Notification for {position}",
                Body = message,
                IsBodyHtml = true
            };

            foreach (var recipient in recipients)
            {
                mail.To.Add(recipient);
            }

            await smtpClient.SendMailAsync(mail);
        }
    }
}
