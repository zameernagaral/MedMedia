# MedMedia Native Mobile Application (Expo Prototype)

This folder contains an Expo and React Native prototype. Its screens render as a native app, but the app is **not production-ready and must not be described or distributed as Play Store ready**.

## Current implementation status

- The app starts with seeded doctor and student profiles. The persona switch is a demo control.
- Login and registration are UI-only. They do not authenticate against the backend or restore a server session.
- Feed, Medclips, opportunities, notifications, messages, and several profile actions still use sample data or demo alerts. The small API client is not a complete app integration.
- Google sign-in, OTP/recovery, credential upload, secure session storage, and push notifications are not implemented end to end.
- The backend currently uses an HTTP-only cookie for web sessions. A native app needs a deliberate token/session flow and secure device storage before its auth UI can be connected safely.

Treat mobile data and actions as demonstrations until each screen is connected to an authenticated API and verified against real backend records.

Package ID: `com.medmedia.app`
Intended platforms: Android and iOS. Store release readiness has not been verified.

## Prototype screens

Native screen components exist for authentication, feed, Medclips, search, opportunities, and profile. The home screen can request posts from the API, but the main app flow currently uses seeded data and demo behavior. These are UI prototypes; they do not imply that workflows persist data or work with real accounts.

## Run locally

Prerequisites: Node.js and Expo Go or a native development build.

```powershell
cd mobile
npm.cmd install
npm.cmd start
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to the backend API URL for a physical device or production build. Development defaults only work for an Android emulator (`10.0.2.2`) or a local iOS simulator (`localhost`).

## Build status

An EAS project configuration (`eas.json`) is not present, and a mobile production build has not been verified. Set up development and production build profiles only after the mobile authentication and data flows are implemented. A successful binary build would still require store release QA.
