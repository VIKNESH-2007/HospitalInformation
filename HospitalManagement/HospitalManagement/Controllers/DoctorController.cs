using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using Microsoft.AspNetCore.Authorization;
using HospitalAPI.Filters;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public DoctorsController(
            HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetDoctors()
        {
            return Ok(_context.Doctors.ToList());
        }

        [HttpGet("{id}")]
        public IActionResult GetDoctor(int id)
        {
            var doctor =
                _context.Doctors.Find(id);

            if (doctor == null)
                return NotFound();

            return Ok(doctor);
        }

        [HttpPost]
        public IActionResult AddDoctor(
            Doctor doctor)
        {
            _context.Doctors.Add(doctor);
            _context.SaveChanges();

            return Ok(doctor);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateDoctor(
            int id,
            Doctor doctor)
        {
            var existing =
                _context.Doctors.Find(id);

            if (existing == null)
                return NotFound();

            existing.Name = doctor.Name;
            existing.Department = doctor.Department;
            existing.Experience = doctor.Experience;
            existing.Phone = doctor.Phone;
            existing.Email = doctor.Email;
            existing.Qualification = doctor.Qualification;
            existing.Availability = doctor.Availability;

            _context.SaveChanges();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteDoctor(
            int id)
        {
            var doctor =
                _context.Doctors.Find(id);

            if (doctor == null)
                return NotFound();

            _context.Doctors.Remove(doctor);

            _context.SaveChanges();

            return Ok(
                "Doctor deleted successfully"
            );
        }
    }
}