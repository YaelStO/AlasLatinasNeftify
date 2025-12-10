# Referencia Rápida: Freighter en el Frontend

## Uso Rápido

### 1. Componente listo para usar
```vue
<FreighterPaymentSimple 
  :destination="destinationKey"
  :amount="1.5"
  @payment-success="onPaymentDone"
/>
```

### 2. Composable para lógica personalizada
```vue
<script setup>
import { useFreighter } from '@/composables/useFreighter'

const freighter = useFreighter()

// Conectar
await freighter.connectFreighter()

// Pagar
const result = await freighter.signPayment({
  destination: 'GXXX...',
  amount: '1.5'
})

console.log('TX:', result.hash)
</script>
```

## Importes Necesarios

```javascript
// En tu componente
import FreighterPaymentSimple from '@/components/FreighterPaymentSimple.vue'
import { useFreighter } from '@/composables/useFreighter'
```

## API del Composable

```javascript
const {
  // Estado
  isConnected,        // boolean
  publicKey,          // string | null
  loading,            // boolean
  error,              // string | null
  
  // Métodos
  isFreighterInstalled(),     // () => boolean
  connectFreighter(),         // () => Promise<string> (retorna public key)
  signPayment(options),       // (options) => Promise<{ hash, xdr }>
  signCustomTransaction(xdr), // (xdr) => Promise<signedXDR>
  disconnect()                // () => void
} = useFreighter()
```

## Opciones de signPayment()

```javascript
freighter.signPayment({
  destination: 'GXXX...',  // Requerido: public key destinatario
  amount: '1.5',           // Requerido: monto en XLM (string)
  assetCode: 'native',     // Opcional: 'native' o código del asset
  issuer: null             // Opcional: public key del issuer del asset
})
```

## Estructura de Archivos

```
frontend/
├── src/
│   ├── components/
│   │   ├── FreighterPayment.vue          ← Componente avanzado (full featured)
│   │   └── FreighterPaymentSimple.vue    ← Componente simple (recomendado)
│   ├── composables/
│   │   └── useFreighter.js               ← Lógica reutilizable
│   └── views/
│       └── DestinationDetail.vue         ← Ya integrado
└── docs/
    ├── FREIGHTER_INTEGRATION.md          ← Guía completa
    └── FREIGHTER_TESTING_GUIDE.md        ← Testing step-by-step
```

## Ejemplo Completo

```vue
<template>
  <div>
    <h2>Pagar Viaje</h2>
    
    <!-- Si no está conectado -->
    <button 
      v-if="!freighter.isConnected"
      @click="freighter.connectFreighter"
      :disabled="freighter.loading"
    >
      Conectar Freighter
    </button>

    <!-- Si está conectado -->
    <div v-else>
      <p>Wallet: {{ freighter.publicKey }}</p>
      <button 
        @click="handlePayment"
        :disabled="freighter.loading"
      >
        Pagar 1.5 XLM
      </button>
      
      <div v-if="freighter.error" class="error">
        {{ freighter.error }}
      </div>
      
      <div v-if="txHash" class="success">
        Pagado! <a :href="`https://stellar.expert/explorer/testnet/tx/${txHash}`">Ver TX</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFreighter } from '@/composables/useFreighter'

const freighter = useFreighter()
const txHash = ref(null)

const handlePayment = async () => {
  const result = await freighter.signPayment({
    destination: 'GB4HTRZF3NF4EVQNPQAQ2ZJIPGCAXUCPZZRHSFMVRX53V5ZXTMHGX672',
    amount: '1.5'
  })
  txHash.value = result.hash
}
</script>
```

## Diferencia: FreighterPayment vs FreighterPaymentSimple

| Feature | Simple | Full |
|---------|--------|------|
| Conexión Freighter | ✓ | ✓ |
| Firmar pago | ✓ | ✓ |
| Formulario custom | ✗ | ✓ |
| Inputs destino/monto | ✗ | ✓ |
| Estilos customizables | Limitados | Sí |

**Recomendación:** Usa `FreighterPaymentSimple` en DestinationDetail, es más limpio.

## Testing Rápido

```bash
# 1. Instala Freighter desde https://www.freighter.app/

# 2. Abre el navegador con devtools
# 3. En console:
console.log(window.freighter) // Debe mostrar objeto

# 4. En la app, haz clic en "Conectar Freighter"
# 5. Aprueba en el popup

# 6. Ingresa un monto y haz clic en "Pagar"

# 7. Firma en Freighter

# 8. Verifica TX en Stellar Expert
# https://stellar.expert/explorer/testnet/tx/HASH_AQUI
```

## Env Vars (Netlify)

Si también quieres server-side signing (opcional):

```
JWT_SECRET=tu_secret_aqui
STELLAR_SEED=SXXXXXXX... (opcional)
NETLIFY_BLOBS_STORE=nombre_del_store
```

Si `STELLAR_SEED` NO está set, `/api/payments` retorna instrucciones para Freighter.

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Freighter no está instalado | Extension no descargada | Instala desde freighter.app |
| Invalid destination | Public key inválida | Verifica que comienza con G |
| Insufficient balance | Sin XLM en cuenta | Pide XLM en Friendbot |
| Transaction failed | Destino no existe | Valida destination key |

## Cheat Sheet

```javascript
// Verificar instalación
if (!window.freighter) alert('Instala Freighter')

// Conectar
const key = await freighter.connectFreighter()

// Pagar
const { hash } = await freighter.signPayment({
  destination: 'GXXX...',
  amount: '1'
})

// Ver TX
console.log(`https://stellar.expert/explorer/testnet/tx/${hash}`)

// Desconectar
freighter.disconnect()
```

## Próximos Pasos

1. ✓ Instala Freighter
2. ✓ Obtén XLM de Friendbot
3. ✓ Prueba el componente en DestinationDetail.vue
4. ✓ Verifica TX en Stellar Expert
5. Deploy a Netlify cuando estés listo

---

**Última actualización:** 2024 | **Version:** 1.0 | **Status:** Production-Ready
