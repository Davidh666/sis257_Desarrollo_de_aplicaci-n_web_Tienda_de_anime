import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import AdminDashboardView from '@/views/AdminDashboardView.vue'
import ClientSalesView from '@/views/ClientSalesView.vue'
import ClientHomeView from '@/views/ClientHomeView.vue'

function getRoleHome(rol?: string) {
  if (rol === 'VENDEDOR') return { name: 'client-sales' }
  if (rol === 'CLIENTE') return { name: 'client-home' }
  return { name: 'admin-dashboard' }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
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
      component: () => import('@/views/TablesView.vue'),
      meta: { requiresAuth: true, role: 'ADMINISTRADOR' }
    },
    {
      path: '/forms',
      name: 'admin-categories',
      component: () => import('@/views/FormsView.vue'),
      meta: { requiresAuth: true, role: 'ADMINISTRADOR' }
    },
    {
      path: '/sales',
      name: 'client-sales',
      component: ClientSalesView,
      meta: { requiresAuth: true, roles: ['ADMINISTRADOR', 'VENDEDOR'] }
    },
    {
      path: '/client',
      name: 'client-home',
      component: ClientHomeView,
      meta: { requiresAuth: true, role: 'CLIENTE' }
    }
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  let user: { rol?: string } | null = null

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (to.meta.requiresAuth) {
    if (
      !token ||
      !['ADMINISTRADOR', 'VENDEDOR', 'CLIENTE'].includes(user?.rol ?? '')
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { name: 'login' }
    }
  }

  if (to.meta.role && user?.rol !== to.meta.role) {
    return getRoleHome(user?.rol)
  }

  if (
    Array.isArray(to.meta.roles) &&
    !to.meta.roles.includes(user?.rol)
  ) {
    return getRoleHome(user?.rol)
  }

  return true
})

export default router