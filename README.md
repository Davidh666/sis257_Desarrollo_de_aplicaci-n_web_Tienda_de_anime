# sis257_Tienda_Anime

Proyecto de laboratorio para la materia **SIS257** - Sistema de Gestión y Ventas para una **Tienda de Anime y Coleccionables**.

---

## 👥 Integrantes del Grupo
* **Estudiante 1:** Herrera David Jesus
* **Estudiante 2:** Montoya Coa Damaris Betzabe

---

## 🏬 1. Descripción del Negocio
**"Akiba Store"** es un comercio enfocado en la comercialización de productos de la cultura pop japonesa, manga y coleccionables. El catálogo de la tienda abarca las siguientes líneas de productos:
* **Figuras Coleccionables:** Nendoroids, Pop Up Parade, Scale Figures y Figuarts.
* **Manga y Novelas Ligeras:** Tomos físicos por serie, número de tomo y editorial.
* **Merchandising y Vestimenta:** Ropa, posters, llaveros, accesorios y artículos de cosplay.

El sistema permitirá gestionar el catálogo de inventario por categorías, administrar el registro de clientes, controlar el acceso de usuarios y procesar transacciones de venta.

---

## 🗄️ 2. Entidades con Campos Tentativos

### 1. `categorias` (Catálogo 1)
Clasificación general para los artículos de la tienda.
* `id` (INT / PK) - Identificador único.
* `nombre` (VARCHAR 50) - Nombre de la categoría (*ej. Mangas, Figuras, Cosplay*).
* `descripcion` (VARCHAR 255) - Breve detalle de la categoría.
* `estado` (BOOLEAN) - Estado activo/inactivo.

### 2. `productos` (Catálogo 2)
Artículos y stock disponible para la venta.
* `id` (INT / PK) - Identificador único.
* `codigo` (VARCHAR 30 / Unique) - Código SKU o código de barras del producto.
* `nombre` (VARCHAR 100) - Nombre del producto (*ej. Figura Luffy Gear 5*).
* `descripcion` (TEXT) - Descripción detallada del artículo.
* `precio_venta` (DECIMAL 10,2) - Precio unitario de venta.
* `stock` (INT) - Cantidad disponible en almacén.
* `imagen_url` (VARCHAR 255) - Enlace o ruta de la imagen promocional.
* `categoria_id` (INT / FK -> `categorias.id`) - Categoría a la que pertenece.
* `estado` (BOOLEAN) - Estado activo/inactivo.

### 3. `clientes` (Catálogo 3)
Registro de compradores para las notas de venta.
* `id` (INT / PK) - Identificador único.
* `razon_social` (VARCHAR 100) - Nombre completo o Razón Social.
* `nit_ci` (VARCHAR 20 / Unique) - C.I. o NIT del cliente.
* `telefono` (VARCHAR 15) - Número de contacto.
* `email` (VARCHAR 100) - Correo electrónico.
* `estado` (BOOLEAN) - Estado activo/inactivo.

### 4. `usuarios` (Autenticación)
Cuentas de acceso para el personal de la tienda.
* `id` (INT / PK) - Identificador único.
* `usuario` (VARCHAR 50 / Unique) - Nombre de usuario para inicio de sesión.
* `clave` (VARCHAR 255) - Contraseña encriptada.
* `nombre_completo` (VARCHAR 100) - Nombre completo del empleado.
* `rol` (VARCHAR 20) - Rol del usuario (*ADMINISTRADOR / VENDEDOR*).
* `estado` (BOOLEAN) - Estado de la cuenta.

### 5. `ventas` (Módulo Transaccional)
Encabezado de la transacción de venta.
* `id` (INT / PK) - Identificador único de la venta.
* `correlativo` (VARCHAR 20 / Unique) - Número de comprobante o nota de venta.
* `fecha` (TIMESTAMP) - Fecha y hora de la transacción.
* `total` (DECIMAL 10,2) - Monto total de la venta.
* `cliente_id` (INT / FK -> `clientes.id`) - Cliente que realiza la compra.
* `usuario_id` (INT / FK -> `usuarios.id`) - Vendedor que procesó la venta.
* `estado` (VARCHAR 20) - Estado de la transacción (*COMPLETADA / ANULADA*).

### 6. `detalle_ventas` (Módulo Transaccional)
Desglose de productos comprados en cada venta.
* `id` (INT / PK) - Identificador único del detalle.
* `venta_id` (INT / FK -> `ventas.id`) - Referencia a la venta realizada.
* `producto_id` (INT / FK -> `productos.id`) - Referencia al producto adquirido.
* `cantidad` (INT) - Cantidad de unidades vendidas.
* `precio_unitario` (DECIMAL 10,2) - Precio del producto al momento de la venta.
* `subtotal` (DECIMAL 10,2) - Cálculo de `cantidad * precio_unitario`.