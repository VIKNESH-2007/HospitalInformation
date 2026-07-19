using System;

namespace HospitalAPI.Models
{
    public class Billing
    {
        public int Id { get; set; }

        public string PatientName { get; set; } = string.Empty;

        public string DoctorName { get; set; } = string.Empty;

        public decimal ConsultationFee { get; set; }

        public decimal MedicineFee { get; set; }

        public decimal LabFee { get; set; }

        public decimal RoomCharge { get; set; }

        public decimal TotalAmount { get; set; }

        public string PaymentMethod { get; set; } = "Cash";

        public string PaymentStatus { get; set; } = "Paid"; // Paid, Pending

        public DateTime BillingDate { get; set; } = DateTime.Now;

        // Prescription Pharmacy Reconciliation Fields
        public string MedicineName { get; set; } = string.Empty;

        public int MedicineQuantity { get; set; }

        public int? PrescriptionId { get; set; }

        public bool IsOverridden { get; set; }

        public string OverrideReason { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending"; // Draft, Pending, Paid
    }
}