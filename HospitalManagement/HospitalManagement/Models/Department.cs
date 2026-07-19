namespace HotelManagement.Models
{
    public class Department
    {
        public int DepartmentId { get; set; }

        public string DepartmentName { get; set; } = string.Empty;

        public string HeadDoctor { get; set; } = string.Empty;
    }
}