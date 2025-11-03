const db = require('../config/database');

exports.list = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM roles ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('SELECT * FROM roles WHERE id=$1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre } = req.body;
    const { rows } = await db.query('INSERT INTO roles(nombre) VALUES($1) RETURNING *', [nombre]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre } = req.body;
    const { rows } = await db.query('UPDATE roles SET nombre=$1 WHERE id=$2 RETURNING *', [nombre, id]);
    if (!rows[0]) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await db.query('DELETE FROM roles WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Rol no encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
