# medsys-api Backend Setup Guide

Production-oriented medical backend built with NestJS (Fastify), Prisma, and PostgreSQL.

## 1. Required Downloads

Install these before setup:

1. Git
- Website: `https://git-scm.com/downloads`

2. Node.js 20 LTS
- Website: `https://nodejs.org/en/download`
- Verify:
```powershell
node -v
npm -v
```

3. Docker Desktop (recommended for PostgreSQL)
- Website: `https://www.docker.com/products/docker-desktop/`
- Verify:
```powershell
docker --version
docker compose version
```

Optional if you do not want Docker:
- PostgreSQL 16+
- Website: `https://www.postgresql.org/download/windows/`

## 2. Clone and Open Project

```powershell
git clone <YOUR_REPO_URL>
cd MEDSYS-BACKEND\medsys-api
```

## 3. Install Dependencies

```powershell
npm install
```

## 4. Configure Environment

Create `.env` from template:

```powershell
Copy-Item .env.example .env
```

Ensure `.env` contains valid values:

```env
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsys_api?schema=public
JWT_ACCESS_SECRET=replace_with_long_random_secret_1
JWT_REFRESH_SECRET=replace_with_long_random_secret_2
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## 5. Start PostgreSQL

### Option A: Docker (recommended)

```powershell
docker compose up -d
docker ps
```

You should see container `medsys-postgres` with port `5432`.

### Option B: Local PostgreSQL install

Create database:

```sql
CREATE DATABASE medsys_api;
```

Update `DATABASE_URL` in `.env` with your username/password.

## 6. Run Prisma Migration and Seed

From `medsys-api` directory:

```powershell
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

If this is a fresh dev reset:

```powershell
npx prisma migrate reset
npm run prisma:seed
```

## 7. Start Backend API

```powershell
npm run start:dev
```

Expected base URL:

- `http://localhost:4000/api/v1`

Swagger:

- `http://localhost:4000/api/v1/docs`

Health checks:

- `GET http://localhost:4000/api/v1/health`
- `GET http://localhost:4000/api/v1/health/ready`

## 8. First Endpoint Test (End-to-End)

1. Login in Swagger:
- `POST /api/v1/auth/login`
- Body example:
```json
{
  "email": "owner1@medsys.local",
  "password": "ChangeMe123!"
}
```

2. Copy `accessToken` from response.

3. Click `Authorize` in Swagger and paste token.

4. Test protected endpoint:
- `GET /api/v1/users`

If token and role are correct, response should be `200`.

## 9. Seeded Demo Accounts

Created by `prisma/seed.ts`:

- Owners: `owner1@medsys.local`, `owner2@medsys.local`
- Doctors: `doctor1@medsys.local` ... `doctor5@medsys.local`
- Assistants: `assistant1@medsys.local` ... `assistant5@medsys.local`
- Default password for all: `ChangeMe123!`

## 10. Implemented Endpoint List

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users` (owner)
- `POST /api/v1/users` (owner)
- `GET /api/v1/patients`
- `POST /api/v1/patients`
- `PATCH /api/v1/patients/:id`
- `GET /api/v1/appointments`
- `POST /api/v1/appointments`
- `PATCH /api/v1/appointments/:id`
- `POST /api/v1/encounters`
- `POST /api/v1/encounters/:id/diagnoses`
- `POST /api/v1/encounters/:id/tests`
- `POST /api/v1/prescriptions`
- `GET /api/v1/prescriptions/:id`
- `GET /api/v1/inventory`
- `POST /api/v1/inventory`
- `POST /api/v1/inventory/:id/movements`
- `GET /api/v1/analytics/overview`
- `GET /api/v1/audit/logs` (owner)
- `GET /api/v1/health`
- `GET /api/v1/health/ready`

## 11. Frontend Connection

In frontend `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

## 12. Useful Commands

```powershell
npm run lint
npm run build
npx prisma studio
```

## 13. Troubleshooting

1. `docker : The term 'docker' is not recognized`
- Install Docker Desktop and restart terminal/PC.

2. `Configuration key "JWT_ACCESS_SECRET" does not exist`
- `.env` is missing or invalid. Copy from `.env.example`.

3. `ERROR: type "citext" does not exist`
- Migration script now creates extension automatically.
- If DB is in failed state, run:
```powershell
npx prisma migrate reset
```

4. Swagger `401 Unauthorized`
- Login first via `/auth/login`.
- Click `Authorize`.
- Use owner token for `/users`.

5. Running Prisma from wrong directory
- Always run Prisma commands inside `medsys-api`.
