# MED MEDIA - Healthcare Professional & Student Platform

**MedMedia** is a dedicated, verified healthcare ecosystem specifically engineered for **Doctors** (Consultants, Specialists, Surgeons) and **Healthcare Students** (Medical/MBBS, Nursing, B.Pharm, D.Pharm, and Allied Lab Practitioners).

---

## 📁 Project Architecture

```
medical/
├── docs/                        # Complete Technical Specs & Schemas
│   ├── ARCHITECTURE.md          # Multi-tier System Architecture, HIPAA & Ethics
│   ├── DATABASE_SCHEMA.sql      # Production PostgreSQL relational schema (Prisma/SQL)
│   └── API_SPECIFICATION.md     # REST endpoints & authentication protocols
│
├── backend/                     # Node.js + Express REST API Server
│   ├── prisma/
│   │   └── schema.prisma        # Prisma ORM schema
│   ├── src/
│   │   ├── routes/              # auth, posts, clips, opportunities, users, search
│   │   ├── data/mockDb.ts       # Realistic clinical seed data
│   │   └── server.ts            # Express server (Port 5000)
│   └── package.json
│
├── web/                         # Responsive Web Platform (React 19 + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopNav.tsx       # Logo, Create (+), Notifications, Messages, Persona Switch
│   │   │   ├── BottomNav.tsx    # Slide 5: Home, Medclips, Search, Opportunities, Profile
│   │   │   ├── StoriesBar.tsx   # Slide 5: Story updates (Accessory feature)
│   │   │   ├── PostCard.tsx     # Slides 5 & 7: Case polls, tweets, images, links (No reels)
│   │   │   ├── MedclipsPlayer.tsx # Slide 6: Vertical video/clinical clips + side actions
│   │   │   ├── OpportunitiesHub.tsx # Slides 8 & 9: Jobs, Research, Locum, Events, Courses
│   │   │   ├── ProfileView.tsx  # Slides 3 & 4: Doctor & Student verified portfolios
│   │   │   ├── SearchAndNetworking.tsx # Slide 10: Multi-entity search & Alumni engine
│   │   │   ├── AuthModal.tsx    # Slides 2, 3, 4: Doctor vs Student verification upload
│   │   │   └── CreatePostModal.tsx # Create + modal with HIPAA consent
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── mobile/                      # True Native Mobile App (React Native / Expo Prebuild)
    ├── src/
    │   └── screens/             # HomeScreen, MedclipsScreen, OpportunitiesScreen, SearchScreen, ProfileScreen, AuthScreen
    ├── app.json                 # Google Play Store config (package: com.medmedia.app, permissions)
    ├── README.md                # Play Store .aab / .apk compilation guide
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Backend Server (Port 5000)
```powershell
cd backend
npm.cmd install
npm.cmd start
```
Healthcheck: `http://localhost:5000/api/health`
Posts API: `http://localhost:5000/api/posts`

### 2. Web Application (Port 3000)
```powershell
cd web
npm.cmd install
npm.cmd run dev
```
Preview production build:
```powershell
npm.cmd run preview -- --port 3000 --host
```
Open in browser: `http://localhost:3000/`

### 3. Native Android Mobile App (Play Store Ready)
```powershell
cd mobile
npm.cmd install
npm.cmd start
```
- **Live Preview**: Scan the QR code using the **Expo Go** app on your Android device.
- **Google Play Store Build**:
  ```powershell
  # Generate native Android project with AndroidManifest.xml & Gradle
  npx.cmd expo prebuild
  
  # Or generate direct signed .aab bundle via EAS:
  eas.cmd build -p android --profile production
  ```

---

## 📑 Feature Mapping to Specification Wireframes

| Slide | Requirement | Implementation |
|---|---|---|
| **Slide 1 & 2** | Playstore download, Sign in / Log in, Phone/email, Google login, Password recovery, Device/session management | Complete auth module (`AuthModal.tsx`, `AuthScreen.tsx`, `/api/auth/login`, `/api/auth/sessions`) |
| **Slide 3** | Doctor Profile & Verification: Name, Specialization, Photo, Qualifications, Hospital, Location, Experience, Interests, Research, Follow/connect, Posts | Doctor portfolio (`ProfileView.tsx`, `ProfileScreen.tsx`, `/api/users/:id`), verification badge |
| **Slide 4** | Student Profile & Verification: MBBS, Nursing, B.Pharm, D.Pharm, Lab practitioner, College, Year, Future specialty, Device mgmt, Help center | Student portfolio (`ProfileView.tsx`, `ProfileScreen.tsx`), Help center FAQ, session revocation |
| **Slide 5** | Home page: Create (+), Medmedia, Notification, Message, StoriesBar, Feed (Text, tweets, Images, Links, Discussions - No reels), Bottom Bar (5 tabs) | `TopNav.tsx`, `StoriesBar.tsx`, `PostCard.tsx`, `BottomNav.tsx` with diagnostic case poll |
| **Slide 6** | Medclips: social update / clinical updates / following, side actions (Like, comment, Share, Save, more: Report, Connect, copy link, Interested), Name, Follow, Caption | Immersive vertical player (`MedclipsPlayer.tsx`, `MedclipsScreen.tsx`, `/api/clips`) |
| **Slide 7** | Post in home page: Name/follow, Like/comment/save/share, more | Instagram/Reddit style social reactions with threaded comments and link copies |
| **Slide 8** | Opportunities: Research projects, Free lancing, Job offers, Community, Networks, Courses, Events (Venue, Time, Date, Organizer, Contact) | Tabbed opportunities hub (`OpportunitiesHub.tsx`, `OpportunitiesScreen.tsx`, `/api/opportunities`) |
| **Slide 9** | Jobs: Doctor jobs, academic jobs, Internship, fellowship; Filters (Company, Type, Place, Experience), Job overview, Education, Skills | Filterable job board with 1-click verified application (`JobDetailModal.tsx`) |
| **Slide 10** | Search bar: Accounts, community, associations, posts, jobs, Hospital; Networking: Likely preference, Alumni connection; Community branches | Live search engine with alumni matching & state chapters (`SearchAndNetworking.tsx`) |
