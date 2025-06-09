using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FNBackend.Migrations
{
    public partial class added_tags : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "ProfileInfos",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tags",
                table: "ProfileInfos");
        }
    }
}
