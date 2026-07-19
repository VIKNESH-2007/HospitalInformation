using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using HospitalAPI.Filters;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public SettingsController(
            HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetSettings()
        {
            var settings =
                _context.SystemSettings
                .FirstOrDefault();

            return Ok(settings);
        }

        [HttpPost]
        public IActionResult SaveSettings(
            SystemSettings settings)
        {
            var existing =
                _context.SystemSettings
                .FirstOrDefault();

            if (existing == null)
            {
                _context.SystemSettings.Add(
                    settings
                );
            }
            else
            {
                existing.HospitalName =
                    settings.HospitalName;

                existing.Address =
                    settings.Address;

                existing.ContactNumber =
                    settings.ContactNumber;

                existing.Email =
                    settings.Email;

                existing.ThemeColor =
                    settings.ThemeColor;

                existing.DarkMode =
                    settings.DarkMode;

                existing.Notifications =
                    settings.Notifications;

                existing.AutoBackup =
                    settings.AutoBackup;
            }

            _context.SaveChanges();

            return Ok(
                "Settings Saved Successfully"
            );
        }
    }
}