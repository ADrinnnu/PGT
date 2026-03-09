using System;

namespace TMS.Domain.Entities
{
    public class CommuterWallet
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime LastActive { get; set; } = DateTime.UtcNow;
    }
}