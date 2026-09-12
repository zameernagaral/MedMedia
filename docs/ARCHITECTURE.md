# MedMedia - System Architecture & Technical Specification

## 1. Executive Summary
**MedMedia** is a dedicated professional, clinical, and social networking platform engineered exclusively for verified healthcare practitioners (Doctors, Surgeons, Specialists) and Healthcare Students (Medical/MBBS, Nursing, B.Pharm, D.Pharm, and Allied Lab Practitioners).

Unlike generic social networks, MedMedia implements a credential-verified tiered graph (Doctors vs. Students) designed for high-signal medical discussions, clinical case knowledge sharing, peer networking, CME courses, research collaboration, and verified medical recruitment.

---

## 2. High-Level System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │                    Client Layer                        │
                    ├───────────────────────────┬────────────────────────────┤
                    │   React 19 Responsive Web │ Native Android & iOS App   │
                    │   (Desktop, Tablet, PWA)  │ (React Native / Expo Bare) │
                    │                           │ Play Store: com.medmedia   │
                    └─────────────┬─────────────┴─────────────┬──────────────┘
                                  │                           │
                                  │ HTTPS / WSS               │ HTTPS / WSS
                                  ▼                           ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               API Gateway & Load Balancer              │
                    │           (Reverse Proxy / Rate Limiter / WAF)         │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │                 Node.js / Express Core                 │
                    ├────────────────────────────────────────────────────────┤
                    │ • Auth & Session Service (JWT + Device Fingerprint)    │
                    │ • Verification Engine (Doctor Council / Student ID)    │
                    │ • Social & Clinical Feed Engine (Algorithmic & Chrono) │
                    │ • Medclips Vertical Stream Service                     │
                    │ • Opportunities & Medical Job Board                    │
                    │ • Real-Time Chat & Notification Gateway (WebSocket)    │
                    │ • Alumni & Specialty Search & Recommendation Engine    │
                    └──────────────┬──────────────────────────┬──────────────┘
                                   │                          │
                    ┌──────────────▼──────────────┐ ┌─────────▼──────────────┐
                    │     PostgreSQL Database     │ │   Cloud Object Storage │
                    │  (Prisma ORM / Relational)  │ │   (S3 / Cloud Storage) │
                    │  • Users, Doctors, Students │ │   • Encrypted Licenses │
                    │  • Posts, Cases, Medclips   │ │   • Clinical Case Media│
                    │  • Jobs, Applications, RSVP │ │   • Profile Avatars    │
                    └─────────────────────────────┘ └────────────────────────┘
```

---

## 3. Tiered Role & Verification Architecture

### A. Doctor Verification Pipeline
1. **Inputs Required**:
   - Full Legal Name & Medical Council Registration Number (e.g., State Medical Council / National Medical Commission / General Medical Council / AMA).
   - Primary Specialization (e.g., Cardiology, Neurological Surgery, Oncology).
   - Institutional Affiliation (Hospital, Academic Medical Center, Clinic).
   - Medical Degree Certificate or Official Government Medical ID upload.
2. **Verification Levels**:
   - `PENDING_REVIEW`: Account created, read-only or student-tier posting privileges.
   - `VERIFIED_DOCTOR`: Granted the Blue Stethoscope Verification Badge, clinical case publishing rights, CME hosting rights, and access to the Doctor-to-Student Mentorship program.

### B. Student Verification Pipeline
1. **Inputs Required**:
   - Discipline: MBBS / MD Candidate, Nursing (B.Sc/GNM), B.Pharm, D.Pharm, Medical Laboratory Technology (MLT).
   - College / University Name and Current Academic Year.
   - Institutional `.edu` email validation or Student Identity Card photo upload.
2. **Verification Levels**:
   - `VERIFIED_STUDENT`: Granted the Academic Caduceus Badge, student research collaboration access, fellowship and internship application privileges, and mentorship pairing.

---

## 4. Privacy, Security & Medical Compliance (HIPAA / GDPR / Ethics)
1. **Patient De-Identification Guidelines**:
   - All clinical cases and medical imaging posted in Home Feed and Medclips must comply with HIPAA Safe Harbor de-identification (removal of 18 PHI identifiers including patient names, dates of birth, MRNs, facial features, or identifying tattoos).
   - Interactive checklist required upon case publication.
2. **Device & Session Management**:
   - Slide 2 requirement: Active device tracking (IP address, device OS, last active timestamp, remote revoke session).
3. **Encrypted Media Storage**:
   - Medical licenses and student ID cards are stored in private, restricted-access buckets with presigned time-limited access URLs, audited for reviewer access.

---

## 5. Mobile Distribution & Play Store Readiness
- Package Identifier: `com.medmedia.app`
- App Architecture: React Native using Expo bare-compatible workflow.
- Native capabilities: Camera access for instant clinical documentation/verification upload, Push notifications via FCM (Firebase Cloud Messaging), Hardware video acceleration for Medclips playback.
