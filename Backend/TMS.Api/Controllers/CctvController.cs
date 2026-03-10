using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Linq;
using System;
using System.Security.Claims;

namespace TMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CctvController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CctvController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("feeds")]
        public async Task<IActionResult> GetCameraFeeds()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            // Base query for active dispatches
            var query = _context.Dispatches.AsQueryable();

            // Filter if Cooperative Admin
            if (role != "HeadAdmin" && int.TryParse(companyIdString, out int companyId))
            {
                query = query.Where(d => d.CompanyId == companyId);
            }

            var dispatches = await query.ToListAsync();
            var vehicles = await _context.Vehicles.ToListAsync();
            var drivers = await _context.Drivers.ToListAsync();
            var companies = await _context.Companies.ToListAsync(); // Need this to get company names!

            var random = new Random();

            var feeds = dispatches.Select(d => {
                var vehicle = vehicles.FirstOrDefault(v => v.Id == d.VehicleId);
                var driver = drivers.FirstOrDefault(dr => dr.Id == d.DriverId);
                var company = companies.FirstOrDefault(c => c.Id == d.CompanyId);

                // Mocking live telemetry data until real hardware sensors are installed
                bool isOnline = random.Next(100) > 15; // 85% chance the camera is online
                int speed = isOnline ? random.Next(0, 80) : 0;
                int passengers = isOnline ? random.Next(5, 45) : 0;

                return new {
                    id = d.Id,
                    plate = vehicle != null ? vehicle.PlateNumber : "UNKNOWN",
                    route = d.RouteName,
                    status = isOnline ? "Online" : "Offline",
                    speed = $"{speed} km/h",
                    passengers = passengers,
                    driver = driver != null ? $"{driver.FirstName} {driver.LastName}" : "Unassigned",
                    companyName = company != null ? company.Name : "Unknown Company" 
                };
            }).ToList();

            return Ok(feeds);
        }
    }
}