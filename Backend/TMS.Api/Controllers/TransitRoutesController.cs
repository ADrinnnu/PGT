using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Domain.Entities;
using TMS.Infrastructure.Data;

namespace TMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransitRoutesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransitRoutesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTransitRoutes()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole == "HeadAdmin")
            {
                var allRoutes = await _context.TransitRoutes.ToListAsync();
                return Ok(allRoutes);
            }
            else if (userRole == "CompanyAdmin")
            {
                var companyIdString = User.FindFirst("companyId")?.Value;

                if (string.IsNullOrEmpty(companyIdString)) 
                    return Unauthorized(new { message = "Company ID missing from token." });

                int companyId = int.Parse(companyIdString);

                var companyRoutes = await _context.TransitRoutes
                    .Where(r => r.CompanyId == companyId)
                    .ToListAsync();

                return Ok(companyRoutes);
            }

            return Forbid();
        }
        
        [HttpDelete("{id}")]
public async Task<IActionResult> DeleteRoute(int id)
{
    var route = await _context.TransitRoutes.FindAsync(id);
    if (route == null) return NotFound();

    _context.TransitRoutes.Remove(route);
    await _context.SaveChangesAsync();

    return NoContent();
}

        [HttpPost]
        public async Task<IActionResult> CreateTransitRoute([FromBody] CreateTransitRouteRequest request)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            int companyIdToAssign;

            if (userRole == "HeadAdmin")
            {
                if (request.CompanyId <= 0)
                    return BadRequest(new { message = "Head Admin must provide a valid CompanyId." });
                
                companyIdToAssign = request.CompanyId;
            }
            else if (userRole == "CompanyAdmin")
            {
                var companyIdString = User.FindFirst("companyId")?.Value;
                
                if (string.IsNullOrEmpty(companyIdString)) 
                    return Unauthorized();
                
                companyIdToAssign = int.Parse(companyIdString);
            }
            else
            {
                return Forbid();
            }

            var route = new TransitRoute
            {
                Origin = request.Origin,
                Destination = request.Destination,
                EstimatedMinutes = request.EstimatedMinutes,
                BaseFare = request.BaseFare,
                CompanyId = companyIdToAssign,
                RouteCoordinates = request.RouteCoordinates,
                DistanceKm = request.DistanceKm
            };

            _context.TransitRoutes.Add(route);
            await _context.SaveChangesAsync();

            return Ok(route);
        }
    }

    public class CreateTransitRouteRequest
    {
        public string Origin { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public decimal BaseFare { get; set; }
        public int CompanyId { get; set; } 
        public string RouteCoordinates { get; set; } = "[]"; 
        public double DistanceKm { get; set; }
    }
}