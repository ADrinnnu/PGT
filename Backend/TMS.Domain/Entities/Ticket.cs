using System;

namespace TMS.Domain.Entities
{
    public class Ticket
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        
        // The Commuter who paid
        public int CommuterId { get; set; } 
        
        // The Conductor who scanned the QR
        public int PaoId { get; set; } 
        
        // Route details
        public string RouteName { get; set; } = string.Empty;
        public string BoardingStop { get; set; } = string.Empty;
        public string DestinationStop { get; set; } = string.Empty;
        
        // Financials
        public decimal DistanceKm { get; set; }
        public decimal BaseFare { get; set; }
        public decimal DiscountAmount { get; set; } // For Student/Senior
        public decimal TotalPaid { get; set; }

        public DateTime ScannedAt { get; set; } = DateTime.UtcNow;
    }
}