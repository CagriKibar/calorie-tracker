using Microsoft.EntityFrameworkCore.Migrations;

namespace QuizSystems.Migrations
{
    public partial class mig_2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OnlineExams",
                columns: table => new
                {
                    QuizId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Question = table.Column<string>(type: "TEXT", nullable: true),
                    Options1 = table.Column<string>(type: "TEXT", nullable: true),
                    Options2 = table.Column<string>(type: "TEXT", nullable: true),
                    Options3 = table.Column<string>(type: "TEXT", nullable: true),
                    Options4 = table.Column<string>(type: "TEXT", nullable: true),
                    Correctans = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnlineExams", x => x.QuizId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OnlineExams");
        }
    }
}
