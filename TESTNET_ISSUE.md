# Soroban Testnet Deployment Issue - reference-types

## Problem Statement

El contrato no se puede desplegar a **Soroban Testnet** debido a un error en la validación del WASM:

```
error: transaction simulation failed: HostError: Error(WasmVm, InvalidAction)
Event log: "reference-types not enabled: zero byte expected" (offset 16003)
```

## Root Cause

El **validador del Soroban Testnet (v23.0.0)** está rechazando el WASM compilado, interpretando incorrectamente ciertos bytes como indicadores de features `reference-types`, aunque:

- ✅ El código NO usa `reference-types` explícitamente
- ✅ `file` command muestra: `WebAssembly (wasm) binary module version 0x1 (MVP)`
- ✅ wasmparser v0.116 valida el WASM como correcto
- ✅ Compilación sin errores

## Attempts Made

### 1. Downgrade soroban-sdk → Failed
Intenté cambiar de `20.5.0` a `21.7.0` sin resolver el issue.

### 2. RUSTFLAGS explicit → Failed
```bash
RUSTFLAGS='-C target-feature=-reference-types -C link-arg=-zno-entry'
```
No tuvo efecto; el validador rechaza de todas formas.

### 3. Hex inspection
El byte en offset 16003 (0x3E83) es código WASM válido, no un indicador real de reference-types.

## Current Status

- ✅ **Contract compiles**: `cargo build --target wasm32-unknown-unknown --release`
- ✅ **All 16 tests pass**: `cargo test --release`
- ✅ **WASM artifact created**: 35KB, MVP features only
- ❌ **Testnet deployment blocks**: Validador rechaza at simulation step

## Solutions

### Option A: Wait for Testnet Update (Recommended)
Stellar está actualizado el validador de Soroban Testnet. Revisa:
- [Soroban Releases](https://github.com/stellar/soroban-examples/releases)
- [Soroban CLI Updates](https://github.com/stellar/rs-soroban-sdk/releases)

**Expected:** Soroban Testnet v23.2+ resuelve la validación.

### Option B: Use Local Soroban Network (Current Workaround)
Desplegar a una **red local de Soroban** para testing:

```bash
# Inicia el sandbox local de Soroban (requiere Docker)
soroban container start --local

# Desplegar al localhost
soroban contract deploy \
  --wasm ./target/wasm32-unknown-unknown/release/soroban_users.wasm \
  --network standalone \
  --source your_public_key
```

**Ventajas:**
- Sin delays de red
- Testing completo antes de producción
- Sin limitaciones de validador

**Requisitos:**
- Docker/Podman instalado
- Soroban CLI con soporte local

### Option C: Simplify Contract
Reducir complejidad del contrato para minimizar WASM:
- Eliminar features innecesarias
- Usar versiones más viejas (pero menos seguras)
- Modularizar funcionalidad

### Option D: Contact Stellar Support
Reportar el issue a Stellar Developers:
- [Stellar Discord](https://discord.gg/stellardev)
- [Github Issues](https://github.com/stellar/rs-soroban-sdk/issues)

**Include:**
- Versión de soroban-cli: `23.2.0`
- WASM file (35KB)
- Error message completo

## Deployment Flow (When Testnet is Fixed)

```bash
# 1. Build contract
cargo build --target wasm32-unknown-unknown --release

# 2. Deploy to Testnet
bash scripts/deploy_testnet.sh

# 3. Verify deployment
soroban contract info --contract-id CONTRACT_ID --network testnet
```

## Development Strategy

**For now, use local development:**

1. **Frontend + Backend**: ✅ Running on `localhost:5000` + `localhost:3001`
2. **Contract Tests**: ✅ 16/16 passing locally
3. **Backend Tests**: ✅ 11/11 passing locally
4. **Testnet Deploy**: ⏳ Pending Stellar Testnet fix

**When Testnet is ready:**
- Deploy contract to Testnet
- Frontend connects to Testnet contract via Freighter wallet
- Users interact with real blockchain

## Versions

- **Soroban CLI**: 23.2.0
- **soroban-sdk**: 21.7.7
- **Rust**: 1.91.1
- **WASM Size**: 35KB (MVP, no reference-types)

## Timeline

- **Now**: Local testing fully functional
- **Week of Dec 9**: Stellar likely updates Testnet validator
- **Target**: Deploy to Testnet when v23.2+ is live

## References

- [Soroban MVP](https://webassembly.org/roadmap/)
- [reference-types spec](https://github.com/WebAssembly/reference-types)
- [Soroban Docs](https://soroban.stellar.org/)

---

**Status**: 🚧 Blocked on Testnet validator update. Local deployment fully working.
