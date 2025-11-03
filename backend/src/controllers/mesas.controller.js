const db = require('../config/database');

exports.list = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM mesas ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('SELECT * FROM mesas WHERE id=$1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { numero_mesa, capacidad = 4, estado = 'disponible' } = req.body;
    const { rows } = await db.query(
      'INSERT INTO mesas(numero_mesa, capacidad, estado) VALUES($1,$2,$3) RETURNING *',
      [numero_mesa, capacidad, estado]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { numero_mesa, capacidad, estado } = req.body;
    const { rows } = await db.query(
      'UPDATE mesas SET numero_mesa=$1, capacidad=$2, estado=$3 WHERE id=$4 RETURNING *',
      [numero_mesa, capacidad, estado, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await db.query('DELETE FROM mesas WHERE id=$1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
