using Microsoft.AspNetCore.Mvc;

namespace QuizSystems.Controllers
{
    public class QuizController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
