using System;

namespace HospitalAPI.Models
{
    public class ResourceInventory
    {
        public int Id { get; set; }

        public string ResourceName { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public int TotalCapacity { get; set; }

        public int CurrentStock { get; set; }

        public string Unit { get; set; } = string.Empty; // Pints, Liters, Cylinders

        public int SafetyThresholdPercent { get; set; } = 25; // warning limit percent
    }
}
