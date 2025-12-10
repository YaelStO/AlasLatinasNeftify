<template>
  <div class="page explorar-mundo">
    <h1>Explorar el Mundo</h1>
    <p>Rutas internacionales destacadas para explorar culturas y ciudades icónicas.</p>

    <div class="cards">
      <div v-for="d in filtered" :key="d.id" class="card">
        <img :src="d.image || placeholder" alt="" class="card-img" />
        <div class="card-body">
          <h3>{{ d.name }}</h3>
          <p class="location">{{ d.location }}</p>
          <p class="desc">{{ d.description }}</p>
          <div class="card-footer">
            <span class="rating">⭐ {{ d.rating || '—' }}</span>
            <router-link class="btn" :to="`/destinations/${d.id}`">Ver detalles</router-link>
          </div>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="empty">No se encontraron destinos para esta categoría.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const all = ref([])
const filtered = ref([])
const placeholder = '/assets/placeholder-travel.jpg'

onMounted(async () => {
  try {
    const res = await axios.get('/api/destinations')
    all.value = res.data
    const targets = ['China', 'Beijing', 'Tokyo', 'Japan', 'Seoul', 'South Korea', 'Korea', 'Germany', 'Berlin']
    filtered.value = all.value.filter(d => targets.some(t => d.location.includes(t) || d.name.includes(t)))
  } catch (e) {
    console.error('Error cargando destinos:', e)
  }
})
</script>

<style scoped>
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 1rem; margin-top: 1rem; }
.card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.08); display:flex; flex-direction:column; }
.card-img { width:100%; height:160px; object-fit:cover; }
.card-body { padding: 0.8rem; display:flex; flex-direction:column; flex:1 }
.card-body h3 { margin:0 0 0.25rem 0 }
.location { color:#666; font-size:0.9rem; margin-bottom:0.5rem }
.desc { flex:1; color:#333; font-size:0.95rem; margin-bottom:0.75rem }
.card-footer { display:flex; justify-content:space-between; align-items:center }
.rating { font-weight:600 }
.btn { background:#667eea; color:white; padding:0.4rem 0.7rem; border-radius:6px; text-decoration:none }
.empty { color:#666; padding:1rem; grid-column:1/-1; text-align:center }
</style>
