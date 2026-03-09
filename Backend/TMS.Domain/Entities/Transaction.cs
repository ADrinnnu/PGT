using System;

namespace TMS.Domain.Entities
{
    public class Transaction
    {
        public int Id { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public int CommuterId { get; set; }
        public string PassengerName { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal RemainingBalance { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}