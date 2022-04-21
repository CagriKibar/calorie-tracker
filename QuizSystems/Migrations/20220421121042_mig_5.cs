using Microsoft.EntityFrameworkCore.Migrations;

namespace QuizSystems.Migrations
{
    public partial class mig_5 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WebContent",
                table: "OnlineExams",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WebHead",
                table: "OnlineExams",
                type: "TEXT",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WebContent",
                table: "OnlineExams");

            migrationBuilder.DropColumn(
                name: "WebHead",
                table: "OnlineExams");
        }
    }
}
