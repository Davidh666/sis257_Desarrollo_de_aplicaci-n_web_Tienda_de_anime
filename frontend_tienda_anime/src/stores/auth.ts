import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import router from '@/router'

export interface Usuario {
  id: number
  usuario: string
  nombreCompleto: string
  rol: string
  estado: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<Usuario | null>(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(usuario: string, clave: string) {
    const response = await axios.post('/auth/login', { usuario, clave })
    const { access_token, ...userData } = response.data

    token.value = access_token
    user.value = userData as Usuario

    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return { token, user, isAuthenticated, login, logout }
})