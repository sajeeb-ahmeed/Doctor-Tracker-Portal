# Contributing to DoctorTracker Portal

Thank you for helping improve the DoctorTracker frontend. This repository contains the Next.js interface; the Express API lives in [Doctor-Tracker-API](https://github.com/sajeeb-ahmeed/Doctor-Tracker-API).

## Development workflow

1. Create a feature branch from `main` and keep changes focused.
2. Install Node.js 24 and npm.
3. Run `npm ci`, `npm run setup:local` and `npm run dev:all` from the frontend root.
4. Verify the change against **local synthetic records**, not the production deployment.
5. Run the checks before opening a pull request:

```bash
npm run typecheck
npm run format:check
npm run build
npx playwright install chromium
npm run test:e2e
```

Keep the existing server-side API rewrite, authentication boundaries, responsive behavior and accessibility intact. Add or update screenshots for visible UI changes. If an API contract changes, coordinate with the backend repository and update the documentation.

## Pull requests

- Describe the problem, solution and affected routes.
- Link related issues and include before/after screenshots for UI changes.
- Confirm desktop and mobile behavior, empty/loading/error states, and keyboard navigation.
- Do not include `.env` files, access tokens, real patient information or production credentials.

The demo data is synthetic; this project is not a certified clinical product.
