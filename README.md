# Mizan — Legal Practice Management

Full-stack authentication module for Mizan.

## Structure

```
lawyer/
├── backend/   # Express.js + TypeScript + Prisma + PostgreSQL
└── frontend/  # Flutter (Material 3, Clean Architecture)
└── web/       # React
```

## Backend quick start

```bash
cd backend
cp .env.example .env   # already configured for local DB if present
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

API: `http://localhost:3000`

- `POST /api/auth/register`
- `POST /api/auth/login`

## Frontend quick start

```bash
cd frontend
flutter pub get
flutter run -d chrome   # or windows / android
```

Flow: Onboarding → Sign Up / Login → Home

OAuth / SSO / social login are intentionally not included.
