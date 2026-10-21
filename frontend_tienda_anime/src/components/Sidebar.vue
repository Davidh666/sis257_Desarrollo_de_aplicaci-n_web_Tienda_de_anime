      <script setup lang="ts">
      import { ref, onMounted } from 'vue'
      import { useRouter } from 'vue-router'
      
      const router = useRouter()
      const userName = ref('Invitado')
      const userRole = ref('')
      
      onMounted(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsed = JSON.parse(userData)
          userName.value = parsed.nombre_completo || parsed.usuario
          userRole.value = parsed.rol
        }
      })
      
      const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
      </script>
<template>
  <div class="sidebar-wrapper" id="sidebar">
    <router-link to="/" class="sidebar-brand">
      <i class="bi bi-asterisk"></i>
      <span>Spark Admin</span>
    </router-link>

    <div class="flex-grow-1 overflow-y-auto">
      <div class="sidebar-menu-section">
        <div class="sidebar-menu-title">MENÚ</div>
        <ul class="sidebar-menu-list">
          <li class="sidebar-menu-item">
            <router-link to="/" class="sidebar-menu-link active">
              <i class="bi bi-grid-fill"></i>
              <span>Dashboard</span>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="sidebar-menu-section">
        <div class="sidebar-menu-title">MÓDULOS DE NEGOCIO</div>
        <ul class="sidebar-menu-list">
          <!-- Solo visible para ADMINISTRADOR -->
          <li v-if="userRole === 'ADMINISTRADOR'" class="sidebar-menu-item">
            <router-link to="/tables" class="sidebar-menu-link">
              <i class="bi bi-box-seam"></i>
              <span>Productos (CRUD)</span>
            </router-link>
          </li>
          
          <li v-if="userRole === 'ADMINISTRADOR'" class="sidebar-menu-item">
            <router-link to="/forms" class="sidebar-menu-link">
              <i class="bi bi-tags"></i>
              <span>Categorías</span>
            </router-link>
          </li>

          <!-- Visible para Administrador y Vendedor/Cliente -->
          <li class="sidebar-menu-item">
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
          <div class="sidebar-profile-name">{{ userName }}</div>
          <small class="text-muted">{{ userRole }}</small>
        </div>
      </div>
      <button @click="logout" class="btn btn-sm btn-outline-danger" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  </div>
</template>
