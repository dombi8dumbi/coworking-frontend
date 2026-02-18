import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Reservation from '../views/Reservation.vue'
import UserDashboard from '../views/UserDashboard.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/reservation', name: 'Reservation', component: Reservation },
  { path: '/dashboard', name: 'UserDashboard', component: UserDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
