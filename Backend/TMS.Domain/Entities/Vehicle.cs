namespace TMS.Domain.Entities
{
    public class Vehicle
    {
        public int Id { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Status { get; set; } = "Active";
        public int CompanyId { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}