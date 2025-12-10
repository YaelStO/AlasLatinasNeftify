<template>
  <div class="destinations">
    <div class="destinations-header">
      <h1>Destinos</h1>
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar destino..."
          class="search-input"
        >
      </div>
    </div>

    <div v-if="destinationStore.isLoading" class="loading">
      Cargando destinos...
    </div>

    <div v-else-if="destinationStore.error" class="alert alert-error">
      {{ destinationStore.error }}
    </div>

    <div v-else class="destinations-grid">
      <div 
        v-for="dest in filteredDestinations" 
        :key="dest.id"
        class="destination-card"
        @click="goToDetail(dest.id)"
      >
        <div class="dest-header">
          <h3>{{ dest.name }}</h3>
          <span class="rating" v-if="dest.rating">⭐ {{ dest.rating }}/5</span>
        </div>
        <p class="location">📍 {{ dest.location }}</p>
        <p class="description">{{ dest.description }}</p>
        <div class="dest-footer">
          <router-link :to="`/destinations/${dest.id}`" class="btn btn-small">
            Ver Detalles
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="!destinationStore.isLoading && filteredDestinations.length === 0" class="no-results">
      No hay destinos disponibles
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDestinationStore } from '../stores/destination'
import { useRouter } from 'vue-router'

const destinationStore = useDestinationStore()
const router = useRouter()
const searchQuery = ref('')

const filteredDestinations = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return destinationStore.destinations.filter(dest => 
    dest.name.toLowerCase().includes(query) ||
    dest.location.toLowerCase().includes(query) ||
    dest.description.toLowerCase().includes(query)
  )
})

const goToDetail = (destId) => {
  router.push(`/destinations/${destId}`)
}

onMounted(async () => {
  try {
    await destinationStore.fetchDestinations()
  } catch (error) {
    console.error('Error cargando destinos:', error)
  }
})
</script>

<style scoped>
.destinations {
  max-width: 1200px;
  margin: 0 auto;
}

.destinations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.destinations-header h1 {
  margin: 0;
}

.search-bar {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.loading,
.no-results {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  color: #999;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.destination-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.destination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.dest-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.dest-header h3 {
  margin: 0;
  color: #333;
}

.rating {
  font-size: 0.9rem;
  background: #ffd700;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  white-space: nowrap;
}

.location {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.description {
  color: #777;
  font-size: 0.95rem;
  margin: 1rem 0;
  flex-grow: 1;
}

.dest-footer {
  margin-top: auto;
  pt: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}
</style>
