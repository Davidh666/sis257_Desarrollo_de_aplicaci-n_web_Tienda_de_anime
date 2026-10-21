<template>
  <div class="container py-4">
    <!-- Barra superior simple para el cliente -->
    <div class="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
      <h3 class="fw-bold text-success m-0">Akiba Store - Catálogo y Compras</h3>
      <div class="d-flex align-items-center gap-3">
        <span class="text-muted">Cliente / Vendedor</span>
        <button @click="logout" class="btn btn-sm btn-outline-danger">Cerrar Sesión</button>
      </div>
    </div>

    <div class="row">
      <!-- Listado de Productos -->
      <div class="col-md-8">
        <div class="card border-0 shadow-sm p-3">
          <h5 class="fw-bold mb-3">Productos Disponibles</h5>
          <div class="row g-3">
            <div class="col-md-4">
              <div class="card h-100 border">
                <div class="card-body text-center">
                  <h6 class="fw-bold">Figura Anime</h6>
                  <p class="text-muted small">Bs. 150.00</p>
                  <button class="btn btn-sm btn-success w-100">Agregar al Carrito</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen del Carrito / Venta -->
      <div class="col-md-4">
        <div class="card border-0 shadow-sm p-4 bg-light">
          <h5 class="fw-bold mb-3">Carrito de Compras</h5>
          <p class="text-muted small">No hay productos seleccionados.</p>
          <hr />
          <div class="d-flex justify-content-between mb-3">
            <span class="fw-bold">Total:</span>
            <span class="fw-bold text-success">Bs. 0.00</span>
          </div>
          <button class="btn btn-success w-100 fw-bold">Finalizar Compra</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>