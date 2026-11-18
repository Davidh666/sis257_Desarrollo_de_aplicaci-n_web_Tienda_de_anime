<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const homeRoute = computed(() => {
  if (authStore.user?.rol === 'VENDEDOR') return '/sales'
  if (authStore.user?.rol === 'CLIENTE') return '/client'
  return '/'
})
</script>
<template>
  <div class="sidebar-wrapper" id="sidebar">
    <router-link :to="homeRoute" class="sidebar-brand">
      <i class="bi bi-asterisk"></i>
      <span>Akiba Store</span>
    </router-link>

    <div class="flex-grow-1 overflow-y-auto">
      <div class="sidebar-menu-section">
        <div class="sidebar-menu-title">MENÚ</div>
        <ul class="sidebar-menu-list">
          <li v-if="authStore.user?.rol === 'ADMINISTRADOR'" class="sidebar-menu-item">
            <router-link to="/" class="sidebar-menu-link active">
              <i class="bi bi-grid-fill"></i>
              <span>Panel administrativo</span>
            </router-link>
          </li>
          <li v-else-if="authStore.user?.rol === 'VENDEDOR'" class="sidebar-menu-item">
            <router-link to="/sales" class="sidebar-menu-link">
              <i class="bi bi-cart-check-fill"></i>
              <span>Ventas</span>
            </router-link>
          </li>
          <li v-else class="sidebar-menu-item">
            <router-link to="/client" class="sidebar-menu-link">
              <i class="bi bi-person-circle"></i>
              <span>Mi cuenta</span>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="sidebar-menu-section">
        <div class="sidebar-menu-title">MÓDULOS DE NEGOCIO</div>
        <ul class="sidebar-menu-list">
          <!-- Solo visible para ADMINISTRADOR -->
          <li v-if="authStore.user?.rol === 'ADMINISTRADOR'" class="sidebar-menu-item">
            <router-link to="/tables" class="sidebar-menu-link">
              <i class="bi bi-box-seam"></i>
              <span>Productos (CRUD)</span>
            </router-link>
          </li>
          
          <li v-if="authStore.user?.rol === 'ADMINISTRADOR'" class="sidebar-menu-item">
            <router-link to="/forms" class="sidebar-menu-link">
              <i class="bi bi-tags"></i>
              <span>Categorías</span>
            </router-link>
          </li>

          <li v-if="authStore.user?.rol === 'ADMINISTRADOR'" class="sidebar-menu-item">
            <router-link to="/sales" class="sidebar-menu-link">
              <i class="bi bi-cart-check-fill"></i>
              <span>Ventas (Módulo)</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Perfil del usuario autenticado + Botón de Cierre de Sesión -->
    <div class="sidebar-profile d-flex align-items-center justify-content-between p-3">
      <div class="d-flex align-items-center gap-2">
        <img src="/assets/images/avatar.png" alt="Usuario" class="sidebar-profile-img" />
        <div class="sidebar-profile-info">
          <div class="sidebar-profile-name">
            {{ authStore.user?.nombreCompleto || authStore.user?.usuario || 'Usuario' }}
          </div>
          <small class="text-muted">{{ authStore.user?.rol }}</small>
        </div>
      </div>
      <button @click="authStore.logout" class="btn btn-sm btn-outline-danger" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  </div>
</template>
