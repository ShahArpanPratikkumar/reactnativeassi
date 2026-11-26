# Travel Guardian 🛡️

A modern mobile travel safety application built with React Native and Expo. Travel Guardian provides real-time emergency readiness, offline safety tools, secure media vaulting, itinerary tracking, and nearby safety zones for travelers.

---

## Features

- **Emergency SOS Response**: One-tap emergency distress siren with auto-looping audio, native emergency contact dialer, and live GPS broadcast.
- **Live Safety Map & Nearby Places**: Real-time OpenStreetMap Overpass queries showing nearby hospitals, police stations, pharmacies, and fire stations with true GPS distances and navigation directions.
- **Live Location Tracking**: Accurate device location monitoring with reverse geocoding, coordinates display, and native share sheet integration.
- **Camera & Media Vault**: Rapid photo and evidence video recording with in-app playback, local encrypted AsyncStorage vault, and device gallery export.
- **Emergency Contacts**: Device phonebook integration, custom emergency contacts management, primary SOS contact selection, and direct native phone dialer launching.
- **Travel Documents**: Categorized document storage with camera scanning, PDF/image viewing, search filtering, and offline local cache.
- **Travel Status & Vehicle Selection**: Active trip tracking with 10 vehicle modes (Car, Bike, Bus, Train, Flight, Taxi, Walking, Bicycle, Auto Rickshaw, Other).
- **Local Travel Reminders**: Device notifications for scheduled itinerary checkpoints and safety reminders.
- **Theme Support**: Seamless light and modern navy dark theme switching with persistent storage.

---

## Tech Stack

- **Frontend**: React Native 0.88, Expo SDK 58, Expo Router (file-based navigation)
- **Maps & Location**: `react-native-maps`, `expo-location`, OpenStreetMap Overpass API
- **Media & Audio**: `expo-camera`, `expo-video`, `expo-audio`, `expo-media-library`
- **Storage**: `@react-native-async-storage/async-storage`, `expo-secure-store`
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication

---

## Project Structure

```text
TravelGuardian/
├── app/                    # Expo Router file-based routes
│   ├── (auth)/             # Login and registration screens
│   ├── (tabs)/             # Main tab navigation (Home, Map, Camera, Contacts, Profile)
│   ├── documents/          # Travel documents and document scanner
│   ├── media/              # Media evidence vault and player
│   ├── sos/                # Emergency response and siren screen
│   └── trips/              # Itinerary planning, vehicle selection, and details
├── components/             # Reusable UI components
│   ├── common/             # Buttons, headers, loaders, empty states, toasts
│   ├── camera/             # Media items and video player
│   └── contacts/           # Contact item cards
├── constants/              # Centralized colors, vehicles, and app configuration
├── context/                # React Context (ThemeContext, UserContext)
├── hooks/                  # Custom hooks (useLocation, useTheme)
├── services/               # API, auth, trips, places, and vault services
├── utils/                  # Reusable utilities (phone dialer, location, validation, storage)
├── backend/                # Express & MongoDB REST API server
└── assets/                 # App icons, splash images, and audio siren
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- Expo Go app on iOS/Android or an emulator

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The server will start on `http://localhost:5001` (or `http://YOUR_LOCAL_IP:5001`).

### 3. Frontend Setup
```bash
npm install
npx expo start
```
Scan the QR code with your mobile device (via Expo Go) or press `a` for Android Emulator / `i` for iOS Simulator.
