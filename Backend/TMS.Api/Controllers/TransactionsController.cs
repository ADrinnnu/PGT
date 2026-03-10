using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace TMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransactionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("wallets")]
        public async Task<IActionResult> GetWallets()
        {
            // Wallets are for commuters, so Head Admin usually views this. 
            // If cooperatives need to see them, you'd filter by CompanyId.
            var wallets = await _context.CommuterWallets.ToListAsync();
            return Ok(wallets);
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetTransactionLogs()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value;

            var query = _context.Transactions.AsQueryable();

            if (role != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int companyId))
                {
                    query = query.Where(t => t.CompanyId == companyId);
                }
                else return Unauthorized();
            }

            var logs = await query.OrderByDescending(t => t.Timestamp).ToListAsync();
            return Ok(logs);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;
            var companyIdString = User.FindFirst("companyId")?.Value;
            var today = System.DateTime.UtcNow.Date;
            
            var query = _context.Transactions.Where(t => t.Timestamp >= today && t.Status == "Success");

            if (role != "HeadAdmin")
            {
                if (int.TryParse(companyIdString, out int companyId))
                {
                    query = query.Where(t => t.CompanyId == companyId);
                }
                else return Unauthorized();
            }

            var todaysRevenue = await query.SumAsync(t => t.Amount);

            // These are global commuter stats
            var totalCredits = await _context.CommuterWallets.SumAsync(w => w.Balance);
            var activeCommuters = await _context.CommuterWallets.CountAsync(w => w.Status == "Active");

            return Ok(new
            {
                todaysRevenue,
                totalCredits,
                activeCommuters
            });
        }
    }
}