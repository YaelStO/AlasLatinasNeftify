<template>
  <div class="home">
    <div class="hero">
      <h1>🌎 Bienvenido a Alas Latinas 3.0</h1>
      <p>Tu plataforma de viajes con tecnología Soroban en Stellar</p>
      <div class="hero-buttons">
        <router-link to="/destinations" class="btn btn-primary">Explorar Destinos</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/register" class="btn btn-secondary">
          Crear Cuenta
        </router-link>
        <router-link v-if="authStore.isAuthenticated" to="/reservations" class="btn btn-secondary">
          Ver Mis Reservas
        </router-link>
      </div>
    </div>

    <section class="features">
      <h2>Características Principales</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>🏖️ Destinos</h3>
          <p>Explora miles de destinos turísticos alrededor del mundo</p>
        </div>
        <div class="feature-card">
          <h3>📅 Reservas</h3>
          <p>Reserva fácilmente tus viajes con confirmación inmediata</p>
        </div>
        <div class="feature-card">
          <h3>💰 Pagos Seguros</h3>
          <p>Transacciones seguras con blockchain de Stellar</p>
        </div>
        <div class="feature-card">
          <h3>⭐ Comentarios</h3>
          <p>Lee y comparte experiencias con otros viajeros</p>
        </div>
      </div>
    </section>

    <section class="info" v-if="authStore.isAuthenticated">
      <h2>Tu Cuenta</h2>
      <div class="user-info">
        <p><strong>Usuario:</strong> {{ authStore.user?.name }}</p>
        <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-block;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.features {
  margin-bottom: 3rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.info {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info h2 {
  margin-bottom: 1rem;
}

.user-info p {
  padding: 0.5rem 0;
}
</style>
