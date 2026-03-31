using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using MQTTnet; // <-- Version 5 handles everything here now!
using TMS.Api.Hubs;
using System.Buffers;

namespace TMS.Api.Services
{
    public class MqttIngestService : BackgroundService
    {
        private readonly IMqttClient _mqttClient;
        private readonly MqttClientOptions _mqttOptions;
        private readonly IHubContext<TrackingHub> _hubContext;
        private readonly ILogger<MqttIngestService> _logger;

        public MqttIngestService(IHubContext<TrackingHub> hubContext, ILogger<MqttIngestService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;

            // 1. Setup the MQTT Factory and Client (Updated for v5)
            var factory = new MqttClientFactory();
            _mqttClient = factory.CreateMqttClient();

            // 2. Exact same HiveMQ credentials from your Python config
            _mqttOptions = factory.CreateClientOptionsBuilder()
                .WithClientId($"pgt-ingest-{Guid.NewGuid().ToString()[..5]}")
                .WithTcpServer("35010b9ea10d41c0be8ac5e9a700a957.s1.eu.hivemq.cloud", 8883)
                .WithCredentials("vanrodolf", "Vanrodolf123.")
                .WithTlsOptions(o => { }) // Enable TLS for HiveMQ (Updated for v5)
                .WithCleanStart() // Updated for v5
                .Build();

            // 3. Attach the message handler
            _mqttClient.ApplicationMessageReceivedAsync += HandleIncomingMessage;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting MQTT Ingest Service...");

            // Connect to HiveMQ
            await _mqttClient.ConnectAsync(_mqttOptions, stoppingToken);

            // Subscribe to the topics (Updated for v5)
            var factory = new MqttClientFactory();
            var subscribeOptions = factory.CreateSubscribeOptionsBuilder()
                .WithTopicFilter("device/+/location")
                .WithTopicFilter("device/+/people")
                .Build();

            await _mqttClient.SubscribeAsync(subscribeOptions, stoppingToken);
            _logger.LogInformation("Successfully subscribed to MQTT topics.");

            // Keep the service running
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }

            // Clean disconnect when the app shuts down
            var disconnectOptions = factory.CreateClientDisconnectOptionsBuilder().Build();
            await _mqttClient.DisconnectAsync(disconnectOptions, stoppingToken);
        }

        private async Task HandleIncomingMessage(MqttApplicationMessageReceivedEventArgs e)
        {
            var topic = e.ApplicationMessage.Topic;
var payloadString = Encoding.UTF8.GetString(e.ApplicationMessage.Payload.ToArray());
            _logger.LogInformation($"Received MQTT: {topic} => {payloadString}");

            try
            {
                // Extract the device ID from the topic (e.g., "device/bus-001/location")
                var topicParts = topic.Split('/');
                if (topicParts.Length < 3) return;
                var deviceId = topicParts[1];

                // Parse the JSON payload
                var payload = JsonSerializer.Deserialize<JsonElement>(payloadString);

                // If it's a location update, broadcast it immediately to the React frontend!
                if (topic.EndsWith("/location"))
                {
                    double lat = payload.GetProperty("lat").GetDouble();
                    double lng = payload.GetProperty("lng").GetDouble();
                    
                    var locationData = new 
                    { 
                        VehicleId = deviceId, 
                        Latitude = lat, 
                        Longitude = lng,
                        Timestamp = DateTime.UtcNow
                    };

                    // Broadcast to specific bus room AND Admin Dashboard
                    await _hubContext.Clients.Group($"Vehicle_{deviceId}").SendAsync("ReceiveLocationUpdate", locationData);
                    await _hubContext.Clients.Group("AdminDashboard").SendAsync("ReceiveLocationUpdate", locationData);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to process MQTT message: {ex.Message}");
            }
        }
    }
}