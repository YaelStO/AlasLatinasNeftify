<template>
  <div class="profile">
    <div class="profile-container">
      <h1>Mi Perfil</h1>
      
      <div class="profile-card">
        <div class="profile-header">
          <h2>{{ authStore.user?.name }}</h2>
          <button @click="editMode = !editMode" class="btn btn-edit">
            {{ editMode ? 'Cancelar' : 'Editar Perfil' }}
          </button>
        </div>

        <div v-if="!editMode" class="profile-info">
          <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
          <p><strong>Teléfono:</strong> {{ authStore.user?.phone }}</p>
          <p><strong>Fecha de Nacimiento:</strong> {{ authStore.user?.birthDate }}</p>
          <p><strong>Género:</strong> {{ authStore.user?.gender }}</p>
          <p v-if="authStore.user?.wallet_address"><strong>Wallet:</strong> {{ authStore.user.wallet_address }}</p>
        </div>

        <form v-else @submit.prevent="handleUpdate" class="profile-form">
          <div class="form-group">
            <label for="name">Nombre</label>
            <input v-model="editForm.name" type="text" id="name" required>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input v-model="editForm.email" type="email" id="email" required>
          </div>

          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input v-model="editForm.phone" type="tel" id="phone" required>
          </div>

          <div v-if="authStore.error" class="alert alert-error">
            {{ authStore.error }}
          </div>

          <button type="submit" class="btn btn-primary" :disabled="authStore.isLoading">
            {{ authStore.isLoading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </form>
      </div>

      <div class="account-section">
        <h3>Gestión de Cuenta</h3>
        <button @click="handleDeleteAccount" class="btn btn-danger">
          Eliminar Cuenta
        </button>
      </div>

      <!-- Wallet Connection Component -->
      <ConnectWallet />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import ConnectWallet from '../components/ConnectWallet.vue'

const authStore = useAuthStore()
const router = useRouter()
const editMode = ref(false)
const editForm = ref({
  name: '',
  email: '',
  phone: ''
})

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    editForm.value = {
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone
    }
  }
}, { immediate: true })

const handleUpdate = async () => {
  try {
    await authStore.updateProfile(editForm.value)
    editMode.value = false
  } catch (error) {
    console.error('Error actualizando perfil:', error)
  }
}

const handleDeleteAccount = () => {
  if (confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
    authStore.logout()
    router.push('/')
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
}

.profile-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-container h1 {
  margin-bottom: 2rem;
}

.profile-card {
  margin-bottom: 2rem;
  border: 1px solid #eee;
  padding: 1.5rem;
  border-radius: 8px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.profile-header h2 {
  margin: 0;
}

.profile-info p {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.profile-info p:last-child {
  border-bottom: none;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.form-group input:focus {
  outline: none;
  border-color: #667eea;
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
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
}

.btn-edit {
  background: #667eea;
  color: white;
}

.btn-edit:hover {
  background: #764ba2;
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

.account-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>
