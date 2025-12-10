<template>
  <div class="reservation-detail">
    <router-link to="/reservations" class="back-link">← Volver</router-link>

    <div v-if="reservationStore.isLoading" class="loading">
      Cargando reserva...
    </div>

    <div v-else-if="reservationStore.error" class="alert alert-error">
      {{ reservationStore.error }}
    </div>

    <div v-else-if="reservationStore.currentReservation" class="detail-container">
      <div class="res-header">
        <h1>Detalles de la Reserva</h1>
        <span class="status" :class="`status-${reservationStore.currentReservation.status}`">
          {{ reservationStore.currentReservation.status }}
        </span>
      </div>

      <div class="res-details">
        <section class="detail-section">
          <h2>Información de la Reserva</h2>
          <p><strong>ID Reserva:</strong> {{ reservationStore.currentReservation.id }}</p>
          <p><strong>Destino:</strong> {{ reservationStore.currentReservation.destinationName }}</p>
          <p><strong>Check-in:</strong> {{ formatDate(reservationStore.currentReservation.checkIn) }}</p>
          <p><strong>Check-out:</strong> {{ formatDate(reservationStore.currentReservation.checkOut) }}</p>
          <p><strong>Precio Total:</strong> ${{ reservationStore.currentReservation.totalPrice }}</p>
        </section>

        <section class="detail-section">
          <h2>Estado de Pago</h2>
          <p v-if="reservationStore.currentReservation.paid" class="paid">
            ✅ Esta reserva ha sido pagada
          </p>
          <p v-else>
            ⏳ El pago aún está pendiente
          </p>

          <div v-if="!reservationStore.currentReservation.paid" class="payment-section">
            <h3>Procesar Pago</h3>
            <div class="payment-form">
              <div class="form-group">
                <label>Número de Tarjeta</label>
                <input 
                  v-model="paymentData.cardNumber" 
                  placeholder="4111 1111 1111 1111"
                  maxlength="19"
                >
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Vencimiento</label>
                  <input v-model="paymentData.expiryDate" placeholder="MM/YY">
                </div>
                <div class="form-group">
                  <label>CVV</label>
                  <input v-model="paymentData.cvv" placeholder="123" maxlength="3">
                </div>
              </div>

              <button 
                @click="processPay" 
                class="btn btn-pay"
                :disabled="reservationStore.isLoading"
              >
                {{ reservationStore.isLoading ? 'Procesando...' : `Pagar $${reservationStore.currentReservation.totalPrice}` }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <div v-if="reservationStore.currentReservation.status === 'reserved'" class="actions">
        <button @click="cancelRes" class="btn btn-danger">
          Cancelar Reserva
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReservationStore } from '../stores/reservation'

const route = useRoute()
const router = useRouter()
const reservationStore = useReservationStore()

const paymentData = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: ''
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const processPay = async () => {
  try {
    await reservationStore.payReservation(route.params.id, paymentData.value)
    alert('¡Pago realizado exitosamente!')
  } catch (error) {
    console.error('Error procesando pago:', error)
  }
}

const cancelRes = async () => {
  if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
    try {
      await reservationStore.cancelReservation(route.params.id)
      router.push('/reservations')
    } catch (error) {
      console.error('Error cancelando:', error)
    }
  }
}

onMounted(async () => {
  try {
    await reservationStore.getReservation(route.params.id)
  } catch (error) {
    console.error('Error cargando reserva:', error)
  }
})
</script>

<style scoped>
.reservation-detail {
  max-width: 800px;
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

.res-header {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.res-header h1 {
  margin: 0;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.3);
}

.res-details {
  padding: 2rem;
}

.detail-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h2 {
  margin-top: 0;
  color: #333;
}

.detail-section p {
  margin: 0.75rem 0;
  line-height: 1.6;
}

.paid {
  color: #2e7d32;
  font-weight: 600;
  background: #e8f5e9;
  padding: 1rem;
  border-radius: 4px;
}

.payment-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.actions {
  padding: 2rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-pay {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  width: 100%;
}

.btn-pay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #da190b;
}
</style>
