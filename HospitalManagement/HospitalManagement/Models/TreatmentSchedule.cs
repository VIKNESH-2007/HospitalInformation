using System;

namespace HospitalAPI.Models
{
    public class TreatmentSchedule
    {
        public int Id { get; set; }

        public string PatientName { get; set; } = string.Empty;

        public string TreatmentType { get; set; } = string.Empty; // Consultation, Surgery, Lab, Therapy

        public DateTime ScheduledTime { get; set; } = DateTime.Now;

        public int ExpectedDuration { get; set; } // expected duration in minutes

        public DateTime? ActualStartTime { get; set; }

        public DateTime? ActualCompletionTime { get; set; }

        public string AssignedDoctor { get; set; } = string.Empty;

        public string Status { get; set; } = "Scheduled"; // Scheduled, Active, Completed, Delayed

        public string DelayReason { get; set; } = string.Empty;
    }
}
