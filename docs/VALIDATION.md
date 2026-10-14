# Validation record

Verified on 13 October 2026 with Node.js 24.18.0 on Windows, Next.js 16.4.0, React 19.3.0, and real MongoDB 8.0.16.

## Automated checks

| Check                                                      | Outcome                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| Frontend strict TypeScript check                           | Passed                                                           |
| Frontend optimized production build                        | Passed; protected portal routes render dynamically               |
| Frontend formatting check                                  | Passed; generated Next.js types excluded                         |
| Backend strict TypeScript check and production compilation | Passed                                                           |
| Backend real-MongoDB integration suite                     | 16 tests passed                                                  |
| Playwright desktop/mobile and API suite                    | 9 tests passed in the final full run                             |
| Installed dependency audits                                | No reported vulnerabilities in either repository at installation |
| GitHub Actions                                             | Frontend and API verification completed successfully             |

The browser suite exercises anonymous redirection, incorrect credentials, login/logout, CSRF verification, persistent doctor/patient creation, patient editing and email clearing, deletion, combined search/date/condition filters, pagination, final-page deletion, dashboard count changes, and mobile navigation/page overflow.

The backend suite additionally verifies validation and invalid identifiers, relationship integrity, inclusive UTC dates, partial updates without unrelated defaults, indexed token-prefix search, and search-token backfill. Regression coverage also checks phone numbers contain 7–15 real digits and that email addresses are trimmed and normalized on creation and updates, while an optional email can be cleared.

## Persistence and query evidence

An independent fresh frontend clone completed `npm ci`, the unmodified default `npm run setup:local`, `npm run typecheck`, and `npm run build`. The setup script automatically cloned the backend repository, installed its dependencies, generated both environment files, enabled the two local origins and synthetic seeding, and generated a session secret. Existing project files were not used as a substitute for the installation steps.

The combined local launcher was stopped and restarted. Existing doctor/patient IDs and record counts matched the pre-restart values, and the administrator session remained valid. The local MongoDB uses persistent WiredTiger storage rather than replacing data with frontend mocks.

A representative selective prefix search against 251 doctors used `IXSCAN` on `searchTokens_1`, examining 2 index keys and 1 document for 1 result. This is query-plan evidence for a controlled fixture, not a production-scale performance benchmark. See the backend repository's `docs/query-plan.md` for reproduction and limits.

## Visual checks

Desktop and mobile screenshots are included in `docs/screenshots/` and were visually inspected. Doctors and Patients were checked at 375, 412, and 768px widths; document width matched the viewport while wide tables retained their own horizontal scrolling. The automated mobile project uses a Pixel 7 viewport. A manual mobile dialog check also verified viewport fit, initial field focus, Escape dismissal, and scroll restoration.

## Local state and deployment status

Automated tests created uniquely named synthetic records. Temporary patients were removed, and unassigned test doctors were removed using their exact test name/email patterns. The delivered local dataset contains the original 14 doctors and 84 synthetic patients.

## Public deployment verification (14 October 2026)

The frontend and backend are deployed as separate Render Free web services:

- Frontend: <https://doctor-tracker-frontend.onrender.com/login>
- Backend health: <https://doctor-tracker-api-tg86.onrender.com/api/health>
- Database: MongoDB Atlas project `Doctor-Tracker-Portal`, database `doctor_tracker`.

The backend reports healthy MongoDB connectivity, and the hosted database contained
14 synthetic doctors and 84 synthetic patients. Production demo seeding was disabled
after initial creation so existing records are not re-created.

[Public smoke tests](https://github.com/sajeeb-ahmeed/Doctor-Tracker-Portal/actions/runs/38557792623)
passed the login-page request (200), direct backend health (200), frontend-proxied API health
(200), anonymous dashboard redirect (307), anonymous doctor API denial (401), and
invalid-login denial (401).

**Outstanding:** authenticated production login, CRUD and user-journey verification
using the privately configured production administrator password. These results should
not be claimed complete until checked. The reserved Netlify address responded 404 and
must not be used as the submitted frontend URL.
