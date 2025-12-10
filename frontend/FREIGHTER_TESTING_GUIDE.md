# Guía de Prueba: Integración Freighter en Frontend

## 1. Requisitos Previos

### Instalar Freighter
- Descarga la extensión Freighter desde: https://www.freighter.app/
- Disponible para Chrome, Firefox y Edge
- Crea una nueva wallet o importa una existente

### Obtener XLM de Testnet
- Vuelve a descargar testnet XLM desde el Friendbot
- URL: https://stellar.org/account-viewer
- O usa este script:

```bash
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"
```

## 2. Estructura de Componentes Vue

### `src/composables/useFreighter.js`
Composable reusable que ofrece:
- `isFreighterInstalled()` - Verifica si Freighter está instalado
- `connectFreighter()` - Abre el popup de Freighter para conectar wallet
- `signPayment(options)` - Firma una transacción de pago
- `signCustomTransaction(xdr)` - Firma una transacción XDR personalizada
- `disconnect()` - Desconecta la wallet

### `src/components/FreighterPaymentSimple.vue`
Componente reutilizable para pagos:
```vue
<FreighterPaymentSimple 
  :destination="publicKey"
  :amount="0.1"
  @payment-success="handlePaymentSuccess"
/>
```

Props:
- `destination` (String): Public key del destinatario
- `amount` (Number/String): Monto en XLM

Events:
- `payment-success`: Emitido cuando el pago es exitoso con { txHash, xdr }

## 3. Integración en Componentes

### Ejemplo 1: Uso simple en componente
```vue
<script setup>
import { useFreighter } from '@/composables/useFreighter'

const freighter = useFreighter()

const payForReservation = async () => {
  await freighter.connectFreighter()
  const result = await freighter.signPayment({
    destination: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    amount: '1.5'
  })
  console.log('Transaction hash:', result.hash)
}
</script>

<template>
  <button @click="payForReservation">Pagar con Freighter</button>
</template>
```

### Ejemplo 2: Con manejo de errores completo
```vue
<script setup>
import { ref } from 'vue'
import { useFreighter } from '@/composables/useFreighter'

const freighter = useFreighter()
const txHash = ref(null)

const handlePayment = async (destination, amount) => {
  try {
    if (!freighter.isFreighterInstalled()) {
      alert('Por favor instala Freighter primero')
      return
    }

    await freighter.connectFreighter()
    
    const result = await freighter.signPayment({
      destination,
      amount: String(amount)
    })
    
    txHash.value = result.hash
    // Notificar backend (opcional)
    // await axios.put('/api/reservations', { txHash: result.hash })
  } catch (error) {
    console.error('Error:', error.message)
    alert('Error: ' + error.message)
  }
}
</script>
```

### Ejemplo 3: Con asset diferente a XLM
```javascript
const result = await freighter.signPayment({
  destination: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  amount: '100',
  assetCode: 'USDC',
  issuer: 'GBBD47UZQ5PJ7VHV2DV7AJVF2ZMGVMB6LJMVGUGDPVK5XTFG47LFKJFT'
})
```

## 4. Flujo de Pago Completo

### Frontend (Freighter)
```
1. Usuario hace clic en "Pagar con Freighter"
   ↓
2. Componente llama connectFreighter()
   ↓
3. Se abre popup de Freighter (aprobación de usuario)
   ↓
4. Componente construye transacción con signPayment()
   ↓
5. Se abre popup de Freighter para firmar (segundo paso)
   ↓
6. Transacción firmada se envía a Horizon
   ↓
7. Si éxito: txHash disponible
   ↓
8. Opcional: Notificar backend
```

### Backend (Netlify Functions)
Si prefieres server-side signing (requiere STELLAR_SEED env var):

```
1. POST /api/payments con { destination, amountStroops }
   ↓
2. jwt-verify: Validar token
   ↓
3. stellar-sdk: Construir transacción
   ↓
4. stellar-sdk: Firmar con Keypair.fromSecret(STELLAR_SEED)
   ↓
5. Horizon: Enviar transacción
   ↓
6. Responder con { hash, status }
```

## 5. Pasos de Prueba

### Test 1: Verificar instalación de Freighter
```javascript
// En console del navegador
console.log(window.freighter)
// Debe mostrar objeto con métodos: getPublicKey, signTransaction, etc.
```

### Test 2: Conectar wallet
1. Abre http://localhost:3000
2. Inicia sesión
3. Ve a cualquier destino
4. Haz clic en "Conectar Freighter"
5. Se debe abrir popup de Freighter
6. Selecciona tu wallet y aprueba
7. Debe mostrar tu public key conectada

### Test 3: Realizar pago
1. Con wallet conectada
2. Ingresa destination address: `GB4HTRZF3NF4EVQNPQAQ2ZJIPGCAXUCPZZRHSFMVRX53V5ZXTMHGX672` (o tu key)
3. Ingresa monto (ej: 0.1 XLM)
4. Haz clic en "Pagar"
5. Se abre popup para firmar
6. Aprueba en Freighter
7. Espera respuesta
8. Debe mostrar link a transaction hash

### Test 4: Verificar en Stellar Expert
```
https://stellar.expert/explorer/testnet/tx/HASH_AQUI
```

## 6. Troubleshooting

### Freighter no se abre
- Verifica que está instalado: `console.log(window.freighter)`
- Recarga la página después de instalar
- Asegúrate que está en la red Testnet

### Error: "Invalid transaction envelope"
- Verifica que destination es una public key válida (comienza con G)
- Verifica que tu cuenta tiene suficiente XLM

### Error: "Transaction failed"
- Revisa en Horizon: https://horizon-testnet.stellar.org/transactions/HASH
- Puede ser: insufficient balance, invalid destination, etc.

### El monto no se envía correctamente
- En Freighter payment: usa amount en XLM (1.5 = 1.5 XLM)
- En backend: espera amountStroops (1500000 = 0.15 XLM)

## 7. Código de Referencia: DestinationDetail.vue

El componente principal ya integra:
- `FreighterPaymentSimple` para pago con wallet
- Fallback a `/api/payments` para server-side signing

```vue
<FreighterPaymentSimple 
  :destination="destPublicKey"
  :amount="amount"
  @payment-success="handleFreighterPaymentSuccess"
/>
```

## 8. Alternativa: Server-side Signing

Si prefieres que el backend firme transacciones:

1. **Set env var en Netlify:**
```
STELLAR_SEED=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

2. **El endpoint POST /api/payments automáticamente:**
   - Si STELLAR_SEED está configurado: firma server-side
   - Si no: retorna instrucciones para Freighter

3. **Ventajas:**
   - No necesitas que usuario instale Freighter
   - Máyor control del backend

4. **Desventajas:**
   - Menos seguro (seed en servidor)
   - No funciona sin conexión
   - Seed puede comprometerse

## 9. Seguridad

### Frontend (Freighter - Recomendado)
✅ Seguro: Las claves privadas nunca salen de la extensión
✅ User-controlled: Usuario aprueba cada transacción
✅ No depende de servidor

### Backend (STELLAR_SEED)
⚠️ Riesgo: Seed almacenado en servidor
⚠️ Riesgo: Si servidor se compromete, todas las transacciones pueden hacerse
⚠️ Usar solo para desarrollo o testing

## 10. Próximos Pasos

1. **Testing en Testnet:**
   - Prueba todos los flujos
   - Verifica txs en Stellar Expert
   - Documenta errores

2. **Desplegar a Netlify:**
   - Push a GitHub
   - Conecta a Netlify
   - Las funciones se desplegarán automáticamente

3. **Integrar con reservaciones:**
   - Actualizar reserva cuando pago es exitoso
   - `PUT /api/reservations` con { paymentStatus: 'completed' }

4. **Producción:**
   - Cambiar a Mainnet en lugar de Testnet
   - Actualizar URLs de Horizon y RPC
   - Aumentar fees según demanda

## 11. URLs Útiles

- **Freighter:** https://www.freighter.app/
- **Stellar Testnet:** https://stellar.org/lumens/testnet
- **Horizon Testnet:** https://horizon-testnet.stellar.org
- **Stellar Expert:** https://stellar.expert/explorer/testnet
- **stellar-sdk Docs:** https://developers.stellar.org/docs/sdk/js/api
- **Freighter SDK:** https://github.com/stellar/js-stellar-sdk/wiki/Using-Freighter

## 12. Configuración de VITE (si es necesario)

En `vite.config.js`, asegúrate que el backend está correctamente apuntado:

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}
```

Para desarrollo local, axios ya está configurado en `src/utils/axios.js`.
