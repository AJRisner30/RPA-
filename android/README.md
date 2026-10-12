# Patrol Ready Performance — Android App Build & Deployment Guide

This directory contains the production Android project files for **Patrol Ready Performance**.

---

## 1. Quickest Method: Direct Android Install (WebAPK)
- On any Android phone (Pixel, Samsung Galaxy, Motorola, etc.), open the app URL in **Google Chrome** or **Samsung Internet**.
- Tap **"Install App"** from the in-app banner or select **⋮ (Menu) -> Install app**.
- Android automatically compiles an on-device WebAPK with the **Patrol Ready** badge icon and places it directly into your Android Home Screen and App Drawer.

---

## 2. Compile Signed Android APK / Play Store Bundle (.aab) with Bubblewrap
Google provides **Bubblewrap**, the official Trusted Web Activity tool for packaging web applications for Android:

```bash
# 1. Install Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Build the signed APK & AAB
bubblewrap build --manifest android/twa-manifest.json

# 3. Output files:
#  - app-release-signed.apk -> Direct sideload install on any Android phone
#  - app-release-bundle.aab -> Direct upload to Google Play Console
```

---

## 3. Open in Android Studio
1. Open **Android Studio**.
2. Select **Open an existing project** and choose the `android` folder.
3. Sync Gradle and click **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.

---

## 4. Key Android Native Capabilities Enabled
- **Adaptive Maskable Icons**: Conforms to Android 14+ squircle/round adaptive masks (`/pwa-maskable-512x512.png`).
- **Tactile Haptics**: Vibration patterns on workouts, set completions, and rest timer intervals.
- **Screen Wake-Lock**: Keeps Android display awake during training sessions (`navigator.wakeLock`).
- **Hardware Back Button Handling**: Edge-swipe back gesture closes modals and sheets rather than navigating away.
- **Android Home Screen Shortcuts**: Long-press icon for **Workouts**, **Officer Portal**, and **Readiness Test**.
