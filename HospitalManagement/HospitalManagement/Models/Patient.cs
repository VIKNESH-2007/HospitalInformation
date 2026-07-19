using System;

namespace HospitalAPI.Models
{
    public class Patient
    {
        public int Id { get; set; }
        public string HospitalId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty; // Legacy support
        public string NameAlias { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string PhoneSecondary { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string EmailSecondary { get; set; } = string.Empty;
        public DateTime DOB { get; set; } = DateTime.Today;
        public string BloodGroup { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
        public string SpouseName { get; set; } = string.Empty;
        public string IdProof { get; set; } = string.Empty;
        public string AadharNumber { get; set; } = string.Empty;
        public string PanCard { get; set; } = string.Empty;
        public string VoterId { get; set; } = string.Empty;
        public string DrivingLicense { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PermanentAddress { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;
        public string Disease { get; set; } = string.Empty;
        
        // Biometrics & Photo
        public string PatientPhoto { get; set; } = string.Empty; // Base64 string
        public DateTime? PhotoUploadDate { get; set; }
        public string BiometricTemplate { get; set; } = string.Empty; // Mock WebAuthn credentials hash
        public string FaceEmbedding { get; set; } = string.Empty; // Mock facial features list
        
        public string Occupation { get; set; } = string.Empty;
        public string EmployerName { get; set; } = string.Empty;
        
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime LastModified { get; set; } = DateTime.Now;
        public bool IsArchived { get; set; } = false;
    }
}