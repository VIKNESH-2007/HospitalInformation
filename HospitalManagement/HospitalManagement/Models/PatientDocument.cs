using System;

namespace HospitalAPI.Models
{
    public class PatientDocument
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        
        public string DocumentType { get; set; } = string.Empty; // Aadhar, PAN, VoterID, Passport, InsuranceCard, ConsentForm
        public string DocumentNumber { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        
        public string FileContent { get; set; } = string.Empty; // Base64 content of scanned ID card
        public DateTime UploadDate { get; set; } = DateTime.Now;
        public string UploadedBy { get; set; } = string.Empty;
        
        public string VerificationStatus { get; set; } = "Pending"; // Pending, Verified, Rejected
        public string VerifiedBy { get; set; } = string.Empty;
        public DateTime? VerificationDate { get; set; }
        public string VerificationNotes { get; set; } = string.Empty;
    }
}
