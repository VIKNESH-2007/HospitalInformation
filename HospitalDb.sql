-- =========================================================
-- Hospital Information Management System (HIMS)
-- Database Creation & Seeding Script
-- =========================================================

-- 1. Create the Database Schema
CREATE DATABASE IF NOT EXISTS HospitalDB;
USE HospitalDB;

-- 2. Drop existing tables if they exist to prevent conflicts
DROP TABLE IF EXISTS `SystemSettings`;
DROP TABLE IF EXISTS `Reports`;
DROP TABLE IF EXISTS `Staff`;
DROP TABLE IF EXISTS `Medicines`;
DROP TABLE IF EXISTS `Billings`;
DROP TABLE IF EXISTS `Appointments`;
DROP TABLE IF EXISTS `Doctors`;
DROP TABLE IF EXISTS `Patients`;
DROP TABLE IF EXISTS `Users`;

-- =========================================================
-- 3. Create Tables
-- =========================================================

-- Table: Users (Credentials and Roles)
CREATE TABLE `Users` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `FullName` VARCHAR(255) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `Username` VARCHAR(255) NOT NULL UNIQUE,
    `Password` VARCHAR(255) NOT NULL,
    `Role` VARCHAR(50) NOT NULL DEFAULT 'User',
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Patients (Clinical Case Records)
CREATE TABLE `Patients` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) NOT NULL,
    `Age` INT NOT NULL,
    `Gender` VARCHAR(50) NOT NULL,
    `Phone` VARCHAR(50) NOT NULL,
    `Address` TEXT NULL,
    `Disease` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Doctors (Specialists)
CREATE TABLE `Doctors` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) NOT NULL,
    `Department` VARCHAR(255) NOT NULL,
    `Experience` INT NOT NULL,
    `Phone` VARCHAR(50) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `Qualification` VARCHAR(255) NOT NULL,
    `Availability` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Appointments (Scheduler)
CREATE TABLE `Appointments` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `PatientName` VARCHAR(255) NOT NULL,
    `DoctorName` VARCHAR(255) NOT NULL,
    `Department` VARCHAR(255) NOT NULL,
    `AppointmentDate` DATETIME NOT NULL,
    `TimeSlot` VARCHAR(50) NOT NULL,
    `Status` VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Billings (Accounting & Invoices)
CREATE TABLE `Billings` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `PatientName` VARCHAR(255) NOT NULL,
    `DoctorName` VARCHAR(255) NOT NULL,
    `ConsultationFee` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    `MedicineFee` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    `LabFee` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    `RoomCharge` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    `TotalAmount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    `PaymentMethod` VARCHAR(100) NOT NULL,
    `PaymentStatus` VARCHAR(50) NOT NULL DEFAULT 'Pending',
    `BillingDate` DATETIME NOT NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Medicines (Pharmacy Inventory)
CREATE TABLE `Medicines` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `MedicineName` VARCHAR(255) NOT NULL,
    `Category` VARCHAR(255) NOT NULL,
    `Quantity` INT NOT NULL DEFAULT 0,
    `Price` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    `ExpiryDate` DATETIME NOT NULL,
    `Manufacturer` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Staff (Nurses, Techs, Support)
CREATE TABLE `Staff` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) NOT NULL,
    `Role` VARCHAR(100) NOT NULL,
    `Department` VARCHAR(255) NOT NULL,
    `Phone` VARCHAR(50) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `Shift` VARCHAR(50) NOT NULL,
    `Salary` DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Reports (Operations Summaries)
CREATE TABLE `Reports` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `ReportType` VARCHAR(100) NOT NULL,
    `ReportName` VARCHAR(255) NOT NULL,
    `GeneratedDate` DATETIME NOT NULL,
    `GeneratedBy` VARCHAR(255) NOT NULL,
    `Description` TEXT NOT NULL,
    `Status` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: SystemSettings (Global App Configurations)
CREATE TABLE `SystemSettings` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `HospitalName` VARCHAR(255) NOT NULL,
    `Address` TEXT NOT NULL,
    `ContactNumber` VARCHAR(50) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `ThemeColor` VARCHAR(50) NOT NULL DEFAULT 'Blue',
    `DarkMode` TINYINT(1) NOT NULL DEFAULT 0,
    `Notifications` TINYINT(1) NOT NULL DEFAULT 1,
    `AutoBackup` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 4. Seed Data Insertion (DML)
-- =========================================================

-- Seed: Users
INSERT INTO `Users` (`FullName`, `Email`, `Username`, `Password`, `Role`) VALUES
('System Administrator', 'admin@hims.com', 'admin', 'adminPassword123', 'Admin'),
('HIMS Clinical Staff', 'staff@hims.com', 'staff_user', 'staffPassword123', 'Staff'),
('Demo Patient', 'patient@hims.com', 'patient_user', 'userPassword123', 'User');

-- Seed: Patients
INSERT INTO `Patients` (`Name`, `Age`, `Gender`, `Phone`, `Address`, `Disease`) VALUES
('John Doe', 45, 'Male', '+123456789', '123 Main St, New York', 'Cardiovascular Disease'),
('Jane Smith', 34, 'Female', '+987654321', '456 Oak Ave, California', 'Neurological Checkup'),
('Robert Johnson', 52, 'Male', '+112233445', '789 Pine Rd, Chicago', 'Osteoarthritis');

-- Seed: Doctors
INSERT INTO `Doctors` (`Name`, `Department`, `Experience`, `Phone`, `Email`, `Qualification`, `Availability`) VALUES
('Dr. Robert Chen', 'Cardiology', 12, '+192837465', 'robert@hims.com', 'MD, FACC', 'Mon-Fri 9AM-5PM'),
('Dr. Sarah Jenkins', 'Neurology', 8, '+182736452', 'sarah@hims.com', 'MD, PhD', 'Mon-Thu 10AM-4PM'),
('Dr. James Carter', 'Orthopedics', 15, '+172635443', 'james@hims.com', 'MD, MS', 'Tue-Fri 8AM-2PM');

-- Seed: Appointments
INSERT INTO `Appointments` (`PatientName`, `DoctorName`, `Department`, `AppointmentDate`, `TimeSlot`, `Status`) VALUES
('John Doe', 'Dr. Robert Chen', 'Cardiology', NOW(), '10:00 AM', 'Scheduled'),
('Jane Smith', 'Dr. Sarah Jenkins', 'Neurology', NOW(), '11:30 AM', 'Completed'),
('Robert Johnson', 'Dr. James Carter', 'Orthopedics', NOW(), '02:00 PM', 'Scheduled');

-- Seed: Billings
INSERT INTO `Billings` (`PatientName`, `DoctorName`, `ConsultationFee`, `MedicineFee`, `LabFee`, `RoomCharge`, `TotalAmount`, `PaymentMethod`, `PaymentStatus`, `BillingDate`) VALUES
('John Doe', 'Dr. Robert Chen', 150.00, 45.00, 80.00, 200.00, 475.00, 'Credit Card', 'Paid', NOW()),
('Jane Smith', 'Dr. Sarah Jenkins', 200.00, 60.00, 120.00, 0.00, 380.00, 'Cash', 'Pending', NOW()),
('Robert Johnson', 'Dr. James Carter', 180.00, 75.00, 90.00, 150.00, 495.00, 'Insurance', 'Paid', NOW());

-- Seed: Medicines
INSERT INTO `Medicines` (`MedicineName`, `Category`, `Quantity`, `Price`, `ExpiryDate`, `Manufacturer`) VALUES
('Aspirin 100mg', 'Cardiology', 500, 10.00, DATE_ADD(NOW(), INTERVAL 2 YEAR), 'PharmaCorp'),
('Gabapentin 300mg', 'Neurology', 250, 35.00, DATE_ADD(NOW(), INTERVAL 1 YEAR), 'NeuroMeds'),
('Ibuprofen 400mg', 'General', 1000, 15.00, DATE_ADD(NOW(), INTERVAL 3 YEAR), 'GlobalPharma');

-- Seed: Staff
INSERT INTO `Staff` (`Name`, `Role`, `Department`, `Phone`, `Email`, `Shift`, `Salary`) VALUES
('Alice Johnson', 'Nurse', 'Cardiology', '+155512345', 'alice@hims.com', 'Day', 60000.00),
('Bob Miller', 'Pharmacist', 'Pharmacy', '+155567890', 'bob@hims.com', 'Night', 75000.00);

-- Seed: Reports
INSERT INTO `Reports` (`ReportType`, `ReportName`, `GeneratedDate`, `GeneratedBy`, `Description`, `Status`) VALUES
('Summary', 'Weekly Operational Report', NOW(), 'Admin', 'Weekly operational metrics summary.', 'Final'),
('Finance', 'Monthly Revenue Report', NOW(), 'Admin', 'Finance and billing summary report.', 'Final');

-- Seed: SystemSettings
INSERT INTO `SystemSettings` (`HospitalName`, `Address`, `ContactNumber`, `Email`, `ThemeColor`, `DarkMode`, `Notifications`, `AutoBackup`) VALUES
('HIMS City Hospital', '456 Healthcare Blvd, New York', '+1-800-555-0199', 'info@cityhospital.com', 'Blue', 0, 1, 1);

-- =========================================================
-- 5. Verification Queries
-- =========================================================
SELECT 'Database setup complete!' AS Status;
SELECT COUNT(*) AS TotalUsers FROM `Users`;
SELECT COUNT(*) AS TotalPatients FROM `Patients`;
SELECT COUNT(*) AS TotalDoctors FROM `Doctors`;