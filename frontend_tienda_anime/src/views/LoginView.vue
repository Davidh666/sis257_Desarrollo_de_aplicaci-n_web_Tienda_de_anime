<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'

const usuario = ref('')
const clave = ref('')
const errorMsg = ref('')
const cargando = ref(false)
const router = useRouter()

const handleLogin = async () => {
  errorMsg.value = ''
  cargando.value = true
  
  try {
    const response = await api.post('/usuarios/login', {
      usuario: usuario.value,
      clave: clave.value
    })

    const { token, user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    // Redirección por rol
    if (user.rol === 'ADMINISTRADOR') {
      router.push('/')
    } else {
      router.push('/sales')
    }
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Usuario o clave incorrectos'
  } finally {
    cargando.value = false
  }
}
</script>
<template>
  <div class="login-wrapper d-flex align-items-center justify-content-center vh-100 w-100">
    <div class="card login-card p-4 p-sm-5 shadow-lg border-0">
      
      <!-- Cabecera con ícono/marca -->
      <div class="text-center mb-4">
        <div class="brand-icon-wrapper mb-2 d-inline-flex align-items-center justify-content-center">
          <img src="/favicon.ico" alt="Akiba Logo" class="brand-icon" />
        </div>
        <h2 class="fw-bold text-dark mb-1 tracking-tight">Akiba Store</h2>
        <p class="text-muted fs-7 mb-0">Inicia sesión para continuar al sistema</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" autocomplete="off">
        <div class="mb-3">
          <label class="form-label text-secondary fw-semibold fs-7 mb-1">Usuario</label>
          <div class="input-group">
            <input 
              v-model="usuario" 
              type="text" 
              class="form-control custom-input" 
              placeholder="Ej. admin" 
              autocomplete="off"
              required 
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label text-secondary fw-semibold fs-7 mb-1">Contraseña</label>
          <div class="input-group">
            <input 
              v-model="clave" 
              type="password" 
              class="form-control custom-input" 
              placeholder="••••••••" 
              autocomplete="new-password"
              required 
            />
          </div>
        </div>

        <div v-if="errorMsg" class="alert alert-danger border-0 p-2 fs-7 text-center rounded-3 mb-3">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary-akiba w-100 py-2 fw-semibold text-white d-flex align-items-center justify-content-center"
          :disabled="cargando"
        >
          <span v-if="!cargando">Ingresar</span>
          <span v-else class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        </button>
      </form>

      <!-- Footer decorativo -->
      <div class="text-center mt-4 pt-2 border-top">
        <small class="text-muted fs-8">Sistemas SIS257 &bull; Akiba Store &copy; 2026</small>
      </div>

    </div>
  </div>
</template>


<style scoped>
.login-wrapper {
  background: radial-gradient(circle at center, #072617 0%, #03170e 100%) !important;
  position: fixed;
  top: 0;
  left: 0;
}

.login-card {
  width: 100%;
  max-width: 410px;
  border-radius: 18px;
  background-color: #ffffff;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
}

.brand-icon-wrapper {
  width: 52px;
  height: 52px;
  background-color: #f0fdf4;
  border-radius: 12px;
}

.brand-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.custom-input {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.custom-input:focus {
  background-color: #ffffff;
  border-color: #0b4f2c;
  box-shadow: 0 0 0 4px rgba(11, 79, 44, 0.12);
}

.btn-primary-akiba {
  background-color: #052315;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.btn-primary-akiba:hover {
  background-color: #0b4f2c;
  transform: translateY(-1px);
}

.btn-primary-akiba:active {
  transform: translateY(0);
}

.fs-7 {
  font-size: 0.85rem;
}

.fs-8 {
  font-size: 0.75rem;
}
</style>