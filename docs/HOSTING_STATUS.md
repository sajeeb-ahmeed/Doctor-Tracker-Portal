# DoctorTracker verified live deployment (14 October 2026)

## Working public URLs

- **Premium Next.js frontend:** https://doctor-tracker-frontend.onrender.com/login
- **Express API health:** https://doctor-tracker-api-tg86.onrender.com/api/health
- **Frontend GitHub repository:** https://github.com/sajeeb-ahmeed/Doctor-Tracker-Portal
- **Backend GitHub repository:** https://github.com/sajeeb-ahmeed/Doctor-Tracker-API

Both application services run on the Render Free plan. The frontend's server-side
`BACKEND_URL` is configured for the separate Render Express API. Render's
`FRONTEND_ORIGIN` accepts the verified Render frontend and the reserved Netlify origin.

MongoDB Atlas cluster `Cluster0` within project `Doctor-Tracker-Portal` hosts
`doctor_tracker`. The dedicated `doctortracker_service` user has scoped
`readWrite` permission on that database only. The synthetic demonstration database
was verified with 14 doctors and 84 patients. `SEED_DEMO=false` after initial seeding.

## Public smoke tests

[Passing GitHub Actions run](https://github.com/sajeeb-ahmeed/Doctor-Tracker-Portal/actions/runs/38557792623):

- Render backend `/api/health`: 200, connected database
- Render frontend `/login`: 200, premium sign-in rendered
- Frontend `/api/health`: 200, successful backend forwarding
- Signed-out `/dashboard`: 307 redirect to login
- Signed-out `/api/doctors`: 401 unauthorized
- Invalid `POST /api/auth/login`: 401 unauthorized

Production administrator password is held in the Render environment and is not
exposed to GitHub Actions. The project owner confirmed a successful production sign-in
on 14 October 2026. Authenticated CRUD is still unverified by public smoke tests.

## Netlify note

The Netlify project `doctor-tracker-portal` is created and has `BACKEND_URL` configured,
but the public `doctor-tracker-portal.netlify.app` site returned 404 during external
testing. Do not submit the Netlify URL as a working demo. Use the verified Render
frontend URL above.

## Operations follow-up

- Remove any unused Atlas database users and restrict the temporarily broad
  Atlas IP access entry when static Render egress or private networking is available.
- Keep database URI, session secret, and admin password only in hosting secrets.
- Free-tier services may have cold-start delays after idle periods.
