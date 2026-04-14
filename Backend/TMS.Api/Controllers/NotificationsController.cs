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
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            var query = _context.Notifications.AsQueryable();

            if (role != "HeadAdmin" && int.TryParse(companyIdString, out int companyId))
            {
                // Show global notifications (CompanyId == null) and company-specific ones
                query = query.Where(n => n.CompanyId == companyId || n.CompanyId == null);
            }

            // Get the 20 most recent notifications
            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpPut("mark-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? User.FindFirst("Role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value ?? User.FindFirst("CompanyId")?.Value;

            var query = _context.Notifications.Where(n => !n.IsRead).AsQueryable();

            if (role != "HeadAdmin" && int.TryParse(companyIdString, out int companyId))
            {
                query = query.Where(n => n.CompanyId == companyId || n.CompanyId == null);
            }

            var unreadNotifications = await query.ToListAsync();

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
            }

            if (unreadNotifications.Any())
            {
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Notifications marked as read." });
        }
    }
}
