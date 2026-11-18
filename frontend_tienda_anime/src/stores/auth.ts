import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import router from '@/router'

export interface Usuario {
  id: number
  usuario: string
  nombreCompleto: string
  rol: 'ADMINISTRADOR' | 'VENDEDOR' | 'CLIENTE'
  estado: boolean
}

function isUsuario(value: unknown): value is Usuario {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'usuario' in value &&
    typeof value.usuario === 'string' &&
    'nombreCompleto' in value &&
    typeof value.nombreCompleto === 'string' &&
    'rol' in value &&
    (value.rol === 'ADMINISTRADOR' ||
      value.rol === 'VENDEDOR' ||
      value.rol === 'CLIENTE') &&
    'estado' in value &&
    typeof value.estado === 'boolean'
  )
}

function readStoredUser(): Usuario | null {
  let storedUser: unknown
  try {
    storedUser = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    storedUser = null
  }
  if (isUsuario(storedUser)) {
    return storedUser
  }

  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<Usuario | null>(readStoredUser())

  const isAuthenticated = computed(() => !!token.value)

  async function login(usuario: string, clave: string) {
    const response = await axios.post<Usuario & { accessToken: string }>(
      '/auth/login',
      { usuario, clave },
    )
    const { accessToken, ...userData } = response.data

    token.value = accessToken
    user.value = userData

    localStorage.setItem('token', accessToken)
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