# Deployment guide

## Current public deployment

| Component               | Provider                | URL                                                                            |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| Frontend / admin portal | Render Free web service | [Launch DoctorTracker](https://doctor-tracker-frontend.onrender.com/login)     |
| Backend / Express API   | Render Free web service | [API health endpoint](https://doctor-tracker-api-tg86.onrender.com/api/health) |
| Database                | MongoDB Atlas           | `doctor_tracker` on `Cluster0`                                                 |

The GitHub repos are deployed separately; the frontend forwards `/api/*` to the standalone backend using the server-side `BACKEND_URL`. The live GitHub Actions smoke tests verified connectivity and protection, and the owner confirmed production login. **Real admin credentials must remain private.**

## Deploy to Render (current setup)

1. Import [Doctor-Tracker-API](https://github.com/sajeeb-ahmeed/Doctor-Tracker-API) as a Render **Node** web service. Use Node 24, build `npm ci --include=dev && npm run build`, and start `npm start`.
2. Configure `NODE_ENV=production`, `MONGODB_URI`, a strong `SESSION_SECRET` (32+ characters), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters), exact `FRONTEND_ORIGIN`, and `SEED_DEMO=false`. Provision a dedicated least-privilege Atlas user, then allow Render's outbound network under an appropriate access policy.
3. Import [Doctor-Tracker-Portal](https://github.com/sajeeb-ahmeed/Doctor-Tracker-Portal) as a separate Render **Node** web service. Build `npm ci --include=dev && npm run build`, then start `./node_modules/.bin/next start --hostname 0.0.0.0 --port $PORT`.
4. Set frontend `BACKEND_URL=https://doctor-tracker-api-tg86.onrender.com` in Render; update it to your own API origin if you deploy a fork. Do **not** prefix it with `NEXT_PUBLIC_`.
5. Set backend `FRONTEND_ORIGIN` to the exact public frontend HTTPS origin. Redeploy both services and validate the frontend `/api/health`, login and administrator workflows.

> Render Free instances can spin down between visits, so a first visit may be slower. Do not deploy to a clinical or patient-data production environment without a separate privacy, operations and security review.

## Alternative: Netlify frontend

1. Connect `sajeeb-ahmeed/Doctor-Tracker-Portal` to Netlify.
2. The included `netlify.toml` selects `npm run build` and the `.next` publish directory. Netlify automatically installs its current Next.js adapter.
3. Set `BACKEND_URL` to the deployed API origin, without `/api` at the end. Make it available to both Builds and Functions.
4. Deploy. The frontend forwards browser `/api/*` calls to Express through a Next.js rewrite; database access and business logic remain in the separate Express application.
5. Update the backend's `FRONTEND_ORIGIN` with the final frontend origin and restart the backend as needed.
6. Redeploy the frontend whenever `BACKEND_URL` changes because rewrites are created at build time.

`.netlify/` is excluded from Git. Runtime secrets belong in hosting environment settings and must not use a `NEXT_PUBLIC_` prefix.

## Acceptance checks before submission

- Visit a protected page signed out; verify redirection to login.
- Sign in using the deployed demo/admin account, then reload a protected page.
- Create a doctor and a patient; verify the records survive reload and a backend restart.
- Combine search, date, and condition filters; navigate result pages.
- Edit and delete a patient and confirm the dashboard reflects the changes.
- Check the interface on desktop and mobile, including dialogs and navigation.
- Sign out and verify the protected API no longer permits data access.
- Verify a fresh local installation using the README.

## Submission

Include the [live frontend](https://doctor-tracker-frontend.onrender.com/login), [live backend health URL](https://doctor-tracker-api-tg86.onrender.com/api/health), and both GitHub repository URLs. Send the demonstration password privately to the reviewer if requested. **Never publish the MongoDB URI, session secret or hosting tokens.** This project uses synthetic records; it is not a regulated clinical system.

For current release evidence and outstanding security hardening tasks, see [Hosting status](HOSTING_STATUS.md).
