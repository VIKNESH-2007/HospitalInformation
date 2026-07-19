using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public AppointmentsController(HospitalDbContext context)
        {
            _context = context;
        }

        private void ReleaseExpiredLocks()
        {
            var expired = _context.Appointments
                .Where(a => a.Status == "RESERVED" && a.LockExpiresAt < DateTime.Now)
                .ToList();
            if (expired.Any())
            {
                _context.Appointments.RemoveRange(expired);
                _context.SaveChanges();
            }
        }

        private double ParseTimeSlot(string timeSlot)
        {
            try
            {
                var parts = timeSlot.Trim().Split(' ');
                var timeParts = parts[0].Split(':');
                double hours = double.Parse(timeParts[0]);
                double minutes = double.Parse(timeParts[1]);
                
                if (parts[1].ToUpper() == "PM" && hours < 12) hours += 12;
                if (parts[1].ToUpper() == "AM" && hours == 12) hours = 0;
                
                return hours + (minutes / 60.0);
            }
            catch
            {
                return 0.0;
            }
        }

        private double ParseAvailabilityTime(string timeStr)
        {
            try
            {
                timeStr = timeStr.Trim().ToUpper();
                bool isPm = timeStr.EndsWith("PM");
                bool isAm = timeStr.EndsWith("AM");
                
                string numbers = timeStr;
                if (isPm) numbers = numbers.Replace("PM", "");
                if (isAm) numbers = numbers.Replace("AM", "");
                
                double hours = 0;
                double minutes = 0;
                
                if (numbers.Contains(":"))
                {
                    var parts = numbers.Split(':');
                    hours = double.Parse(parts[0]);
                    minutes = double.Parse(parts[1]);
                }
                else
                {
                    hours = double.Parse(numbers);
                }
                
                if (isPm && hours < 12) hours += 12;
                if (isAm && hours == 12) hours = 0;
                
                return hours + (minutes / 60.0);
            }
            catch
            {
                return 0.0;
            }
        }

        private bool IsTimeSlotInAvailability(string availability, string timeSlot)
        {
            try
            {
                var parts = availability.Split(' ');
                if (parts.Length < 2) return true;
                
                var timeRange = parts[1].Split('-');
                double start = ParseAvailabilityTime(timeRange[0]);
                double end = ParseAvailabilityTime(timeRange[1]);
                double current = ParseTimeSlot(timeSlot);
                
                return current >= start && current <= end;
            }
            catch
            {
                return true;
            }
        }

        [HttpGet]
        public IActionResult GetAppointments()
        {
            ReleaseExpiredLocks();
            return Ok(_context.Appointments.ToList());
        }

        [HttpGet("{id}")]
        public IActionResult GetAppointment(int id)
        {
            var appointment = _context.Appointments.Find(id);
            if (appointment == null)
                return NotFound();

            return Ok(appointment);
        }

        [HttpPost("reserve")]
        public IActionResult ReserveSlot([FromBody] Appointment reservation)
        {
            ReleaseExpiredLocks();

            // Enforce open/close hours (8:00 AM - 9:00 PM) for reservation requests
            var currentHour = DateTime.Now.Hour;
            if (currentHour < 8 || currentHour >= 21)
            {
                return BadRequest("❌ Booking is closed. Appointments can only be booked online between 8:00 AM and 9:00 PM.");
            }

            // Verify if Doctor exists in system and is available at this time
            string targetDoc = (reservation.DoctorName ?? "").Replace(" ", "").Replace("dr.", "").Replace("dr", "").ToLower();
            var doctor = _context.Doctors.AsEnumerable().FirstOrDefault(d =>
                (d.Name ?? "").Replace(" ", "").Replace("dr.", "").Replace("dr", "").ToLower() == targetDoc
            );

            if (doctor == null)
            {
                return BadRequest("❌ The requested doctor does not exist in our hospital system.");
            }

            // Check availability day
            var day = reservation.AppointmentDate.DayOfWeek;
            bool isDayAvailable = false;
            if (doctor.Availability.Contains("Mon-Fri")) {
                isDayAvailable = (day != DayOfWeek.Saturday && day != DayOfWeek.Sunday);
            } else if (doctor.Availability.Contains("Mon-Thu")) {
                isDayAvailable = (day >= DayOfWeek.Monday && day <= DayOfWeek.Thursday);
            } else if (doctor.Availability.Contains("Tue-Fri")) {
                isDayAvailable = (day >= DayOfWeek.Tuesday && day <= DayOfWeek.Friday);
            } else {
                isDayAvailable = true;
            }

            if (!isDayAvailable)
            {
                return BadRequest($"❌ Doctor is not available on {day}. Regular hours: {doctor.Availability}.");
            }

            // Check availability time slot
            if (!IsTimeSlotInAvailability(doctor.Availability, reservation.TimeSlot))
            {
                return BadRequest($"❌ Doctor is not available at {reservation.TimeSlot}. Regular hours: {doctor.Availability}.");
            }

            // Conflict Check - Normalize doctor name by stripping spaces and "dr." / "dr" prefixes
            var conflict = _context.Appointments.FirstOrDefault(a =>
                a.DoctorName.Replace(" ", "").Replace("dr.", "").Replace("dr", "").ToLower() == targetDoc &&
                a.AppointmentDate.Date == reservation.AppointmentDate.Date &&
                a.TimeSlot == reservation.TimeSlot &&
                (a.Status == "Scheduled" || a.Status == "CONFIRMED" || (a.Status == "RESERVED" && a.LockExpiresAt > DateTime.Now))
            );

            if (conflict != null)
            {
                if (conflict.Status == "RESERVED")
                {
                    return Conflict("⏳ Being Booked... Try Another Slot");
                }
                return Conflict("❌ SLOT ALREADY BOOKED");
            }

            // Same patient cannot book 2 appointments same day check
            var sameDayPatientCheck = _context.Appointments.FirstOrDefault(a =>
                a.PatientName.ToLower() == reservation.PatientName.ToLower() &&
                a.AppointmentDate.Date == reservation.AppointmentDate.Date &&
                (a.Status == "Scheduled" || a.Status == "CONFIRMED" || (a.Status == "RESERVED" && a.LockExpiresAt > DateTime.Now))
            );

            if (sameDayPatientCheck != null)
            {
                return BadRequest("❌ Same patient cannot book 2 appointments on the same day.");
            }

            var appt = new Appointment
            {
                PatientName = reservation.PatientName,
                DoctorName = doctor.Name, // Use canonical name from doctor record!
                Department = doctor.Department, // Use canonical department!
                AppointmentDate = reservation.AppointmentDate,
                TimeSlot = reservation.TimeSlot,
                Status = "RESERVED",
                ReservedByUserId = reservation.ReservedByUserId ?? 1,
                ReservedTimestamp = DateTime.Now,
                LockExpiresAt = DateTime.Now.AddSeconds(30),
                DoctorId = doctor.Id
            };

            _context.Appointments.Add(appt);
            _context.SaveChanges();

            return Ok(appt);
        }

        [HttpPost]
        public IActionResult BookAppointment(Appointment appointment)
        {
            ReleaseExpiredLocks();

            // Enforce booking hours: 8:00 AM to 9:00 PM (8 to 21)
            var currentHour = DateTime.Now.Hour;
            if (currentHour < 8 || currentHour >= 21)
            {
                return BadRequest("❌ Booking is closed! Appointments can only be booked online between 8:00 AM and 9:00 PM.");
            }

            // Verify if Doctor exists in system and is available at this time
            string targetDocDirect = (appointment.DoctorName ?? "").Replace(" ", "").Replace("dr.", "").Replace("dr", "").ToLower();
            var doctor = _context.Doctors.AsEnumerable().FirstOrDefault(d =>
                (d.Name ?? "").Replace(" ", "").Replace("dr.", "").Replace("dr", "").ToLower() == targetDocDirect
            );

            if (doctor == null)
            {
                return BadRequest("❌ The requested doctor does not exist in our hospital system.");
            }

            // Check availability day
            var day = appointment.AppointmentDate.DayOfWeek;
            bool isDayAvailable = false;
            if (doctor.Availability.Contains("Mon-Fri")) {
                isDayAvailable = (day != DayOfWeek.Saturday && day != DayOfWeek.Sunday);
            } else if (doctor.Availability.Contains("Mon-Thu")) {
                isDayAvailable = (day >= DayOfWeek.Monday && day <= DayOfWeek.Thursday);
            } else if (doctor.Availability.Contains("Tue-Fri")) {
                isDayAvailable = (day >= DayOfWeek.Tuesday && day <= DayOfWeek.Friday);
            } else {
                isDayAvailable = true;
            }

            if (!isDayAvailable)
            {
                return BadRequest($"❌ Doctor is not available on {day}. Regular hours: {doctor.Availability}.");
            }

            // Check availability time slot
            if (!IsTimeSlotInAvailability(doctor.Availability, appointment.TimeSlot))
            {
                return BadRequest($"❌ Doctor is not available at {appointment.TimeSlot}. Regular hours: {doctor.Availability}.");
            }

            // If there's an existing reservation for this client/doctor/slot/date, promote it to Scheduled
            var reserved = _context.Appointments.FirstOrDefault(a =>
                a.PatientName.ToLower() == appointment.PatientName.ToLower() &&
                a.DoctorName.Replace(" ", "").Replace("dr.", "").Replace("dr", "").ToLower() == targetDocDirect &&
                a.AppointmentDate.Date == appointment.AppointmentDate.Date &&
                a.TimeSlot == appointment.TimeSlot &&
                a.Status == "RESERVED" &&
                a.LockExpiresAt > DateTime.Now
            );

            if (reserved != null)
            {
                reserved.Status = "Scheduled";
                reserved.ReservedTimestamp = null;
                reserved.LockExpiresAt = null;
                _context.SaveChanges();
                return Ok(reserved);
            }

            // Otherwise check conflict for normal direct bookings
            var conflict = _context.Appointments.FirstOrDefault(a =>
                a.DoctorName.Replace(" ", "").Replace("dr.", "").Replace("dr", "").ToLower() == targetDocDirect &&
                a.AppointmentDate.Date == appointment.AppointmentDate.Date &&
                a.TimeSlot == appointment.TimeSlot &&
                (a.Status == "Scheduled" || a.Status == "CONFIRMED" || (a.Status == "RESERVED" && a.LockExpiresAt > DateTime.Now))
            );

            if (conflict != null)
            {
                return BadRequest("❌ Slot already occupied or being booked.");
            }

            appointment.Status = "Scheduled";
            appointment.DoctorName = doctor.Name; // Use canonical name
            appointment.Department = doctor.Department; // Use canonical department
            appointment.DoctorId = doctor.Id;
            _context.Appointments.Add(appointment);
            _context.SaveChanges();

            return Ok(appointment);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateAppointment(int id, Appointment appointment)
        {
            var existing = _context.Appointments.Find(id);
            if (existing == null)
                return NotFound();

            existing.PatientName = appointment.PatientName;
            existing.DoctorName = appointment.DoctorName;
            existing.Department = appointment.Department;
            existing.AppointmentDate = appointment.AppointmentDate;
            existing.TimeSlot = appointment.TimeSlot;
            existing.Status = appointment.Status;

            _context.SaveChanges();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public IActionResult CancelAppointment(int id)
        {
            var appointment = _context.Appointments.Find(id);
            if (appointment == null)
                return NotFound();

            // Cancellation must be > 24 hours before appointment date/time
            if (appointment.AppointmentDate - DateTime.Now < TimeSpan.FromHours(24))
            {
                return BadRequest("❌ Cancellation must be requested at least 24 hours before the appointment.");
            }

            _context.Appointments.Remove(appointment);
            _context.SaveChanges();

            return Ok("Appointment Cancelled Successfully");
        }
    }
}