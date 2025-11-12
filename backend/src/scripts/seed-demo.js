const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function getRoleId(nombre) {
  const r = await db.query('SELECT id FROM roles WHERE nombre=$1', [nombre]);
  return r.rows[0]?.id || null;
}

async function getOrCreateCategoria(nombre) {
  const f = await db.query('SELECT id FROM categorias WHERE nombre=$1', [nombre]);
  if (f.rows[0]) return f.rows[0].id;
  const i = await db.query('INSERT INTO categorias(nombre) VALUES($1) RETURNING id', [nombre]);
  return i.rows[0].id;
}

async function getOrCreateProducto({ nombre, descripcion, precio, categoria_id, disponible = true }) {
  const f = await db.query('SELECT id FROM productos WHERE nombre=$1', [nombre]);
  if (f.rows[0]) return f.rows[0].id;
  const i = await db.query(
    'INSERT INTO productos(nombre, descripcion, precio, categoria_id, disponible) VALUES($1,$2,$3,$4,$5) RETURNING id',
    [nombre, descripcion, precio, categoria_id, disponible]
  );
  return i.rows[0].id;
}

async function getMesaId(numero_mesa) {
  const f = await db.query('SELECT id FROM mesas WHERE numero_mesa=$1', [numero_mesa]);
  if (f.rows[0]) return f.rows[0].id;
  const i = await db.query('INSERT INTO mesas(numero_mesa, capacidad, estado) VALUES($1,$2,$3) RETURNING id', [numero_mesa, 4, 'disponible']);
  return i.rows[0].id;
}

async function getOrCreateUsuario({ nombre, username, password, roleNombre, activo = true }) {
  const f = await db.query('SELECT id FROM usuarios WHERE username=$1', [username]);
  if (f.rows[0]) return f.rows[0].id;
  const role_id = await getRoleId(roleNombre);
  if (!role_id) throw new Error(`Role no encontrado: ${roleNombre}`);
  const password_hash = bcrypt.hashSync(password, 10);
  const i = await db.query(
    'INSERT INTO usuarios(nombre, username, password_hash, role_id, activo) VALUES($1,$2,$3,$4,$5) RETURNING id',
    [nombre, username, password_hash, role_id, activo]
  );
  return i.rows[0].id;
}

async function getProductoPrecio(producto_id) {
  const r = await db.query('SELECT precio FROM productos WHERE id=$1', [producto_id]);
  return r.rows[0]?.precio || 0;
}

async function createPedidoDemo({ mesa_id, mesero_id, items }) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const p = await client.query('INSERT INTO pedidos(mesa_id, mesero_id) VALUES($1,$2) RETURNING *', [mesa_id, mesero_id]);
    const pedido = p.rows[0];

    let total = 0;
    for (const it of items) {
      const precio_unitario = it.precio_unitario ?? (await getProductoPrecio(it.producto_id));
      await client.query(
        'INSERT INTO detalle_pedidos(pedido_id, producto_id, cantidad, precio_unitario, notas) VALUES($1,$2,$3,$4,$5)',
        [pedido.id, it.producto_id, it.cantidad || 1, precio_unitario, it.notas || null]
      );
      total += Number(precio_unitario) * Number(it.cantidad || 1);
    }
    const u = await client.query('UPDATE pedidos SET total=$1 WHERE id=$2 RETURNING *', [total, pedido.id]);
    await client.query('COMMIT');
    return u.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('Seed Demo: probando conexión...');
    await db.testConnection();
    console.log('Conexión OK. Cargando datos de demostración...');

    // Categorías
    const catBebidas = await getOrCreateCategoria('Bebidas');
    const catPlatos = await getOrCreateCategoria('Platos');
    const catPostres = await getOrCreateCategoria('Postres');

    // Productos
    const prodCafe = await getOrCreateProducto({ nombre: 'Café Americano', descripcion: 'Taza 8oz', precio: 4500, categoria_id: catBebidas });
    const prodJugo = await getOrCreateProducto({ nombre: 'Jugo de Naranja', descripcion: 'Natural', precio: 6000, categoria_id: catBebidas });
    const prodHamb = await getOrCreateProducto({ nombre: 'Hamburguesa Clásica', descripcion: 'Carne 120g', precio: 18000, categoria_id: catPlatos });
    const prodPastel = await getOrCreateProducto({ nombre: 'Pastel de Chocolate', descripcion: 'Porción', precio: 8000, categoria_id: catPostres });

    // Usuarios
    const admin = await getOrCreateUsuario({ nombre: 'Admin', username: 'admin@mesero360.com', password: 'admin123', roleNombre: 'Admin' });
    const mesero = await getOrCreateUsuario({ nombre: 'María Mesera', username: 'mesero1@mesero360.com', password: 'mesero123', roleNombre: 'Mesero' });
    const cajero = await getOrCreateUsuario({ nombre: 'Carlos Cajero', username: 'cajero1@mesero360.com', password: 'cajero123', roleNombre: 'Cajero' });
    const cocinero = await getOrCreateUsuario({ nombre: 'Cata Cocinera', username: 'cocinero1@mesero360.com', password: 'cocinero123', roleNombre: 'Cocinero' });

    // Mesas
    const mesa1 = await getMesaId(1);
    const mesa2 = await getMesaId(2);

    // Pedido demo en mesa 1
    await createPedidoDemo({
      mesa_id: mesa1,
      mesero_id: mesero,
      items: [
        { producto_id: prodCafe, cantidad: 2, notas: 'Sin azúcar' },
        { producto_id: prodHamb, cantidad: 1 },
      ],
    });

    // Pedido demo en mesa 2
    await createPedidoDemo({
      mesa_id: mesa2,
      mesero_id: mesero,
      items: [
        { producto_id: prodJugo, cantidad: 1 },
        { producto_id: prodPastel, cantidad: 1 },
      ],
    });

    console.log('Seed Demo completado. Usuarios:');
    console.log('  - admin@mesero360.com / admin123');
    console.log('  - mesero1@mesero360.com / mesero123');
    console.log('  - cajero1@mesero360.com / cajero123');
    console.log('  - cocinero1@mesero360.com / cocinero123');
    process.exit(0);
  } catch (e) {
    console.error('Error en seed demo:', e);
    process.exit(1);
  }
}

main();
