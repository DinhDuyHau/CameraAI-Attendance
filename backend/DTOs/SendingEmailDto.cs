using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AttendanceSystem.DTOs
{
    public class SendingEmailDto
    {
        public string Position { get; set; }
        public string EmployeeID { get; set; }
    }
    public class EmailRequest
    {
        public string Position { get; set; }
        public string EmployeeId { get; set; }
        public DateTime EventTime { get; set; }
        public string Location { get; set; }
        public string Status { get; set; }
    }
}
