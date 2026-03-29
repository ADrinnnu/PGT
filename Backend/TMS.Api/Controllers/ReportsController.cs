using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
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
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value;
            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;

            var query = _context.Transactions
                .Where(t => t.Timestamp.Month == currentMonth && t.Timestamp.Year == currentYear && t.Status == "Success");

            if (role != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int companyId))
                {
                    query = query.Where(t => t.CompanyId == companyId);
                }
                else return Unauthorized();
            }

            // Join with Companies to get the CompanyName and group by both Route and Company
            var revenueData = await (from t in query
                                     join c in _context.Companies on t.CompanyId equals c.Id into compGroup
                                     from c in compGroup.DefaultIfEmpty()
                                     group t by new { t.Route, CompanyName = c != null ? c.Name : "Unknown Company" } into g
                                     select new
                                     {
                                         name = g.Key.Route,
                                         companyName = g.Key.CompanyName,
                                         revenue = g.Sum(x => x.Amount),
                                         trips = g.Count()
                                     }).ToListAsync();

            return Ok(revenueData);
        }

        [HttpGet("trips")]
        public async Task<IActionResult> GetTripLogs()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value;

            var query = _context.Dispatches.AsQueryable();

            if (role != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int companyId))
                {
                    query = query.Where(d => d.CompanyId == companyId);
                }
                else return Unauthorized();
            }

            // Join with Companies and Drivers to get all necessary names in one efficient query
            var logs = await (from d in query
                              join c in _context.Companies on d.CompanyId equals c.Id into compGroup
                              from c in compGroup.DefaultIfEmpty()
                              join dr in _context.Drivers on d.DriverId equals dr.Id into driverGroup
                              from dr in driverGroup.DefaultIfEmpty()
                              orderby d.DepartureTime descending
                              select new
                              {
                                  id = d.Id,
                                  date = d.DepartureTime.ToString("yyyy-MM-dd"),
                                  route = d.RouteName,
                                  driver = dr != null ? $"{dr.FirstName} {dr.LastName}" : "Unknown",
                                  status = d.Status,
                                  amount = "See Transactions",
                                  companyName = c != null ? c.Name : "Unknown Company"
                              }).Take(50).ToListAsync();

            return Ok(logs);
        }
    }
}