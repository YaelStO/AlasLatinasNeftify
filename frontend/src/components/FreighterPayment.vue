<template>
  <div class="payment-card">
    <h3>{{ destination.name }}</h3>
    <p>{{ destination.description }}</p>

    <div v-if="!isConnected" class="connect-section">
      <button @click="connectFreighter" :disabled="loading">
        {{ loading ? 'Conectando...' : 'Conectar Freighter' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div v-else class="payment-section">
      <p>Wallet: {{ publicKey?.substring(0, 10) }}...</p>
      <div class="form-group">
        <label>Cantidad (stroops):</label>
        <input v-model.number="amountStroops" type="number" placeholder="Ej: 1000000" />
      </div>
      <div class="form-group">
        <label>Destino (Public Key):</label>
        <input v-model="destinationAddress" type="text" placeholder="GXXXXXX..." />
      </div>
      <button @click="submitPayment" :disabled="loading">
        {{ loading ? 'Procesando...' : 'Pagar con Freighter' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">
        Pago exitoso! TX: <a :href="`https://stellar.expert/explorer/testnet/tx/${txHash}`" target="_blank">{{ txHash }}</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Keypair, TransactionBuilder, Operation, Asset, Networks, Server } from '@stellar/stellar-sdk'

const props = defineProps({
  destination: {
    type: Object,
    required: true
  }
})

const isConnected = ref(false)
const publicKey = ref(null)
const amountStroops = ref(1000000) // 0.1 XLM en stroops
const destinationAddress = ref(props.destination?.id || '')
const loading = ref(false)
const error = ref(null)
const success = ref(false)
const txHash = ref(null)

const connectFreighter = async () => {
  try {
    loading.value = true
    error.value = null

    if (!window.freighter) {
      throw new Error('Freighter no está instalado. Descárgalo desde https://www.freighter.app/')
    }

    const key = await window.freighter.getPublicKey()
    publicKey.value = key
    isConnected.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const submitPayment = async () => {
  try {
    loading.value = true
    error.value = null
    success.value = false

    if (!publicKey.value) {
      throw new Error('Necesitas conectar Freighter primero')
    }

    if (!amountStroops.value || amountStroops.value <= 0) {
      throw new Error('Ingresa una cantidad válida')
    }

    if (!destinationAddress.value) {
      throw new Error('Ingresa una dirección de destino')
    }

    // Build transaction (use env override if provided)
    const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org'
    const server = new Server(HORIZON_URL)
    const sourceAccount = await server.loadAccount(publicKey.value)

    const txBuilder = new TransactionBuilder(sourceAccount, {
      fee: 100,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(Operation.payment({
        destination: destinationAddress.value,
        asset: Asset.native(),
        amount: (amountStroops.value / 10000000).toString()
      }))
      .setTimeout(30)

    const tx = txBuilder.build()

    // Sign with Freighter
    const { signedXDR } = await window.freighter.signTransaction(
      tx.toXDR(),
      {
        network: Networks.TESTNET,
        accountToSign: publicKey.value
      }
    )

    // Submit to Horizon
    const txObj = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
    const submitResponse = await server.submitTransaction(txObj)

    txHash.value = submitResponse.hash
    success.value = true

    // Optional: notify backend to update reservation status
    // await axios.put('/api/reservations', { reservationId: ..., paymentStatus: 'completed', txHash: submitResponse.hash })
  } catch (err) {
    error.value = err.message || 'Error en el pago'
    console.error('Payment error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.payment-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
}

.connect-section,
.payment-section {
  margin-top: 20px;
}

.form-group {
  margin: 10px 0;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}

.success a {
  color: green;
  text-decoration: underline;
}
</style>
