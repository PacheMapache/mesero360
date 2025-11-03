const db = require('../config/database');

exports.list = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM productos ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('SELECT * FROM productos WHERE id=$1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria_id, disponible = true } = req.body;
    const { rows } = await db.query(
      'INSERT INTO productos(nombre, descripcion, precio, categoria_id, disponible) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [nombre, descripcion, precio, categoria_id, disponible]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, descripcion, precio, categoria_id, disponible } = req.body;
    const { rows } = await db.query(
      'UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, categoria_id=$4, disponible=$5 WHERE id=$6 RETURNING *',
      [nombre, descripcion, precio, categoria_id, disponible, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await db.query('DELETE FROM productos WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
