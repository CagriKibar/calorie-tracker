using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;
using QuizSystems.Models;
using System.Linq;
using System.Net;

namespace QuizSystems.Controllers
{
    public class ExamController : Controller
    {
        QuizContext _context;

        public ExamController(QuizContext quizContext)
        {
            _context = quizContext;
        }

        public IActionResult Index()
        {
            var results = _context.OnlineExams.ToList();
            return View(results);
        }



    }
}
