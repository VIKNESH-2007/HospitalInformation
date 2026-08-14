using HospitalAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Explicitly set the URLs to avoid port conflicts during development
builder.WebHost.UseUrls("http://127.0.0.1:5000");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<HospitalDbContext>(
    options =>
        options.UseMySql(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            new MySqlServerVersion(new Version(8, 0, 31))
        )
);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowReact",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Enable Swagger UI so the API documentation is served at /swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hospital API V1");
    // To serve the UI at application root, uncomment the next line:
    // c.RoutePrefix = string.Empty;
});

// Ensure database is created on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HospitalDbContext>();
    context.Database.EnsureCreated();

    // Self-healing database schema migrations for Appointments columns
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Appointments ADD COLUMN DoctorId INT NOT NULL DEFAULT 0;"); } catch {}
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Appointments ADD COLUMN PatientId INT NOT NULL DEFAULT 0;"); } catch {}
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Appointments ADD COLUMN ReservedByUserId INT NULL;"); } catch {}
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Appointments ADD COLUMN ReservedTimestamp DATETIME NULL;"); } catch {}
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Appointments ADD COLUMN LockExpiresAt DATETIME NULL;"); } catch {}

    // Self-healing database schema migrations for Billings columns
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Billings ADD COLUMN MedicineName VARCHAR(255) NULL;"); } catch {}
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Billings ADD COLUMN MedicineQuantity INT NOT NULL DEFAULT 0;"); } catch {}
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Billings ADD COLUMN PrescriptionId INT NULL;"); } catch {}
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Billings ADD COLUMN IsOverridden TINYINT(1) NOT NULL DEFAULT 0;"); } catch {}
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Billings ADD COLUMN OverrideReason VARCHAR(500) NULL;"); } catch {}
    try { context.Database.ExecuteSqlRaw("ALTER TABLE Billings ADD COLUMN Status VARCHAR(50) NULL;"); } catch {}

    // Seed Demo Users if they do not exist
    if (!context.Users.Any())
    {
        context.Users.AddRange(
            new HospitalAPI.Models.User
            {
                FullName = "System Administrator",
                Email = "admin@hims.com",
                Username = "admin",
                Password = "admin",
                Role = "Admin"
            },
            new HospitalAPI.Models.User
            {
                FullName = "HIMS Clinical Staff",
                Email = "staff@hims.com",
                Username = "staff_user",
                Password = "staff",
                Role = "Staff"
            },
            new HospitalAPI.Models.User
            {
                FullName = "Demo Patient",
                Email = "patient@hims.com",
                Username = "patient_user",
                Password = "patient",
                Role = "User"
            }
        );
        context.SaveChanges();
    }

    // Seed Patients
    if (!context.Patients.Any())
    {
        context.Patients.AddRange(
            new HospitalAPI.Models.Patient {
                HospitalId = "HOS-2026-00001",
                FirstName = "John",
                LastName = "Doe",
                Name = "John Doe",
                Age = 45,
                Gender = "Male",
                Phone = "+9843546493",
                Email = "john@example.com",
                DOB = new DateTime(1981, 5, 15),
                FatherName = "George Doe",
                IdProof = "Aadhar-12345678",
                AadharNumber = "123456789012",
                PanCard = "ABCDE1234F",
                VoterId = "VOTER123",
                DrivingLicense = "DL12345",
                Address = "123 Main St",
                PermanentAddress = "123 Main St",
                City = "New York",
                State = "NY",
                PinCode = "10001",
                Disease = "Cardiovascular Disease",
                PatientPhoto = "mock_face_john_doe_base64",
                PhotoUploadDate = DateTime.Now,
                BiometricTemplate = "fingerprint_john_doe_hash",
                FaceEmbedding = "[0.12, 0.45, -0.67, 0.89]"
            },
            new HospitalAPI.Models.Patient {
                HospitalId = "HOS-2026-00002",
                FirstName = "Jane",
                LastName = "Smith",
                Name = "Jane Smith",
                Age = 34,
                Gender = "Female",
                Phone = "+987654356",
                Email = "jane@example.com",
                DOB = new DateTime(1992, 8, 24),
                FatherName = "William Smith",
                IdProof = "PAN-ABCD1234E",
                AadharNumber = "987654321098",
                PanCard = "ABCD1234E",
                VoterId = "VOTER456",
                DrivingLicense = "DL67890",
                Address = "456 Oak Ave",
                PermanentAddress = "456 Oak Ave",
                City = "Chicago",
                State = "IL",
                PinCode = "60601",
                Disease = "Neurological Checkup",
                PatientPhoto = "mock_face_jane_smith_base64",
                PhotoUploadDate = DateTime.Now,
                BiometricTemplate = "fingerprint_jane_smith_hash",
                FaceEmbedding = "[-0.23, 0.56, 0.78, -0.11]"
            },
            new HospitalAPI.Models.Patient {
                HospitalId = "HOS-2026-00003",
                FirstName = "Robert",
                LastName = "Johnson",
                Name = "Robert Johnson",
                Age = 52,
                Gender = "Male",
                Phone = "+9677588445",
                Email = "robert@example.com",
                DOB = new DateTime(1974, 11, 2),
                FatherName = "Arthur Johnson",
                IdProof = "Aadhar-87654321",
                AadharNumber = "876543218765",
                PanCard = "WXYZ5678A",
                VoterId = "VOTER789",
                DrivingLicense = "DL54321",
                Address = "789 Pine Rd",
                PermanentAddress = "789 Pine Rd",
                City = "Boston",
                State = "MA",
                PinCode = "02101",
                Disease = "Osteoarthritis",
                PatientPhoto = "mock_face_robert_johnson_base64",
                PhotoUploadDate = DateTime.Now,
                BiometricTemplate = "fingerprint_robert_johnson_hash",
                FaceEmbedding = "[0.88, -0.12, 0.34, 0.55]"
            },
            new HospitalAPI.Models.Patient {
                HospitalId = "HOS-2026-00004",
                FirstName = "John",
                LastName = "Doe",
                Name = "John Doe",
                Age = 45,
                Gender = "Male",
                Phone = "+9843546493",
                Email = "johndoe_dup@example.com",
                DOB = new DateTime(1981, 5, 15),
                FatherName = "George Doe",
                IdProof = "Aadhar-12345679",
                AadharNumber = "123456789019",
                Address = "123 Main St Apt B",
                PermanentAddress = "123 Main St",
                City = "New York",
                State = "NY",
                PinCode = "10001",
                Disease = "Checkup",
                PatientPhoto = "mock_face_john_doe_base64",
                PhotoUploadDate = DateTime.Now,
                BiometricTemplate = "fingerprint_john_doe_hash"
            }
        );
    }

    // Seed Doctors
    if (!context.Doctors.Any())
    {
        context.Doctors.AddRange(
            new HospitalAPI.Models.Doctor { Name = "Dr. Robert Chen", Department = "Cardiology", Experience = 12, Phone = "+192837465", Email = "robert@hims.com", Qualification = "MD, FACC", Availability = "Mon-Fri 9AM-5PM", ConsultationFee = 150.00m },
            new HospitalAPI.Models.Doctor { Name = "Dr. Sarah Jenkins", Department = "Neurology", Experience = 8, Phone = "+182736452", Email = "sarah@hims.com", Qualification = "MD, PhD", Availability = "Mon-Thu 10AM-4PM", ConsultationFee = 200.00m },
            new HospitalAPI.Models.Doctor { Name = "Dr. James Carter", Department = "Orthopedics", Experience = 15, Phone = "+172635443", Email = "james@hims.com", Qualification = "MD, MS", Availability = "Tue-Fri 8AM-2PM", ConsultationFee = 180.00m }
        );
    }

    // Seed Appointments
    if (!context.Appointments.Any())
    {
        context.Appointments.AddRange(
            new HospitalAPI.Models.Appointment { PatientName = "John Doe", DoctorName = "Dr. Robert Chen", Department = "Cardiology", AppointmentDate = DateTime.Today, TimeSlot = "10:00 AM", Status = "Scheduled" },
            new HospitalAPI.Models.Appointment { PatientName = "Jane Smith", DoctorName = "Dr. Sarah Jenkins", Department = "Neurology", AppointmentDate = DateTime.Today, TimeSlot = "11:30 AM", Status = "Completed" },
            new HospitalAPI.Models.Appointment { PatientName = "Robert Johnson", DoctorName = "Dr. James Carter", Department = "Orthopedics", AppointmentDate = DateTime.Today, TimeSlot = "02:00 PM", Status = "Scheduled" }
        );
    }

    // Seed Billings
    if (!context.Billings.Any())
    {
        context.Billings.AddRange(
            new HospitalAPI.Models.Billing { PatientName = "John Doe", DoctorName = "Dr. Robert Chen", ConsultationFee = 150, MedicineFee = 45, LabFee = 80, RoomCharge = 200, TotalAmount = 475, PaymentMethod = "Credit Card", PaymentStatus = "Paid", BillingDate = DateTime.Now, Status = "Paid" },
            new HospitalAPI.Models.Billing { PatientName = "Jane Smith", DoctorName = "Dr. Sarah Jenkins", ConsultationFee = 200, MedicineFee = 60, LabFee = 120, RoomCharge = 0, TotalAmount = 380, PaymentMethod = "Cash", PaymentStatus = "Pending", BillingDate = DateTime.Now, Status = "Pending" },
            new HospitalAPI.Models.Billing { PatientName = "Robert Johnson", DoctorName = "Dr. James Carter", ConsultationFee = 180, MedicineFee = 75, LabFee = 90, RoomCharge = 150, TotalAmount = 495, PaymentMethod = "Insurance", PaymentStatus = "Paid", BillingDate = DateTime.Now, Status = "Paid" }
        );
    }

    // Seed Medicines
    if (!context.Medicines.Any())
    {
        context.Medicines.AddRange(
            new HospitalAPI.Models.Medicine { MedicineName = "Aspirin 100mg", Category = "Cardiology", Quantity = 500, Price = 10, ExpiryDate = DateTime.Today.AddYears(2), Manufacturer = "PharmaCorp" },
            new HospitalAPI.Models.Medicine { MedicineName = "Gabapentin 300mg", Category = "Neurology", Quantity = 250, Price = 35, ExpiryDate = DateTime.Today.AddYears(1), Manufacturer = "NeuroMeds" },
            new HospitalAPI.Models.Medicine { MedicineName = "Ibuprofen 400mg", Category = "General", Quantity = 1000, Price = 15, ExpiryDate = DateTime.Today.AddYears(3), Manufacturer = "GlobalPharma" }
        );
    }

    // Seed Staff
    if (!context.Staff.Any())
    {
        context.Staff.AddRange(
            new HospitalAPI.Models.Staff { Name = "Alice Johnson", Role = "Nurse", Department = "Cardiology", Phone = "+9842106847", Email = "alice@hims.com", Shift = "Day", Salary = 60000 },
            new HospitalAPI.Models.Staff { Name = "Bob Miller", Role = "Pharmacist", Department = "Pharmacy", Phone = "+90", Email = "bob@hims.com", Shift = "Night", Salary = 75000 }
        );
    }

    // Seed Reports
    if (!context.Reports.Any())
    {
        context.Reports.AddRange(
            new HospitalAPI.Models.Report { ReportType = "Summary", ReportName = "Weekly Operational Report", GeneratedDate = DateTime.Now, GeneratedBy = "Admin", Description = "Weekly operational metrics summary.", Status = "Final" },
            new HospitalAPI.Models.Report { ReportType = "Finance", ReportName = "Monthly Revenue Report", GeneratedDate = DateTime.Now, GeneratedBy = "Admin", Description = "Finance and billing summary report.", Status = "Final" }
        );
    }

    // Seed Prescriptions
    if (!context.Prescriptions.Any())
    {
        context.Prescriptions.AddRange(
            new HospitalAPI.Models.Prescription { PatientName = "John Doe", MedicationName = "Aspirin 100mg", PrescribedQty = 5, Dosage = "500mg", Duration = 5, DoctorName = "Dr. Robert Chen", Status = "Active", Signature = "Digitally Signed" },
            new HospitalAPI.Models.Prescription { PatientName = "Jane Smith", MedicationName = "Gabapentin 300mg", PrescribedQty = 10, Dosage = "300mg", Duration = 10, DoctorName = "Dr. Sarah Jenkins", Status = "Active", Signature = "Digitally Signed" },
            new HospitalAPI.Models.Prescription { PatientName = "Robert Johnson", MedicationName = "Ibuprofen 400mg", PrescribedQty = 8, Dosage = "400mg", Duration = 4, DoctorName = "Dr. James Carter", Status = "Active", Signature = "Digitally Signed" }
        );
    }

    // Seed Treatments
    if (!context.TreatmentSchedules.Any())
    {
        context.TreatmentSchedules.AddRange(
            new HospitalAPI.Models.TreatmentSchedule { PatientName = "John Doe", TreatmentType = "Surgery", ScheduledTime = DateTime.Now.AddMinutes(-45), ExpectedDuration = 30, ActualStartTime = DateTime.Now.AddMinutes(-40), Status = "Active", AssignedDoctor = "Dr. Robert Chen", DelayReason = "Awaiting surgical instrument sterilization" },
            new HospitalAPI.Models.TreatmentSchedule { PatientName = "Jane Smith", TreatmentType = "Consultation", ScheduledTime = DateTime.Now.AddMinutes(-10), ExpectedDuration = 15, ActualStartTime = DateTime.Now.AddMinutes(-8), Status = "Active", AssignedDoctor = "Dr. Sarah Jenkins" },
            new HospitalAPI.Models.TreatmentSchedule { PatientName = "Robert Johnson", TreatmentType = "Therapy", ScheduledTime = DateTime.Now.AddHours(2), ExpectedDuration = 60, Status = "Scheduled", AssignedDoctor = "Dr. James Carter" }
        );
    }

    // Seed Duty Rosters
    if (!context.DutyRosters.Any())
    {
        context.DutyRosters.AddRange(
            new HospitalAPI.Models.DutyRoster { StaffName = "Nurse Sarah Jenkins", ShiftName = "Morning", ShiftStart = DateTime.Today.AddHours(8), ShiftEnd = DateTime.Today.AddHours(16), CheckInTime = DateTime.Today.AddHours(8).AddMinutes(20), IsLate = true, TardinessMinutes = 20 },
            new HospitalAPI.Models.DutyRoster { StaffName = "Nurse Emily Davis", ShiftName = "Morning", ShiftStart = DateTime.Today.AddHours(8), ShiftEnd = DateTime.Today.AddHours(16), CheckInTime = DateTime.Today.AddHours(7).AddMinutes(55), IsLate = false, TardinessMinutes = 0 },
            new HospitalAPI.Models.DutyRoster { StaffName = "Staff Robert Smith", ShiftName = "Evening", ShiftStart = DateTime.Today.AddHours(16), ShiftEnd = DateTime.Today.AddHours(24), IsLate = false, TardinessMinutes = 0 }
        );
    }

    // Seed Resource Inventories
    if (!context.ResourceInventories.Any())
    {
        context.ResourceInventories.AddRange(
            new HospitalAPI.Models.ResourceInventory { ResourceName = "Oxygen Cylinders (ICU)", Category = "Gas", TotalCapacity = 100, CurrentStock = 22, Unit = "Cylinders", SafetyThresholdPercent = 25 },
            new HospitalAPI.Models.ResourceInventory { ResourceName = "O- Negative Blood Pints", Category = "Blood", TotalCapacity = 50, CurrentStock = 4, Unit = "Pints", SafetyThresholdPercent = 25 },
            new HospitalAPI.Models.ResourceInventory { ResourceName = "Normal Saline 0.9% IV", Category = "Fluid", TotalCapacity = 200, CurrentStock = 120, Unit = "Liters", SafetyThresholdPercent = 25 }
        );
    }

    // Seed Equipment Maintenance schedules
    if (!context.EquipmentMaintenances.Any())
    {
        context.EquipmentMaintenances.AddRange(
            new HospitalAPI.Models.EquipmentMaintenance { EquipmentName = "ICU Ventilator #4", LastServiceDate = DateTime.Today.AddMonths(-3), NextServiceDueDate = DateTime.Today.AddDays(5), Status = "Due Soon", AssignedEngineer = "Eng. Jack Reynolds" },
            new HospitalAPI.Models.EquipmentMaintenance { EquipmentName = "General MRI Scanner", LastServiceDate = DateTime.Today.AddMonths(-6), NextServiceDueDate = DateTime.Today.AddDays(-2), Status = "Overdue", AssignedEngineer = "Eng. Clara Oswald" },
            new HospitalAPI.Models.EquipmentMaintenance { EquipmentName = "Emergency X-Ray System", LastServiceDate = DateTime.Today.AddMonths(-1), NextServiceDueDate = DateTime.Today.AddMonths(2), Status = "Serviced", AssignedEngineer = "Eng. Daniel Pink" }
        );
    }

    context.SaveChanges();
}

app.UseCors("AllowReact");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HospitalAPI v1");
});

// Redirect uppercase /Swagger to lowercase /swagger to prevent 404 errors
app.Use((context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/Swagger", StringComparison.Ordinal))
    {
        context.Response.Redirect("/swagger");
        return Task.CompletedTask;
    }
    return next();
});

app.MapControllers();

app.Run();