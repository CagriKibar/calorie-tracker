using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using QuizSystems.Models;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace QuizSystems.Controllers
{
    public class LoginController : Controller
    {


        QuizContext _context;

        public LoginController(QuizContext quizContext)
        {
            _context = quizContext;
        }



        [HttpPost]
        public async Task<IActionResult> Index(User user)
        {

            QuizContext context = new QuizContext();
            var value = context.Users.FirstOrDefault(x => x.UserMail == user.UserMail && x.UserPassword == user.UserPassword);
            if (value != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Email,user.UserMail),
                };
                var userIdentity = new ClaimsIdentity(claims, "Login");
                ClaimsPrincipal principal = new ClaimsPrincipal(userIdentity);
                await HttpContext.SignInAsync(principal);
                return RedirectToAction("Index", "Exam");
            }
            else
            {
                return View();
            }

        }
    }
}
