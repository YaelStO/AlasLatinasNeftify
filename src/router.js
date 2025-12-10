import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

// Vistas
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Profile from './views/Profile.vue'
import Destinations from './views/Destinations.vue'
import DestinationDetail from './views/DestinationDetail.vue'
import Reservations from './views/Reservations.vue'
import ReservationDetail from './views/ReservationDetail.vue'
import Wallet from './views/Wallet.vue'
import VisitasRaras from './views/VisitasRaras.vue'
import ExplorarMundo from './views/ExplorarMundo.vue'
import ConoceTuPais from './views/ConoceTuPais.vue'

const routes = [
  { path: '/', component: Home, name: 'Home', meta: { requiresAuth: true } },
  { path: '/login', component: Login, name: 'Login', meta: { requiresGuest: true } },
  { path: '/register', component: Register, name: 'Register', meta: { requiresGuest: true } },
  { path: '/profile', component: Profile, name: 'Profile', meta: { requiresAuth: true } },
  { path: '/destinations', component: Destinations, name: 'Destinations', meta: { requiresAuth: true } },
  { path: '/destinations/:id', component: DestinationDetail, name: 'DestinationDetail', meta: { requiresAuth: true } },
  { path: '/wallet', component: Wallet, name: 'Wallet', meta: { requiresAuth: true } },
  { path: '/visitas-raras', component: VisitasRaras, name: 'VisitasRaras', meta: { requiresAuth: true } },
  { path: '/explorar-mundo', component: ExplorarMundo, name: 'ExplorarMundo', meta: { requiresAuth: true } },
  { path: '/conoce-tu-pais', component: ConoceTuPais, name: 'ConoceTuPais', meta: { requiresAuth: true } },
  { path: '/reservations', component: Reservations, name: 'Reservations', meta: { requiresAuth: true } },
  { path: '/reservations/:id', component: ReservationDetail, name: 'ReservationDetail', meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
