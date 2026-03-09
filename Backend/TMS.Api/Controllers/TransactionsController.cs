using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using System.Threading.Tasks;

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
            var wallets = await _context.CommuterWallets.ToListAsync();
            return Ok(wallets);
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetTransactionLogs()
        {
            var logs = await _context.Transactions.OrderByDescending(t => t.Timestamp).ToListAsync();
            return Ok(logs);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var today = System.DateTime.UtcNow.Date;
            
            var todaysRevenue = await _context.Transactions
                .Where(t => t.Timestamp >= today && t.Status == "Success")
                .SumAsync(t => t.Amount);

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