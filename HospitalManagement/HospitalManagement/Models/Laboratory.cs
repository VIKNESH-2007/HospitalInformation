namespace HospitalAPI.Models
{
    public class LaboratoryReport
    {
        public int Id { get; set; }

        public string PatientName { get; set; }

        public string DoctorName { get; set; }

        public string TestName { get; set; }

        public string TestResult { get; set; }

        public string Status { get; set; }

        public DateTime TestDate { get; set; }
    }
}