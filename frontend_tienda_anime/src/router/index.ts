import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import AdminDashboardView from '@/views/AdminDashboardView.vue'
import ClientSalesView from '@/views/ClientSalesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true, role: 'ADMINISTRADOR' }
    },
    {
      path: '/tables',
      name: 'admin-products',
      component: () => import('@/views/TablesView.vue'), // CRUD de Productos (Admin)
      meta: { requiresAuth: true, role: 'ADMINISTRADOR' }
    },
    {
      path: '/sales',
      name: 'client-sales',
      component: ClientSalesView, // Vista orientada a ventas/cliente
      meta: { requiresAuth: true } // Accesible para Admin y Vendedor/Cliente
    }
  ]
})

// Guardia global actualizado para Vue Router moderno
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (to.meta.requiresAuth && !token) {
    return { name: 'login' }
  } 
  
  if (to.meta.role && user.rol !== to.meta.role) {
    if (user.rol !== 'ADMINISTRADOR') {
      return { name: 'sales' }
    } else {
      return { name: 'admin-dashboard' }
    }
  }
  
  // Si no hay restricciones que cumplir, se omite next() o se retorna true
  return true
})

export default router