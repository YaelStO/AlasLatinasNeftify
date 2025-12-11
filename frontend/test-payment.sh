#!/bin/bash
# Script para probar el endpoint de pagos

echo "🧪 Probando endpoint POST /api/payments..."
echo

# Parámetros de prueba
DESTINATION="GB4HTRZF3NF4EVQNPQAQ2ZJIPGCAXUCPZZRHSFMVRX53V5ZXTMHGX672"  # cuenta destino testdst
AMOUNT_STROOPS=1000000  # 0.1 XLM

# Hacer la solicitud POST
echo "Enviando solicitud:"
echo "  Destino: $DESTINATION"
echo "  Monto: $AMOUNT_STROOPS stroops (0.1 XLM)"
echo

RESPONSE=$(curl -s -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d "{\"destination\": \"$DESTINATION\", \"amountStroops\": $AMOUNT_STROOPS}")

echo "Respuesta del servidor:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo

# Si hay un hash, mostrar enlace a Horizon
HASH=$(echo "$RESPONSE" | jq -r '.hash // empty' 2>/dev/null)
if [ ! -z "$HASH" ]; then
  echo "✅ Transacción enviada con éxito!"
  echo "Hash: $HASH"
  echo "Ver en Horizon: https://horizon-testnet.stellar.org/transactions/$HASH"
else
  ERROR=$(echo "$RESPONSE" | jq -r '.message // .details // empty' 2>/dev/null)
  if [ ! -z "$ERROR" ]; then
    echo "❌ Error: $ERROR"
  fi
fi
