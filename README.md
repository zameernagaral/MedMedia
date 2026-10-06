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
│   │   └── server.ts            # Express server (Port 5001)
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
└── mobile/                      # Expo / React Native prototype (not store-ready)
    ├── src/
    │   └── screens/             # HomeScreen, MedclipsScreen, OpportunitiesScreen, SearchScreen, ProfileScreen, AuthScreen
    ├── app.json                 # Expo app configuration (package: com.medmedia.app)
    ├── README.md                # Mobile implementation status and prototype build guide
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Backend Server (Port 5001)
```powershell
Copy-Item backend/.env.example backend/.env
# Set DATABASE_URL to a reachable MySQL database and JWT_SECRET to a random
# value of at least 32 characters in backend/.env.
npm.cmd --prefix backend install
npm.cmd --prefix backend run db:generate
npm.cmd --prefix backend run db:migrate:dev
npm.cmd --prefix backend run dev
```
Healthcheck: `http://localhost:5001/health` (database readiness: `/api/ready`)
Posts API: `http://localhost:5001/api/posts`

### 2. Web Application (Port 3000)
```powershell
npm.cmd --prefix web install
npm.cmd --prefix web run dev
```
Preview production build:
```powershell
npm.cmd --prefix web run preview -- --port 3000 --host
```
Open in browser: `http://localhost:3000/`

### Railway Production Deployment

Railway uses the repository-root `Dockerfile` as the single production build/start strategy. The image builds the React site and TypeScript API, generates Prisma Client, applies checked-in migrations with `prisma migrate deploy`, and starts the API, which serves both `/api` and the built SPA. It listens on Railway's injected `PORT` and binds to `0.0.0.0`.

1. Connect this GitHub repository to Railway and create a MySQL service.
2. Add an application service from the repository. Keep the Dockerfile builder selected; do not override the image start command.
3. Set `DATABASE_URL` to a private Railway variable reference such as `${{MySQL.MYSQL_URL}}` (replace `MySQL` with your service name), `JWT_SECRET` to a cryptographically random value of at least 32 characters, and `NODE_ENV=production`. Railway supplies `PORT` automatically.
4. To enable media uploads, set `CLOUDINARY_URL` in the application service. Production uploads return `503` when persistent storage is not configured; the app never stores production media on the ephemeral Railway filesystem.
5. Same-origin web traffic needs no CORS entry. For separately hosted clients, set `CORS_ORIGINS` to a comma-separated allowlist of exact HTTPS origins. Keep `USE_REDIS=false` unless a Railway Redis service is connected; if enabled, set `REDIS_URL` or `REDIS_HOST` (and optionally `REDIS_PORT`/`REDIS_PASSWORD`).
6. Deploy from the repository root. The container runs migrations on startup; it does not reset or seed the database. Do not run `prisma db push --force-reset` against production.
7. Generate a Railway public domain (or attach your custom domain), then verify `https://<domain>/api/health` and load the frontend at `https://<domain>/`.

Troubleshooting: a startup failure before listening usually indicates missing/invalid `DATABASE_URL` or `JWT_SECRET`; check Railway deployment logs without pasting secrets. Migration failures require resolving the migration/database state before retrying. Uploads require Cloudinary. `/api/ready` checks MySQL and checks Redis only when `USE_REDIS=true`.

For local backend setup, copy `backend/.env.example` to `backend/.env`, configure a reachable MySQL database, and use private local-only credentials. Never commit `.env` files.

Backend configuration: `DATABASE_URL` (MySQL), `JWT_SECRET` (at least 32 characters), `NODE_ENV`, `PORT`, `CORS_ORIGINS`, `USE_REDIS`, and `PUBLIC_SITE_URL` after the public HTTPS domain is set. Set `CLOUDINARY_URL` to enable persistent media uploads; `REDIS_URL` or `REDIS_HOST` is needed only when `USE_REDIS=true`. Web `VITE_API_URL` is optional; the default `/api` is served by the backend in production and proxied by Vite in development. Native builds use `EXPO_PUBLIC_API_URL` with the backend URL including `/api`; mobile authentication and store release are not ready yet.

For a fresh MySQL database, run `npm.cmd --prefix backend run db:generate` and then `npm.cmd --prefix backend run db:migrate:dev`. Production deployment uses `prisma migrate deploy` at container startup. Never run `prisma db push --force-reset` against a database containing data.

The checked-in MySQL baseline migration is intended for a fresh database. If a production database already contains MedMedia tables or data but does not have this migration history, stop and review the migration baseline before deploying; do not mark migrations applied or reset the database blindly.

### 3. Native Mobile Prototype (Not Store Ready)
```powershell
cd mobile
npm.cmd install
npm.cmd start
```
- **Live Preview**: Scan the QR code using the **Expo Go** app on your Android device.
- **Development artifact only** (a successful build is not release approval):
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
| **Slide 1 & 2** | Sign in / registration and account verification | Web email/password auth connects to the backend. Google, OTP, recovery and credential review are incomplete. Mobile auth is UI-only; see `mobile/README.md`. |
| **Slide 3** | Doctor Profile & Verification: Name, Specialization, Photo, Qualifications, Hospital, Location, Experience, Interests, Research, Follow/connect, Posts | Doctor portfolio (`ProfileView.tsx`, `ProfileScreen.tsx`, `/api/users/:id`), verification badge |
| **Slide 4** | Student Profile & Verification: MBBS, Nursing, B.Pharm, D.Pharm, Lab practitioner, College, Year, Future specialty, Device mgmt, Help center | Student portfolio (`ProfileView.tsx`, `ProfileScreen.tsx`), Help center FAQ, session revocation |
| **Slide 5** | Home page: Create (+), Medmedia, Notification, Message, StoriesBar, Feed (Text, tweets, Images, Links, Discussions - No reels), Bottom Bar (5 tabs) | `TopNav.tsx`, `StoriesBar.tsx`, `PostCard.tsx`, `BottomNav.tsx` with diagnostic case poll |
| **Slide 6** | Medclips: social update / clinical updates / following, side actions (Like, comment, Share, Save, more: Report, Connect, copy link, Interested), Name, Follow, Caption | Immersive vertical player (`MedclipsPlayer.tsx`, `MedclipsScreen.tsx`, `/api/clips`) |
| **Slide 7** | Post in home page: Name/follow, Like/comment/save/share, more | Instagram/Reddit style social reactions with threaded comments and link copies |
| **Slide 8** | Opportunities: Research projects, Free lancing, Job offers, Community, Networks, Courses, Events (Venue, Time, Date, Organizer, Contact) | Tabbed opportunities hub (`OpportunitiesHub.tsx`, `OpportunitiesScreen.tsx`, `/api/opportunities`) |
| **Slide 9** | Jobs: Doctor jobs, academic jobs, Internship, fellowship; Filters (Company, Type, Place, Experience), Job overview, Education, Skills | Filterable job board with 1-click verified application (`JobDetailModal.tsx`) |
| **Slide 10** | Search bar: Accounts, community, associations, posts, jobs, Hospital; Networking: Likely preference, Alumni connection; Community branches | Live search engine with alumni matching & state chapters (`SearchAndNetworking.tsx`) |
