using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using HospitalAPI.Filters;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public ReportsController(
            HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetReports()
        {
            return Ok(_context.Reports.ToList());
        }

        [HttpGet("{id}")]
        public IActionResult GetReport(int id)
        {
            var report = _context.Reports.Find(id);

            if (report == null)
                return NotFound();

            return Ok(report);
        }

        [HttpPost]
        public IActionResult CreateReport(
            Report report)
        {
            report.GeneratedDate = DateTime.Now;

            _context.Reports.Add(report);

            _context.SaveChanges();

            return Ok(report);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateReport(
            int id,
            Report report)
        {
            var existing =
                _context.Reports.Find(id);

            if (existing == null)
                return NotFound();

            existing.ReportType =
                report.ReportType;

            existing.ReportName =
                report.ReportName;

            existing.GeneratedBy =
                report.GeneratedBy;

            existing.Description =
                report.Description;

            existing.Status =
                report.Status;

            _context.SaveChanges();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteReport(int id)
        {
            var report =
                _context.Reports.Find(id);

            if (report == null)
                return NotFound();

            _context.Reports.Remove(report);

            _context.SaveChanges();

            return Ok(
                "Report Deleted Successfully"
            );
        }
    }
}