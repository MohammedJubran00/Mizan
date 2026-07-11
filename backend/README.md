# Mizan Backend API

Express.js + TypeScript + Prisma + PostgreSQL authentication service.

## Stack

- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT + bcrypt
- Zod validation

## Setup

1. Copy `.env.example` to `.env` and set credentials.
2. Install dependencies: `npm install`
3. Apply migrations: `npx prisma migrate deploy`
4. Generate client: `npx prisma generate`
5. Start: `npm run dev`

## Auth endpoints

### `POST /api/auth/register`

```json
{
  "fullName": "Jane Doe",
  "email": "jane@mizan.law",
  "password": "secret123"
}
```

### `POST /api/auth/login`

```json
{
  "email": "jane@mizan.law",
  "password": "secret123"
}
```

## Architecture

```
Controllers → Services → Repositories → Prisma → PostgreSQL
```

Business rules live only in the service layer.
