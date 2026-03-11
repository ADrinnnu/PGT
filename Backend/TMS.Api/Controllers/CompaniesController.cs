using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Domain.Entities;
using TMS.Infrastructure.Data;
using BCrypt.Net;
using System.Threading.Tasks;
using System.Linq;
using System;

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

        [HttpGet]
        public async Task<IActionResult> GetCompanies()
        {
            var companies = await _context.Companies
                .Select(c => new 
                {
                    c.Id,
                    c.Name,
                    c.ContactEmail,
                    AdminEmail = _context.Users
                        .Where(u => u.CompanyId == c.Id && u.Role == "CompanyAdmin")
                        .Select(u => u.Email)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(companies);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyRequest request)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Email == request.AdminEmail))
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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] UpdateCompanyRequest request)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound(new { message = "Company not found." });

            company.Name = request.CompanyName;
            company.ContactEmail = request.ContactEmail;
            _context.Companies.Update(company);

            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.CompanyId == id && u.Role == "CompanyAdmin");
            
            if (adminUser != null && !string.IsNullOrWhiteSpace(request.AdminEmail))
            {
                if (adminUser.Email != request.AdminEmail && await _context.Users.AnyAsync(u => u.Email == request.AdminEmail))
                {
                    return BadRequest(new { message = "The new login email is already taken by another user." });
                }
                
                adminUser.Email = request.AdminEmail;
                _context.Users.Update(adminUser);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Company updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound(new { message = "Company not found." });

            var adminUsers = _context.Users.Where(u => u.CompanyId == id);
            _context.Users.RemoveRange(adminUsers);

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Company deleted successfully." });
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

    public class UpdateCompanyRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
    }
}