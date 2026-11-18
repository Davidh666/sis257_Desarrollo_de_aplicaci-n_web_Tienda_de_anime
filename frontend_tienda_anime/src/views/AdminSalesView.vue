<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import api from '@/plugins/axios'

type PedidoEstado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'COMPLETADA' | 'ANULADA'
type Resolucion = 'APROBADO' | 'RECHAZADO'

interface Pedido {
  id: number
  correlativo: string
  fecha: string
  total: number | string
  estado: PedidoEstado
  cliente?: {
    nombreCompleto: string
    usuario: string
  } | null
  detalles: Array<{
    cantidad: number
    producto?: { nombre: string }
  }>
}

const pedidos = ref<Pedido[]>([])
const isLoading = ref(false)
const processingId = ref<number | null>(null)
const errorMessage = ref('')
const successMessage = ref('')
const pedidosPendientes = computed(() =>
  pedidos.value.filter((pedido) => pedido.estado === 'PENDIENTE'),
)

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    return Array.isArray(message)
      ? message.join(', ')
      : message ?? 'No se pudo completar la operación.'
  }
  return 'Ocurrió un error inesperado.'
}

async function loadPedidos(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get<Pedido[]>('/ventas')
    pedidos.value = response.data
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

async function resolverPedido(
  pedido: Pedido,
  estado: Resolucion,
): Promise<void> {
  processingId.value = pedido.id
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await api.patch(`/ventas/${pedido.id}/estado`, { estado })
    successMessage.value =
      estado === 'APROBADO'
        ? `Pedido ${pedido.correlativo} aprobado.`
        : `Pedido ${pedido.correlativo} rechazado y stock liberado.`
    await loadPedidos()
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    processingId.value = null
  }
}

function formatCurrency(value: number | string): string {
  return Number(value).toFixed(2)
}

onMounted(loadPedidos)
</script>

<template>
  <div class="container-fluid py-4">
    <header class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h2 fw-bold mb-1">Pedidos pendientes</h1>
        <p class="text-muted mb-0">
          Revisa las solicitudes de compra y confirma su estado.
        </p>
      </div>
      <button class="btn btn-outline-primary" type="button" @click="loadPedidos">
        Actualizar
      </button>
    </header>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="alert alert-success" role="status">
      {{ successMessage }}
    </div>
    <p v-if="isLoading" class="text-muted">Cargando pedidos…</p>
    <div v-else-if="pedidosPendientes.length === 0" class="alert alert-light border">
      No hay pedidos pendientes de confirmación.
    </div>

    <div v-else class="row g-3">
      <div v-for="pedido in pedidosPendientes" :key="pedido.id" class="col-12">
        <article class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex flex-wrap justify-content-between gap-3">
              <div>
                <h2 class="h5 mb-1">{{ pedido.correlativo }}</h2>
                <p class="text-muted mb-1">
                  Cliente: {{ pedido.cliente?.nombreCompleto || pedido.cliente?.usuario || '—' }}
                </p>
                <small class="text-muted">{{ new Date(pedido.fecha).toLocaleString() }}</small>
              </div>
              <div class="text-md-end">
                <span class="badge bg-warning text-dark">Pendiente</span>
                <p class="fw-bold fs-5 mb-0 mt-2">Bs. {{ formatCurrency(pedido.total) }}</p>
              </div>
            </div>

            <ul class="small text-muted mt-3 mb-3">
              <li v-for="(detalle, index) in pedido.detalles" :key="`${pedido.id}-${index}`">
                {{ detalle.producto?.nombre || 'Producto' }} × {{ detalle.cantidad }}
              </li>
            </ul>

            <div class="d-flex flex-wrap gap-2">
              <button
                class="btn btn-success"
                type="button"
                :disabled="processingId === pedido.id"
                @click="resolverPedido(pedido, 'APROBADO')"
              >
                Aprobar
              </button>
              <button
                class="btn btn-outline-danger"
                type="button"
                :disabled="processingId === pedido.id"
                @click="resolverPedido(pedido, 'RECHAZADO')"
              >
                Rechazar
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
