# DoctorTracker hosting status (14 October 2026)

Frontend repository: https://github.com/sajeeb-ahmeed/Doctor-Tracker-Portal

Backend repository: https://github.com/sajeeb-ahmeed/Doctor-Tracker-API

## Verified infrastructure

- Express REST API is deployed on Render: https://doctor-tracker-api-tg86.onrender.com
- Public health endpoint: https://doctor-tracker-api-tg86.onrender.com/api/health
- Render deployment reported `live` after successful TypeScript compilation, MongoDB connection, and application startup.
- MongoDB Atlas project `Doctor-Tracker-Portal`, cluster `Cluster0`, database `doctor_tracker`.
- Dedicated MongoDB user `doctortracker_service` has database-specific `readWrite` permission.
- The seeded database contains 14 synthetic doctors and 84 synthetic patients.
- Netlify project `doctor-tracker-portal` exists, and its `BACKEND_URL` environment variable points to the Render API with build and runtime scopes.

## Frontend deployment

Target URL: https://doctor-tracker-portal.netlify.app

The frontend must be deployed from this repository's `main` branch **after**
`BACKEND_URL` is set, because Next.js resolves the API rewrite when building.
A configured project URL is not itself proof that deployment or login succeeded.

## Final acceptance checklist

- Verify Netlify deployment is published and serves the Next.js login route.
- Verify `/api/health` on the frontend forwards successfully to Render.
- Verify signed-out users cannot open `/dashboard`.
- Verify login, dashboard data, doctor/patient workflows, search, pagination and logout.
- Confirm responsive mobile layout and that the public demo contains **synthetic** records only.
- Restrict Atlas network access when stable egress is available, and remove unused DB users.

Secrets (session secret, MongoDB URI, and admin password) belong in hosting
environment settings only. Never commit them to the repositories.
