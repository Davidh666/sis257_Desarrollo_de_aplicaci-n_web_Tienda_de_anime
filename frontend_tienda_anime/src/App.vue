<template>
  <div class="layout-wrapper">
    <!-- Componente del Menú Lateral / Sidebar -->
    <Sidebar v-if="mostrarSidebar" />

    <!-- Área del Contenido Principal (Dashboard, Tablas, etc.) -->
    <main class="content-area" :class="{ 'full-width': !mostrarSidebar }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue' // Ajusta la ruta a tu componente de Sidebar

const route = useRoute()

// Ocultar el Sidebar únicamente en la pantalla de Login
const mostrarSidebar = computed(() => route.path !== '/login')
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: #f8fafc;
}

/* Ajuste del espacio del contenido respetando el Sidebar */
.content-area {
  flex: 1;
  margin-left: 260px; /* Mismo ancho que tiene el Sidebar */
  min-height: 100vh;
  padding: 2rem;
  transition: all 0.3s ease;
}

/* Si no hay sidebar (pantalla de login) ocupa el 100% */
.content-area.full-width {
  margin-left: 0;
  padding: 0;
}
</style>