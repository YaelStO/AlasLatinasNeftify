<template>
  <div class="payment-simple">
    <h4>Pagar Reserva</h4>

    <div v-if="!freighter.isConnected" class="connect-section">
      <button 
        @click="handleConnect" 
        :disabled="freighter.loading"
        class="btn btn-primary"
      >
        {{ freighter.loading ? 'Conectando...' : '🔐 Conectar Freighter' }}
      </button>
      <p v-if="freighter.error" class="error-text">
        {{ freighter.error }}
      </p>
    </div>

    <div v-else class="connected-section">
      <p class="wallet-info">
        Wallet: <code>{{ freighter.publicKey.substring(0, 12) }}...{{ freighter.publicKey.substring(freighter.publicKey.length - 8) }}</code>
      </p>
      
      <button 
        @click="handlePayment"
        :disabled="freighter.loading"
        class="btn btn-success"
      >
        {{ freighter.loading ? 'Procesando pago...' : '✓ Pagar' }}
      </button>

      <button 
        @click="handleDisconnect"
        class="btn btn-secondary"
      >
        Desconectar
      </button>

      <p v-if="freighter.error" class="error-text">{{ freighter.error }}</p>
      <p v-if="txHash" class="success-text">
        ✓ Pago completado!
        <a :href="`https://stellar.expert/explorer/testnet/tx/${txHash}`" target="_blank">
          Ver en Stellar Expert
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFreighter } from '../composables/useFreighter'

const props = defineProps({
  destination: {
    type: String,
    required: true
  },
  amount: {
    type: [Number, String],
    default: '0.1'
  }
})

const emit = defineEmits(['payment-success'])

const freighter = useFreighter()
const txHash = ref(null)

const handleConnect = async () => {
  try {
    await freighter.connectFreighter()
  } catch (err) {
    console.error('Failed to connect Freighter:', err)
  }
}

const handlePayment = async () => {
  try {
    const result = await freighter.signPayment({
      destination: props.destination,
      amount: String(props.amount)
    })
    txHash.value = result.hash
    emit('payment-success', { txHash: result.hash, xdr: result.xdr })
  } catch (err) {
    console.error('Payment failed:', err)
  }
}

const handleDisconnect = () => {
  freighter.disconnect()
  txHash.value = null
}
</script>

<style scoped>
.payment-simple {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.payment-simple h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #333;
}

.connect-section,
.connected-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallet-info {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 12px;
  margin: 8px 0;
  font-size: 0.9em;
}

.wallet-info code {
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1976d2;
}

.btn-success {
  background-color: #4caf50;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #388e3c;
}

.btn-secondary {
  background-color: #757575;
  color: white;
  font-size: 0.85em;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #616161;
}

.error-text {
  color: #d32f2f;
  background: #ffebee;
  border-left: 4px solid #d32f2f;
  padding: 12px;
  margin: 8px 0;
  font-size: 0.9em;
}

.success-text {
  color: #388e3c;
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 12px;
  margin: 8px 0;
  font-size: 0.9em;
}

.success-text a {
  color: #1976d2;
  text-decoration: none;
  font-weight: bold;
}

.success-text a:hover {
  text-decoration: underline;
}
</style>
