# SXR LEETLAB

## Start locally with Docker

1. Copy `.env.example` to `.env` and replace `JWT_SECRET` with a long random value.
2. Start the application with `docker compose up --build`.
3. Open `http://localhost:5173` and create an account.
4. Set `SEED_USER_EMAIL` in `.env` to that account's email, then run `docker compose --profile tools run --rm seed`.

The starter seed is idempotent: it creates **Add Two Numbers** only if it does not already exist. It never deletes or overwrites users, problems, or submissions.

For code execution, set `JUDGE0_API_URL` to a reachable Judge0-compatible API before submitting a solution.

For a public HTTPS deployment, set `COOKIE_SECURE=true`. Keep it `false` for local Docker at `http://localhost` so the browser accepts the login cookie.
