using Microsoft.AspNetCore.Mvc;

namespace QuizSystems.Controllers
{
    public class UserController : Controller
    {

        public IActionResult Index()
        {
            return View();
        }
    }
}
