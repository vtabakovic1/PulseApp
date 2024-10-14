using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PulseApp.Controllers
{
    public class HomeController : Controller
    {
        private static readonly HttpClient client = new HttpClient();
        private const string esp8266Url = "http://192.168.0.39/pulse";

        // Metoda za prikaz početne stranice
        public async Task<IActionResult> Index()
        {
            try
            {
                var response = await client.GetStringAsync(esp8266Url);
                ViewData["PulseData"] = response;
            }
            catch (HttpRequestException e)
            {
                ViewData["PulseData"] = $"Error: {e.Message}";
            }
            return View();
        }

        // Metoda za dohvaćanje podataka o pulsu
        public async Task<IActionResult> GetPulseData()
        {
            try
            {
                var response = await client.GetStringAsync(esp8266Url);

                
                var bpmPattern = @"BPM:\s*(\d+(\.\d+)?)";
                var match = Regex.Match(response, bpmPattern);

                if (match.Success)
                {
                    var bpmValue = match.Groups[1].Value;
                    var bpmDouble = Convert.ToDouble(bpmValue);

                    
                    return Json(new { bpm = bpmDouble });
                }
                else
                {
                    return Json(new { error = "Unexpected response format." });
                }
            }
            catch (HttpRequestException e)
            {
                return Json(new { error = e.Message });
            }
            catch (FormatException e)
            {
                return Json(new { error = $"Data format is incorrect: {e.Message}" });
            }
            catch (Exception e)
            {
                return Json(new { error = $"An unexpected error occurred: {e.Message}" });
            }
        }

       
        public IActionResult Graph()
        {
            return View();
        }

       
        public IActionResult GetPulseDataForChart()
        {
            var chartData = new
            {
                labels = new[] { "10:00", "10:05", "10:10", "10:15", "10:20" },
                datasets = new[]
                {
                    new
                    {
                        label = "Heart Rate (BPM)",
                        data = new[] { 72, 80, 85, 90, 78 },
                        borderColor = "rgba(75, 192, 192, 1)",
                        borderWidth = 2,
                        fill = false
                    }
                }
            };

            return Json(chartData);
        }
    }
}
