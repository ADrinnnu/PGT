using System;

namespace TMS.Domain.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "info"; // info, success, warning
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // If CompanyId is null, it's a global notification.
        public int? CompanyId { get; set; }
    }
}
