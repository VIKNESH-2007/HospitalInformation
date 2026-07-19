using System;

namespace HospitalAPI.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        public string PatientName { get; set; } = string.Empty;

        public string DoctorName { get; set; } = string.Empty;

        public string Department { get; set; } = string.Empty;

        public DateTime AppointmentDate { get; set; }

        public string TimeSlot { get; set; } = string.Empty;

        public string Status { get; set; } = "Scheduled"; // AVAILABLE, RESERVED, CONFIRMED, COMPLETED, CANCELLED

        public int DoctorId { get; set; }

        public int PatientId { get; set; }

        public int? ReservedByUserId { get; set; }

        public DateTime? ReservedTimestamp { get; set; }

        public DateTime? LockExpiresAt { get; set; }
    }
}