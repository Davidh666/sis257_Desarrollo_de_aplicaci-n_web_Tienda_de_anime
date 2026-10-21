<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-dark">Gestión de Categorías</h2>
      <button class="btn btn-success">+ Nueva Categoría</button>
    </div>

    <div class="card border-0 shadow-sm p-4">
      <div class="table-responsive">
        <table class="table align-middle">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Shonen</td>
              <td>Manga y coleccionables de acción</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2">Editar</button>
                <button class="btn btn-sm btn-outline-danger">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lógica para el CRUD de categorías
</script>