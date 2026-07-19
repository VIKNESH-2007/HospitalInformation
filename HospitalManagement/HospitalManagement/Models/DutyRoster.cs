using System;

namespace HospitalAPI.Models
{
    public class DutyRoster
    {
        public int Id { get; set; }

        public string StaffName { get; set; } = string.Empty;

        public string ShiftName { get; set; } = string.Empty; // Morning, Evening, Night

        public DateTime ShiftStart { get; set; }

        public DateTime ShiftEnd { get; set; }

        public DateTime? CheckInTime { get; set; }

        public bool IsLate { get; set; }

        public int TardinessMinutes { get; set; }
    }
}
