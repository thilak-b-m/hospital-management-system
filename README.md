# CityCare Hospital Management System

A role-based hospital management app with a React/Vite client and an Express, MongoDB, and Socket.IO server.

## Requirements

- Node.js 20.19+ (or 22.12+) and npm
- A reachable MongoDB database

## Configuration

Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Set the actual database connection string and a long random JWT secret in the server file; keep both `.env` files private and out of source control.

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<at-least-32-random-characters>
PORT=5000
CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

For production, set `CLIENT_ORIGINS` to the exact frontend origins and set `VITE_API_URL` and `VITE_SOCKET_URL` to the deployed API origin before building the client. The server ignores `/uploads/` because those files may contain protected health information.

For MongoDB Atlas, add the machine's current public IP to the project's Network Access IP Access List and confirm the database user's credentials and permissions. A connection failure during seeding means the account has not been created yet.

## Run Locally

In one terminal:

```powershell
cd server
npm install
npm run seed:admin
npm run dev
```

In another terminal:

```powershell
cd client
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. The API runs on port `5000` by default.

The API only begins listening after MongoDB connects. Use `/health/live` for process liveness and `/health/ready` for database readiness; readiness returns HTTP 503 until the database is connected.

## Patient Appointments and Profiles

- Appointment booking only accepts today or a future date. Past dates are rejected by both the booking form and API; booking a slot that has already passed today is also rejected. The API uses `Asia/Kolkata` as its hospital time zone by default. Set `HOSPITAL_TIME_ZONE` in `server/.env` to an IANA time zone identifier if the hospital is in another time zone.
- Doctors can block dates from their schedule. Expired blocked dates are removed from the active blocked list and retained as past-block history in the calendar.
- Patients receive in-app notifications on the day before and the day of appointments that are pending or confirmed. These reminders appear in the application notification center; they are not email or SMS messages.
- Patient signup collects date of birth, gender, and address. Patients can review and update these details in their profile.

## Initial Admin Login

| Field | Value |
| --- | --- |
| Role | Admin |
| Email | `admin@citycare.com` |
| Password | `CityCareAdmin#2026!` |

Select **Admin** on the login screen. The seed is safe to rerun: it creates the account only when that email is absent and does not reset an existing account's password. To use different initial credentials, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` before running `npm run seed:admin`; passwords must be at least 8 characters.

These are development bootstrap credentials stored here at the project's request. Do not use them for a public deployment. Configure a private password before deploying, and keep production credentials out of source control.

## Checks

From `client/`, run `npm run lint` and `npm run build`. From `server/`, run `npm test` for database-independent health endpoint checks. The data-backed end-to-end verifier in `scripts/e2e_verify.mjs` requires a running server and seeded doctor/patient records; it creates test records and should only be run against a disposable test database.

The optional `server/seed_test.js` demo-data script requires a separate `TEST_MONGO_URI` targeting an isolated disposable database. It never falls back to `MONGO_URI` or a default local database. The end-to-end verifier accepts `API_BASE` so it can be pointed at a test server without changing the default development endpoint.
