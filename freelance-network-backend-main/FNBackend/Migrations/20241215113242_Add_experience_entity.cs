using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FNBackend.Migrations
{
    public partial class Add_experience_entity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Experience",
                table: "ProfileInfos");

            migrationBuilder.AddColumn<Guid>(
                name: "ExperienceId",
                table: "ProfileInfos",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Experiences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Experiences", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProfileInfos_ExperienceId",
                table: "ProfileInfos",
                column: "ExperienceId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProfileInfos_Experiences_ExperienceId",
                table: "ProfileInfos",
                column: "ExperienceId",
                principalTable: "Experiences",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProfileInfos_Experiences_ExperienceId",
                table: "ProfileInfos");

            migrationBuilder.DropTable(
                name: "Experiences");

            migrationBuilder.DropIndex(
                name: "IX_ProfileInfos_ExperienceId",
                table: "ProfileInfos");

            migrationBuilder.DropColumn(
                name: "ExperienceId",
                table: "ProfileInfos");

            migrationBuilder.AddColumn<int>(
                name: "Experience",
                table: "ProfileInfos",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
