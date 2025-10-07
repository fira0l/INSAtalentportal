# INSAtalentportal Backend

TypeScript + Express + MongoDB backend for the INSAtalentportal MERN project.

## Tech Stack
- Node.js 18+
- TypeScript 5
- Express 4
- MongoDB (Mongoose 8)
- Zod (validation)
- JWT (auth)

## Getting Started
1. Install dependencies:
   ```bash
   cd Backend
   npm install
   ```
2. Create a `.env` file in `Backend/`:
   ```ini
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
   JWT_SECRET=please_change_me
   ```
   
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Health check:
   - Open http://localhost:5000/api/v1/health

## Available Scripts
- `npm run dev` – Run with ts-node-dev (watch/restart)
- `npm run build` – Compile TypeScript to `dist/`
- `npm start` – Run compiled server from `dist/`
- `npm run lint` / `npm run lint:fix` – ESLint
- `npm run format` – Prettier

## Project Structure (typical)
```
Backend/
  src/
    controllers/
    middleware/
    models/
    routes/
    types/
    utils/
    app.ts
    server.ts
  package.json
  tsconfig.json
  .eslintrc.cjs
  .prettierrc
  .gitignore
```

## API Endpoints
Base URL: `http://localhost:5000/api/v1`

- Health
  - GET `/health` → `{ "status": "ok" }`
- Auth
  - POST `/auth/register` → `{ id, name, email }`
  - POST `/auth/login` → `{ token }`
  - GET `/auth/me` (Bearer token) → `{ id, name, email }`

### cURL Examples
Register:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```
Login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"secret123"}'
```
Me:
```bash
curl http://localhost:5000/api/v1/auth/me \
  -H 'Authorization: Bearer <TOKEN>'
```

## Docker (optional)
- Build and run with Compose (requires `.env`):
  ```bash
  docker compose up -d --build
  ```
- Then check: http://localhost:5000/api/v1/health

## Troubleshooting
- MongoDB connection: verify `MONGODB_URI` and Atlas IP allowlist.
- JWT errors: ensure `JWT_SECRET` is set; restart the server.
- Type errors: run `npm run lint` and `npm run build`.
