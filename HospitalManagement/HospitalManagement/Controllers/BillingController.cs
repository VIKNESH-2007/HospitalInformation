using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using HospitalAPI.Data;
using HospitalAPI.Models;
using HospitalAPI.Filters;

namespace HospitalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillingController : ControllerBase
    {
        private readonly HospitalDbContext _context;

        public BillingController(HospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetBills()
        {
            return Ok(_context.Billings.ToList());
        }

        [HttpGet("{id}")]
        public IActionResult GetBill(int id)
        {
            var bill = _context.Billings.Find(id);
            if (bill == null)
                return NotFound();

            return Ok(bill);
        }

        [HttpPost("validate")]
        public IActionResult ValidateBill([FromBody] BillingValidationRequest req)
        {
            var res = new BillingValidationResponse();

            // 1. Patient Exists & Duplicate Check
            var patients = _context.Patients
                .Where(p => p.Name.ToLower() == req.PatientName.ToLower())
                .ToList();

            if (patients.Count == 0)
            {
                res.PatientExists = false;
                res.PatientMessage = "❌ Patient not found in system database.";
            }
            else if (patients.Count > 1)
            {
                res.PatientExists = true;
                res.IsDuplicatePatient = true;
                res.PatientCandidates = patients.Select(p => new PatientCandidateDto {
                    Id = p.Id,
                    HospitalId = p.HospitalId,
                    Name = p.Name,
                    DOB = p.DOB,
                    Phone = p.Phone
                }).ToList();
                res.PatientMessage = $"⚠️ DUPLICATE ALERT: Found {patients.Count} patients matching this name.";
            }
            else
            {
                res.PatientExists = true;
                res.PatientMessage = $"✓ Patient matched: ID {patients[0].HospitalId}.";
            }

            // 2. Daily Bill Duplicate Check
            var today = DateTime.Today;
            var existingBill = _context.Billings
                .FirstOrDefault(b => b.PatientName.ToLower() == req.PatientName.ToLower() &&
                                     b.BillingDate.Date == today);

            if (existingBill != null)
            {
                res.HasExistingBill = true;
                res.ExistingBillId = existingBill.Id;
                res.ExistingBillMessage = $"⚠️ DUPLICATE BILL: Bill ID {existingBill.Id} already generated for this patient today.";
            }
            else
            {
                res.ExistingBillMessage = "✓ No same-day bill conflict.";
            }

            // 3. Amount Mismatches
            // A. Consultation Fee
            var docNameClean = req.DoctorName.Replace(" ", "").Replace("dr.", "").Replace("dr", "").ToLower();
            var doctor = _context.Doctors.ToList()
                .FirstOrDefault(d => d.Name.Replace(" ", "").Replace("dr.", "").Replace("dr", "").ToLower() == docNameClean);

            if (doctor != null)
            {
                res.ExpectedConsultation = doctor.ConsultationFee;
                if (Math.Abs(req.ConsultationFee - doctor.ConsultationFee) > (doctor.ConsultationFee * 0.05m))
                {
                    res.ConsultationMismatch = true;
                }
            }
            else
            {
                res.ExpectedConsultation = 150.00m; // standard fallback
                if (Math.Abs(req.ConsultationFee - 150.00m) > 150.00m * 0.05m)
                {
                    res.ConsultationMismatch = true;
                }
            }

            // B. Medicine Fee
            if (!string.IsNullOrEmpty(req.MedicineName))
            {
                var medNameClean = req.MedicineName.ToLower().Trim();
                var med = _context.Medicines.ToList()
                    .FirstOrDefault(m => m.MedicineName.ToLower().Trim().Contains(medNameClean) || medNameClean.Contains(m.MedicineName.ToLower().Trim()));

                if (med != null)
                {
                    decimal expectedPrice = med.Price * req.MedicineQuantity;
                    res.ExpectedMedicine = expectedPrice;
                    if (Math.Abs(req.MedicineFee - expectedPrice) > (expectedPrice * 0.05m))
                    {
                        res.MedicineMismatch = true;
                    }
                }
            }

            // C. Lab Fee
            var labReports = _context.LaboratoryReports
                .Where(r => r.PatientName.ToLower() == req.PatientName.ToLower())
                .ToList();

            decimal expectedLabTotal = 0;
            foreach (var r in labReports)
            {
                string test = r.TestName.ToLower();
                if (test.Contains("blood") || test.Contains("cbc")) expectedLabTotal += 80;
                else if (test.Contains("mri") || test.Contains("scan")) expectedLabTotal += 500;
                else if (test.Contains("x-ray") || test.Contains("xray")) expectedLabTotal += 120;
                else if (test.Contains("ecg")) expectedLabTotal += 150;
                else expectedLabTotal += 100;
            }

            res.ExpectedLab = expectedLabTotal;
            if (Math.Abs(req.LabFee - expectedLabTotal) > (expectedLabTotal * 0.05m))
            {
                res.LabMismatch = true;
            }

            res.ValidationsPassed = !res.IsDuplicatePatient &&
                                    !res.HasExistingBill &&
                                    !res.ConsultationMismatch &&
                                    !res.MedicineMismatch &&
                                    !res.LabMismatch &&
                                    res.PatientExists;

            return Ok(res);
        }

        [HttpPost("{id}/approve")]
        public IActionResult ApproveBill(int id)
        {
            var bill = _context.Billings.Find(id);
            if (bill == null) return NotFound();

            bill.Status = "Paid";
            _context.SaveChanges();

            // Save compliance log
            Console.WriteLine($"[AUDIT TRAIL] Bill {id} manually approved and finalized.");

            return Ok(bill);
        }

        [HttpPost]
        public IActionResult CreateBill(Billing bill)
        {
            // Prescription-Pharmacy Reconciliation Check
            if (bill.PrescriptionId.HasValue && bill.PrescriptionId.Value > 0)
            {
                var prescription = _context.Prescriptions.Find(bill.PrescriptionId.Value);
                if (prescription != null)
                {
                    // IF billing quantity doesn't match prescribed quantity AND no override approval is supplied, flag error
                    if (bill.MedicineQuantity != prescription.PrescribedQty && !bill.IsOverridden)
                    {
                        return BadRequest(new {
                            message = "⚠️ BILLING MISMATCH DETECTED",
                            prescribedQty = prescription.PrescribedQty,
                            doctor = prescription.DoctorName,
                            medicineName = prescription.MedicationName
                        });
                    }

                    // Dispense prescription
                    prescription.Status = "Dispensed";
                }
            }

            bill.TotalAmount = bill.ConsultationFee + bill.MedicineFee + bill.LabFee + bill.RoomCharge;
            bill.BillingDate = DateTime.Now;

            _context.Billings.Add(bill);
            _context.SaveChanges();

            // Write audit trail log
            Console.WriteLine($"[AUDIT TRAIL] New bill generated. ID: {bill.Id}, Patient: {bill.PatientName}, Total: {bill.TotalAmount}, Status: {bill.Status}");

            return Ok(bill);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateBill(int id, Billing bill)
        {
            var existing = _context.Billings.Find(id);
            if (existing == null)
                return NotFound();

            existing.PatientName = bill.PatientName;
            existing.DoctorName = bill.DoctorName;
            existing.ConsultationFee = bill.ConsultationFee;
            existing.MedicineFee = bill.MedicineFee;
            existing.LabFee = bill.LabFee;
            existing.RoomCharge = bill.RoomCharge;
            existing.TotalAmount = bill.ConsultationFee + bill.MedicineFee + bill.LabFee + bill.RoomCharge;
            existing.PaymentMethod = bill.PaymentMethod;
            existing.PaymentStatus = bill.PaymentStatus;
            existing.MedicineName = bill.MedicineName;
            existing.MedicineQuantity = bill.MedicineQuantity;
            existing.PrescriptionId = bill.PrescriptionId;
            existing.IsOverridden = bill.IsOverridden;
            existing.OverrideReason = bill.OverrideReason;

            _context.SaveChanges();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteBill(int id)
        {
            var bill = _context.Billings.Find(id);
            if (bill == null)
                return NotFound();

            _context.Billings.Remove(bill);
            _context.SaveChanges();

            return Ok("Bill Deleted Successfully");
        }
    }

    public class BillingValidationRequest
    {
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public decimal ConsultationFee { get; set; }
        public decimal MedicineFee { get; set; }
        public decimal LabFee { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int MedicineQuantity { get; set; }
    }

    public class BillingValidationResponse
    {
        public bool PatientExists { get; set; }
        public bool IsDuplicatePatient { get; set; }
        public string PatientMessage { get; set; } = string.Empty;
        public List<PatientCandidateDto> PatientCandidates { get; set; } = new List<PatientCandidateDto>();

        public bool HasExistingBill { get; set; }
        public int ExistingBillId { get; set; }
        public string ExistingBillMessage { get; set; } = string.Empty;

        public bool ConsultationMismatch { get; set; }
        public decimal ExpectedConsultation { get; set; }

        public bool MedicineMismatch { get; set; }
        public decimal ExpectedMedicine { get; set; }

        public bool LabMismatch { get; set; }
        public decimal ExpectedLab { get; set; }

        public bool ValidationsPassed { get; set; }
    }

    public class PatientCandidateDto
    {
        public int Id { get; set; }
        public string HospitalId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime DOB { get; set; }
        public string Phone { get; set; } = string.Empty;
    }
}