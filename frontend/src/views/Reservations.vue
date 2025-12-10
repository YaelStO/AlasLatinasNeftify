<template>
  <div class="reservations">
    <h1>Mis Reservas</h1>

    <div v-if="reservationStore.isLoading" class="loading">
      Cargando reservas...
    </div>

    <div v-else-if="reservationStore.error" class="alert alert-error">
      {{ reservationStore.error }}
    </div>

    <div v-else class="reservations-container">
      <div v-if="reservationStore.reservations.length === 0" class="no-reservations">
        <p>No tienes reservas aún</p>
        <router-link to="/destinations" class="btn btn-primary">
          Explorar Destinos
        </router-link>
      </div>

      <div v-else class="reservations-list">
        <div 
          v-for="res in reservationStore.reservations" 
          :key="res.id"
          class="reservation-card"
        >
          <div class="res-header">
            <h3>{{ res.destinationName }}</h3>
            <span class="status" :class="`status-${res.status}`">
              {{ res.status }}
            </span>
          </div>

          <div class="res-details">
            <p><strong>ID:</strong> {{ res.id }}</p>
            <p><strong>Check-in:</strong> {{ formatDate(res.checkIn) }}</p>
            <p><strong>Check-out:</strong> {{ formatDate(res.checkOut) }}</p>
            <p><strong>Precio Total:</strong> ${{ res.totalPrice }}</p>
            <p><strong>Estado de Pago:</strong> 
              <span :class="{ paid: res.paid }">
                {{ res.paid ? '✅ Pagado' : '⏳ Pendiente' }}
              </span>
            </p>
          </div>

          <div class="res-actions">
            <button 
              v-if="res.status === 'reserved' && !res.paid"
              @click="goToPay(res.id)"
              class="btn btn-success"
            >
              Pagar Ahora
            </button>
            <button 
              v-if="res.status === 'reserved'"
              @click="cancelReservation(res.id)"
              class="btn btn-danger"
            >
              Cancelar
            </button>
            <router-link 
              :to="`/reservations/${res.id}`" 
              class="btn btn-info"
            >
              Ver Detalles
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useReservationStore } from '../stores/reservation'
import { useRouter } from 'vue-router'

const reservationStore = useReservationStore()
const router = useRouter()

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goToPay = (resId) => {
  router.push(`/reservations/${resId}`)
}

const cancelReservation = async (resId) => {
  if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
    try {
      await reservationStore.cancelReservation(resId)
    } catch (error) {
      console.error('Error cancelando reserva:', error)
    }
  }
}

onMounted(async () => {
  try {
    await reservationStore.fetchReservations()
  } catch (error) {
    console.error('Error cargando reservas:', error)
  }
})
</script>

<style scoped>
.reservations {
  max-width: 1000px;
  margin: 0 auto;
}

.reservations h1 {
  margin-bottom: 2rem;
}

.loading,
.alert,
.no-reservations {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
  margin-bottom: 2rem;
}

.no-reservations {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reservation-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.reservation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.res-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.res-header h3 {
  margin: 0;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.status-reserved {
  background: #e3f2fd;
  color: #1976d2;
}

.status-cancelled {
  background: #ffebee;
  color: #c62828;
}

.status-completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.res-details {
  margin: 1rem 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.res-details p {
  margin: 0;
  font-size: 0.95rem;
}

.res-details strong {
  color: #333;
}

.paid {
  color: #2e7d32;
  font-weight: 600;
}

.res-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-success {
  background: #4caf50;
  color: white;
}

.btn-success:hover {
  background: #45a049;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #da190b;
}

.btn-info {
  background: #2196f3;
  color: white;
}

.btn-info:hover {
  background: #0b7dda;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
}
</style>
