import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const register = async (userData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/auth/register', userData)
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error en el registro'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const login = async (email, password) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error en el login'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    error.value = null
  }

  const updateProfile = async (userData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.put('/api/auth/profile', userData, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error actualizando perfil'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Cargar usuario desde localStorage si existe
  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  loadUserFromStorage()

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile
  }
})
