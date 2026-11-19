<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import api from '@/plugins/axios'

interface Producto {
  id: number
  codigo: string
  nombre: string
  precioVenta: number | string
  stock: number
  estado: boolean
}

interface PedidoItem {
  productoId: number
  cantidad: number
}

const productos = ref<Producto[]>([])
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

async function loadProducts(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get<Producto[]>('/productos')
    productos.value = response.data
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
    const response = await api.post<{ correlativo: string }>('/ventas/pedidos', {
      items: pedidoItems.value,
    })
    successMessage.value = `Pedido ${response.data.correlativo} creado y pendiente de aprobación.`
    for (const productoId of Object.keys(cantidades)) {
      delete cantidades[Number(productoId)]
    }
    await loadProducts()
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

function formatCurrency(value: number | string): string {
  return Number(value).toFixed(2)
}

onMounted(loadProducts)
</script>

<template>
  <div class="container-fluid py-4">
    <header class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h2 fw-bold mb-1">Mis compras</h1>
        <p class="text-muted mb-0">Selecciona productos y envía un pedido.</p>
      </div>
      <button class="btn btn-outline-primary" type="button" @click="loadProducts">
        Actualizar catálogo
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

  </div>
</template>
