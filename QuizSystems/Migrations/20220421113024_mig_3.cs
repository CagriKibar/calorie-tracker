using Microsoft.EntityFrameworkCore.Migrations;

namespace QuizSystems.Migrations
{
    public partial class mig_3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WebDataId",
                table: "OnlineExams",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "WebData",
                columns: table => new
                {
                    WebDataId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WebDataHead = table.Column<string>(type: "TEXT", nullable: true),
                    WebDataContent = table.Column<string>(type: "TEXT", nullable: true),
                    QuizId = table.Column<int>(type: "INTEGER", nullable: false),
                    OnlineExamQuizId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebData", x => x.WebDataId);
                    table.ForeignKey(
                        name: "FK_WebData_OnlineExams_OnlineExamQuizId",
                        column: x => x.OnlineExamQuizId,
                        principalTable: "OnlineExams",
                        principalColumn: "QuizId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WebData_OnlineExamQuizId",
                table: "WebData",
                column: "OnlineExamQuizId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WebData");

            migrationBuilder.DropColumn(
                name: "WebDataId",
                table: "OnlineExams");
        }
    }
}
