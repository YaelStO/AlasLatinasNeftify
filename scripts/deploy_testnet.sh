#!/usr/bin/env bash

# Soroban Testnet Contract Deployment Script
# Alas Latinas 3.0

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WASM_PATH="$PROJECT_DIR/target/wasm32-unknown-unknown/release/soroban_users.wasm"
PUBLIC_KEY="GA4GQGKRDFH6T2CH7EKIMDCEWPZJWRJ5KU5MJRMTXKMDLCOMBTRATBSC"
SECRET_KEY="SCDIECRLTLRI7VSEAIGUKLC2KLHC765JHHE4FDNSE62PFKK7CJY36RLQ"

echo "🚀 Deploying Soroban Contract to Stellar Testnet"
echo "================================================"
echo "Network: testnet"
echo "Public Key: $PUBLIC_KEY"
echo "Wasm: $WASM_PATH"
echo ""

# Build wasm if not present
if [ ! -f "$WASM_PATH" ]; then
  echo "Building release wasm..."
  cd "$PROJECT_DIR"
  cargo build --release --target wasm32-unknown-unknown
fi

if [ ! -f "$WASM_PATH" ]; then
  echo "❌ ERROR: wasm not found at $WASM_PATH"
  exit 3
fi

echo "✓ Wasm ready"
echo ""

# Configure testnet if not already configured
echo "Step 1: Configuring Soroban CLI for Testnet..."
soroban config network add \
  --name testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015" \
  2>/dev/null || echo "Network testnet already configured"

echo "✓ Network configured"
echo ""

# Deploy the contract
echo "Step 2: Deploying WASM contract..."
set -x
soroban contract deploy \
  --wasm "$WASM_PATH" \
  --network testnet \
  --source "$SECRET_KEY"
set +x

echo ""
echo "✅ Deployment completed!"
