const db = require('../config/database');

exports.list = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT p.* FROM pedidos p ORDER BY p.id DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.get = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const pedido = await db.query('SELECT * FROM pedidos WHERE id=$1', [id]);
    if (!pedido.rows[0]) return res.status(404).json({ error: 'Pedido no encontrado' });
    const items = await db.query('SELECT * FROM detalle_pedidos WHERE pedido_id=$1 ORDER BY id', [id]);
    res.json({ ...pedido.rows[0], items: items.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { mesa_id, mesero_id, items = [] } = req.body;
    await client.query('BEGIN');
    const pedidoRes = await client.query(
      'INSERT INTO pedidos(mesa_id, mesero_id) VALUES($1,$2) RETURNING *',
      [mesa_id, mesero_id]
    );
    const pedido = pedidoRes.rows[0];

    let total = 0;
    for (const it of items) {
      const { producto_id, cantidad = 1, precio_unitario, notas } = it;
      await client.query(
        'INSERT INTO detalle_pedidos(pedido_id, producto_id, cantidad, precio_unitario, notas) VALUES($1,$2,$3,$4,$5)',
        [pedido.id, producto_id, cantidad, precio_unitario, notas || null]
      );
      total += Number(precio_unitario) * Number(cantidad);
    }
    const updated = await client.query('UPDATE pedidos SET total=$1 WHERE id=$2 RETURNING *', [total, pedido.id]);
    await client.query('COMMIT');
    res.status(201).json({ ...updated.rows[0], items });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { estado, cajero_id } = req.body;
    const setFecha = estado === 'pagado' ? ', fecha_cierre = NOW()' : '';
    const { rows } = await db.query(
      `UPDATE pedidos SET estado=$1, cajero_id=$2 ${setFecha} WHERE id=$3 RETURNING *`,
      [estado, cajero_id || null, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await db.query('DELETE FROM pedidos WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
