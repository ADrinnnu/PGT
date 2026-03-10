using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Linq;
using System;

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
            var dispatches = await _context.Dispatches.ToListAsync();
            var vehicles = await _context.Vehicles.ToListAsync();
            var drivers = await _context.Drivers.ToListAsync();

            var random = new Random();

            var feeds = dispatches.Select(d => {
                var vehicle = vehicles.FirstOrDefault(v => v.Id == d.VehicleId);
                var driver = drivers.FirstOrDefault(dr => dr.Id == d.DriverId);

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
                    driver = driver != null ? $"{driver.FirstName} {driver.LastName}" : "Unassigned"
                };
            }).ToList();

            return Ok(feeds);
        }
    }
}