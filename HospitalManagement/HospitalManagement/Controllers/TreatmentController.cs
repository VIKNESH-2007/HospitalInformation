using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TreatmentsController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public TreatmentsController(HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetTreatments()
        {
            var list = _context.TreatmentSchedules.ToList();
            bool changed = false;

            foreach (var item in list)
            {
                if (item.Status == "Active" && item.ActualStartTime.HasValue)
                {
                    double elapsed = (DateTime.Now - item.ActualStartTime.Value).TotalMinutes;
                    if (elapsed > item.ExpectedDuration)
                    {
                        item.Status = "Delayed";
                        changed = true;
                    }
                }
            }

            if (changed)
            {
                _context.SaveChanges();
            }

            return Ok(list);
        }

        [HttpPost]
        public IActionResult CreateTreatment(TreatmentSchedule treatment)
        {
            _context.TreatmentSchedules.Add(treatment);
            _context.SaveChanges();
            return Ok(treatment);
        }

        [HttpPost("{id}/start")]
        public IActionResult StartTreatment(int id)
        {
            var item = _context.TreatmentSchedules.Find(id);
            if (item == null) return NotFound();

            item.ActualStartTime = DateTime.Now;
            item.Status = "Active";

            _context.SaveChanges();
            return Ok(item);
        }

        [HttpPost("{id}/complete")]
        public IActionResult CompleteTreatment(int id)
        {
            var item = _context.TreatmentSchedules.Find(id);
            if (item == null) return NotFound();

            item.ActualCompletionTime = DateTime.Now;
            item.Status = "Completed";

            _context.SaveChanges();
            return Ok(item);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateTreatment(int id, TreatmentSchedule updated)
        {
            var existing = _context.TreatmentSchedules.Find(id);
            if (existing == null) return NotFound();

            existing.PatientName = updated.PatientName;
            existing.TreatmentType = updated.TreatmentType;
            existing.ExpectedDuration = updated.ExpectedDuration;
            existing.AssignedDoctor = updated.AssignedDoctor;
            existing.Status = updated.Status;
            existing.DelayReason = updated.DelayReason;

            _context.SaveChanges();
            return Ok(existing);
        }
    }
}
