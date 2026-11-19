<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import api from '@/plugins/axios'

type PedidoEstado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'COMPLETADA' | 'ANULADA'

interface Pedido {
  id: number
  correlativo: string
  fecha: string
  total: number | string
  estado: PedidoEstado
  detalles: Array<{
    cantidad: number
    subtotal: number | string
    producto?: { nombre: string }
  }>
}

const pedidos = ref<Pedido[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    return Array.isArray(message)
      ? message.join(', ')
      : message ?? 'No se pudo cargar el historial.'
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

function statusBadgeClass(estado: PedidoEstado): string {
  if (estado === 'PENDIENTE') return 'bg-warning text-dark'
  if (estado === 'APROBADO' || estado === 'COMPLETADA') return 'bg-success'
  if (estado === 'RECHAZADO' || estado === 'ANULADA') return 'bg-danger'
  return 'bg-secondary'
}

function statusLabel(estado: PedidoEstado): string {
  const labels: Record<PedidoEstado, string> = {
    PENDIENTE: 'Pendiente',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
    COMPLETADA: 'Completado',
    ANULADA: 'Anulado',
  }
  return labels[estado]
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
        <h1 class="h2 fw-bold mb-1">Historial de pedidos</h1>
        <p class="text-muted mb-0">Consulta el estado y el detalle de tus pedidos.</p>
      </div>
      <button
        class="btn btn-outline-primary"
        type="button"
        :disabled="isLoading"
        @click="loadPedidos"
      >
        {{ isLoading ? 'Actualizando…' : 'Actualizar historial' }}
      </button>
    </header>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
    <p v-if="isLoading" class="text-muted" role="status">Cargando historial…</p>
    <p v-else-if="!errorMessage && pedidos.length === 0" class="text-muted">
      Aún no tienes pedidos registrados.
    </p>
    <div v-else-if="pedidos.length > 0" class="row g-3">
      <div v-for="pedido in pedidos" :key="pedido.id" class="col-12">
        <article class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex flex-wrap justify-content-between gap-3">
              <div>
                <h2 class="h5 mb-1">{{ pedido.correlativo }}</h2>
                <small class="text-muted">{{ new Date(pedido.fecha).toLocaleString() }}</small>
              </div>
              <div class="text-md-end">
                <span class="badge" :class="statusBadgeClass(pedido.estado)">
                  {{ statusLabel(pedido.estado) }}
                </span>
                <p class="fw-bold mb-0 mt-2">Bs. {{ formatCurrency(pedido.total) }}</p>
              </div>
            </div>
            <ul class="small text-muted mt-3 mb-0">
              <li v-for="(detalle, index) in pedido.detalles" :key="`${pedido.id}-${index}`">
                {{ detalle.producto?.nombre || 'Producto' }} × {{ detalle.cantidad }}
                — Bs. {{ formatCurrency(detalle.subtotal) }}
              </li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
