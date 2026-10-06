ALTER TABLE `MedicalEvent`
  ADD COLUMN `startDate` DATE NULL,
  ADD COLUMN `endDate` DATE NULL,
  ADD COLUMN `department` VARCHAR(191) NULL,
  ADD COLUMN `creditHours` INTEGER NULL,
  ADD COLUMN `contactPhone` VARCHAR(32) NULL,
  ADD COLUMN `contactEmail` VARCHAR(254) NULL,
  MODIFY COLUMN `description` TEXT NOT NULL;

CREATE INDEX `MedicalEvent_startDate_idx` ON `MedicalEvent`(`startDate`);

ALTER TABLE `Scholarship`
  ADD COLUMN `coverage` VARCHAR(191) NULL,
  ADD COLUMN `applyLink` TEXT NULL,
  MODIFY COLUMN `description` TEXT NOT NULL;

ALTER TABLE `ResearchProject`
  ADD COLUMN `creatorId` VARCHAR(191) NULL,
  ADD COLUMN `hashtags` TEXT NULL,
  ADD COLUMN `requiredSkills` TEXT NULL,
  ADD INDEX `ResearchProject_creatorId_idx` (`creatorId`),
  ADD CONSTRAINT `ResearchProject_creatorId_fkey`
    FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`, `department`, `creditHours`, `contactPhone`, `contactEmail`)
SELECT '550e8400-e29b-41d4-a716-446655440001', 'DSMB Training Workshop', '27 Oct 2026 - 29 Oct 2026', '2026-10-27', '2026-10-29', 'St Johns Medical and Research Institute, Bangalore', 'National', 'Workshop', 'DSMB training workshop organized by DCRT at St Johns Research Institute.', 'DCRT, St Johns Research Institute', 'General', 5, '9980018022', 'hrm_training@sjri.res.in'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = 'DSMB Training Workshop' AND `date` = '27 Oct 2026 - 29 Oct 2026');

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`, `department`, `creditHours`, `contactPhone`, `contactEmail`)
SELECT '550e8400-e29b-41d4-a716-446655440002', 'BREASTCON 2026', '13 Nov 2026', '2026-11-13', '2026-11-13', 'Sharada Hall, MCHP, Manipal', 'National', 'Conference', 'Medical conference organized by the Breast Clinic, Department of Surgery, Manipal Medical College, Manipal.', 'Breast Clinic, Department of Surgery, Manipal Medical College, Manipal', 'General', 2, '7022229976', 'manasa.u@manipal.edu'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = 'BREASTCON 2026' AND `date` = '13 Nov 2026');

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`, `department`, `creditHours`, `contactPhone`, `contactEmail`)
SELECT '550e8400-e29b-41d4-a716-446655440003', '319th National Conference of Association of Obstetric Anaesthesiologists', '31 Oct 2026 - 1 Nov 2026', '2026-10-31', '2026-11-01', 'Auditorium, 1st floor, Shimoga Institute of Medical Sciences, Shivamogga', 'National', 'Conference', 'National conference organized by the Department of Anaesthesiology, SIMS and ISA, Shivamogga.', 'Department of Anaesthesiology, SIMS and ISA, Shivamogga', 'General', 3, '9740073702', 'regaoacon2026@gmail.com'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = '319th National Conference of Association of Obstetric Anaesthesiologists' AND `date` = '31 Oct 2026 - 1 Nov 2026');

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`, `department`, `creditHours`)
SELECT '550e8400-e29b-41d4-a716-446655440004', 'Reproductive Medicine', '25 Oct 2026', '2026-10-25', '2026-10-25', 'Hotel Royal Park', 'National', 'Seminar', 'Reproductive medicine event organized by the Kakinada Obstetrics and Gynaecological Society.', 'Kakinada Obstetrics and Gynaecological Society', 'Obstetrics & Gynaecology', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = 'Reproductive Medicine' AND `date` = '25 Oct 2026');

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`, `department`, `creditHours`)
SELECT '550e8400-e29b-41d4-a716-446655440005', 'Artificial Intelligence for Medical Image Diagnosis', '13 Nov 2026 - 14 Nov 2026', '2026-11-13', '2026-11-14', 'AIIMS Mangalagiri', 'National', 'Workshop', 'Medical image diagnosis workshop organized by the Department of Anatomy, All India Institute of Medical Sciences.', 'Department of Anatomy, All India Institute of Medical Sciences', 'Anatomy', 4
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = 'Artificial Intelligence for Medical Image Diagnosis' AND `date` = '13 Nov 2026 - 14 Nov 2026');

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`)
SELECT '550e8400-e29b-41d4-a716-446655440006', 'Advanced DBS and Botulinum Toxin Workshop 2026', '25 Nov 2026 - 28 Nov 2026', '2026-11-25', '2026-11-28', 'Jawaharlal Auditorium, AIIMS New Delhi, New Delhi, Delhi 110029', 'National', 'Workshop', 'Academic workshop on Deep Brain Stimulation and Botulinum Toxin therapies, with expert-led lectures, hands-on sessions and live case discussions.', 'AIIMS Movement Disorders Association, Department of Neurology, AIIMS'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = 'Advanced DBS and Botulinum Toxin Workshop 2026');

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`)
SELECT '550e8400-e29b-41d4-a716-446655440007', 'NAILSCON 2026', '30 Oct 2026 - 1 Nov 2026', '2026-10-30', '2026-11-01', 'Peninsula Del Mar, Fisheries Road, Mangaluru, Karnataka 574119', 'National', 'Conference', 'Academic meeting for trauma surgeons covering interlocking nailing and fracture care, with workshops, live surgeries and case-based discussions.', 'NAILSCON 2026'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = 'NAILSCON 2026');

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`, `contactPhone`, `contactEmail`)
SELECT '550e8400-e29b-41d4-a716-446655440008', 'RESCARE 2026 - 19th National Conference of IARC', '2 Oct 2026 - 4 Oct 2026', '2026-10-02', '2026-10-04', 'Yenepoya (Deemed to be University), Deralakatte, Mangaluru, Karnataka 575018', 'National', 'Conference', 'National conference of the Indian Association of Respiratory Care with lectures, hands-on workshops, exhibitions and research sessions.', 'Indian Association of Respiratory Care (IARC)', NULL, NULL
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = 'RESCARE 2026 - 19th National Conference of IARC');

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`, `contactPhone`, `contactEmail`)
SELECT '550e8400-e29b-41d4-a716-446655440009', 'RHINOCON 2027', '26 Nov 2027 - 28 Nov 2027', '2027-11-26', '2027-11-28', 'SRMS Institute of Medical Sciences, Bareilly, Uttar Pradesh, India', 'National', 'Conference', '38th Annual Conference of the All India Rhinology Society.', 'All India Rhinology Society', '9974747514', 'operation.event@docthub.com'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = 'RHINOCON 2027');

INSERT INTO `MedicalEvent`
  (`id`, `title`, `date`, `startDate`, `endDate`, `location`, `category`, `type`, `description`, `organizer`, `contactPhone`, `contactEmail`)
SELECT '550e8400-e29b-41d4-a716-446655440010', 'AFFASCON 2027', '10 Nov 2027 - 13 Nov 2027', '2027-11-10', '2027-11-13', 'Biswa Bangla Convention Centre, Kolkata, West Bengal, India', 'National', 'Conference', '11th Asian Federation of Foot and Ankle Congress, hosted by the Indian Foot and Ankle Society.', 'Indian Foot and Ankle Society (IFAS)', '9974747514', 'operation.event@docthub.com'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `MedicalEvent` WHERE `title` = 'AFFASCON 2027');

INSERT INTO `Scholarship` (`id`, `title`, `amount`, `deadline`, `institution`, `description`, `coverage`, `applyLink`)
SELECT '660e8400-e29b-41d4-a716-446655440001', 'Reliance Foundation Undergraduate Scholarships 2026-27', 'Up to INR 2,00,000 over the degree programme', 'See official portal', 'Reliance Foundation', 'For eligible first-year undergraduate students in regular full-time degree courses. The supplied details require at least 60% in Class 12, family income below INR 15 lakh, and completion of the mandatory aptitude test.', 'Undergraduate scholarship', 'https://scholarshipportal.reliancefoundation.org/RegisterScholar#ug'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Scholarship` WHERE `title` = 'Reliance Foundation Undergraduate Scholarships 2026-27');

INSERT INTO `Scholarship` (`id`, `title`, `amount`, `deadline`, `institution`, `description`, `coverage`, `applyLink`)
SELECT '660e8400-e29b-41d4-a716-446655440002', 'Sitaram Jindal Foundation Scholarship Scheme', 'Tuition and study support; hosteller assistance may apply', 'Always Open', 'Sitaram Jindal Foundation', 'For eligible students under 30 in school, diploma, undergraduate or postgraduate study, including medical and engineering fields. Check the foundation page for current eligibility and documentation.', 'Need-based education support', 'https://www.sitaramjindalfoundation.org/scholarships-for-students-in-bangalore.php'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Scholarship` WHERE `title` = 'Sitaram Jindal Foundation Scholarship Scheme');

INSERT INTO `Scholarship` (`id`, `title`, `amount`, `deadline`, `institution`, `description`, `coverage`, `applyLink`)
SELECT '660e8400-e29b-41d4-a716-446655440003', 'Federal Bank Hormis Memorial Foundation Scholarship 2025-26', 'Up to INR 1,00,000 per year, including eligible education expenses', '31 December 2025', 'Federal Bank Hormis Memorial Foundation', 'The supplied listing states applications closed on 31 December 2025. This historical listing is retained for reference; applications are no longer open.', 'Tuition and eligible study expenses', 'https://www.federal.bank.in/corporate-social-responsibility'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Scholarship` WHERE `title` = 'Federal Bank Hormis Memorial Foundation Scholarship 2025-26');

INSERT INTO `Scholarship` (`id`, `title`, `amount`, `deadline`, `institution`, `description`, `coverage`)
SELECT '660e8400-e29b-41d4-a716-446655440004', 'GSK Scholars Programme 2026-27', 'Up to INR 1,00,000 per year for 4.5 years', 'Check official programme page', 'GSK', 'For eligible first-year MBBS students at government medical colleges, with at least 65% in Class 12 and annual family income below INR 6 lakh. Funds are for academic expenses; verify current dates and eligibility with the programme.', 'Academic expenses'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `Scholarship` WHERE `title` = 'GSK Scholars Programme 2026-27');
