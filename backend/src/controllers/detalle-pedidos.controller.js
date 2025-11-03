const db = require('../config/database');

exports.list = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM detalle_pedidos ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('SELECT * FROM detalle_pedidos WHERE id=$1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Detalle no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { pedido_id, producto_id, cantidad = 1, precio_unitario, notas } = req.body;
    const { rows } = await db.query(
      'INSERT INTO detalle_pedidos(pedido_id, producto_id, cantidad, precio_unitario, notas) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [pedido_id, producto_id, cantidad, precio_unitario, notas]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { pedido_id, producto_id, cantidad, precio_unitario, notas } = req.body;
    const { rows } = await db.query(
      'UPDATE detalle_pedidos SET pedido_id=$1, producto_id=$2, cantidad=$3, precio_unitario=$4, notas=$5 WHERE id=$6 RETURNING *',
      [pedido_id, producto_id, cantidad, precio_unitario, notas, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Detalle no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await db.query('DELETE FROM detalle_pedidos WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Detalle no encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
