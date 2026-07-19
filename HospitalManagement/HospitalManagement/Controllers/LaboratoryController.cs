using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using Microsoft.AspNetCore.Authorization;
using HospitalAPI.Filters;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LaboratoryController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public LaboratoryController(
            HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetReports()
        {
            return Ok(
                _context.LaboratoryReports.ToList()
            );
        }

        [HttpGet("{id}")]
        public IActionResult GetReport(int id)
        {
            var report =
                _context.LaboratoryReports.Find(id);

            if (report == null)
                return NotFound();

            return Ok(report);
        }

        [HttpPost]
        public IActionResult AddReport(
            LaboratoryReport report)
        {
            report.TestDate = DateTime.Now;

            _context.LaboratoryReports.Add(report);

            _context.SaveChanges();

            return Ok(report);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateReport(
            int id,
            LaboratoryReport report)
        {
            var existing =
                _context.LaboratoryReports.Find(id);

            if (existing == null)
                return NotFound();

            existing.PatientName =
                report.PatientName;

            existing.DoctorName =
                report.DoctorName;

            existing.TestName =
                report.TestName;

            existing.TestResult =
                report.TestResult;

            existing.Status =
                report.Status;

            existing.TestDate =
                report.TestDate;

            _context.SaveChanges();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteReport(int id)
        {
            var report =
                _context.LaboratoryReports.Find(id);

            if (report == null)
                return NotFound();

            _context.LaboratoryReports.Remove(
                report
            );

            _context.SaveChanges();

            return Ok(
                "Laboratory Report Deleted Successfully"
            );
        }
    }
}