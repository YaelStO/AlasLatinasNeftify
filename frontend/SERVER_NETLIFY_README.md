# Netlify Deployment & Functions Guide

This project runs an Express server locally for development (file-backed lowdb JSON store). For production, we deploy as **Netlify Functions** using **Netlify Blobs** for storage.

## Netlify Functions Structure

All serverless functions are in `netlify/functions/`:

- **auth-register.js** - POST /api/auth/register (register user, hash password, issue JWT)
- **auth-login.js** - POST /api/auth/login (login, validate password, return JWT)
- **auth-profile.js** - GET/PUT/DELETE /api/auth/profile (get profile, update, link wallet, delete user)
- **destinations.js** - GET /api/destinations (list all destinations)
- **reservations.js** - GET/POST/PUT/DELETE /api/reservations (CRUD reservations with JWT auth)
- **payments.js** - POST /api/payments (submit payment, supports server-side or Freighter client-side signing)
- **store.js** - helper that uses `@netlify/blobs` to read/write a single JSON blob (key `app-data`) containing { users, destinations, reservations }
- **jwt-verify.js** - utility to verify JWT tokens and return 401 if invalid

## How it Works

1. Each function verifies the JWT token from the `Authorization` header.
2. Authorized functions read/write to a single blob (key `app-data`) which contains all app data as JSON.
3. The blob is persisted in Netlify Blobs storage (automatic, no DB setup needed).
4. When deploying to Netlify, configure environment variables (see below).

## Environment Variables for Netlify Deployment

Set these in your Netlify project settings (Site settings > Build & deploy > Environment):

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret key for signing/verifying JWTs. Use a strong random string. |
| `NETLIFY_BLOBS_STORE` | No | Custom blob store name (default: `alas-latinas-app`). |
| `STELLAR_SEED` | No | Stellar secret key for server-side payment signing (S...). If not set, payments default to Freighter client-side signing. |

**Example**: Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Local Development

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Express server** (uses local lowdb):
   ```bash
   npm run server
   # Server runs on http://localhost:3001
   ```

3. **Preview Netlify Functions locally** (optional, requires Netlify CLI):
   ```bash
   npm install -g netlify-cli
   netlify dev
   # Functions available at http://localhost:8888/.netlify/functions/*
   ```

## Deployment to Netlify

### Prerequisites
- Push your code to a Git repository (GitHub, GitLab, Bitbucket).
- Create a Netlify account and link your team project: https://app.netlify.com/teams/yaelsto/projects

### Steps

1. **Connect your repository** to Netlify.
2. **Set build settings**:
   - Build command: `npm install --prefix frontend && npm run build --prefix frontend`
   - Publish directory: `frontend/dist`
3. **Set environment variables** in Site settings > Environment:
   - `JWT_SECRET` = (your secret)
   - `STELLAR_SEED` = (optional, leave blank for Freighter signing)
4. **Deploy**: Push to main branch or manually trigger deploy in Netlify UI.

The `netlify.toml` file in `frontend/` automatically configures:
- Functions directory: `netlify/functions`
- Publish directory: `dist` (Vue build output)
- Redirect: `/api/*` → `/.netlify/functions/:splat` (maps API calls to functions)

## Payment Signing: Freighter vs Server-side

### Option 1: Freighter (Recommended, Client-side)
- User installs **Freighter browser extension** (https://www.freighter.app/).
- User clicks "Pay" in the app.
- Freighter prompts user to sign the transaction.
- User approves and transaction is submitted to Horizon.
- More secure: server never sees user's private key.

**Setup**: Leave `STELLAR_SEED` unset in environment. Frontend will use Freighter API.

See `FREIGHTER_INTEGRATION.md` for code examples.

### Option 2: Server-side Signing (Testnet Demo)
- Set `STELLAR_SEED` to your test account secret key.
- Payments function uses it to sign transactions server-side.
- Less secure but convenient for testing.

**Setup**: Set `STELLAR_SEED` in Netlify environment variables.

## Function Routing

`netlify.toml` redirects `/api/*` requests to Netlify Functions:

| Frontend Request | Maps to Function |
|------------------|------------------|
| POST /api/auth/register | auth-register.js |
| POST /api/auth/login | auth-login.js |
| GET/PUT/DELETE /api/auth/profile | auth-profile.js |
| GET /api/destinations | destinations.js |
| GET/POST/PUT/DELETE /api/reservations | reservations.js |
| POST /api/payments | payments.js |

## JWT Token Flow

1. **Register/Login** → Function returns JWT token in response.
2. **Frontend stores token** in localStorage (see `src/stores/auth.js`).
3. **Axios interceptor** (in `src/utils/axios.js`) attaches token to all requests: `Authorization: Bearer <token>`.
4. **Protected functions** verify token before processing.
5. **Token expires** after 7 days (configurable via `JWT_EXPIRES_IN` env var).

## Testing with curl

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"secret"}'
```

### Login & Get Token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret"}'
# Response includes: { "token": "eyJ...", "user": {...} }
```

### Use Token for Protected Endpoint
```bash
TOKEN="eyJ..." # from login response
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## Notes & Next Steps

- **Data persistence**: Netlify Blobs stores a single JSON blob. For larger apps, consider Netlify DB or external Postgres.
- **Blob concurrency**: If multiple functions write simultaneously, the last write wins. For critical data, implement conflict resolution or use a proper DB.
- **Security**: Always use HTTPS in production, keep JWT_SECRET strong, rotate secrets periodically.
- **Forms**: Netlify Forms (HTML form with `data-netlify="true"` attribute) can capture submissions without extra API calls.
