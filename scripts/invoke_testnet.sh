#!/usr/bin/env bash
set -euo pipefail

# Helper to call basic contract methods on testnet after deployment.
# Usage:
#   CONTRACT_ID=... SECRET_KEY="SA..." bash scripts/invoke_testnet.sh
# or set CONTRACT_ID and SECRET_KEY in the environment.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -z "${CONTRACT_ID:-}" ]; then
  echo "ERROR: CONTRACT_ID env var not set. Example: CONTRACT_ID=CA..."
  exit 2
fi
if [ -z "${SECRET_KEY:-}" ]; then
  echo "ERROR: SECRET_KEY env var not set. Provide the secret for the source account."
  exit 2
fi

# Example: call list_users (no args)
echo "Invoking list_users on contract $CONTRACT_ID"
set -x
soroban contract invoke --id "$CONTRACT_ID" --fn list_users --network testnet --secret "$SECRET_KEY"
set +x

echo "Invoke finished."