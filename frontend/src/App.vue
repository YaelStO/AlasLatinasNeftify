<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>✈️ Alas Latinas 3.0</h1>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <router-link to="/destinations" class="nav-link">Destinos</router-link>
        <router-link to="/explorar-mundo" class="nav-link">Explorar</router-link>
        <router-link to="/visitas-raras" class="nav-link">Visitas Raras</router-link>
        <router-link to="/conoce-tu-pais" class="nav-link">Conoce Tu País</router-link>
        <router-link to="/wallet" class="nav-link">Wallet</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/login" class="nav-link">Login</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/register" class="nav-link">Registro</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/profile" class="nav-link">Mi Perfil</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/reservations" class="nav-link">Mis Reservas</router-link>
        <button v-if="authStore.isAuthenticated" @click="logout" class="btn-logout">Salir</button>
      </div>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <footer class="footer">
      <p>&copy; 2024 Alas Latinas 3.0 | Plataforma de Viajes con Soroban</p>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-brand h1 {
  font-size: 1.8rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav-link:hover {
  opacity: 0.8;
}

.nav-link.router-link-active {
  border-bottom: 2px solid white;
  padding-bottom: 5px;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
}
</style>
