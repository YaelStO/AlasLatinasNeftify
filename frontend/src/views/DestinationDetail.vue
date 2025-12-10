<template>
  <div class="destination-detail">
    <router-link to="/destinations" class="back-link">← Volver</router-link>

    <div v-if="destinationStore.isLoading" class="loading">
      Cargando destino...
    </div>

    <div v-else-if="destinationStore.error" class="alert alert-error">
      {{ destinationStore.error }}
    </div>

    <div v-else-if="destinationStore.currentDestination" class="detail-container">
      <div class="destination-header">
        <h1>{{ destinationStore.currentDestination.name }}</h1>
        <span class="rating" v-if="destinationStore.currentDestination.rating">
          ⭐ {{ destinationStore.currentDestination.rating }}/5
        </span>
      </div>

      <div class="detail-content">
        <section class="info-section">
          <h2>Información</h2>
          <p><strong>📍 Ubicación:</strong> {{ destinationStore.currentDestination.location }}</p>
          <p><strong>🏢 Dirección:</strong> {{ destinationStore.currentDestination.address }}</p>
          <p><strong>📝 Descripción:</strong> {{ destinationStore.currentDestination.description }}</p>
        </section>

        <section class="booking-section">
          <h2>Hacer una Reserva / Pagar</h2>
          <div v-if="authStore.isAuthenticated">
            <button @click="goToReservation" class="btn btn-primary" style="margin-bottom:0.75rem">Reservar Ahora</button>

            <!-- Freighter Payment Component -->
            <div style="margin-top:1.5rem; border-top: 1px solid #ddd; padding-top:1rem">
              <h3 style="margin-top:0; font-size:0.95rem; color:#333">Pago con Freighter</h3>
              <FreighterPaymentSimple 
                :destination="destPublicKey"
                :amount="amount"
                @payment-success="handleFreighterPaymentSuccess"
              />
            </div>

            <!-- Server-Side Payment (fallback) -->
            <div style="margin-top:1.5rem; border-top: 1px solid #ddd; padding-top:1rem">
              <h3 style="margin-top:0; font-size:0.95rem; color:#333">Pago Backend (opcional)</h3>
              <p style="font-size:0.85rem; color:#555; margin-top:0.25rem">Método preferido: <strong>Freighter</strong>. Usa la opción de backend solo si no puedes usar Freighter.</p>
              <div>
                <label style="display:block; margin-bottom:0.4rem; font-size:0.85rem">Destino (clave pública)</label>
                <input v-model="destPublicKey" type="text" placeholder="GB..." style="width:100%; padding:0.6rem; margin-bottom:0.5rem; font-size:0.85rem" />
                <label style="display:block; margin-bottom:0.4rem; font-size:0.85rem">Monto XLM</label>
                <input v-model="amount" type="number" min="0.0000001" step="0.0000001" style="width:100%; padding:0.6rem; margin-bottom:0.5rem; font-size:0.85rem" />
                <button :disabled="isPaying" @click="submitPayment" class="btn" style="font-size:0.85rem">{{ isPaying ? 'Enviando...' : 'Pagar (opcional)' }}</button>

                <div v-if="txHash" style="margin-top:0.6rem; font-size:0.85rem">
                  <div style="color:#388e3c">✓ Transacción: <a :href="txUrl" target="_blank">{{ txHash.substring(0, 16) }}...</a></div>
                  <div v-if="txMessage" style="color:#666; margin-top:0.25rem">{{ txMessage }}</div>
                </div>
                <div v-if="payError" style="color:#c33; margin-top:0.6rem; font-size:0.85rem">{{ payError }}</div>
              </div>
            </div>
          </div>
          <p v-else>
            <router-link to="/login">Inicia sesión</router-link> para hacer una reserva o pagar
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDestinationStore } from '../stores/destination'
import { useAuthStore } from '../stores/auth'
import axios from '../utils/axios'
import FreighterPaymentSimple from '../components/FreighterPaymentSimple.vue'

const route = useRoute()
const router = useRouter()
const destinationStore = useDestinationStore()
const authStore = useAuthStore()

const goToReservation = () => {
  router.push(`/reservations?destination=${route.params.id}`)
}

const amount = ref('1')
const isPaying = ref(false)
const txHash = ref('')
const txMessage = ref('')
const payError = ref('')
const destPublicKey = ref('GB4HTRZF3NF4EVQNPQAQ2ZJIPGCAXUCPZZRHSFMVRX53V5ZXTMHGX672')

const handleFreighterPaymentSuccess = async (payload) => {
  console.log('Freighter payment success:', payload)
  // Actualizar reserva automáticamente si existe o crear una y marcarla como pagada
  try {
    const reservationId = route.query.reservation || route.query.reservationId

    if (reservationId) {
      // Marcar pago como completado
      await axios.put('/api/reservations', { reservationId, paymentStatus: 'completed' })
      console.log('Reserva actualizada (paymentStatus=completed) para:', reservationId)
    } else {
      // Crear una reserva mínima y marcarla como pagada
      const dest = destinationStore.currentDestination || {}
      const createBody = {
        destinationId: route.params.id,
        destinationName: dest.name || 'Destino',
        checkInDate: null,
        checkOutDate: null,
        totalPrice: Number(amount.value) || 0
      }
      const createRes = await axios.post('/api/reservations', createBody)
      const newReservation = createRes.data?.reservation
      if (newReservation?.id) {
        await axios.put('/api/reservations', { reservationId: newReservation.id, paymentStatus: 'completed' })
        console.log('Reserva creada y marcada como pagada:', newReservation.id)
      } else {
        console.warn('No se pudo crear reserva antes de marcar como pagada')
      }
    }
  } catch (err) {
    console.error('Error actualizando reserva tras pago Freighter:', err)
    // Mostrar al usuario (no bloquear éxito del pago)
    payError.value = err.response?.data?.message || err.message || 'Error actualizando reserva tras pago'
  }
}

const submitPayment = async () => {
  payError.value = ''
  txHash.value = ''
  txMessage.value = ''
  if (!amount.value || Number(amount.value) <= 0) {
    payError.value = 'Ingresa un monto válido'
    return
  }
  try {
    isPaying.value = true
  // Convert XLM to stroops (1 XLM = 10_000_000 stroops)
  const stroops = Math.round(Number(amount.value) * 10000000)
  const res = await axios.post('/api/payments', { destination: destPublicKey.value, amountStroops: stroops })
    if (res.data && res.data.hash) {
      txHash.value = res.data.hash
      txMessage.value = 'Enviado correctamente (Testnet)'
    } else {
      payError.value = 'Respuesta inesperada del servidor'
    }
  } catch (err) {
    console.error('Payment error', err)
    payError.value = err.response?.data?.message || err.message || 'Error enviando pago'
  } finally {
    isPaying.value = false
  }
}

const txUrl = computed(() => txHash.value ? `https://horizon-testnet.stellar.org/transactions/${txHash.value}` : '')

onMounted(async () => {
  try {
    await destinationStore.getDestination(route.params.id)
  } catch (error) {
    console.error('Error cargando destino:', error)
  }
})
</script>

<style scoped>
.destination-detail {
  max-width: 900px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 1rem;
  transition: color 0.3s;
}

.back-link:hover {
  color: #764ba2;
}

.loading,
.alert {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.detail-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.destination-header {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.destination-header h1 {
  margin: 0;
  flex: 1;
  min-width: 200px;
}

.rating {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
}

.detail-content {
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
}

.info-section h2,
.booking-section h2 {
  margin-top: 0;
  color: #333;
}

.info-section p {
  margin: 1rem 0;
  line-height: 1.6;
}

.booking-section {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
}

.booking-section a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}
</style>
