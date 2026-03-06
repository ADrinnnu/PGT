using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Domain.Entities;
using TMS.Infrastructure.Data;
using BCrypt.Net;

namespace TMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "HeadAdmin")]
    public class CompaniesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompaniesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyRequest request)
        {
            try
            {
                if (_context.Users.Any(u => u.Email == request.AdminEmail))
                {
                    return BadRequest(new { message = "Admin email already exists." });
                }

                var company = new Company
                {
                    Name = request.CompanyName,
                    ContactEmail = request.ContactEmail
                };

                _context.Companies.Add(company);
                await _context.SaveChangesAsync();

                var adminUser = new User
                {
                    Name = request.AdminName,
                    Email = request.AdminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.AdminPassword),
                    Role = "CompanyAdmin",
                    CompanyId = company.Id,
                    Status = "Active",
                    CreatedDate = DateTime.UtcNow
                };

                _context.Users.Add(adminUser);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Company and Admin created successfully", companyId = company.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class CreateCompanyRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string AdminName { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string AdminPassword { get; set; } = string.Empty;
    }
}