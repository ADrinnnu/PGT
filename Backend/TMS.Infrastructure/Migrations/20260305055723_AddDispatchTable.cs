using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDispatchTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RouteId",
                table: "Dispatches");

            migrationBuilder.AddColumn<string>(
                name: "RouteName",
                table: "Dispatches",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RouteName",
                table: "Dispatches");

            migrationBuilder.AddColumn<int>(
                name: "RouteId",
                table: "Dispatches",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
