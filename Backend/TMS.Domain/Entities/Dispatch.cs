using System;

namespace TMS.Domain.Entities
{
    public class Dispatch
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public int DriverId { get; set; }
        public string RouteName { get; set; } = string.Empty;
        public DateTime DepartureTime { get; set; }
        public string Status { get; set; } = "Scheduled";
        public int CompanyId { get; set; }
    }
}