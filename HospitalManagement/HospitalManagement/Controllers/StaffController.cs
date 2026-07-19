using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using HospitalAPI.Filters;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public StaffController(
            HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetStaff()
        {
            return Ok(_context.Staff.ToList());
        }

        [HttpGet("{id}")]
        public IActionResult GetStaffMember(int id)
        {
            var staff =
                _context.Staff.Find(id);

            if (staff == null)
                return NotFound();

            return Ok(staff);
        }

        [HttpPost]
        public IActionResult AddStaff(
            Staff staff)
        {
            _context.Staff.Add(staff);

            _context.SaveChanges();

            return Ok(staff);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateStaff(
            int id,
            Staff staff)
        {
            var existing =
                _context.Staff.Find(id);

            if (existing == null)
                return NotFound();

            existing.Name = staff.Name;
            existing.Role = staff.Role;
            existing.Department = staff.Department;
            existing.Phone = staff.Phone;
            existing.Email = staff.Email;
            existing.Shift = staff.Shift;
            existing.Salary = staff.Salary;

            _context.SaveChanges();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteStaff(
            int id)
        {
            var staff =
                _context.Staff.Find(id);

            if (staff == null)
                return NotFound();

            _context.Staff.Remove(staff);

            _context.SaveChanges();

            return Ok(
                "Staff Member Deleted Successfully"
            );
        }
    }
}