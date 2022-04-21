using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace QuizSystems.Models
{
    public class QuizContext:DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite(@"Data Source=D:\Users\cagri\Desktop\Quiz\QuizSystems\QuizSystems\ExamProject.db");
        }
        public DbSet<OnlineExam> OnlineExams { get; set; }
        public DbSet<WebData> WebDatas { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
