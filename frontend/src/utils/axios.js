import axios from 'axios'

// Configurar baseURL según entorno
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

axios.defaults.baseURL = baseURL
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Interceptor para agregar token a cada request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axios
