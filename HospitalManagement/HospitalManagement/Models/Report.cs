namespace HospitalAPI.Models
{
    public class Report
    {
        public int Id { get; set; }

        public string ReportType { get; set; }

        public string ReportName { get; set; }

        public DateTime GeneratedDate { get; set; }

        public string GeneratedBy { get; set; }

        public string Description { get; set; }

        public string Status { get; set; }
    }
}