<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import api from '@/plugins/axios'

interface Categoria {
  id: number
  nombre: string
  estado: boolean
}

interface Producto {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  precioVenta: number | string
  stock: number
  imagenUrl: string | null
  categoriaId: number
  categoria?: Categoria
  estado: boolean
}

interface ProductoForm {
  codigo: string
  nombre: string
  descripcion: string
  precioVenta: number
  stock: number
  imagenUrl: string
  categoriaId: number
  estado: boolean
}

function createEmptyForm(): ProductoForm {
  return {
    codigo: '',
    nombre: '',
    descripcion: '',
    precioVenta: 0,
    stock: 0,
    imagenUrl: '',
    categoriaId: 0,
    estado: true,
  }
}

const productos = ref<Producto[]>([])
const categorias = ref<Categoria[]>([])
const form = reactive<ProductoForm>(createEmptyForm())
const editingId = ref<number | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? 'No se pudo completar la operación.'
  }
  return 'Ocurrió un error inesperado.'
}

async function loadData(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [productResponse, categoryResponse] = await Promise.all([
      api.get<Producto[]>('/productos'),
      api.get<Categoria[]>('/categorias'),
    ])
    productos.value = productResponse.data
    categorias.value = categoryResponse.data
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

function editProducto(producto: Producto): void {
  editingId.value = producto.id
  Object.assign(form, {
    codigo: producto.codigo,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? '',
    precioVenta: Number(producto.precioVenta),
    stock: producto.stock,
    imagenUrl: producto.imagenUrl ?? '',
    categoriaId: producto.categoriaId,
    estado: producto.estado,
  })
  successMessage.value = ''
}

function resetForm(): void {
  editingId.value = null
  Object.assign(form, createEmptyForm())
}

async function saveProducto(): Promise<void> {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const payload = {
      ...form,
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      imagenUrl: form.imagenUrl.trim() || undefined,
    }

    if (editingId.value === null) {
      await api.post('/productos', payload)
      successMessage.value = 'Producto creado correctamente.'
    } else {
      await api.patch(`/productos/${editingId.value}`, payload)
      successMessage.value = 'Producto actualizado correctamente.'
    }
    resetForm()
    await loadData()
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSaving.value = false
  }
}

async function toggleEstado(producto: Producto): Promise<void> {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await api.patch(`/productos/${producto.id}`, { estado: !producto.estado })
    successMessage.value = producto.estado
      ? 'Producto desactivado.'
      : 'Producto activado.'
    await loadData()
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  }
}

onMounted(loadData)
</script>

<template>
  <div class="container-fluid p-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h2 fw-bold text-dark mb-1">Gestión de productos</h1>
        <p class="text-muted mb-0">Administra el catálogo, precios y existencias.</p>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success" role="status">{{ successMessage }}</div>

    <div class="row g-4">
      <div class="col-xl-4">
        <form class="card border-0 shadow-sm p-4" @submit.prevent="saveProducto">
          <h2 class="h5 fw-bold mb-3">
            {{ editingId === null ? 'Nuevo producto' : 'Editar producto' }}
          </h2>
          <label for="product-code" class="form-label">Código</label>
          <input
            id="product-code"
            v-model="form.codigo"
            class="form-control mb-3"
            maxlength="30"
            required
          />
          <label for="product-name" class="form-label">Nombre</label>
          <input
            id="product-name"
            v-model="form.nombre"
            class="form-control mb-3"
            maxlength="100"
            required
          />
          <label for="product-description" class="form-label">Descripción</label>
          <textarea
            id="product-description"
            v-model="form.descripcion"
            class="form-control mb-3"
            rows="2"
          />
          <div class="row">
            <div class="col-sm-6">
              <label for="product-price" class="form-label">Precio (Bs.)</label>
              <input
                id="product-price"
                v-model.number="form.precioVenta"
                class="form-control mb-3"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="col-sm-6">
              <label for="product-stock" class="form-label">Stock</label>
              <input
                id="product-stock"
                v-model.number="form.stock"
                class="form-control mb-3"
                type="number"
                min="0"
                step="1"
                required
              />
            </div>
          </div>
          <label for="product-category" class="form-label">Categoría</label>
          <select
            id="product-category"
            v-model.number="form.categoriaId"
            class="form-select mb-3"
            required
          >
            <option :value="0" disabled>Selecciona una categoría</option>
            <option
              v-for="categoria in categorias.filter((item) => item.estado)"
              :key="categoria.id"
              :value="categoria.id"
            >
              {{ categoria.nombre }}
            </option>
          </select>
          <label for="product-image" class="form-label">URL de imagen (opcional)</label>
          <input
            id="product-image"
            v-model="form.imagenUrl"
            class="form-control mb-3"
            maxlength="255"
            type="url"
          />
          <div class="d-flex gap-2">
            <button class="btn btn-success" type="submit" :disabled="isSaving">
              {{ isSaving ? 'Guardando…' : editingId === null ? 'Crear producto' : 'Guardar cambios' }}
            </button>
            <button
              v-if="editingId !== null"
              class="btn btn-outline-secondary"
              type="button"
              @click="resetForm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <div class="col-xl-8">
        <div class="card border-0 shadow-sm p-4">
          <h2 class="h5 fw-bold mb-3">Catálogo</h2>
          <div v-if="isLoading" class="text-muted">Cargando productos…</div>
          <div v-else-if="productos.length === 0" class="text-muted">
            No hay productos registrados.
          </div>
          <div v-else class="table-responsive">
            <table class="table align-middle">
              <thead class="table-light">
                <tr>
                  <th>Código / Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="producto in productos" :key="producto.id">
                  <td>
                    <span class="d-block text-muted small">{{ producto.codigo }}</span>
                    <span class="fw-semibold">{{ producto.nombre }}</span>
                  </td>
                  <td>{{ producto.categoria?.nombre || producto.categoriaId }}</td>
                  <td>Bs. {{ Number(producto.precioVenta).toFixed(2) }}</td>
                  <td>{{ producto.stock }}</td>
                  <td>
                    <span class="badge" :class="producto.estado ? 'bg-success' : 'bg-secondary'">
                      {{ producto.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="text-end text-nowrap">
                    <button
                      class="btn btn-sm btn-outline-primary me-2"
                      type="button"
                      @click="editProducto(producto)"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      type="button"
                      @click="toggleEstado(producto)"
                    >
                      {{ producto.estado ? 'Desactivar' : 'Activar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>