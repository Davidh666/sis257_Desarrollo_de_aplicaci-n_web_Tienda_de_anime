<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import api from '@/plugins/axios'

type PedidoEstado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'COMPLETADA' | 'ANULADA'

interface Producto {
  id: number
  codigo: string
  nombre: string
  precioVenta: number | string
  stock: number
  estado: boolean
}

interface Pedido {
  id: number
  correlativo: string
  fecha: string
  total: number | string
  estado: PedidoEstado
  detalles: Array<{
    cantidad: number
    precioUnitario: number | string
    subtotal: number | string
    producto?: { nombre: string }
  }>
}

interface PedidoItem {
  productoId: number
  cantidad: number
}

const productos = ref<Producto[]>([])
const pedidos = ref<Pedido[]>([])
const cantidades = reactive<Record<number, number>>({})
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const productosDisponibles = computed(() =>
  productos.value.filter((producto) => producto.estado && producto.stock > 0),
)
const pedidoItems = computed<PedidoItem[]>(() =>
  productosDisponibles.value.flatMap((producto) => {
    const cantidad = Number(cantidades[producto.id] || 0)
    return cantidad > 0 ? [{ productoId: producto.id, cantidad }] : []
  }),
)
const totalEstimado = computed(() =>
  pedidoItems.value.reduce((sum, item) => {
    const producto = productosDisponibles.value.find(
      (candidate) => candidate.id === item.productoId,
    )
    return sum + Number(producto?.precioVenta || 0) * item.cantidad
  }, 0),
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

async function loadData(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [purchaseResponse, productResponse] = await Promise.all([
      api.get<Pedido[]>('/ventas'),
      api.get<Producto[]>('/productos'),
    ])
    pedidos.value = purchaseResponse.data
    productos.value = productResponse.data
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

async function createPedido(): Promise<void> {
  if (pedidoItems.value.length === 0) {
    errorMessage.value = 'Selecciona al menos un producto para continuar.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const response = await api.post<Pedido>('/ventas/pedidos', {
      items: pedidoItems.value,
    })
    successMessage.value = `Pedido ${response.data.correlativo} creado y pendiente de aprobación.`
    for (const productoId of Object.keys(cantidades)) {
      delete cantidades[Number(productoId)]
    }
    await loadData()
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSubmitting.value = false
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

onMounted(loadData)
</script>

<template>
  <div class="container-fluid py-4">
    <header class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h2 fw-bold mb-1">Mis compras</h1>
        <p class="text-muted mb-0">Crea pedidos y consulta su estado de aprobación.</p>
      </div>
      <button class="btn btn-outline-primary" type="button" @click="loadData">
        Actualizar historial
      </button>
    </header>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success" role="status">
      {{ successMessage }}
    </div>

    <section class="card border-0 shadow-sm p-4 mb-4">
      <h2 class="h5 fw-bold">Solicitar una compra</h2>
      <p class="small text-muted">
        El stock se reserva al crear el pedido y se libera si el pedido es rechazado.
      </p>
      <div v-if="isLoading" class="text-muted">Cargando catálogo…</div>
      <div v-else-if="productosDisponibles.length === 0" class="text-muted">
        No hay productos disponibles en este momento.
      </div>
      <div v-else class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th style="width: 130px">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productosDisponibles" :key="producto.id">
              <td>{{ producto.nombre }} <small class="text-muted">({{ producto.codigo }})</small></td>
              <td>Bs. {{ formatCurrency(producto.precioVenta) }}</td>
              <td>{{ producto.stock }}</td>
              <td>
                <input
                  v-model.number="cantidades[producto.id]"
                  class="form-control form-control-sm"
                  type="number"
                  min="0"
                  :max="producto.stock"
                  step="1"
                  :aria-label="`Cantidad de ${producto.nombre}`"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-2">
        <strong>Total estimado: Bs. {{ formatCurrency(totalEstimado) }}</strong>
        <button
          class="btn btn-success"
          type="button"
          :disabled="isSubmitting || isLoading || pedidoItems.length === 0"
          @click="createPedido"
        >
          {{ isSubmitting ? 'Enviando…' : 'Enviar pedido' }}
        </button>
      </div>
    </section>

    <section>
      <h2 class="h4 fw-bold mb-3">Historial de pedidos</h2>
      <p v-if="!isLoading && pedidos.length === 0" class="text-muted">
        Aún no tienes compras registradas.
      </p>
      <div v-else class="row g-3">
        <div v-for="pedido in pedidos" :key="pedido.id" class="col-12">
          <article class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex flex-wrap justify-content-between gap-3">
                <div>
                  <h3 class="h5 mb-1">{{ pedido.correlativo }}</h3>
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
    </section>
  </div>
</template>
