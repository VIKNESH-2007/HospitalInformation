using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Models
{
    public class Pharmacy
    {
        [Key]
        public int MedicineId { get; set; }

        public string MedicineName { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public decimal Price { get; set; }
    }
}
