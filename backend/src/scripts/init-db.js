const db = require('../config/database');

// Utilidad: ejecutar una lista de sentencias en orden dentro de una transacción
async function runStatements(statements) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    for (const stmt of statements) {
      if (!stmt || !stmt.trim()) continue;
      await client.query(stmt);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function init() {
  try {
    console.log('Probando conexión a la base de datos...');
    await db.testConnection();
    console.log('Conexión OK. Creando/esquema base (idempotente)...');

    // Esquema basado en el requerimiento (usará nombres en minúscula en PostgreSQL)
    const statements = [
      // Roles
      `CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) UNIQUE NOT NULL
      );`,

      // Categorias
      `CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL
      );`,

      // Mesas
      `CREATE TABLE IF NOT EXISTS mesas (
        id SERIAL PRIMARY KEY,
        numero_mesa INTEGER UNIQUE NOT NULL,
        capacidad INTEGER DEFAULT 4,
        estado VARCHAR(50) NOT NULL DEFAULT 'disponible'
      );`,

      // Usuarios
      `CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role_id INTEGER NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_usuarios_role_id FOREIGN KEY (role_id) REFERENCES roles(id)
      );`,

      // Productos
      `CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        categoria_id INTEGER,
        disponible BOOLEAN DEFAULT TRUE,
        CONSTRAINT fk_productos_categoria_id FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      );`,

      // Pedidos
      `CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        mesa_id INTEGER NOT NULL,
        mesero_id INTEGER NOT NULL,
        cajero_id INTEGER,
        estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
        total DECIMAL(10, 2) DEFAULT 0.00,
        fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre TIMESTAMPTZ,
        CONSTRAINT fk_pedidos_mesa_id FOREIGN KEY (mesa_id) REFERENCES mesas(id),
        CONSTRAINT fk_pedidos_mesero_id FOREIGN KEY (mesero_id) REFERENCES usuarios(id),
        CONSTRAINT fk_pedidos_cajero_id FOREIGN KEY (cajero_id) REFERENCES usuarios(id)
      );`,

      // Detalle_Pedidos
      `CREATE TABLE IF NOT EXISTS detalle_pedidos (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        notas TEXT,
        CONSTRAINT fk_dp_pedido_id FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        CONSTRAINT fk_dp_producto_id FOREIGN KEY (producto_id) REFERENCES productos(id)
      );`,

      // Datos iniciales (roles básicos)
      `INSERT INTO roles (nombre) VALUES ('Cajero'), ('Mesero'), ('Cocinero'), ('Admin')
       ON CONFLICT (nombre) DO NOTHING;`,

      // Mesas de ejemplo
      `INSERT INTO mesas (numero_mesa, capacidad) VALUES (1,4), (2,2), (3,6), (4,4)
       ON CONFLICT (numero_mesa) DO NOTHING;`,
    ];

    await runStatements(statements);

    console.log('Esquema creado/actualizado. Listo.');
    process.exit(0);
  } catch (err) {
    console.error('Error inicializando la BD:', err);
    process.exit(1);
  }
}

init();
