namespace TMS.Domain.Entities
{
    public class TransitRoute
    {
        public int Id { get; set; }
        public string Origin { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public decimal BaseFare { get; set; }
        public int CompanyId { get; set; }
        
        public string RouteCoordinates { get; set; } = "[]"; 
        public double DistanceKm { get; set; }
    }
}