# Mizan Web

React + TypeScript frontend for the Mizan legal practice management platform.

## Stack

- Vite + React 19 + TypeScript
- React Router
- TanStack Query (server state)
- Zustand + `persist` (auth/session in `localStorage`)
- Tailwind CSS v4
- Axios (Bearer JWT + 401 → `/login`)
- Recharts

## Setup

```bash
cd web
npm install
npm run dev
```

Ensure the Express API is running on `http://localhost:3000` (or set `VITE_API_BASE_URL` in `.env`).

## Auth

- Login stores `accessToken`, `user`, and `workspace` via Zustand `persist` → `localStorage` key `mizan-auth`
- Requests send `Authorization: Bearer <token>` and `X-Workspace-Id`
- Any `401` clears the session and redirects to `/login`

## Screens

| Route | State |
|-------|-------|
| `/`, `/login`, `/signup` | Onboarding + auth |
| `/dashboard` | Live: stats, charts, hearings, deadlines, activity |
| `/documents` | Live: PDF library with table, filters, in-browser viewer, upload/download |
| Everything else in the sidebar | "Coming soon" placeholder |

## Documents

- Table with sortable columns, debounced search, and category/case/client filters
- In-browser PDF preview via `react-pdf` (pdf.js), with page navigation and zoom
- Files are fetched as blobs through Axios so the Bearer token applies; the same blob powers preview and download
- The route is lazy-loaded so pdf.js stays out of the initial bundle
- Uploads are PDF-only and capped by `VITE_MAX_UPLOAD_MB` (mirror the API's `MAX_UPLOAD_MB`)
