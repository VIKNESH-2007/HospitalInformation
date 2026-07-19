using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Models
{
    public class MedicalRecord
    {
        [Key]
        public int RecordId { get; set; }

        public string PatientName { get; set; } = string.Empty;

        public string Diagnosis { get; set; } = string.Empty;

        public string Treatment { get; set; } = string.Empty;

        public string DoctorName { get; set; } = string.Empty;
    }
}
