<script setup lang="ts">
import { ref } from 'vue'
import { isAxiosError } from 'axios'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'

const router = useRouter()
const usuario = ref('')
const nombreCompleto = ref('')
const clave = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function register(): Promise<void> {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await api.post('/usuarios', {
      usuario: usuario.value.trim(),
      nombreCompleto: nombreCompleto.value.trim(),
      clave: clave.value,
    })
    await router.push({ name: 'login', query: { registered: '1' } })
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const message = error.response?.data?.message
      errorMessage.value = Array.isArray(message)
        ? message.join(', ')
        : message ?? 'No se pudo crear la cuenta.'
    } else {
      errorMessage.value = 'Ocurrió un error inesperado.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="d-flex min-vh-100 align-items-center justify-content-center bg-light p-3">
    <div class="card w-100 border-0 shadow" style="max-width: 440px">
      <div class="card-body p-4 p-sm-5">
        <h1 class="h3 fw-bold text-success">Crear cuenta de cliente</h1>
        <p class="text-muted">Regístrate para crear tu cuenta de Akiba Store.</p>

        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="register">
          <label for="register-name" class="form-label">Nombre completo</label>
          <input
            id="register-name"
            v-model="nombreCompleto"
            class="form-control mb-3"
            maxlength="100"
            autocomplete="name"
            required
          />

          <label for="register-user" class="form-label">Usuario</label>
          <input
            id="register-user"
            v-model="usuario"
            class="form-control mb-3"
            maxlength="50"
            autocomplete="username"
            required
          />

          <label for="register-password" class="form-label">Contraseña</label>
          <input
            id="register-password"
            v-model="clave"
            class="form-control mb-4"
            type="password"
            minlength="6"
            maxlength="255"
            autocomplete="new-password"
            required
          />

          <button class="btn btn-success w-100" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creando cuenta…' : 'Registrarme' }}
          </button>
        </form>

        <p class="text-center mt-3 mb-0">
          ¿Ya tienes cuenta?
          <router-link :to="{ name: 'login' }" class="link-success">Inicia sesión</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
