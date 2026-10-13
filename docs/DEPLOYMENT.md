# Deployment guide

The frontend and backend are separate applications and repositories. This checkout is prepared for local development first; publishing requires a persistent hosted MongoDB instance and hosting account configuration.

## 1. Database and backend

1. Provision a MongoDB database and a dedicated database user for the application.
2. Deploy `sajeeb-ahmeed/Doctor-Tracker-API` as a standalone Node web service using the backend's `render.yaml` blueprint or equivalent hosting.
3. Use `npm ci --include=dev && npm run build` as the build command and `npm start` as the start command. Use Node 24. The explicit include keeps TypeScript and type definitions available during compilation when `NODE_ENV=production` is configured.
4. Set `NODE_ENV=production`, `MONGODB_URI`, a random `SESSION_SECRET` of at least 32 characters, `ADMIN_EMAIL`, `ADMIN_NAME`, and a strong `ADMIN_PASSWORD` for the initial admin account.
5. Set `FRONTEND_ORIGIN` to the exact HTTPS frontend origin. For several permitted origins, use the format documented in the backend README.
6. Set `SEED_DEMO=true` only if synthetic example records are wanted in the deployment; disable it afterward.
7. Verify the API's `/api/health` endpoint and direct authentication behavior.

The local automatically launched MongoDB process is a development tool. Production uses the configured hosted MongoDB URI.

## 2. Frontend on Netlify

1. Connect `sajeeb-ahmeed/Doctor-Tracker-Portal` to Netlify.
2. The included `netlify.toml` selects `npm run build` and the `.next` publish directory. Netlify automatically installs its current Next.js adapter.
3. Set `BACKEND_URL` to the deployed API origin, without `/api` at the end. Make it available to both Builds and Functions.
4. Deploy. The frontend forwards browser `/api/*` calls to Express through a Next.js rewrite; database access and business logic remain in the separate Express application.
5. Update the backend's `FRONTEND_ORIGIN` with the final frontend origin and restart the backend as needed.
6. Redeploy the frontend whenever `BACKEND_URL` changes because rewrites are created at build time.

`.netlify/` is excluded from Git. Runtime secrets belong in hosting environment settings and must not use a `NEXT_PUBLIC_` prefix.

## 3. Acceptance checks before submission

- Visit a protected page signed out; verify redirection to login.
- Sign in using the deployed demo/admin account, then reload a protected page.
- Create a doctor and a patient; verify the records survive reload and a backend restart.
- Combine search, date, and condition filters; navigate result pages.
- Edit and delete a patient and confirm the dashboard reflects the changes.
- Check the interface on desktop and mobile, including dialogs and navigation.
- Sign out and verify the protected API no longer permits data access.
- Verify a fresh local installation using the README.

## Submission

Reply All to the original assignment email with both repository links, both live service URLs, and an appropriate demonstration login. Use the actual receipt timestamp for the two-day deadline. Do not put database credentials, session secrets, or hosting tokens in the submission.
