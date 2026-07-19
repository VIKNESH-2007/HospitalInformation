using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionsController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public PrescriptionsController(HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetPrescriptions()
        {
            return Ok(_context.Prescriptions.ToList());
        }

        [HttpGet("patient/{patientName}")]
        public IActionResult GetPatientPrescriptions(string patientName)
        {
            var list = _context.Prescriptions
                .Where(p => p.PatientName.ToLower() == patientName.ToLower() && p.Status == "Active")
                .ToList();
            return Ok(list);
        }

        [HttpPost]
        public IActionResult CreatePrescription(Prescription prescription)
        {
            _context.Prescriptions.Add(prescription);
            _context.SaveChanges();
            return Ok(prescription);
        }
    }
}
