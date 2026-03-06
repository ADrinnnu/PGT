using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TMS.Domain.Entities;
using TMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace TMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DispatchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DispatchController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDispatches()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            var query = _context.Dispatches.AsQueryable();

            if (role != "HeadAdmin" && int.TryParse(companyIdString, out int companyId))
            {
                query = query.Where(d => d.CompanyId == companyId);
            }

            var dispatches = await query.ToListAsync();
            return Ok(dispatches);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDispatch([FromBody] CreateDispatchRequest request)
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
                else
                {
                    return Unauthorized(new { message = "Invalid company ID." });
                }
            }

            var dispatch = new Dispatch
            {
                VehicleId = request.VehicleId,
                DriverId = request.DriverId,
                RouteName = request.RouteName,
                DepartureTime = request.DepartureTime,
                Status = request.Status ?? "Scheduled",
                CompanyId = companyIdToAssign
            };

            _context.Dispatches.Add(dispatch);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Dispatch scheduled successfully." });
        }
    }

    public class CreateDispatchRequest
    {
        public int VehicleId { get; set; }
        public int DriverId { get; set; }
        public string RouteName { get; set; } = string.Empty;
        public DateTime DepartureTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public int CompanyId { get; set; }
    }
}