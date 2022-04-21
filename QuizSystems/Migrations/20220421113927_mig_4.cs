using Microsoft.EntityFrameworkCore.Migrations;

namespace QuizSystems.Migrations
{
    public partial class mig_4 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WebData_OnlineExams_OnlineExamQuizId",
                table: "WebData");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WebData",
                table: "WebData");

            migrationBuilder.RenameTable(
                name: "WebData",
                newName: "WebDatas");

            migrationBuilder.RenameIndex(
                name: "IX_WebData_OnlineExamQuizId",
                table: "WebDatas",
                newName: "IX_WebDatas_OnlineExamQuizId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WebDatas",
                table: "WebDatas",
                column: "WebDataId");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserMail = table.Column<string>(type: "TEXT", nullable: true),
                    UserPassword = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_WebDatas_OnlineExams_OnlineExamQuizId",
                table: "WebDatas",
                column: "OnlineExamQuizId",
                principalTable: "OnlineExams",
                principalColumn: "QuizId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WebDatas_OnlineExams_OnlineExamQuizId",
                table: "WebDatas");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WebDatas",
                table: "WebDatas");

            migrationBuilder.RenameTable(
                name: "WebDatas",
                newName: "WebData");

            migrationBuilder.RenameIndex(
                name: "IX_WebDatas_OnlineExamQuizId",
                table: "WebData",
                newName: "IX_WebData_OnlineExamQuizId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WebData",
                table: "WebData",
                column: "WebDataId");

            migrationBuilder.AddForeignKey(
                name: "FK_WebData_OnlineExams_OnlineExamQuizId",
                table: "WebData",
                column: "OnlineExamQuizId",
                principalTable: "OnlineExams",
                principalColumn: "QuizId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
