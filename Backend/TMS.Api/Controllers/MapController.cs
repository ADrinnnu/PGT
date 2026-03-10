using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TMS.Infrastructure.Data;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class MapController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MapController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetLiveVehicles()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
        var companyIdString = User.FindFirst("companyId")?.Value;

        // JOIN with Companies to get the Name for the frontend filter
        var query = from v in _context.Vehicles
                    join c in _context.Companies on v.CompanyId equals c.Id into companyGroup
                    from c in companyGroup.DefaultIfEmpty()
                    where v.Status == "Active" // Only show active vehicles on map
                    select new
                    {
                        v.Id,
                        v.PlateNumber,
                        v.Model,
                        v.Latitude,
                        v.Longitude,
                        v.Status,
                        v.CompanyId,
                        CompanyName = c != null ? c.Name : "Unknown Company"
                    };

        if (role != "HeadAdmin" && int.TryParse(companyIdString, out int companyId))
        {
            query = query.Where(v => v.CompanyId == companyId);
        }

        return Ok(await query.ToListAsync());
    }
}