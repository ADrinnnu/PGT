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
    var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
    var companyIdString = User.FindFirst("companyId")?.Value;

    // Join with Companies to get the Name for the frontend filter
    var query = from r in _context.TransitRoutes
                join c in _context.Companies on r.CompanyId equals c.Id into companyGroup
                from c in companyGroup.DefaultIfEmpty()
                select new
                {
                    r.Id,
                    r.Origin,
                    r.Destination,
                    r.EstimatedMinutes,
                    r.BaseFare,
                    r.DistanceKm,
                    r.RouteCoordinates,
                    r.CompanyId,
                    CompanyName = c != null ? c.Name : "Unknown Company"
                };

    if (userRole == "HeadAdmin")
    {
        return Ok(await query.ToListAsync());
    }
    else if (userRole == "CompanyAdmin")
    {
        if (string.IsNullOrEmpty(companyIdString)) 
            return Unauthorized(new { message = "Company ID missing from token." });

        int companyId = int.Parse(companyIdString);
        return Ok(await query.Where(r => r.CompanyId == companyId).ToListAsync());
    }

    return Forbid();
}
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoute(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value;

            var route = await _context.TransitRoutes.FindAsync(id);
            if (route == null) return NotFound();

            if (userRole != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int companyId))
                {
                    if (route.CompanyId != companyId) return Forbid();
                }
                else return Unauthorized();
            }

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