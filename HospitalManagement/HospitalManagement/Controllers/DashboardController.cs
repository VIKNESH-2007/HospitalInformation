using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public DashboardController(HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetStats()
        {
            var stats = new DashboardStats
            {
                TotalPatients = _context.Patients.Count(),
                TotalDoctors = _context.Doctors.Count(),
                TotalAppointments = _context.Appointments.Count(),
                TotalRevenue = _context.Billings.Any() ? _context.Billings.Sum(b => b.TotalAmount) : 0,
                TotalMedicines = _context.Medicines.Any() ? _context.Medicines.Sum(m => m.Quantity) : 0,
                TotalReports = _context.Reports.Count(),
                TotalStaff = _context.Staff.Count(),
                TodayAppointments = _context.Appointments.AsEnumerable().Count(a => a.AppointmentDate.Date == DateTime.Today)
            };

            return Ok(stats);
        }
    }
}
