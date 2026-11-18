<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'

interface Producto {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  precioVenta: number | string
  stock: number
  imagenUrl: string | null
  estado: boolean
}

interface ClientePerfil {
  id: number
  nombreCompleto: string
  nitCi: string | null
  estado: boolean
}

interface Venta {
  id: number
  correlativo: string
  fecha: string
  total: number | string
  estado: string
  cliente?: ClientePerfil
}

interface CartItem {
  producto: Producto
  cantidad: number
}

const authStore = useAuthStore()
const productos = ref<Producto[]>([])
const clientes = ref<ClientePerfil[]>([])
const ventas = ref<Venta[]>([])
const carrito = ref<CartItem[]>([])
const clienteId = ref<number | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const showNewClientForm = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const nuevoCliente = reactive({ razonSocial: '', nitCi: '', telefono: '', email: '' })

const total = computed(() =>
  carrito.value.reduce(
    (sum, item) => sum + Number(item.producto.precioVenta) * item.cantidad,
    0,
  ),
)
const activeProducts = computed(() =>
  productos.value.filter((producto) => producto.estado && producto.stock > 0),
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

function formatCurrency(value: number | string): string {
  return Number(value).toFixed(2)
}

async function loadData(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [productResponse, clientResponse, saleResponse] = await Promise.all([
      api.get<Producto[]>('/productos'),
      api.get<ClientePerfil[]>('/usuarios/clientes'),
      api.get<Venta[]>('/ventas'),
    ])
    productos.value = productResponse.data
    clientes.value = clientResponse.data
    ventas.value = saleResponse.data
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

function addToCart(producto: Producto): void {
  errorMessage.value = ''
  const existingItem = carrito.value.find((item) => item.producto.id === producto.id)
  if (existingItem) {
    if (existingItem.cantidad >= producto.stock) {
      errorMessage.value = `No hay más stock disponible de ${producto.nombre}.`
      return
    }
    existingItem.cantidad += 1
    return
  }
  carrito.value.push({ producto, cantidad: 1 })
}

function changeQuantity(item: CartItem, change: number): void {
  const nextQuantity = item.cantidad + change
  if (nextQuantity < 1) {
    carrito.value = carrito.value.filter(
      (cartItem) => cartItem.producto.id !== item.producto.id,
    )
    return
  }
  if (nextQuantity > item.producto.stock) {
    errorMessage.value = `Stock insuficiente para ${item.producto.nombre}.`
    return
  }
  item.cantidad = nextQuantity
}

async function createClient(): Promise<void> {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const response = await api.post<ClientePerfil>('/usuarios/clientes', {
      nombreCompleto: nuevoCliente.razonSocial.trim(),
      nitCi: nuevoCliente.nitCi.trim(),
      telefono: nuevoCliente.telefono.trim() || undefined,
      email: nuevoCliente.email.trim() || undefined,
    })
    clientes.value.push(response.data)
    clienteId.value = response.data.id
    Object.assign(nuevoCliente, {
      razonSocial: '',
      nitCi: '',
      telefono: '',
      email: '',
    })
    showNewClientForm.value = false
    successMessage.value = 'Cliente registrado correctamente.'
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  }
}

async function completeSale(): Promise<void> {
  if (!clienteId.value || carrito.value.length === 0) {
    errorMessage.value = 'Selecciona un cliente y agrega productos a la venta.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const response = await api.post<Venta>('/ventas', {
      clienteId: clienteId.value,
      items: carrito.value.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
      })),
    })
    successMessage.value = `Venta ${response.data.correlativo} registrada por Bs. ${formatCurrency(response.data.total)}.`
    carrito.value = []
    await loadData()
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSaving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="container-fluid py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h2 fw-bold text-success mb-1">Punto de venta</h1>
        <p class="text-muted mb-0">
          Bienvenido, {{ authStore.user?.nombreCompleto || authStore.user?.usuario }}.
          <span class="badge ms-2" :class="authStore.user?.rol === 'ADMINISTRADOR' ? 'bg-primary' : 'bg-success'">
            {{ authStore.user?.rol }}
          </span>
        </p>
      </div>
      <button class="btn btn-outline-danger" type="button" @click="authStore.logout">
        Cerrar sesión
      </button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success" role="status">{{ successMessage }}</div>

    <div class="row g-4">
      <section class="col-xl-8" aria-labelledby="catalog-title">
        <div class="card border-0 shadow-sm p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 id="catalog-title" class="h5 fw-bold mb-0">Productos disponibles</h2>
            <span class="text-muted small">{{ activeProducts.length }} disponibles</span>
          </div>
          <div v-if="isLoading" class="text-muted">Cargando catálogo…</div>
          <div v-else-if="activeProducts.length === 0" class="text-muted">
            No hay productos con stock disponibles.
          </div>
          <div v-else class="row g-3">
            <div v-for="producto in activeProducts" :key="producto.id" class="col-md-6 col-xxl-4">
              <article class="card h-100">
                <img
                  v-if="producto.imagenUrl"
                  :src="producto.imagenUrl"
                  :alt="producto.nombre"
                  class="card-img-top"
                  style="height: 160px; object-fit: cover"
                />
                <div class="card-body d-flex flex-column">
                  <span class="text-muted small">{{ producto.codigo }}</span>
                  <h3 class="h6 fw-bold mt-1">{{ producto.nombre }}</h3>
                  <p class="text-muted small flex-grow-1">
                    {{ producto.descripcion || 'Producto de Akiba Store' }}
                  </p>
                  <div class="d-flex justify-content-between align-items-center">
                    <strong class="text-success">Bs. {{ formatCurrency(producto.precioVenta) }}</strong>
                    <span class="small text-muted">Stock: {{ producto.stock }}</span>
                  </div>
                  <button
                    class="btn btn-sm btn-success mt-3"
                    type="button"
                    @click="addToCart(producto)"
                  >
                    Agregar
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm p-4 mt-4">
          <h2 class="h5 fw-bold mb-3">
            {{ authStore.user?.rol === 'ADMINISTRADOR' ? 'Ventas recientes' : 'Mis ventas recientes' }}
          </h2>
          <div v-if="ventas.length === 0" class="text-muted">Aún no hay ventas registradas.</div>
          <div v-else class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Comprobante</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th class="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="venta in ventas.slice(0, 10)" :key="venta.id">
                  <td>{{ venta.correlativo }}</td>
                  <td>{{ new Date(venta.fecha).toLocaleString() }}</td>
                  <td>{{ venta.cliente?.nombreCompleto || '—' }}</td>
                  <td>{{ venta.estado }}</td>
                  <td class="text-end">Bs. {{ formatCurrency(venta.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <aside class="col-xl-4">
        <form class="card border-0 shadow-sm p-4" @submit.prevent="completeSale">
          <h2 class="h5 fw-bold mb-3">Nueva venta</h2>
          <label for="customer-select" class="form-label">Cliente</label>
          <select
            id="customer-select"
            v-model.number="clienteId"
            class="form-select"
            required
          >
            <option :value="null" disabled>Selecciona un cliente</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombreCompleto }} — {{ cliente.nitCi || 'Sin NIT/CI' }}
            </option>
          </select>
          <button
            class="btn btn-link btn-sm align-self-start px-0"
            type="button"
            @click="showNewClientForm = !showNewClientForm"
          >
            {{ showNewClientForm ? 'Cancelar nuevo cliente' : '+ Registrar cliente' }}
          </button>

          <div v-if="showNewClientForm" class="border rounded p-3 mb-3">
            <label for="customer-name" class="form-label">Razón social</label>
            <input
              id="customer-name"
              v-model="nuevoCliente.razonSocial"
              class="form-control mb-2"
              maxlength="100"
              required
            />
            <label for="customer-id" class="form-label">NIT / CI</label>
            <input
              id="customer-id"
              v-model="nuevoCliente.nitCi"
              class="form-control mb-2"
              maxlength="20"
              required
            />
            <label for="customer-phone" class="form-label">Teléfono (opcional)</label>
            <input
              id="customer-phone"
              v-model="nuevoCliente.telefono"
              class="form-control mb-2"
              maxlength="15"
            />
            <label for="customer-email" class="form-label">Correo (opcional)</label>
            <input
              id="customer-email"
              v-model="nuevoCliente.email"
              class="form-control mb-3"
              type="email"
              maxlength="100"
            />
            <button class="btn btn-outline-success btn-sm" type="button" @click="createClient">
              Guardar cliente
            </button>
          </div>

          <hr />
          <h3 class="h6 fw-bold">Carrito</h3>
          <p v-if="carrito.length === 0" class="small text-muted">No hay productos seleccionados.</p>
          <div v-for="item in carrito" :key="item.producto.id" class="d-flex justify-content-between gap-2 py-2 border-bottom">
            <div>
              <span class="d-block fw-semibold">{{ item.producto.nombre }}</span>
              <small class="text-muted">Bs. {{ formatCurrency(item.producto.precioVenta) }} c/u</small>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button
                class="btn btn-sm btn-outline-secondary"
                type="button"
                :aria-label="`Quitar una unidad de ${item.producto.nombre}`"
                @click="changeQuantity(item, -1)"
              >
                −
              </button>
              <span>{{ item.cantidad }}</span>
              <button
                class="btn btn-sm btn-outline-secondary"
                type="button"
                :aria-label="`Agregar una unidad de ${item.producto.nombre}`"
                :disabled="item.cantidad >= item.producto.stock"
                @click="changeQuantity(item, 1)"
              >
                +
              </button>
            </div>
          </div>

          <div class="d-flex justify-content-between my-3">
            <span class="fw-bold">Total</span>
            <span class="fw-bold text-success">Bs. {{ formatCurrency(total) }}</span>
          </div>
          <button
            class="btn btn-success w-100 fw-bold"
            type="submit"
            :disabled="isSaving || carrito.length === 0 || !clienteId"
          >
            {{ isSaving ? 'Procesando…' : 'Registrar venta' }}
          </button>
        </form>
      </aside>
    </div>
  </div>
</template>
