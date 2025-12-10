# Netlify Deployment Summary

## Changes Made

### ✅ Protected Routes (All pages require authentication)
- Updated `src/router.js` to require authentication (`requiresAuth: true`) for all routes except:
  - `/login` (public, redirects to home if already logged in)
  - `/register` (public, redirects to home if already logged in)

### ✅ Login/Register Card on Home
- Home page (`/`) shows a centered card with "Iniciar Sesión" and "Registrarse" buttons when user is NOT authenticated
- Shows the full hero + content when user IS authenticated

### ✅ SPA Fallback for Netlify
- Added `netlify.toml` with:
  - `/api/*` redirects to `/.netlify/functions/:splat` (for Netlify Functions)
  - `/*` redirects to `/index.html` (SPA fallback - prevents 404 on client-side routes)
- Added `public/_redirects` file as backup

### ✅ Gitignore for Clean Repo
- Created `.gitignore` to exclude:
  - `node_modules/`
  - `dist/` (Netlify builds this)
  - `.env` files
  - Large documentation files
  - Build cache and logs

## Deployment Steps for Netlify

### 1. Connect GitHub Repository
- Go to https://netlify.com
- Click "New site from Git"
- Select GitHub, authorize, and choose `https://github.com/YaelStO/AlasLatinasNeftify`
- Select branch: `netlify-fix` (or merge to `main` first, then select `main`)

### 2. Build Settings
**Important**: Set these in Netlify dashboard:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions` (or leave default)

### 3. Environment Variables (Add in Netlify Dashboard)
Set these in **Site settings → Build & deploy → Environment**:

```
JWT_SECRET=<your-secret-key>
NETLIFY_BLOBS_STORE=<blob-store-name> (optional)
VITE_API_URL=/api
```

### 4. Deploy
- Netlify will auto-detect changes and deploy
- Logs will show build progress
- Visit your site URL once deploy is complete

## What Happens During Deployment

1. Netlify clones from GitHub (from `netlify-fix` branch)
2. Installs dependencies: `npm install` (in `frontend/` directory)
3. Builds: `npm run build` (generates optimized `dist/` folder)
4. Publishes `dist/` folder as your site
5. Netlify Functions in `frontend/netlify/functions/` are automatically deployed

## User Flow After Deployment

1. User visits https://your-site.netlify.app
2. Router checks if user is authenticated (via localStorage token)
3. If NOT authenticated → redirects to `/login`
4. Login card appears on `/login` page
5. User enters credentials → backend validates via `/api/auth/login`
6. Token saved to localStorage
7. User can now navigate to `/destinations`, `/reservations`, etc.

## Testing After Deploy

Run this from terminal to test endpoints (replace YOUR_SITE_URL):

```bash
YOUR_SITE="https://your-site.netlify.app"

# Test 1: Unauthenticated visit to protected route
curl -s "${YOUR_SITE}/destinations" | head -20

# Test 2: Auth registration
curl -X POST "${YOUR_SITE}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# Test 3: Auth login
curl -X POST "${YOUR_SITE}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test 4: Get destinations (requires token)
TOKEN="your-jwt-token-from-login"
curl -H "Authorization: Bearer ${TOKEN}" "${YOUR_SITE}/api/destinations"
```

## Branch Information

- **Local branch**: `master` (frontend code)
- **Remote branch**: `netlify-fix` (pushed to GitHub)
- **Production branch**: `main` (will merge `netlify-fix` → `main` after testing)

## Next Steps

1. ✅ Code ready in `netlify-fix` branch on GitHub
2. ⏳ Connect repo to Netlify (requires Netlify account)
3. ⏳ Add environment variables in Netlify dashboard
4. ⏳ Trigger deploy and test endpoints
5. ⏳ Merge `netlify-fix` → `main` once verified

---

**Current Status**: Code is ready to deploy. Just connect the GitHub repo to Netlify and configure build settings.
