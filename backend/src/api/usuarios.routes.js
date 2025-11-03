const { Router } = require('express');
const ctrl = require('../controllers/usuarios.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

const router = Router();

// Endpoints públicos (sin protección por ahora para compatibilidad)
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Endpoints protegidos (solo Admin puede crear/editar/eliminar usuarios)
router.post('/', verifyToken, requireRole('Admin'), ctrl.create);
router.put('/:id', verifyToken, requireRole('Admin'), ctrl.update);
router.delete('/:id', verifyToken, requireRole('Admin'), ctrl.remove);

module.exports = router;
