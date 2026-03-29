using System;

namespace TMS.Domain.Entities
{
    public class WalletTransaction
    {
        public int Id { get; set; }
        public int WalletId { get; set; }
        
        // "TopUp" or "FareDeduction"
        public string TransactionType { get; set; } = string.Empty; 
        
        public decimal Amount { get; set; }
        
        // "Pending", "Approved", "Rejected", "Completed"
        public string Status { get; set; } = "Pending"; 
        
        // If a top-up, the URL to the uploaded GCash/PayMaya receipt
        public string? ReceiptImageUrl { get; set; } 
        
        // Which Teller approved this top-up? (Null if it's a fare deduction)
        public int? ProcessedByTellerId { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}