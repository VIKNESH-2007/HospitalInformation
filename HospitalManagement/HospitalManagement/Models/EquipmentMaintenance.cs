using System;

namespace HospitalAPI.Models
{
    public class EquipmentMaintenance
    {
        public int Id { get; set; }

        public string EquipmentName { get; set; } = string.Empty;

        public DateTime LastServiceDate { get; set; }

        public DateTime NextServiceDueDate { get; set; }

        public string Status { get; set; } = "Serviced"; // Serviced, Due Soon, Overdue

        public string AssignedEngineer { get; set; } = string.Empty;
    }
}
