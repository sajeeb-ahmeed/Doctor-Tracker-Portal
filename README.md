# Doctor-Tracker-Portal

A responsive administrative portal for managing doctors, their patients, and care activity. The application pairs a Next.js frontend with a separate Express REST API and MongoDB, with authenticated access, searchable directories, patient management, and database-backed analytics.

## Architecture

Browser → Next.js frontend → Express REST API → MongoDB.

The frontend repository lives at the workspace root. The separately versioned backend will live in `backend/` and is excluded from the frontend repository.

## Implementation checklist

- [ ] Secure admin authentication and authorization
- [ ] Doctor creation, search, date/specialization/hospital filters, pagination
- [ ] Doctor details and assigned patient creation/deletion
- [ ] Patient directory, editing, deletion, search, filters, pagination
- [ ] Dashboard totals, patients per doctor, date-based charts
- [ ] Responsive, accessible UI with loading, empty, and error states
- [ ] Input validation, MongoDB indexes, efficient server-side queries
- [ ] Local setup, environment examples, two technical decisions, screenshots
- [ ] Integration tests, production build, and deployment verification

## Documentation

Detailed local setup, environment configuration, screenshots, and validation results will be added as the implementation is verified.

## Scope assumptions

The application has one administrator role. Each patient belongs to one doctor. Date filters use record creation dates in UTC; deleting a patient removes that patient from every view. Demonstration records are synthetic.
