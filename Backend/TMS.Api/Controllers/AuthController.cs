using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Infrastructure.Services;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(ApplicationDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            bool isPasswordValid = false;
            try
            {
                isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            catch 
            {
                isPasswordValid = (request.Password == user.PasswordHash);
            }

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = _tokenService.CreateToken(user);

            return Ok(new
            {
                token,
                name = user.Name,
                role = user.Role,
                companyId = user.CompanyId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error: " + ex.Message });
        }
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
        var nameClaim = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst("name")?.Value ?? User.FindFirst("unique_name")?.Value;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim || u.Name == nameClaim);

        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(new
        {
            name = user.Name,
            email = user.Email,
            role = user.Role,
            companyId = user.CompanyId
        });
    }

    [HttpPut("update-profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
        var nameClaim = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst("name")?.Value ?? User.FindFirst("unique_name")?.Value;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim || u.Name == nameClaim);

        if (user == null) return NotFound(new { message = "Database Error: User identity not found." });

        if (request.Email != user.Email && await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { message = "Email is already in use by another account." });
        }

        user.Name = request.Name;
        user.Email = request.Email;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        var newToken = _tokenService.CreateToken(user);

        return Ok(new { message = "Profile updated successfully.", token = newToken });
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Current password and new password are required." });
        }

        if (request.NewPassword.Length < 8)
        {
            return BadRequest(new { message = "New password must be at least 8 characters long." });
        }

        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
        var nameClaim = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst("name")?.Value ?? User.FindFirst("unique_name")?.Value;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim || u.Name == nameClaim);

        if (user == null) return NotFound(new { message = "User not found." });

        bool isCurrentPasswordValid = false;
        try
        {
            isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
        }
        catch
        {
            isCurrentPasswordValid = (request.CurrentPassword == user.PasswordHash);
        }

        if (!isCurrentPasswordValid)
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}