using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TMS.Infrastructure.Data;
using TMS.Infrastructure.Services;
using TMS.Api.Hubs; 
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Setup
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

// 2. Services & Hubs
builder.Services.AddSignalR(); // <-- Kept only one of these!
builder.Services.AddHostedService<TMS.Api.Services.MqttIngestService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
    
builder.Services.AddScoped<TokenService>();

// 3. FIXED CORS POLICY FOR SIGNALR
// 3. FIXED CORS POLICY FOR SIGNALR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        // ADD 5174 TO THIS LIST!
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000") 
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); 
    });
});

// 4. JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "fallback_key_at_least_32_characters_long"))
        };
    });

var app = builder.Build();

// 5. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use the fixed CORS policy
app.UseCors("AllowReactApp"); 

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TrackingHub>("/trackingHub"); // <-- Kept only one of these!

// 6. Database Migrations & Seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    
    context.Database.Migrate();

    if (!context.Users.Any())
    {
        context.Users.Add(new TMS.Domain.Entities.User
        {
            Name = "System Admin",
            Email = "admin@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "HeadAdmin",
            Bio = "Initial System Administrator",
            Status = "Active",
            CompanyId = 0,
            CreatedDate = DateTime.UtcNow
        });
        context.SaveChanges();
    }
}

app.Run();