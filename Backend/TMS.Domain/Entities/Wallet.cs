using System;

namespace TMS.Domain.Entities
{
    public class Wallet
    {
        public int Id { get; set; }
        
        // Links to the Commuter's User Account
        public int UserId { get; set; } 
        
        public decimal Balance { get; set; }
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        // A unique 16-character string used to generate their QR code securely
        public string QrCodePayload { get; set; } = string.Empty; 
    }
}