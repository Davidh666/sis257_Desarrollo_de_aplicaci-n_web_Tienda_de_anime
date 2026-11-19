-- ============================================
-- BASE DE DATOS: sis257_tienda_anime
-- Proyecto: Akiba Store
-- Motor: PostgreSQL
-- ============================================

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(255),
    categoria_id INT NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_productos_categorias FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    clave VARCHAR(255),
    nombre_completo VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    nit_ci VARCHAR(20) UNIQUE,
    telefono VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    correlativo VARCHAR(20) UNIQUE NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    cliente_id INT,
    usuario_id INT,
    estado VARCHAR(20) DEFAULT 'COMPLETADA',
    CONSTRAINT fk_venta_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    CONSTRAINT fk_venta_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_venta FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- ============================================
-- 1. CATEGORÍAS (6 registros)
-- ============================================
INSERT INTO categorias (nombre, descripcion, estado) VALUES
('Figuras Anime', 'Figuras de colección, Nendoroid y escala', TRUE),
('Mangas', 'Tomos impresos y ediciones especiales de manga', TRUE),
('Ropa Temática', 'Poleras, buzos y hoodies inspirados en anime', TRUE),
('Accesorios Otaku', 'Llaveros, pines, collares y lanyards', TRUE),
('Hogar y Escritorio', 'Mousepads XL, tazas, posters y lámparas LED', TRUE),
('Snacks Japoneses', 'Dulces, ramen instantáneo y bebidas importadas', TRUE);

-- ============================================
-- 2. USUARIOS (5 registros - Contraseña: 123456)
-- ============================================
INSERT INTO usuarios (usuario, clave, nombre_completo, rol, estado, nit_ci, telefono, email) VALUES
('admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Administrador Principal', 'ADMINISTRADOR', TRUE, '7100001', '70010001', 'admin@akibastore.bo'),
('jotaro', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Jotaro Kujo', 'CLIENTE', TRUE, '7100002', '70010002', 'jotaro@correo.bo'),
('vendedor', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Vendedor de Mostrador', 'VENDEDOR', TRUE, '7100003', '70010003', 'vendedor@akibastore.bo'),
('cliente_ana', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Ana María Quispe', 'CLIENTE', TRUE, '7100004', '70010004', 'ana.quispe@correo.bo'),
('cliente_luis', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Luis Fernando Rojas', 'CLIENTE', TRUE, '7100005', '70010005', 'luis.rojas@correo.bo')
ON CONFLICT (usuario) DO UPDATE SET
    clave = EXCLUDED.clave,
    nombre_completo = EXCLUDED.nombre_completo,
    rol = EXCLUDED.rol,
    estado = EXCLUDED.estado;

-- ============================================
-- 3. PRODUCTOS (18 registros con URLs de imagen)
-- ============================================
INSERT INTO productos (codigo, nombre, descripcion, precio_venta, stock, imagen_url, categoria_id, estado) VALUES
('AKB-FIG-001', 'Figura Naruto Modo Sabio', 'Figura detallada de colección de 22 cm', 340.00, 8, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500', (SELECT id FROM categorias WHERE nombre = 'Figuras Anime' LIMIT 1), TRUE),
('AKB-FIG-002', 'Figura Gojo Satoru Edición Especial', 'Figura con base acrílica y pose dinámica', 390.00, 6, 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=500', (SELECT id FROM categorias WHERE nombre = 'Figuras Anime' LIMIT 1), TRUE),
('AKB-FIG-003', 'Figura Luffy Gear 5', 'Edición coleccionista con efectos de nube', 420.00, 5, 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500', (SELECT id FROM categorias WHERE nombre = 'Figuras Anime' LIMIT 1), TRUE),

('AKB-MNG-001', 'Manga Jujutsu Kaisen Vol. 01', 'Tomo 1 en español, tapa blanda', 85.00, 20, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', (SELECT id FROM categorias WHERE nombre = 'Mangas' LIMIT 1), TRUE),
('AKB-MNG-002', 'Manga Chainsaw Man Vol. 01', 'Primera entrega de la serie shonen', 85.00, 18, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500', (SELECT id FROM categorias WHERE nombre = 'Mangas' LIMIT 1), TRUE),
('AKB-MNG-003', 'Manga Demon Slayer Vol. 01', 'Edición estándar de colección', 80.00, 25, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500', (SELECT id FROM categorias WHERE nombre = 'Mangas' LIMIT 1), TRUE),

('AKB-ROP-001', 'Polera Oversize Akatsuki', 'Algodón peinado con estampado frontal y dorsal', 135.00, 15, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', (SELECT id FROM categorias WHERE nombre = 'Ropa Temática' LIMIT 1), TRUE),
('AKB-ROP-002', 'Hoodie Cyberpunk Edgerunners', 'Buzo con capucha afelpado unisex', 210.00, 10, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', (SELECT id FROM categorias WHERE nombre = 'Ropa Temática' LIMIT 1), TRUE),
('AKB-ROP-003', 'Polera Clásica Studio Ghibli', 'Corte regular, suave y resistente al lavado', 120.00, 14, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', (SELECT id FROM categorias WHERE nombre = 'Ropa Temática' LIMIT 1), TRUE),

('AKB-ACC-001', 'Llavero Acrílico Espada Nichirin', 'Doble cara con acabado brillante', 25.00, 40, 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500', (SELECT id FROM categorias WHERE nombre = 'Accesorios Otaku' LIMIT 1), TRUE),
('AKB-ACC-002', 'Set de Pines Esmaltados Anime x4', 'Broches metálicos con cierre seguro', 45.00, 30, 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500', (SELECT id FROM categorias WHERE nombre = 'Accesorios Otaku' LIMIT 1), TRUE),
('AKB-ACC-003', 'Collar Estilo Minimalista', 'Acero inoxidable con dije temático', 55.00, 22, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500', (SELECT id FROM categorias WHERE nombre = 'Accesorios Otaku' LIMIT 1), TRUE),

('AKB-HOG-001', 'Mousepad Gamer XL 90x40 cm', 'Base antideslizante y bordes cosidos', 95.00, 16, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500', (SELECT id FROM categorias WHERE nombre = 'Hogar y Escritorio' LIMIT 1), TRUE),
('AKB-HOG-002', 'Taza Cerámica Sublimada 11 oz', 'Apta para microondas, diseño de alta definición', 45.00, 28, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', (SELECT id FROM categorias WHERE nombre = 'Hogar y Escritorio' LIMIT 1), TRUE),
('AKB-HOG-003', 'Lámpara LED Acrílica de Escritorio', 'Luz cálida y multicolor con control táctil', 110.00, 12, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', (SELECT id FROM categorias WHERE nombre = 'Hogar y Escritorio' LIMIT 1), TRUE),

('AKB-SNK-001', 'Ramen Instantáneo Estilo Tonkotsu', 'Fideos con caldo sabor cerdo y especias', 28.00, 35, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', (SELECT id FROM categorias WHERE nombre = 'Snacks Japoneses' LIMIT 1), TRUE),
('AKB-SNK-002', 'Galletas Pocky Sabor Fresa', 'Caja de galletas cubiertas con crema de fresa', 22.00, 45, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', (SELECT id FROM categorias WHERE nombre = 'Snacks Japoneses' LIMIT 1), TRUE),
('AKB-SNK-003', 'Bebida Refrescante Sabor Melón', 'Lata importada sabor fruta dulce', 24.00, 32, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500', (SELECT id FROM categorias WHERE nombre = 'Snacks Japoneses' LIMIT 1), TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- 4. VENTA Y DETALLE DE EJEMPLO
-- ============================================
INSERT INTO ventas (correlativo, fecha, total, cliente_id, usuario_id, estado)
VALUES (
    'VNT-000001',
    CURRENT_TIMESTAMP,
    425.00,
    (SELECT id FROM usuarios WHERE usuario = 'jotaro' LIMIT 1),
    (SELECT id FROM usuarios WHERE usuario = 'admin' LIMIT 1),
    'COMPLETADA'
)
ON CONFLICT (correlativo) DO NOTHING;

INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
SELECT
    v.id,
    p.id,
    1,
    p.precio_venta,
    p.precio_venta
FROM ventas v
CROSS JOIN productos p
WHERE v.correlativo = 'VNT-000001'
  AND p.codigo = 'AKB-FIG-001'
  AND NOT EXISTS (
      SELECT 1 FROM detalle_ventas dv WHERE dv.venta_id = v.id AND dv.producto_id = p.id
  );

INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
SELECT
    v.id,
    p.id,
    1,
    p.precio_venta,
    p.precio_venta
FROM ventas v
CROSS JOIN productos p
WHERE v.correlativo = 'VNT-000001'
  AND p.codigo = 'AKB-MNG-001'
  AND NOT EXISTS (
      SELECT 1 FROM detalle_ventas dv WHERE dv.venta_id = v.id AND dv.producto_id = p.id
  );