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
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueAnalysis()
        {
            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;

            var revenueData = await _context.Transactions
                .Where(t => t.Timestamp.Month == currentMonth && t.Timestamp.Year == currentYear && t.Status == "Success")
                .GroupBy(t => t.Route)
                .Select(g => new {
                    name = g.Key,
                    revenue = g.Sum(t => t.Amount),
                    trips = g.Count()
                })
                .ToListAsync();

            return Ok(revenueData);
        }

        [HttpGet("trips")]
        public async Task<IActionResult> GetTripLogs()
        {
            var dispatches = await _context.Dispatches.OrderByDescending(d => d.DepartureTime).Take(50).ToListAsync();
            var drivers = await _context.Drivers.ToListAsync();
            
            var logs = dispatches.Select(d => {
                var driver = drivers.FirstOrDefault(dr => dr.Id == d.DriverId);
                return new {
                    id = d.Id,
                    date = d.DepartureTime.ToString("yyyy-MM-dd"),
                    route = d.RouteName,
                    driver = driver != null ? $"{driver.FirstName} {driver.LastName}" : "Unknown",
                    status = d.Status,
                    amount = "See Transactions"
                };
            });

            return Ok(logs);
        }
    }
}