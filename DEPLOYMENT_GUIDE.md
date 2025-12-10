# Deployment Guide for AlasLatinas Soroban Contract

## Overview

This guide covers deployment options for the Soroban smart contract and integration with the full-stack application (Vue.js frontend + Express.js backend).

## Current Status

- ✅ **Contract Implementation**: Complete with 16 unit tests covering RF-01 through RF-15 requirements
- ✅ **Frontend**: Vue 3 with Freighter wallet integration, functional locally
- ✅ **Backend**: Express.js server with auth and API endpoints, functional locally
- ✅ **Local Unit Tests**: Contract tests fixed and passing (SDK 20.5.0 compatible)
- ⚠️ **Testnet Deployment**: Currently blocked due to wasm validation issue (see troubleshooting)

## Local Development Setup

### Prerequisites

```bash
# Rust and cargo (required)
rustup toolchain install nightly
rustup target add wasm32-unknown-unknown

# Soroban CLI
# Installation: https://soroban.stellar.org/docs/getting-started/setup
soroban --version  # Should show 23.2.0 or later

# Node.js and npm (for frontend/backend)
node --version  # v18+ recommended
npm --version   # v8+ recommended

# Podman or Docker (optional, for local sandbox)
podman --version  # or docker --version
```

### Running Tests Locally

```bash
# Run contract unit tests (compiles to native test binary)
cd /home/yael/soroban_users
cargo test --release --lib

# Expected: All 16 tests pass
# Tests cover: user mgmt, destinations, reservations, comments, payments
```

### Running Frontend + Backend

```bash
# Terminal 1: Start backend Express server
cd frontend/server
npm install  # if not already done
npm start    # runs on http://localhost:3001

# Terminal 2: Start frontend Vite dev server
cd frontend
npm install  # if not already done
npm run dev  # runs on http://localhost:3000

# Access application at http://localhost:3000
# Frontend proxies /api requests to backend:3001
```

## Deployment Options

### Option 1: Local Soroban Sandbox (Recommended for Testing)

For local development and testing without deploying to Testnet:

```bash
# Start local Soroban sandbox container
soroban container start --local

# Build the contract (release mode for smaller binary)
cd /home/yael/soroban_users
cargo build --release --target wasm32-unknown-unknown

# Deploy to local sandbox
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_users.wasm \
  --source-account <YOUR_ACCOUNT_ID> \
  --network standalone

# This returns the contract ID for local testing
```

**Advantages:**
- No network latency or rate limits
- Instant contract deployment and testing
- Can iterate quickly on contract changes

**Requirements:**
- Podman 4.x+ or Docker
- Soroban CLI 23.x+

### Option 2: Stellar Testnet Deployment

For public testing on the Stellar test network:

```bash
# Fund testnet account (if not already done)
# Visit: https://soroban.stellar.org/docs/getting-started/deploy-to-testnet

# Build contract
cargo build --release --target wasm32-unknown-unknown

# Deploy script provided at: scripts/deploy_testnet.sh
# (Contains hardcoded test keys - replace with your own before production use)
bash scripts/deploy_testnet.sh
```

**Status:** ⚠️ **Blocked** - See troubleshooting section below

### Option 3: Production Deployment to Stellar Mainnet

**Not recommended** without resolving the testnet issue first.

For production deployment:
1. Use a production account and keys
2. Test thoroughly on testnet first
3. Follow Soroban security guidelines: https://soroban.stellar.org/docs

## Troubleshooting

### Issue: Testnet Deployment Fails with "reference-types not enabled"

**Error Message:**
```
transaction simulation failed: HostError: Error(WasmVm, InvalidAction)
event log: "reference-types not enabled: zero byte expected" (offset 16003)
```

**Root Cause:**
The compiled WebAssembly binary contains the `reference-types` feature flag enabled by the LLVM/Rust toolchain, even though the contract code doesn't explicitly use reference types. The Soroban Testnet host validator rejects wasm binaries with this feature.

**Diagnosis Performed:**
- ✅ Wasmparser v0.86.0 validates the binary as OK (no reference-types feature "needed")
- ✅ Compiled wasm is ~35KB, well-structured with FuncRef table, 31 type entries, 21 exports
- ✅ Binary inspection shows feature flag is present despite not being explicitly used in contract code
- ✅ Multiple rebuild attempts with `RUSTFLAGS='-C target-feature=-reference-types'` still produce wasm with reference-types+

**Solution Path 1: Update Soroban SDK Version**
```bash
# Try upgrading to a newer SDK version that might have better wasm compilation
# Current: soroban-sdk = "20.5.0"
# Try: soroban-sdk = "21.x" or "22.x"

# Edit Cargo.toml, then rebuild:
cargo clean
cargo build --release --target wasm32-unknown-unknown
bash scripts/deploy_testnet.sh
```

**Solution Path 2: Use Local Sandbox Instead**
```bash
# Skip Testnet and test locally instead
soroban container start --local
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_users.wasm \
  --source-account <STANDALONE_ACCOUNT_ID> \
  --network standalone
```

**Solution Path 3: Contact Soroban Team**
- Issue: SDK/LLVM toolchain enabling reference-types feature unnecessarily
- Workaround waiting: More recent SDK versions may have resolved this
- GitHub Issue Template: "Wasm binary rejected by Testnet host due to reference-types feature (offset 16003)"

### Issue: Contract Tests Won't Compile

**Error:** `cannot find function 'register_test_contract' in module 'soroban_sdk::testutils'`

**Solution:** Fixed in codebase
- Old: `soroban_sdk::testutils::register_test_contract(&env, AlasLatinas)`
- New: `env.register_contract::<AlasLatinas>(None)`
- API changed in SDK 20.5.0

### Issue: Frontend Can't Connect to Backend

**Error:** CORS errors or connection refused on localhost:3001

**Solution:**
```bash
# Ensure backend is running
ps aux | grep "node.*server"

# Check vite.config.js proxy is configured:
# server: { proxy: { '/api': 'http://localhost:3001' } }

# Clear browser cache and hard refresh (Ctrl+Shift+R)
```

### Issue: Wallet Not Connecting

**Solution:**
1. Ensure Freighter extension is installed: https://www.freighter.app/
2. Create/import a Soroban-enabled account in Freighter
3. Refresh browser and try connecting again
4. Check browser console for specific errors

## Environment Variables

### Backend (.env or frontend/server/.env)

```bash
# Optional: Add if needed for production
DATABASE_URL=postgresql://...  # Not currently used (in-memory db)
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Frontend (frontend/.env)

```bash
# Optional: Override API endpoint if not using proxy
VITE_API_BASE_URL=http://localhost:3001
```

## Next Steps for Full Deployment

1. **Resolve Wasm Compilation Issue**
   - Try SDK version upgrade (see troubleshooting)
   - If successful: Deploy to Testnet for integration testing
   - If unsuccessful: Use local sandbox for development

2. **Add Integration Tests**
   - Backend: Jest tests for auth endpoints
   - Frontend: Vitest + Vue Test Utils for components
   - E2E: Playwright tests for full workflows

3. **Database Migration** (Optional)
   - Currently using in-memory mock database
   - Production: Implement PostgreSQL persistence
   - Create migrations for schema versioning

4. **Security Hardening**
   - Replace hardcoded keys in deploy script
   - Implement proper secret management (env vars, vaults)
   - Add input validation and rate limiting
   - Enable HTTPS for production

5. **Deployment Infrastructure**
   - Frontend: Deploy to Vercel, Netlify, or S3+CloudFront
   - Backend: Deploy to Heroku, AWS Lambda, or self-hosted VPS
   - Contract: Final version to Soroban Mainnet after testnet validation

## References

- **Soroban Documentation:** https://soroban.stellar.org/docs
- **Soroban Testnet:** https://soroban.stellar.org/docs/getting-started/deploy-to-testnet
- **Freighter Wallet:** https://www.freighter.app/
- **Vue 3 Guide:** https://vuejs.org/
- **Express.js:** https://expressjs.com/
- **Vite:** https://vitejs.dev/

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review contract unit tests in `src/lib.rs`
3. Consult Soroban SDK documentation
4. Check browser console and server logs for detailed error messages

---

**Last Updated:** 2024
**Contract Version:** 1.0  
**SDK Version:** 20.5.0  
**Soroban CLI Version:** 23.2.0+
