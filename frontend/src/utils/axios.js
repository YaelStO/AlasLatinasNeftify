import axios from 'axios'

// Configurar baseURL según entorno
// VITE_API_URL may be set to '/api' in production (so client requests like '/api/...' work).
// If we set axios.baseURL to '/api' and the code also uses paths that begin with '/api',
// requests will become '/api/api/...'. To avoid that, when VITE_API_URL === '/api' we
// leave baseURL empty and let the requests use absolute '/api/...' paths so Vercel
// will route them correctly. For local development, .env.local sets VITE_API_URL to
// the backend URL (e.g. 'http://localhost:3001') and we use that as baseURL.
const envBase = import.meta.env.VITE_API_URL
let baseURL
if (envBase === '/api' || typeof envBase === 'undefined' || envBase === '') {
  // In production the frontend calls absolute '/api/...' so leave baseURL blank.
  // Also guards against undefined/empty values.
  baseURL = ''
} else {
  // Use explicit backend URL (local dev) like http://localhost:3001
  baseURL = envBase
}

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
