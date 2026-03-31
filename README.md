## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
* **[.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)** (Required for the C# Backend)
* **[Node.js](https://nodejs.org/)** (v18 or higher, required for the React Frontend)
* **[XAMPP](https://www.apachefriends.org/index.html)** or any local MySQL Server (For the database)
* **Git**

### Install Entity Framework Tools
You will need the EF Core CLI tools to manage the database. Open your terminal and run:
```bash
dotnet tool install --global dotnet-ef
🗄️ 1. Database Setup (MySQL)
Open XAMPP and Start the MySQL module.

Open the Backend configuration file located at Backend/TMS.Api/appsettings.json.

Verify your connection string matches your local MySQL setup (Default XAMPP uses root with no password):

JSON
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=tms_db;User=root;Password=;"
}
(Note: You do not need to create the database manually in phpMyAdmin; Entity Framework will create it for you).

⚙️ 2. Backend Setup (.NET 8 API)
The backend is split into multiple projects (Clean Architecture). All terminal commands must point to the correct startup and infrastructure projects.

1. Navigate to the Backend folder

Bash
cd Backend
2. Restore NuGet Packages

Bash
dotnet restore
3. Apply Database Migrations
This command will build the MySQL database and create all the necessary tables (Employees, Vehicles, Dispatches, etc.):

Bash
dotnet ef database update --project TMS.Infrastructure --startup-project TMS.Api
4. Run the API
Navigate into the API project and start the server:

Bash
cd TMS.Api
dotnet run
The API will start running (usually on http://localhost:5072 or https://localhost:7053).

Backend Background Services
SignalR: Runs on /trackingHub for real-time map updates.

MQTTnet: Runs a background service (MqttIngestService) that connects to HiveMQ Cloud to listen for live GPS coordinates from physical bus trackers.

🖥️ 3. Frontend Setup (React + Vite)
Open a new, separate terminal so your backend can keep running in the background.

1. Navigate to the Frontend folder

Bash
cd Frontend
2. Install Dependencies

Bash
npm install
3. Environment Variables
Create a file named .env in the Frontend folder (if it doesn't exist) and link it to your C# API:

Code snippet
VITE_API_URL=http://localhost:5072
(Make sure the port matches the one shown in your C# terminal).

4. Run the React App

Bash
npm run dev
Open your browser to http://localhost:5173 to view the application!

🔑 Default Login Credentials
When the database is first created, it automatically seeds a Head Admin account.

Email: admin@test.com

Password: admin123

📡 Hardware & IoT Integration
Physical GPS trackers send data to this system using MQTT.

Broker: HiveMQ Cloud

Topics: device/+/location and device/+/people

The payload must be formatted as JSON: {"lat": 15.4828, "lng": 120.5983, "speed": 45}.

The backend (MqttIngestService.cs) automatically parses this data and forwards it to the React map via SignalR.