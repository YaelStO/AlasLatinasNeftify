# Netlify Deployment Checklist — Alas Latinas

This checklist guides you through connecting the repository to Netlify, configuring environment variables, setting build options, and verifying that Netlify Functions respond correctly after deployment.

---

## 1) Pre-requirements

- GitHub repository: https://github.com/YaelStO/AlasLatinasNeftify
- Netlify account with access to the Team where you'll deploy
- SSH or HTTPS credentials for GitHub (UI uses OAuth)
- Ensure this repo is the one you want to deploy (we pushed `main` branch)

---

## 2) Netlify Site Setup (UI)

1. Log in to https://app.netlify.com and open your Team.
2. Click "New site from Git" → Choose GitHub as provider.
3. Authorize Netlify to access your account if needed. Select repository `YaelStO/AlasLatinasNeftify`.
4. Configure the deploy settings:
   - Branch to deploy: `main`
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory (Netlify UI may auto-detect from netlify.toml). If needed, set to: `netlify/functions` (relative to repository root or base dir). Our repo has `frontend/netlify/functions` and `frontend/netlify.toml` already specifying `functions = "netlify/functions"`.
5. Click "Deploy site".

> Note: You can also use the Netlify CLI (netlify init) to connect local repo to the site.

---

## 3) Environment Variables (Netlify UI: Site settings → Build & deploy → Environment)

Set these env vars in Netlify for the site (choose Site-level environment variables):

- `JWT_SECRET` (required)
  - Description: Secret used to sign JWTs. Set to a secure random string.
  - Example: `s3cr3t-change-me-please`

- `NETLIFY_BLOBS_STORE` (recommended)
  - Description: Name of the blobs store used by @netlify/blobs persistence wrapper.
  - Example: `alas-latinas-store`

- `STELLAR_SEED` (optional, NOT RECOMMENDED for production)
  - Description: If set, the payments Netlify Function will sign transactions server-side. If unset, clients must use Freighter.
  - Example: `SD...secret...`

- `JWT_EXPIRES_IN` (optional)
  - Default: `7d` in functions. Change if desired.

- `VITE_API_URL` (optional/recommended)
  - For production where frontend and functions are served under the same domain, set to `/api` OR leave unset and ensure frontend uses relative `/api` paths. Our frontend axios uses `import.meta.env.VITE_API_URL || 'http://localhost:3001'`. To make production use functions on the same domain, set `VITE_API_URL=/api`.

- `NODE_VERSION` (optional)
  - If you need a specific node, set in a `.nvmrc` or Netlify UI. Netlify supports many Node versions.

---

## 4) Build & Publish settings (Netlify)

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `frontend/netlify/functions` (or leave to netlify.toml) — confirm Netlify detects functions from `frontend/netlify.toml`.

If using Netlify CLI locally, run:

```bash
cd frontend
npm install
npm run build
netlify deploy --prod --dir=dist
```

---

## 5) Post-deploy Smoke Tests (curl)

After the site deploys, note the site URL (e.g. `https://alas-latinas.netlify.app`). Use the following checks to validate functions.

Replace `SITE_URL` with your deployed URL.

1) GET /api/destinations — public

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://SITE_URL/api/destinations"
# Expect: 200
```

2) Register a new user (POST /api/auth/register)

```bash
curl -s -X POST "https://SITE_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test+netlify@example.com","password":"Password123"}'
# Expect: 201 with JSON { token, user }
```

3) Login (POST /api/auth/login)

```bash
curl -s -X POST "https://SITE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test+netlify@example.com","password":"Password123"}'
# Expect: 200 with { token }
```

Save the token and use for protected calls:

```bash
TOKEN=eyJ...yourtoken...
```

4) GET /api/auth/profile (protected)

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://SITE_URL/api/auth/profile" -H "Authorization: Bearer $TOKEN"
# Expect: 200
```

5) Create a reservation (POST /api/reservations)

```bash
curl -s -X POST "https://SITE_URL/api/reservations" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"destinationId":"dest-1","destinationName":"Demo","checkInDate":null,"checkOutDate":null,"totalPrice":0}'
# Expect: 201 with reservation object
```

6) Update reservation status (PUT /api/reservations)

```bash
curl -s -X PUT "https://SITE_URL/api/reservations" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"reservationId":"res-xxx","paymentStatus":"completed"}'
# Expect: 200
```

7) Payment endpoint (POST /api/payments)

- If `STELLAR_SEED` is set on server, this will sign and submit the payment and return `hash`.
- If not set, it will return a message explaining the client-side Freighter flow.

```bash
curl -s -X POST "https://SITE_URL/api/payments" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"destination":"GB4...","amountStroops":1000000, "reservationId":"res-xxx"}'
```

Expected: 200 with `hash` if server-side signing used; else 200 with guidance for Freighter (client-side)

---

## 6) Post-deploy verification checklist (manual)

- [ ] Site deploy succeeded (Netlify UI: Deploys → Live)
- [ ] `/api/destinations` returns 200 and JSON list
- [ ] Registration and login flows work (create user, login, receive token)
- [ ] Protected endpoints return 200 with Authorization header
- [ ] Reservation creation and update work
- [ ] Payment endpoint responds (server-side signing or Freighter guidance)
- [ ] Frontend works: user can connect Freighter, sign TX, and see transaction hash

---

## 7) Troubleshooting

- If functions return 500 or 404:
  - Check Netlify function logs (Site → Functions → Function name → Logs)
  - Check Build logs for environment variable errors
  - Ensure `NETLIFY_BLOBS_STORE` is set if you rely on blob persistence

- If authentication fails:
  - Confirm `JWT_SECRET` matches what you used during local testing
  - Confirm time skew on server is not excessive

- If payment fails:
  - If server-side signing: ensure `STELLAR_SEED` is valid and has funds (Testnet)
  - If client-side Freighter: verify Freighter extension is installed and connected, and `VITE_API_URL` is set to `/api` so frontend hits functions at the same domain

---

## 8) Automated verification script (optional)

You can save the following bash script and run it after deploy to run the smoke tests automatically. Replace `SITE_URL` and update test email/password.

```bash
#!/usr/bin/env bash
SITE_URL=https://your-netlify-site.netlify.app
TEST_EMAIL=test+netlify@example.com
TEST_PASS=Password123

set -e

echo "Checking /api/destinations..."
http_status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/api/destinations")
if [ "$http_status" != "200" ]; then
  echo "destinations failed: $http_status"; exit 1
fi

# Register user
reg_response=$(curl -s -X POST "$SITE_URL/api/auth/register" -H 'Content-Type: application/json' -d "{\"name\":\"Netlify Test\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")

echo "Register response: $reg_response"

# Login user
login_response=$(curl -s -X POST "$SITE_URL/api/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")
TOKEN=$(echo "$login_response" | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).token)")
echo "Token: $TOKEN"

# Protected call
profile_status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/api/auth/profile" -H "Authorization: Bearer $TOKEN")
if [ "$profile_status" != "200" ]; then
  echo "profile failed: $profile_status"; exit 1
fi

echo "Smoke tests passed." 
```

---

## 9) Notes & recommendations

- Prefer Freighter (client-side signing) in production to avoid storing secret keys server-side.
- Use GitHub Actions or Netlify Build Plugins for more advanced CI/CD.
- Add pre-commit hook to prevent committing `target/` or compiled binaries.

---

If you want, I can:
- Connect the repo to Netlify for you (if you grant access),
- Set the environment variables in the Netlify UI (requires site admin access), and
- Run the smoke tests and report success/failures.

Tell me which of the three follow-ups you want me to do next and provide access when needed.
