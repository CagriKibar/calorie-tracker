using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
namespace QuizSystems.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string UserMail { get; set; }
        public string UserPassword { get; set; }

       
    }
}
