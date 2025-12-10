<template>
  <div class="register">
    <div class="register-container">
      <h1>Crear Cuenta</h1>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name">Nombre Completo</label>
          <input 
            v-model="form.name" 
            type="text" 
            id="name" 
            placeholder="Tu nombre"
            required
          >
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            id="email" 
            placeholder="tu@email.com"
            required
          >
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            v-model="form.password" 
            type="password" 
            id="password" 
            placeholder="••••••••"
            required
            minlength="8"
          >
          <small>Mínimo 8 caracteres</small>
        </div>

        <div class="form-group">
          <label for="phone">Teléfono</label>
          <input 
            v-model="form.phone" 
            type="tel" 
            id="phone" 
            placeholder="555-1234"
            required
          >
        </div>

        <div class="form-group">
          <label for="birthdate">Fecha de Nacimiento</label>
          <input 
            v-model="form.birthDate" 
            type="date" 
            id="birthdate"
            required
          >
        </div>

        <div class="form-group">
          <label for="gender">Género</label>
          <select v-model="form.gender" id="gender" required>
            <option value="">Selecciona...</option>
            <option value="Male">Masculino</option>
            <option value="Female">Femenino</option>
            <option value="Other">Otro</option>
          </select>
        </div>

        <div v-if="authStore.error" class="alert alert-error">
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Registrando...' : 'Crear Cuenta' }}
        </button>

        <p class="login-link">
          ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  birthDate: '',
  gender: ''
})

const handleRegister = async () => {
  try {
    await authStore.register(form.value)
    router.push('/')
  } catch (error) {
    console.error('Error registrando:', error)
  }
}
</script>

<style scoped>
.register {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.register-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.register-container h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
  color: #999;
  margin-top: 0.25rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.btn {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
