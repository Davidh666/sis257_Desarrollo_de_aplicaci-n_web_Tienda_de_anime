<template>
  <div class="container-fluid p-4">
    <!-- Encabezado de bienvenida -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark">Panel de Administración - Akiba Store</h2>
        <p class="text-muted">Bienvenido, Administrador. Aquí tienes el resumen general del negocio.</p>
      </div>
      <span class="badge bg-success fs-6 px-3 py-2">Rol: ADMINISTRADOR</span>
    </div>

    <!-- Tarjetas de Estadísticas Principales -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm p-3 border-start border-success border-4">
          <h6 class="text-muted">Ventas Totales del Día</h6>
          <h3 class="fw-bold text-success">Bs. 1,450.00</h3>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm p-3 border-start border-primary border-4">
          <h6 class="text-muted">Productos en Catálogo</h6>
          <h3 class="fw-bold text-primary">48 Items</h3>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm p-3 border-start border-warning border-4">
          <h6 class="text-muted">Clientes Registrados</h6>
          <h3 class="fw-bold text-warning">24 Clientes</h3>
        </div>
      </div>
    </div>

    <!-- Accesos rápidos a los CRUDs obligatorios -->
    <div class="card border-0 shadow-sm p-4">
      <h5 class="fw-bold mb-3">Gestión Rápida de Módulos</h5>
      <div class="d-flex gap-3">
        <router-link to="/tables" class="btn btn-outline-success">
          <i class="bi bi-box-seam me-2"></i> Administrar Productos (CRUD)
        </router-link>
        <router-link to="/forms" class="btn btn-outline-success">
          <i class="bi bi-tags me-2"></i> Administrar Categorías (CRUD)
        </router-link>
        <router-link to="/sales" class="btn btn-success">
          <i class="bi bi-cart-check me-2"></i> Ir al Módulo de Ventas
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lógica del Dashboard de Administrador
</script>