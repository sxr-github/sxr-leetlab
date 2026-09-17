# SXR LEETLAB

Coding-practice app with cookie-based authentication, a searchable problem library, browser-based code workspace, submission history support, and private playlists.

## Run locally

1. Start the local database from the repository root: `docker compose up -d`.
2. Copy `backend/.env.example` to `backend/.env` and supply JWT and Judge0 values. The supplied database URL matches the Compose database.
3. Run `npm install` in both `backend` and `frontend`.
4. In `backend`, run `npm run db:migrate` then `npm run dev`.
5. In `frontend`, optionally copy `.env.example` to `.env`, then run `npm run dev`.

The frontend defaults to `http://127.0.0.1:8000/api/v1`; adjust `VITE_API_URL` when deploying.

## Database commands

- Start: `docker compose up -d`
- Stop (keeps data): `docker compose stop`
- Stop and remove the database data: `docker compose down -v`
