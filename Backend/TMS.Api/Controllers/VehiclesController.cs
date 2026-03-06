using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Domain.Entities;
using TMS.Infrastructure.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace TMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VehiclesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VehiclesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetVehicles()
        {
            // NEW: Safely checks multiple ways the Role and CompanyId might be capitalized in the token
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            var query = _context.Vehicles.AsQueryable();

            if (role != "HeadAdmin" && int.TryParse(companyIdString, out int companyId))
            {
                query = query.Where(v => v.CompanyId == companyId);
            }

            var vehicles = await query.ToListAsync();
            return Ok(vehicles);
        }

        [HttpPost]
        public async Task<IActionResult> CreateVehicle([FromBody] CreateVehicleRequest request)
        {
            // NEW: Safely checks multiple ways the Role and CompanyId might be capitalized in the token
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            int companyIdToAssign = request.CompanyId;

            if (role != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int tokenCompanyId))
                {
                    companyIdToAssign = tokenCompanyId;
                }
                else
                {
                    return Unauthorized(new { message = "Invalid company ID. You are not recognized as a HeadAdmin." });
                }
            }

            var vehicle = new Vehicle
            {
                PlateNumber = request.PlateNumber,
                Model = request.Model,
                Capacity = request.Capacity,
                Status = request.Status ?? "Active",
                CompanyId = companyIdToAssign
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Vehicle created successfully." });
        }
    }

    public class CreateVehicleRequest
    {
        public string PlateNumber { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Status { get; set; } = string.Empty;
        public int CompanyId { get; set; }
    }
}