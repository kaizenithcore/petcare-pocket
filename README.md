# PetCare Pocket

Your pet's health, simplified. A calm, mobile-first pet health record and reminder app for busy urban pet owners.

## Features

- 🐾 **Multi-pet profiles** with species, breed, weight, microchip ID, and emergency contacts
- ✏️ **Edit & delete pets** with cascade deletion of all related records
- 💉 **Health records**: vaccines, medications, and vet visits
- 🔔 **Smart reminders** with overdue alerts and calendar view
- 🌡️ **Symptom checker** with urgency assessment
- 🔐 **Authentication**: Email/password, Google OAuth, or Guest mode
- 🌍 **Multilingual**: English & Spanish (fully localized)
- 👑 **Premium tier** with feature gating and conversion banners
- 💳 **Stripe integration** for subscription payments
- ⚙️ **Cloud-synced settings**: notifications, reminder preferences, data export
- 📱 **Native-ready** via Capacitor (iOS & Android)

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **UI**: shadcn/ui + Framer Motion
- **State**: Zustand (local) + Lovable Cloud (authenticated)
- **Backend**: Lovable Cloud (PostgreSQL, Auth, RLS, Edge Functions)
- **Payments**: Stripe (subscriptions)
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

## Plan Logic

### Free Plan
- 1 pet maximum
- 10 records per category (vaccines, medications, visits)
- Basic reminders only
- Conversion banners visible

### Premium Plan ($4.99/month)
- Unlimited pets
- Unlimited records
- Advanced recurring reminders
- No banners/ads
- Cloud sync across devices

When a free user hits a limit, a calm modal appears showing premium benefits with an upgrade CTA.

## Stripe Setup

1. Enable Stripe integration in Lovable
2. Create a subscription product and price in Stripe Dashboard
3. Set the `STRIPE_SECRET_KEY` secret (auto-configured by Lovable)
4. Set the `STRIPE_WEBHOOK_SECRET` secret for webhook validation
5. Configure webhook endpoint in Stripe Dashboard pointing to the `stripe-webhook` edge function

### Webhook Events

The webhook handles these events:
- `checkout.session.completed` — Activates premium subscription
- `customer.subscription.updated` — Updates subscription status
- `customer.subscription.deleted` — Reverts to free plan
- `invoice.payment_failed` — Reverts to free plan

### Edge Functions

| Function | Purpose |
|---|---|
| `create-checkout-session` | Creates Stripe checkout session for authenticated users |
| `stripe-webhook` | Handles Stripe webhook events to sync subscription status |

## Lovable Cloud Setup

Lovable Cloud is already enabled and provides:
- **Database**: PostgreSQL with RLS policies for all tables
- **Authentication**: Email/password + Google OAuth
- **Real-time sync**: Pets and reminders sync across devices

### Tables

| Table | Description |
|---|---|
| `profiles` | User profiles with language, subscription tier, notification prefs |
| `pets` | Pet profiles per user |
| `vaccines` | Vaccination records (cascade delete with pet) |
| `medications` | Medication tracking (cascade delete with pet) |
| `visits` | Vet visit records (cascade delete with pet) |
| `symptom_logs` | Symptom check history (cascade delete with pet) |
| `reminders` | Reminder system with completion tracking (cascade delete with pet) |

### Profile Settings (Cloud-Synced)

| Column | Description |
|---|---|
| `notification_enabled` | Push notifications toggle |
| `reminder_default_time` | Default reminder time |
| `overdue_alerts_enabled` | Overdue alert toggle |
| `default_reminder_recurrence` | Default recurrence (none/weekly/monthly) |
| `default_snooze_duration` | Default snooze (1h/4h/1d) |
| `language` | Preferred language (en/es) |

## Native Mobile Builds

### Prerequisites

- Node.js 18+
- For iOS: macOS with Xcode 15+
- For Android: Android Studio with SDK 34+

### Build Steps

```bash
npm install
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

## App Architecture

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui primitives
│   ├── BottomNav    # 5-tab navigation
│   ├── CalendarView # Monthly reminder calendar
│   ├── EditPetDialog# Edit/delete pet with cascade
│   ├── PremiumBanner# Conversion banners for free users
│   ├── PremiumGateModal # Limit-reached upgrade modal
│   ├── SettingsView # Full settings with cloud sync
│   └── ...
├── hooks/           # Custom hooks
│   ├── useAuth      # Authentication context
│   ├── useCloudStore# Cloud CRUD + settings operations
│   └── usePremium   # Feature gating
├── lib/             # Utilities
│   ├── store.ts     # Zustand store (guest mode)
│   ├── i18n.tsx     # Translation system
│   └── translations/# EN/ES JSON files
├── pages/           # Route pages
│   ├── Auth.tsx     # Login/signup
│   ├── Index.tsx    # Main dashboard
│   └── ResetPassword.tsx
├── integrations/    # Backend integration (auto-generated)
└── supabase/
    └── functions/   # Edge functions
        ├── create-checkout-session/
        └── stripe-webhook/
```
