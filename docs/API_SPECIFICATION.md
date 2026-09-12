# MedMedia - REST API Specification

Base URL: `https://api.medmedia.health/v1` (Local: `http://localhost:5000/api`)

---

## 1. Authentication & Verification (`/auth`)

### `POST /auth/register`
Creates an unverified Doctor or Student account.
- **Request Body**:
  ```json
  {
    "fullName": "Dr. Sarah Jenkins",
    "email": "sarah.jenkins@hospital.org",
    "phoneNumber": "+1-555-019-2831",
    "password": "SecurePassword123!",
    "role": "DOCTOR", // or "STUDENT"
    "doctorDetails": {
      "specialization": "Interventional Cardiology",
      "qualifications": ["MBBS", "MD", "FACC"],
      "hospitalAffiliation": "St. Jude Heart Center",
      "location": "Boston, MA",
      "yearsExperience": 8,
      "medicalCouncilRegNumber": "MA-MED-49102"
    },
    "studentDetails": {
      "discipline": "MEDICAL_STUDENT", // "NURSING", "B_PHARM", "D_PHARM", "LAB_PRACTITIONER"
      "collegeName": "Harvard Medical School",
      "academicYear": 3,
      "futureSpecialty": "Neurosurgery"
    }
  }
  ```

### `POST /auth/login`
- **Request Body**: `{ "identifier": "sarah.jenkins@hospital.org", "password": "...", "device": { "name": "Pixel 8", "os": "Android 15" } }`
- **Response**: `{ "token": "jwt...", "user": { ... }, "sessionId": "..." }`

### `POST /auth/google`
OAuth 2.0 exchange for mobile and web.

### `POST /auth/verify-credentials` (Multipart Upload)
Uploads medical council certificates or student ID badges for verification.

### `GET /auth/sessions` & `POST /auth/sessions/revoke`
List and revoke active devices (Slide 2 Device Management).

---

## 2. Feed & Clinical Posts (`/posts`)

### `GET /posts`
Query params: `page`, `limit`, `tag`, `type` (`TEXT`, `TWEET`, `IMAGE_CASE`, `ARTICLE_LINK`, `CLINICAL_DISCUSSION`).
Returns paginated feed without shorts/reels.

### `POST /posts`
Create a new clinical case, medical discussion, image post, or tweet.

### `POST /posts/:id/like`, `POST /posts/:id/save`, `POST /posts/:id/comment`
Instagram/Reddit style social reactions.

---

## 3. Medclips Vertical Stream (`/clips`)

### `GET /clips`
Returns high-bitrate vertical video / clinical updates stream with author badge, audio, and clinical tags.

### `POST /clips/:id/action`
Handles: `like`, `save`, `share`, `report`, `connect`, `mark_interested`.

---

## 4. Opportunities Hub (`/opportunities`)

### `GET /opportunities/research`
List active multicenter research projects, open co-author calls, and protocols.

### `GET /opportunities/freelance`
Locum tenens, telemedicine shifts, medical writing contracts.

### `GET /opportunities/jobs`
Query filters: `category` (`DOCTOR_JOB`, `ACADEMIC_JOB`, `INTERNSHIP`, `FELLOWSHIP`), `location`, `experience`, `company`.

### `POST /opportunities/jobs/:id/apply`
Submit 1-click application using verified MedMedia profile portfolio.

### `GET /opportunities/events`
Upcoming clinical conferences, CME seminars, and webinars. Filters: `nearBy=true`, `category`.

### `GET /opportunities/courses`
CME credit courses and board review updates.

---

## 5. Unified Search & Alumni Networking (`/search`)

### `GET /search`
Query: `q`, `category` (`accounts`, `community`, `associations`, `posts`, `job_offers`, `hospitals`).

### `GET /networking/alumni`
Recommends peers from the same medical college, residency program, or hospital affiliation.
