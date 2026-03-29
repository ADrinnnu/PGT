# Base image for running the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["TMS.Api/TMS.Api.csproj", "TMS.Api/"]
COPY ["TMS.Domain/TMS.Domain.csproj", "TMS.Domain/"]
COPY ["TMS.Infrastructure/TMS.Infrastructure.csproj", "TMS.Infrastructure/"]
COPY ["TMS.Application/TMS.Application.csproj", "TMS.Application/"]

# Restore dependencies
RUN dotnet restore "TMS.Api/TMS.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/TMS.Api"
RUN dotnet build "TMS.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "TMS.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TMS.Api.dll"]