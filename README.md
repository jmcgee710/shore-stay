# Shore Stay

A vacation rental management platform for renters, homeowners, and property managers.

## Project structure

- `frontend/` — React + Vite UI built for mobile responsiveness.
- `backend/` — Node + Express REST API with Prisma and PostgreSQL.

## Local setup

1. Install Node.js 20+ from https://nodejs.org.
2. Install dependencies at the repository root:
   ```bash
   npm install
   ```
3. Copy `backend/.env.example` to `backend/.env` and configure `DATABASE_URL`.
4. Run Prisma migrations:
   ```bash
   npm --workspace backend run prisma:migrate
   ```
5. Start the app:
   ```bash
   npm run dev
   ```

## Notes

This scaffold includes a starter frontend, backend, and Prisma schema for Shore Stay.
