<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div class="app-container">
    <!-- 1. Barra Lateral fija en toda la app -->
    <Sidebar />

    <!-- 2. Contenedor Principal -->
    <div class="main-wrapper">
      <!-- 3. Navbar Superior fijo en toda la app -->
      <Navbar />

      <!-- 4. Aquí se renderizarán de forma dinámica las vistas (Home, Tablas, Formularios, etc.) -->
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
/* Puedes dejar este espacio vacío o agregar estilos globales si lo requieres */
</style>