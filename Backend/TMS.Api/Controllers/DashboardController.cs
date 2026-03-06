using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TMS.Infrastructure.Data;
using System.Threading.Tasks;

namespace TMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            int totalVehicles = 0;
            int activeVehicles = 0;
            int totalDrivers = 0;
            int activeDrivers = 0;
            int totalCompanies = 0;

            if (role == "HeadAdmin")
            {
                totalVehicles = await _context.Vehicles.CountAsync();
                activeVehicles = await _context.Vehicles.CountAsync(v => v.Status == "Active");
                totalDrivers = await _context.Drivers.CountAsync();
                activeDrivers = await _context.Drivers.CountAsync(d => d.Status == "Active");
                totalCompanies = await _context.Companies.CountAsync();
            }
            else if (int.TryParse(companyIdString, out int companyId))
            {
                totalVehicles = await _context.Vehicles.CountAsync(v => v.CompanyId == companyId);
                activeVehicles = await _context.Vehicles.CountAsync(v => v.CompanyId == companyId && v.Status == "Active");
                totalDrivers = await _context.Drivers.CountAsync(d => d.CompanyId == companyId);
                activeDrivers = await _context.Drivers.CountAsync(d => d.CompanyId == companyId && d.Status == "Active");
            }
            else
            {
                return Unauthorized();
            }

            return Ok(new
            {
                totalVehicles,
                activeVehicles,
                totalDrivers,
                activeDrivers,
                totalCompanies
            });
        }
    }
}