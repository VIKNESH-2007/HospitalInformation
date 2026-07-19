using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResourcesController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public ResourcesController(HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet("roster")]
        public IActionResult GetRosters()
        {
            var list = _context.DutyRosters.ToList();
            bool changed = false;

            foreach (var item in list)
            {
                // If roster has no check-in, check for late tardiness dynamically
                if (item.CheckInTime == null && DateTime.Now > item.ShiftStart)
                {
                    double lateMinutes = (DateTime.Now - item.ShiftStart).TotalMinutes;
                    if (lateMinutes > 15 && !item.IsLate)
                    {
                        item.IsLate = true;
                        item.TardinessMinutes = (int)lateMinutes;
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

        [HttpGet("inventory")]
        public IActionResult GetInventory()
        {
            return Ok(_context.ResourceInventories.ToList());
        }

        [HttpPut("inventory/{id}")]
        public IActionResult UpdateInventoryStock(int id, [FromBody] int newStock)
        {
            var item = _context.ResourceInventories.Find(id);
            if (item == null) return NotFound();

            item.CurrentStock = newStock;
            _context.SaveChanges();
            return Ok(item);
        }

        [HttpGet("maintenance")]
        public IActionResult GetMaintenance()
        {
            var list = _context.EquipmentMaintenances.ToList();
            bool changed = false;

            foreach (var item in list)
            {
                // Update maintenance warnings dynamically
                var daysRemaining = (item.NextServiceDueDate - DateTime.Today).TotalDays;
                if (daysRemaining < 0 && item.Status != "Overdue")
                {
                    item.Status = "Overdue";
                    changed = true;
                }
                else if (daysRemaining >= 0 && daysRemaining <= 7 && item.Status != "Due Soon")
                {
                    item.Status = "Due Soon";
                    changed = true;
                }
            }

            if (changed)
            {
                _context.SaveChanges();
            }

            return Ok(list);
        }
    }
}
