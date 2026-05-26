using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AttendanceSystem.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string position, string employeeId, DateTime EventTime, string location, string status);
    }
}
