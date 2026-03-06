using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Domain.Entities;
using TMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Linq;

namespace TMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DriversController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DriversController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDrivers()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            
            var query = from d in _context.Drivers
                        join c in _context.Companies on d.CompanyId equals c.Id into companyGroup
                        from c in companyGroup.DefaultIfEmpty()
                        select new
                        {
                            d.Id,
                            d.FirstName,
                            d.LastName,
                            d.LicenseNumber,
                            d.ContactNumber,
                            d.Status,
                            d.CompanyId,
                            CompanyName = c != null ? c.Name : "Unknown Company"
                        };

            if (userRole == "HeadAdmin")
            {
                var allDrivers = await query.ToListAsync();
                return Ok(allDrivers);
            }
            else if (userRole == "CompanyAdmin")
            {
                var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

                if (string.IsNullOrEmpty(companyIdString)) 
                    return Unauthorized(new { message = "Company ID missing from token." });

                int companyId = int.Parse(companyIdString);

                var companyDrivers = await query
                    .Where(d => d.CompanyId == companyId)
                    .ToListAsync();

                return Ok(companyDrivers);
            }

            return Forbid();
        }

        [HttpPost]
        public async Task<IActionResult> CreateDriver([FromBody] CreateDriverRequest request)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            int companyIdToAssign;

            if (userRole == "HeadAdmin")
            {
                if (request.CompanyId <= 0)
                    return BadRequest(new { message = "Head Admin must provide a valid CompanyId." });
                
                companyIdToAssign = request.CompanyId;
            }
            else if (userRole == "CompanyAdmin")
            {
                var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;
                
                if (string.IsNullOrEmpty(companyIdString)) 
                    return Unauthorized();
                
                companyIdToAssign = int.Parse(companyIdString);
            }
            else
            {
                return Forbid();
            }

            var driver = new Driver
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                LicenseNumber = request.LicenseNumber,
                ContactNumber = request.ContactNumber,
                CompanyId = companyIdToAssign,
                Status = request.Status ?? "Active"
            };

            _context.Drivers.Add(driver);
            await _context.SaveChangesAsync();

            return Ok(driver);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDriver(int id, [FromBody] CreateDriverRequest request)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null)
            {
                return NotFound(new { message = "Driver not found." });
            }

            if (userRole != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int companyId))
                {
                    if (driver.CompanyId != companyId)
                    {
                        return Forbid();
                    }
                    request.CompanyId = companyId; 
                }
                else
                {
                    return Unauthorized();
                }
            }

            driver.FirstName = request.FirstName;
            driver.LastName = request.LastName;
            driver.LicenseNumber = request.LicenseNumber;
            driver.ContactNumber = request.ContactNumber;
            driver.Status = request.Status ?? "Active";

            if (userRole == "HeadAdmin")
            {
                driver.CompanyId = request.CompanyId;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Driver updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDriver(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            var driver = await _context.Drivers.FindAsync(id);
            
            if (driver == null)
            {
                return NotFound(new { message = "Driver not found." });
            }

            if (userRole != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int companyId))
                {
                    if (driver.CompanyId != companyId)
                    {
                        return Forbid(); 
                    }
                }
                else
                {
                    return Unauthorized();
                }
            }

            _context.Drivers.Remove(driver);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Driver deleted successfully." });
        }
    }

    public class CreateDriverRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int CompanyId { get; set; } 
    }
}