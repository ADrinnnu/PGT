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
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            // THIS IS THE FIX: We JOIN the Companies table so React knows the actual Company Name!
            var query = from v in _context.Vehicles
                        join c in _context.Companies on v.CompanyId equals c.Id into companyGroup
                        from c in companyGroup.DefaultIfEmpty()
                        select new
                        {
                            v.Id,
                            v.PlateNumber,
                            v.Model,
                            v.Capacity,
                            v.Status,
                            v.CompanyId,
                            CompanyName = c != null ? c.Name : "Unknown Company"
                        };

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
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            int companyIdToAssign = request.CompanyId;

            if (role != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int tokenCompanyId))
                {
                    companyIdToAssign = tokenCompanyId;
                }
                else return Unauthorized(new { message = "Invalid company ID." });
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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVehicle(int id, [FromBody] CreateVehicleRequest request)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound(new { message = "Vehicle not found." });

            if (role != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int companyId))
                {
                    if (vehicle.CompanyId != companyId) return Forbid();
                    request.CompanyId = companyId; 
                }
                else return Unauthorized();
            }

            vehicle.PlateNumber = request.PlateNumber;
            vehicle.Model = request.Model;
            vehicle.Capacity = request.Capacity;
            vehicle.Status = request.Status ?? "Active";

            if (role == "HeadAdmin")
            {
                vehicle.CompanyId = request.CompanyId;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Vehicle updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound(new { message = "Vehicle not found." });

            if (role != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int companyId))
                {
                    if (vehicle.CompanyId != companyId) return Forbid();
                }
                else return Unauthorized();
            }

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Vehicle deleted successfully." });
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