const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar usuario por username
    const { rows } = await db.query('SELECT * FROM usuarios WHERE username=$1', [username]);
    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = bcrypt.compareSync(password, usuario.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Obtener el nombre del rol
    const roleRes = await db.query('SELECT nombre FROM roles WHERE id=$1', [usuario.role_id]);
    const roleName = roleRes.rows[0]?.nombre || 'Unknown';

    // Generar JWT
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    const token = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        role_id: usuario.role_id,
        role_name: roleName,
      },
      secret,
      { expiresIn }
    );

    // Responder con token y datos del usuario (sin password_hash)
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        username: usuario.username,
        role_id: usuario.role_id,
        role_name: roleName,
        activo: usuario.activo,
      },
    });
  } catch (e) {
    console.error('Error en login:', e);
    res.status(500).json({ error: e.message });
  }
};
