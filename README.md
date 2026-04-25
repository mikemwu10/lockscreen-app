# 🔒 Lock Screen App

A production-ready **React Native / Expo** personal dashboard app with real-time Firebase sync. Set a custom wallpaper, manage your daily to-do list, and keep yourself motivated with a rotating quote library — all synced across devices via Firebase Auth + Firestore.

---

## 🚀 Quick Start


## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install 
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase project values 

### 3. Start the App

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS / Android) or press `i` for iOS Simulator / `a` for Android Emulator.

---

## 🔥 Firebase Setup

### Step 1 — Create a Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → follow the setup wizard
3. Register a **Web app** (the `</>` icon) to get your config keys

### Step 2 — Enable Authentication

1. In the sidebar go to **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, enable **Email/Password**

### Step 3 — Enable Firestore

1. In the sidebar go to **Build → Firestore Database**
2. Click **Create database**
3. Start in **Test mode** for development (locks down after 30 days — see Security Rules below)

### Step 4 — Security Rules (Production)

Replace the default test-mode rules with user-scoped rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

👥 Authors

- Mike Wu

- Peace Cyebukayire

- Zheyuan Lin

