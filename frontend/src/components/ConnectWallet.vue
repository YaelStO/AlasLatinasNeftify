<template>
  <div class="wallet-section">
    <h2>🪙 Conectar Wallet</h2>
    
    <div v-if="!isFreighterInstalled" class="alert alert-warning">
      <p>Freighter no está instalado. Descárgalo desde: <a href="https://www.freighter.app" target="_blank">freighter.app</a></p>
    </div>

    <div v-else-if="!walletConnected" class="wallet-connect">
      <button @click="connectWallet" class="btn btn-primary">
        Conectar Freighter Wallet
      </button>
      <p class="wallet-info">Conecta tu wallet de Stellar para realizar transacciones en blockchain</p>
    </div>

    <div v-else class="wallet-connected">
      <div class="wallet-info-card">
        <h3>Wallet Conectada ✓</h3>
        <p><strong>Dirección:</strong></p>
        <code>{{ walletAddress }}</code>
        <p><strong>Red:</strong> {{ networkName }}</p>
      </div>

      <button @click="disconnectWallet" class="btn btn-secondary">
        Desconectar Wallet
      </button>

      <button @click="linkWalletToProfile" class="btn btn-primary" :disabled="isLinking">
        {{ isLinking ? 'Vinculando...' : 'Vincular a Mi Perfil' }}
      </button>

      <div v-if="linkError" class="alert alert-error">{{ linkError }}</div>
      <div v-if="linkSuccess" class="alert alert-success">{{ linkSuccess }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()

const isFreighterInstalled = ref(false)
const walletConnected = ref(false)
const walletAddress = ref('')
const networkName = ref('Testnet')
const isLinking = ref(false)
const linkError = ref('')
const linkSuccess = ref('')

// Check if Freighter is installed
onMounted(() => {
  isFreighterInstalled.value = !!window.freighter
})

// Connect to Freighter wallet
const connectWallet = async () => {
  try {
    linkError.value = ''
    linkSuccess.value = ''

    if (!window.freighter) {
      linkError.value = 'Freighter no está instalado'
      return
    }

    // Request public key from Freighter
    const publicKey = await window.freighter.getPublicKey()
    
    // Get network
    const network = await window.freighter.getNetwork()

    walletAddress.value = publicKey
    networkName.value = network.toLowerCase().includes('test') ? 'Testnet' : 'Mainnet'
    walletConnected.value = true
    
    linkSuccess.value = '✓ Wallet conectada exitosamente'
  } catch (error) {
    console.error('Error conectando wallet:', error)
    linkError.value = 'Error al conectar wallet: ' + (error.message || 'Desconocido')
  }
}

// Disconnect wallet
const disconnectWallet = () => {
  walletAddress.value = ''
  walletConnected.value = false
  linkError.value = ''
  linkSuccess.value = ''
}

// Link wallet to user profile
const linkWalletToProfile = async () => {
  try {
    isLinking.value = true
    linkError.value = ''
    linkSuccess.value = ''

    if (!authStore.isAuthenticated) {
      linkError.value = 'Debes estar autenticado para vincular una wallet'
      return
    }

    // Call backend endpoint to link wallet
    const response = await axios.post('/api/auth/link-wallet', {
      walletAddress: walletAddress.value,
      network: networkName.value
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    linkSuccess.value = '✓ Wallet vinculada a tu perfil exitosamente'
    authStore.user.wallet_address = walletAddress.value

  } catch (error) {
    console.error('Error vinculando wallet:', error)
    linkError.value = 'Error: ' + (error.response?.data?.message || error.message || 'Desconocido')
  } finally {
    isLinking.value = false
  }
}
</script>

<style scoped>
.wallet-section {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  margin: 1rem 0;
}

.wallet-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.alert-warning {
  background-color: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
  color: #fff;
}

.alert-error {
  background-color: rgba(244, 67, 54, 0.2);
  border: 1px solid #f44336;
  color: #ffcdd2;
}

.alert-success {
  background-color: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
  color: #c8e6c9;
}

.alert a {
  color: #ffc107;
  text-decoration: underline;
}

.wallet-connect {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.wallet-info {
  font-size: 0.9rem;
  opacity: 0.9;
}

.wallet-connected {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wallet-info-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.wallet-info-card h3 {
  margin-top: 0;
}

.wallet-info-card code {
  display: block;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem;
  border-radius: 4px;
  word-break: break-all;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  font-family: 'Courier New', monospace;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #fff;
  color: #667eea;
  font-weight: bold;
}

.btn-primary:hover:not(:disabled) {
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
