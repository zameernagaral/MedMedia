# Medmedia Native Mobile Application (Play Store Ready)

This is a **True Native Mobile Application** built with React Native and Expo (Bare / Prebuild compatible).
It compiles to 100% native Android and iOS binary bytecode — **it is NOT a web view, PWA, or `manifest.json` wrapper.**

Package ID: `com.medmedia.app`
Target Platform: Google Play Store (Android) & Apple App Store (iOS)

---

## 1. Features Implemented Matching Wireframes

- **Authentication & Verification (Slides 2, 3, 4)**:
  - Phone / Email OTP authentication
  - Google Sign-In integration
  - Doctor Verification (State Medical Council number, specialization, qualification checklist)
  - Student Verification (Discipline selector: MBBS, Nursing, B.Pharm, D.Pharm, Lab practitioner + College ID)
  - Active device & session management
- **Home Feed (Slides 5 & 7)**:
  - Medical Stories bar (Accessory feature)
  - Pure clinical feed: Text, MedTweets, Clinical case imagery, Journal citations, Diagnostic polls (No shorts/reels)
  - Header with `+` create post, Notifications, and Direct messages
- **Medclips (Slide 6)**:
  - Immersive vertical video feed
  - Channels: `social update` | `clinical updates` | `following`
  - Right interaction bar: Like, Comment, Share, Save, More (Report, Connect, Copy Link, Interested)
- **Opportunities Hub (Slides 8 & 9)**:
  - Jobs board with filters: Doctor jobs, Academic jobs, Internships, Fellowships
  - Research collaboration open calls
  - Freelance / Locum shifts
  - Events & Conferences with Venue, Date/Time, Organizer, and Contact details
  - CME Courses
- **Unified Search & Networking (Slide 10)**:
  - Search across Accounts, Communities, Associations, Posts, Jobs, and Hospitals
  - Alumni connection suggestions (same medical college / hospital)
  - Likely preferences matching engine

---

## 2. Running Locally for Development

### Prerequisites
- Node.js 18+ installed
- Expo CLI or Expo Go app on your physical Android phone (from Google Play Store)

### Steps
```bash
cd mobile
npm install
npm start
```
Scan the generated QR code using the **Expo Go** app on your Android phone to run the app immediately with live reload.

---

## 3. Building for Google Play Store (Production AAB / APK)

### Option A: Cloud Native Build with EAS (Recommended for Play Store)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo / EAS account:
   ```bash
   eas login
   ```
3. Run the automated Android Play Store build:
   ```bash
   eas build -p android --profile production
   ```
   This generates the signed `.aab` (Android App Bundle) ready for direct upload to the **Google Play Console**.

### Option B: Local Native Android Build (Bare Workflow)
Generate the complete native Android project directory:
```bash
npx expo prebuild
```
This generates the full `android/` folder with:
- `android/app/src/main/AndroidManifest.xml` (configured for `com.medmedia.app`)
- `android/build.gradle` (using Gradle 8 and Java 17)
- Native Java/Kotlin files

Then open `android/` in **Android Studio** or run:
```bash
cd android
./gradlew bundleRelease
```
The resulting `.aab` bundle will be at:
`android/app/build/outputs/bundle/release/app-release.aab`
Upload this file directly to your Google Play Console track.
