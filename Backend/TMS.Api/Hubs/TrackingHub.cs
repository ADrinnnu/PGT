using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TMS.Api.Hubs
{
    public class TrackingHub : Hub
    {
        public async Task UpdateLocation(string vehicleId, double latitude, double longitude)
        {
            await Clients.All.SendAsync("ReceiveLocationUpdate", vehicleId, latitude, longitude);
        }
    }
}