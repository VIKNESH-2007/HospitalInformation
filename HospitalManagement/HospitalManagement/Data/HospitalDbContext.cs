using Microsoft.EntityFrameworkCore;
using HospitalAPI.Models;

namespace HospitalAPI.Data
{
    public class HospitalDbContext : DbContext
    {
        public HospitalDbContext(
            DbContextOptions<HospitalDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Billing> Billings { get; set; }
        public DbSet<LaboratoryReport> LaboratoryReports { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<SystemSettings> SystemSettings { get; set; }
        public DbSet<Staff> Staff { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<TreatmentSchedule> TreatmentSchedules { get; set; }
        public DbSet<DutyRoster> DutyRosters { get; set; }
        public DbSet<ResourceInventory> ResourceInventories { get; set; }
        public DbSet<EquipmentMaintenance> EquipmentMaintenances { get; set; }
        public DbSet<PatientDocument> PatientDocuments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasIndex(p => p.Name);
                entity.HasIndex(p => p.Phone);
                entity.HasIndex(p => p.AadharNumber);
                entity.HasIndex(p => p.HospitalId);
                entity.HasIndex(p => p.DOB);
            });
        }
    }
}