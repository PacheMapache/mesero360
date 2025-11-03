const jwt = require('jsonwebtoken');

// Middleware que valida JWT en el header Authorization
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'default_secret_key';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, username, role_id, role_name }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware que valida que el usuario tenga uno de los roles permitidos
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const userRole = req.user.role_name;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: `Acceso denegado. Rol requerido: ${allowedRoles.join(' o ')}` });
    }

    next();
  };
};
