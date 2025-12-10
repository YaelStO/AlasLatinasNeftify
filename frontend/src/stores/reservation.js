import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useReservationStore = defineStore('reservation', () => {
  const reservations = ref([])
  const currentReservation = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const fetchReservations = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/reservations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      })
      reservations.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error cargando reservas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getReservation = async (resId) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get(`/api/reservations/${resId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      })
      currentReservation.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error cargando reserva'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createReservation = async (resData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/reservations', resData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      })
      reservations.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error creando reserva'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const cancelReservation = async (resId) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post(`/api/reservations/${resId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      })
      const idx = reservations.value.findIndex(r => r.id === resId)
      if (idx !== -1) {
        reservations.value[idx] = response.data
      }
      if (currentReservation.value?.id === resId) {
        currentReservation.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error cancelando reserva'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const payReservation = async (resId, paymentData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post(`/api/reservations/${resId}/pay`, paymentData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      })
      const idx = reservations.value.findIndex(r => r.id === resId)
      if (idx !== -1) {
        reservations.value[idx] = response.data
      }
      if (currentReservation.value?.id === resId) {
        currentReservation.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error pagando reserva'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    reservations,
    currentReservation,
    isLoading,
    error,
    fetchReservations,
    getReservation,
    createReservation,
    cancelReservation,
    payReservation
  }
})
