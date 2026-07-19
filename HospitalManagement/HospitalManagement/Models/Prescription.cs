using System;

namespace HospitalAPI.Models
{
    public class Prescription
    {
        public int Id { get; set; }

        public string PatientName { get; set; } = string.Empty;

        public string MedicationName { get; set; } = string.Empty;

        public int PrescribedQty { get; set; }

        public string Dosage { get; set; } = string.Empty;

        public int Duration { get; set; }

        public string DoctorName { get; set; } = string.Empty;

        public string Status { get; set; } = "Active"; // Active, Dispensed

        public string Signature { get; set; } = "Digitally Signed";
    }
}
