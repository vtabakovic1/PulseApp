using Microsoft.AspNetCore.Mvc;

namespace YourNamespace.Controllers
{
    public class HistoryController : Controller
    {
        public IActionResult Index()
        {
            // Hardkodirani podaci za prikaz
            var patients = new List<Patient>
            {
                new Patient { Id = 1, Name = "John Doe", Age = 30, LastCheckup = "2024-09-01" },
                new Patient { Id = 2, Name = "Jane Smith", Age = 25, LastCheckup = "2024-08-15" },
                new Patient { Id = 3, Name = "Alice Johnson", Age = 40, LastCheckup = "2024-07-20" },
                new Patient { Id = 4, Name = "Bob Brown", Age = 35, LastCheckup = "2024-06-30" }
            };

            return View(patients);
        }
    }

    public class Patient
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Age { get; set; }
        public string LastCheckup { get; set; }
    }
}
