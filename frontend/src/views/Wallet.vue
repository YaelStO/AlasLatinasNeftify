<template>
  <div class="page wallet-page">
    <h1>Conectar Wallet</h1>
    <p>Conecta tu Freighter Wallet y vincúlala a tu perfil.</p>
    <ConnectWallet />

    <section class="wallet-info" v-if="user">
      <h2>Tu información</h2>
      <p><strong>Usuario:</strong> {{ user.name || user.email }}</p>
      <p><strong>Wallet vinculada:</strong> <code v-if="user.wallet_address">{{ user.wallet_address }}</code><span v-else>No vinculada</span></p>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ConnectWallet from '../components/ConnectWallet.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const user = computed(() => auth.user)
</script>

<style scoped>
.wallet-page { padding: 1.5rem; }
.wallet-info { margin-top: 1.5rem; background: #fff; padding: 1rem; border-radius: 6px; }
code { background:#f5f5f5; padding:0.25rem 0.5rem; border-radius:4px; }
</style>
