<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import api from '@/plugins/axios'

interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  estado: boolean
}

const categorias = ref<Categoria[]>([])
const editingId = ref<number | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({ nombre: '', descripcion: '' })

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? 'No se pudo completar la operación.'
  }
  return 'Ocurrió un error inesperado.'
}

async function loadCategorias(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get<Categoria[]>('/categorias')
    categorias.value = response.data
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

function editCategoria(categoria: Categoria): void {
  editingId.value = categoria.id
  form.nombre = categoria.nombre
  form.descripcion = categoria.descripcion ?? ''
  successMessage.value = ''
}

function resetForm(): void {
  editingId.value = null
  form.nombre = ''
  form.descripcion = ''
}

async function saveCategoria(): Promise<void> {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
    }
    if (editingId.value === null) {
      await api.post('/categorias', payload)
      successMessage.value = 'Categoría creada correctamente.'
    } else {
      await api.patch(`/categorias/${editingId.value}`, payload)
      successMessage.value = 'Categoría actualizada correctamente.'
    }
    resetForm()
    await loadCategorias()
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSaving.value = false
  }
}

async function toggleEstado(categoria: Categoria): Promise<void> {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await api.patch(`/categorias/${categoria.id}`, {
      estado: !categoria.estado,
    })
    successMessage.value = categoria.estado
      ? 'Categoría desactivada.'
      : 'Categoría activada.'
    await loadCategorias()
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  }
}

onMounted(loadCategorias)
</script>

<template>
  <div class="container-fluid p-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h2 fw-bold text-dark mb-1">Gestión de categorías</h1>
        <p class="text-muted mb-0">Organiza el catálogo de Akiba Store.</p>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success" role="status">{{ successMessage }}</div>

    <div class="row g-4">
      <div class="col-lg-4">
        <form class="card border-0 shadow-sm p-4" @submit.prevent="saveCategoria">
          <h2 class="h5 fw-bold mb-3">
            {{ editingId === null ? 'Nueva categoría' : 'Editar categoría' }}
          </h2>
          <label for="category-name" class="form-label">Nombre</label>
          <input
            id="category-name"
            v-model="form.nombre"
            class="form-control mb-3"
            maxlength="50"
            required
          />
          <label for="category-description" class="form-label">Descripción</label>
          <textarea
            id="category-description"
            v-model="form.descripcion"
            class="form-control mb-3"
            maxlength="255"
            rows="3"
          />
          <div class="d-flex gap-2">
            <button class="btn btn-success" type="submit" :disabled="isSaving">
              {{ isSaving ? 'Guardando…' : editingId === null ? 'Crear' : 'Guardar cambios' }}
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

      <div class="col-lg-8">
        <div class="card border-0 shadow-sm p-4">
          <h2 class="h5 fw-bold mb-3">Categorías registradas</h2>
          <div v-if="isLoading" class="text-muted">Cargando categorías…</div>
          <div v-else-if="categorias.length === 0" class="text-muted">
            No hay categorías registradas.
          </div>
          <div v-else class="table-responsive">
            <table class="table align-middle">
              <thead class="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="categoria in categorias" :key="categoria.id">
                  <td class="fw-semibold">{{ categoria.nombre }}</td>
                  <td>{{ categoria.descripcion || '—' }}</td>
                  <td>
                    <span class="badge" :class="categoria.estado ? 'bg-success' : 'bg-secondary'">
                      {{ categoria.estado ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td class="text-end text-nowrap">
                    <button
                      class="btn btn-sm btn-outline-primary me-2"
                      type="button"
                      @click="editCategoria(categoria)"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      type="button"
                      @click="toggleEstado(categoria)"
                    >
                      {{ categoria.estado ? 'Desactivar' : 'Activar' }}
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