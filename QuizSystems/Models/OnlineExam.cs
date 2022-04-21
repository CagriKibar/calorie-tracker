using System.ComponentModel.DataAnnotations;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
namespace QuizSystems.Models
{
    public class OnlineExam
    {
        [Key]
        public int QuizId { get; set; }
        public string WebHead { get; set; }
        public string WebContent { get; set; }
        public string Question { get; set; }
        public string Options1 { get; set; }
        public string Options2 { get; set; }
        public string Options3 { get; set; }
        public string Options4 { get; set; }

        public string Correctans { get; set; }

        public int WebDataId { get; set; }
        public List<WebData> WebDatas { get; set; }
    }
}
