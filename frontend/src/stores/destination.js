import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useDestinationStore = defineStore('destination', () => {
  const destinations = ref([])
  const currentDestination = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const fetchDestinations = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/destinations')
      destinations.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error cargando destinos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getDestination = async (destId) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get(`/api/destinations/${destId}`)
      currentDestination.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error cargando destino'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createDestination = async (destData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/destinations', destData)
      destinations.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error creando destino'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateDestination = async (destId, destData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.put(`/api/destinations/${destId}`, destData)
      const idx = destinations.value.findIndex(d => d.id === destId)
      if (idx !== -1) {
        destinations.value[idx] = response.data
      }
      if (currentDestination.value?.id === destId) {
        currentDestination.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error actualizando destino'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteDestination = async (destId) => {
    isLoading.value = true
    error.value = null
    try {
      await axios.delete(`/api/destinations/${destId}`)
      destinations.value = destinations.value.filter(d => d.id !== destId)
      if (currentDestination.value?.id === destId) {
        currentDestination.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error eliminando destino'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    destinations,
    currentDestination,
    isLoading,
    error,
    fetchDestinations,
    getDestination,
    createDestination,
    updateDestination,
    deleteDestination
  }
})
