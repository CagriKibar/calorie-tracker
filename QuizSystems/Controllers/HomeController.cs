using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QuizSystems.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace QuizSystems.Controllers
{
    public class HomeController : Controller
    {
        QuizContext _context;



        public IActionResult Index()
        {
           
            return View();
        }

    }
}
