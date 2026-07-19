namespace HospitalAPI.Models
{
    public class Staff
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Role { get; set; }

        public string Department { get; set; }

        public string Phone { get; set; }

        public string Email { get; set; }

        public string Shift { get; set; }

        public decimal Salary { get; set; }
    }
}