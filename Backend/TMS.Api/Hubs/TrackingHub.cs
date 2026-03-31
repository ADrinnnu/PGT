using Microsoft.AspNetCore.SignalR;

namespace TMS.Api.Hubs
{
    public class TrackingHub : Hub
    {
        // 1. ADMIN DASHBOARD: Join a global group to watch ALL vehicles
        public async Task JoinAdminDashboard()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "AdminDashboard");
            // Optional: You could fetch current locations from DB and send them immediately here
        }

        public async Task LeaveAdminDashboard()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AdminDashboard");
        }

        // 2. COMMUTERS: Join a specific room to watch ONE specific vehicle (Just like Python's room=trip_id)
        public async Task SubscribeToVehicle(string vehicleId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Vehicle_{vehicleId}");
        }

        public async Task UnsubscribeFromVehicle(string vehicleId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Vehicle_{vehicleId}");
        }

        // 3. BROADCAST: The bus app/device calls this to send its GPS coordinates
        public async Task BroadcastLocation(string vehicleId, double lat, double lng, double speed, string status)
        {
            // Package the data nicely for the React frontend
            var locationData = new 
            { 
                VehicleId = vehicleId, 
                Latitude = lat, 
                Longitude = lng, 
                Speed = speed,
                Status = status,
                Timestamp = DateTime.UtcNow 
            };

            // Blast it to commuters watching this specific bus
            await Clients.Group($"Vehicle_{vehicleId}").SendAsync("ReceiveLocationUpdate", locationData);

            // Blast it to the HR/Admin Dashboard watching the Live Map
            await Clients.Group("AdminDashboard").SendAsync("ReceiveLocationUpdate", locationData);
        }
    }
}