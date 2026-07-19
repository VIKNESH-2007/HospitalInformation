namespace HospitalAPI.Models
{
    public class Doctor
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Department { get; set; }

        public int Experience { get; set; }

        public string Phone { get; set; }

        public string Email { get; set; }

        public string Qualification { get; set; }

        public string Availability { get; set; }

        public decimal ConsultationFee { get; set; } = 150.00m;
    }
}