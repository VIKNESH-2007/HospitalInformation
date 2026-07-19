namespace HospitalAPI.Models
{
    public class SystemSettings
    {
        public int Id { get; set; }

        public string HospitalName { get; set; }

        public string Address { get; set; }

        public string ContactNumber { get; set; }

        public string Email { get; set; }

        public string ThemeColor { get; set; }

        public bool DarkMode { get; set; }

        public bool Notifications { get; set; }

        public bool AutoBackup { get; set; }
    }
}