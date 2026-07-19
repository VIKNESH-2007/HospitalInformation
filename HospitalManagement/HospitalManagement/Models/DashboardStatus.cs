namespace HospitalAPI.Models
{
    public class DashboardStats
    {
        public int TotalPatients { get; set; }

        public int TotalDoctors { get; set; }

        public int TotalAppointments { get; set; }

        public decimal TotalRevenue { get; set; }

        public int TotalMedicines { get; set; }

        public int TotalReports { get; set; }

        public int TotalStaff { get; set; }

        public int TodayAppointments { get; set; }
    }
}