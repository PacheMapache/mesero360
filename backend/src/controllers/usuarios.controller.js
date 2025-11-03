const db = require('../config/database');

exports.list = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM usuarios ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('SELECT * FROM usuarios WHERE id=$1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, username, password_hash, role_id, activo = true } = req.body;
    const { rows } = await db.query(
      'INSERT INTO usuarios(nombre, username, password_hash, role_id, activo) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [nombre, username, password_hash, role_id, activo]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, username, password_hash, role_id, activo } = req.body;
    const { rows } = await db.query(
      'UPDATE usuarios SET nombre=$1, username=$2, password_hash=$3, role_id=$4, activo=$5 WHERE id=$6 RETURNING *',
      [nombre, username, password_hash, role_id, activo, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await db.query('DELETE FROM usuarios WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
