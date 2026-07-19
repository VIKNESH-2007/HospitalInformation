using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using Microsoft.AspNetCore.Authorization;
using HospitalAPI.Filters;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PharmacyController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public PharmacyController(
            HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetMedicines()
        {
            return Ok(_context.Medicines.ToList());
        }

        [HttpGet("{id}")]
        public IActionResult GetMedicine(int id)
        {
            var medicine =
                _context.Medicines.Find(id);

            if (medicine == null)
                return NotFound();

            return Ok(medicine);
        }

        [HttpPost]
        public IActionResult AddMedicine(
            Medicine medicine)
        {
            _context.Medicines.Add(medicine);
            _context.SaveChanges();

            return Ok(medicine);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateMedicine(
            int id,
            Medicine medicine)
        {
            var existing =
                _context.Medicines.Find(id);

            if (existing == null)
                return NotFound();

            existing.MedicineName =
                medicine.MedicineName;

            existing.Category =
                medicine.Category;

            existing.Quantity =
                medicine.Quantity;

            existing.Price =
                medicine.Price;

            existing.ExpiryDate =
                medicine.ExpiryDate;

            existing.Manufacturer =
                medicine.Manufacturer;

            _context.SaveChanges();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteMedicine(
            int id)
        {
            var medicine =
                _context.Medicines.Find(id);

            if (medicine == null)
                return NotFound();

            _context.Medicines.Remove(
                medicine);

            _context.SaveChanges();

            return Ok(
                "Medicine Deleted Successfully"
            );
        }
    }
}