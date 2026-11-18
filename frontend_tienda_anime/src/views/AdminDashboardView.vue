<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'

interface Producto {
  id: number
  estado: boolean
}

interface Cliente {
  id: number
  estado: boolean
}

interface Venta {
  id: number
  fecha: string
  total: number | string
  estado: string
}

const authStore = useAuthStore()
const productos = ref<Producto[]>([])
const clientes = ref<Cliente[]>([])
const ventas = ref<Venta[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const today = new Date().toDateString()
const salesToday = computed(() =>
  ventas.value.filter(
    (venta) =>
      new Date(venta.fecha).toDateString() === today && venta.estado === 'COMPLETADA',
  ),
)
const totalToday = computed(() =>
  salesToday.value.reduce((sum, venta) => sum + Number(venta.total), 0),
)

onMounted(async () => {
  isLoading.value = true
  try {
    const [productResponse, clientResponse, saleResponse] = await Promise.all([
      api.get<Producto[]>('/productos'),
      api.get<Cliente[]>('/clientes'),
      api.get<Venta[]>('/ventas'),
    ])
    productos.value = productResponse.data
    clientes.value = clientResponse.data
    ventas.value = saleResponse.data
  } catch (error: unknown) {
    errorMessage.value = isAxiosError(error)
      ? error.response?.data?.message ?? 'No se pudieron cargar las estadísticas.'
      : 'Ocurrió un error inesperado al cargar las estadísticas.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container-fluid p-4">
    <header class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h2 fw-bold text-dark mb-1">Panel administrativo</h1>
        <p class="text-muted mb-0">
          Bienvenido, {{ authStore.user?.nombreCompleto || authStore.user?.usuario }}.
          Aquí tienes el resumen de Akiba Store.
        </p>
      </div>
      <span class="badge bg-primary fs-6 px-3 py-2">{{ authStore.user?.rol }}</span>
    </header>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
    <p v-if="isLoading" class="text-muted">Cargando estadísticas…</p>

    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <article class="card border-0 shadow-sm p-3 border-start border-success border-4 h-100">
          <h2 class="h6 text-muted">Ventas completadas de hoy</h2>
          <p class="h3 fw-bold text-success mb-1">Bs. {{ totalToday.toFixed(2) }}</p>
          <small class="text-muted">{{ salesToday.length }} operaciones</small>
        </article>
      </div>
      <div class="col-md-4">
        <article class="card border-0 shadow-sm p-3 border-start border-primary border-4 h-100">
          <h2 class="h6 text-muted">Productos activos</h2>
          <p class="h3 fw-bold text-primary mb-1">
            {{ productos.filter((producto) => producto.estado).length }}
          </p>
          <small class="text-muted">en el catálogo</small>
        </article>
      </div>
      <div class="col-md-4">
        <article class="card border-0 shadow-sm p-3 border-start border-warning border-4 h-100">
          <h2 class="h6 text-muted">Clientes activos</h2>
          <p class="h3 fw-bold text-warning mb-1">
            {{ clientes.filter((cliente) => cliente.estado).length }}
          </p>
          <small class="text-muted">registrados</small>
        </article>
      </div>
    </div>

    <section class="card border-0 shadow-sm p-4">
      <h2 class="h5 fw-bold mb-3">Gestión de Akiba Store</h2>
      <p class="text-muted">
        Como administrador puedes mantener el catálogo y las categorías, además de consultar todas las ventas.
      </p>
      <div class="d-flex flex-wrap gap-3">
        <router-link to="/tables" class="btn btn-outline-success">
          <i class="bi bi-box-seam me-2"></i>Administrar productos
        </router-link>
        <router-link to="/forms" class="btn btn-outline-success">
          <i class="bi bi-tags me-2"></i>Administrar categorías
        </router-link>
        <router-link to="/sales" class="btn btn-success">
          <i class="bi bi-cart-check me-2"></i>Ir al punto de venta
        </router-link>
      </div>
    </section>
  </div>
</template>