<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="container py-5">
    <section class="card border-0 shadow-sm p-4 p-md-5">
      <span class="badge bg-info text-dark align-self-start mb-3">CLIENTE</span>
      <h1 class="h2 fw-bold">¡Bienvenido, {{ authStore.user?.nombreCompleto }}!</h1>
      <p class="text-muted mb-4">
        Tu cuenta de Akiba Store está lista.
      </p>
      <router-link to="/purchases" class="btn btn-success align-self-start mb-3">
        Ver mis compras
      </router-link>
      <button class="btn btn-outline-danger align-self-start" type="button" @click="authStore.logout">
        Cerrar sesión
      </button>
    </section>
  </div>
</template>
