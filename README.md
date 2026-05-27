# MealsToGo

Food ordering on-the-go — Expo 56 + NativeWind + Clerk + Firebase + Xendit.

## Setup

1. Copy `.env.example` to `.env` and fill in Clerk + Firebase keys.
2. `npm install`
3. `npm start` — mobile | `npm run web` — includes admin at `/admin`

### Clerk

- Enable Email/Password and OAuth (e.g. Google) in Clerk dashboard.
- Set `publicMetadata.role` to `"admin"` for admin users.

### Firebase

- Create a Firebase project and add a web app.
- Deploy rules: `firebase deploy --only firestore:rules`
- Deploy functions (set secrets first):

```bash
cd functions && npm install && npm run build
firebase functions:secrets:set CLERK_SECRET_KEY
firebase functions:secrets:set XENDIT_SECRET_KEY
firebase functions:secrets:set XENDIT_WEBHOOK_VERIFICATION_TOKEN
firebase deploy --only functions
```

### Xendit (server only — jangan masuk `.env` Expo)

1. Copy `functions/.env.example` → `functions/.env`
2. Isi:
   - `XENDIT_SECRET_KEY` = secret key development (`xnd_development_...`) dari [Xendit Dashboard](https://dashboard.xendit.co/settings/developers#api-keys)
   - `CLERK_SECRET_KEY` = sama seperti di Clerk Dashboard (Development)
   - `XENDIT_WEBHOOK_VERIFICATION_TOKEN` = dari Xendit webhook settings (setelah deploy)

3. Deploy + set secrets production:
```bash
firebase functions:secrets:set XENDIT_SECRET_KEY
firebase functions:secrets:set CLERK_SECRET_KEY
firebase functions:secrets:set XENDIT_WEBHOOK_VERIFICATION_TOKEN
```

Webhook URL: `https://us-central1-mealstogo-d77b1.cloudfunctions.net/xenditWebhook`

### `.env` root (Expo app saja)

Hanya variabel `EXPO_PUBLIC_*`. Isi `EXPO_PUBLIC_FIREBASE_API_KEY` dari Firebase Console (satu field yang masih kosong di `.env` lu).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Auth redirect |
| `/(tabs)` | Restaurants, Offers, Account |
| `/admin` | Web-only admin (master data) |
| `/map` | Leaflet map of restaurants |

## Map center (seed)

Default cluster: `-6.245775, 106.986666` (Bekasi area).
