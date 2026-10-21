<template>
  <!-- Si estamos en la ruta /login, muestra solo la vista sin el panel de administración -->
  <router-view v-if="$route.path === '/login'" />

  <!-- Si estamos en cualquier otra ruta, muestra el panel completo con Sidebar y Navbar -->
  <div v-else class="d-flex" style="min-height: 100vh;">
    <Sidebar />
    <div class="flex-grow-1 d-flex flex-column">
      <Navbar />
      <div class="flex-grow-1 bg-light">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue' // O la ruta donde tengas tu barra superior
</script>