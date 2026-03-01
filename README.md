# PetCare Pocket

Your pet's health, simplified. A calm, mobile-first pet health record and reminder app for busy urban pet owners.

## Features

- 🐾 **Multi-pet profiles** with species, breed, weight, and emergency contacts
- 💉 **Health records**: vaccines, medications, and vet visits
- 🔔 **Smart reminders** with overdue alerts and calendar view
- 🌡️ **Symptom checker** with urgency assessment
- 🔐 **Authentication**: Email/password, Google OAuth, or Guest mode
- 🌍 **Multilingual**: English & Spanish
- 👑 **Premium tier** with feature gating
- 📱 **Native-ready** via Capacitor (iOS & Android)

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **UI**: shadcn/ui + Framer Motion
- **State**: Zustand (local) + Lovable Cloud (authenticated)
- **Backend**: Lovable Cloud (PostgreSQL, Auth, RLS)
- **Native**: Capacitor for iOS & Android

## Getting Started

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

## Environment Variables

These are automatically configured by Lovable Cloud:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

## Lovable Cloud Setup

Lovable Cloud is already enabled and provides:
- **Database**: PostgreSQL with RLS policies for all tables
- **Authentication**: Email/password + Google OAuth
- **Real-time sync**: Pets and reminders sync across devices

### Tables

| Table | Description |
|---|---|
| `profiles` | User profiles with language and subscription tier |
| `pets` | Pet profiles per user |
| `vaccines` | Vaccination records |
| `medications` | Medication tracking |
| `visits` | Vet visit records |
| `symptom_logs` | Symptom check history |
| `reminders` | Reminder system with completion tracking |

## Stripe Setup (Premium)

1. Enable Stripe integration in Lovable
2. Create products and prices in Stripe Dashboard
3. The app has premium gating infrastructure ready
4. Free tier: 1 pet, 10 records per category
5. Premium tier: unlimited pets, records, and cloud sync

## Native Mobile Builds

### Prerequisites

- Node.js 18+
- For iOS: macOS with Xcode 15+
- For Android: Android Studio with SDK 34+

### Build Steps

```bash
# 1. Export to GitHub and clone locally
git pull

# 2. Install dependencies
npm install

# 3. Build the web app
npm run build

# 4. Add native platforms
npx cap add ios
npx cap add android

# 5. Sync web assets to native
npx cap sync

# 6. Open in native IDE
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

### iOS Build

1. Run `npx cap open ios`
2. In Xcode, select your team in Signing & Capabilities
3. Set the Bundle Identifier to `app.lovable.e23b6cfabab642b3b6cefd2e84fbabfd`
4. Select a real device or simulator
5. Press Cmd+R to build and run
6. For App Store: Product → Archive → Distribute App

### Android Build

1. Run `npx cap open android`
2. In Android Studio, wait for Gradle sync
3. Select a device or emulator
4. Press Run (▶)
5. For Play Store: Build → Generate Signed Bundle/APK

### Hot Reload (Development)

The `capacitor.config.json` is pre-configured with the Lovable preview URL for live reload during development. For production builds, remove the `server` block from `capacitor.config.json`.

### Push Notifications Setup

Push notifications require additional setup per platform:
- **iOS**: Enable Push Notifications capability in Xcode, configure APNs
- **Android**: Add Firebase Cloud Messaging, configure `google-services.json`
- Install `@capacitor/push-notifications` and follow the [Capacitor Push docs](https://capacitorjs.com/docs/apis/push-notifications)

## App Architecture

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui primitives
│   ├── BottomNav    # 5-tab navigation
│   ├── CalendarView # Monthly reminder calendar
│   ├── SettingsView # Settings with language + subscription
│   └── ...
├── hooks/           # Custom hooks
│   ├── useAuth      # Authentication context
│   ├── useCloudStore# Cloud CRUD operations
│   └── usePremium   # Feature gating
├── lib/             # Utilities
│   ├── store.ts     # Zustand store (guest mode)
│   ├── i18n.tsx     # Translation system
│   └── translations/# EN/ES JSON files
├── pages/           # Route pages
│   ├── Auth.tsx     # Login/signup
│   ├── Index.tsx    # Main dashboard
│   └── ResetPassword.tsx
└── integrations/    # Backend integration (auto-generated)
```
