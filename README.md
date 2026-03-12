# PGAD Mobile App

[![Expo](https://img.shields.io/badge/Expo-54-000020.svg?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb.svg?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Platform iOS](https://img.shields.io/badge/platform-iOS-000000.svg?logo=apple)](https://developer.apple.com)
[![Platform Android](https://img.shields.io/badge/platform-Android-3ddc84.svg?logo=android)](https://developer.android.com)

## 📌 Executive Summary

The **Personalized Gait Anomaly Detection (PGAD) Mobile App** is a cross-platform React Native application built with **Expo 54** that enables caretakers to monitor elderly patients' gait activity, visualize real-time telemetry, and receive anomaly alerts. The application interfaces directly with **ESP32-C3 edge devices** over BLE and subscribes to live metric streams via the MQTT broker, forming the patient-facing layer of the broader PGAD system.

## 🏗️ Architecture & System Integration

The mobile app operates as the primary user interface within the PGAD IoT-cloud pipeline:

* **BLE Edge Interface (ESP32-C3 + BNO085):** Connects directly to wearable IMU sensors using `react-native-ble-plx`, receiving serialized kinematic frames and relaying them upstream to the cloud backend.
* **Real-Time Telemetry (MQTT):** Subscribes to live gait metric topics via `precompiled-mqtt`, rendering sensor streams with low latency for immediate clinical feedback.
* **REST API Integration:** Communicates with the PGAD FastAPI backend for authentication, patient profile management, and historical metric retrieval using short-lived JWTs stored in `expo-secure-store`.
* **State Management (Zustand):** Maintains BLE device state, patient session context, and UI state through lightweight, atomic Zustand stores.
* **File-Based Routing (Expo Router):** Implements a structured navigation hierarchy with protected routes, tab layouts, and deep-linking support via `expo-router`.

## 🛡️ Security & Access Control

* **Role-Based Access:** Enforces strict `Caretaker` / `Patient` domain separation at the API boundary, with all token management handled via secure storage — never plain AsyncStorage.
* **BLE Permissions:** Declares `NSBluetoothAlwaysUsageDescription` and `bluetooth-central` background mode on iOS; runtime Bluetooth and location permissions are requested on Android.
* **New Architecture Enabled:** The app runs on React Native's New Architecture (`newArchEnabled: true`) with Reanimated 4 and Worklets for GPU-accelerated animations without bridge overhead.

## 🚀 Local Environment Provisioning

### Prerequisites

Ensure your local development environment meets the following specifications:

* [Node.js 18+](https://nodejs.org) and npm
* [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
* **iOS:** macOS with Xcode 15+ and CocoaPods (`sudo gem install cocoapods`)
* **Android:** Android Studio with a configured SDK and emulator, or a physical device with USB debugging enabled

### 1. Install Dependencies

```bash
npm install
```

### 2. iOS Build

Install native CocoaPods dependencies, then launch the app on a simulator or connected device:

```bash
npx pod-install
npx expo run:ios
```

> To target a specific simulator, append `--device` to select interactively, or pass `--simulator "iPhone 16"`.

### 3. Android Build

```bash
npx expo run:android
```

> Ensure `ANDROID_HOME` is set and an emulator is running (or a physical device is connected via ADB) before executing the build.

### 4. Development Server (Expo Go / Tunnel)

For rapid iteration without a full native build:

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your device, or press `i` / `a` to open in a simulator.

## 🤝 Contribution Standards

All commits must adhere to our quality gates:

* Execute `npx expo lint` and resolve all ESLint violations prior to staging.
* TypeScript strict mode is enforced — no `any` escapes without justification.
* BLE and MQTT logic must remain isolated within `hooks/` and `store/` — do not call native modules directly from screen components.

