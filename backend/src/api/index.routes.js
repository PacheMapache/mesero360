const { Router } = require('express');

const rolesRoutes = require('./roles.routes');
const usuariosRoutes = require('./usuarios.routes');
const categoriasRoutes = require('./categorias.routes');
const productosRoutes = require('./productos.routes');
const mesasRoutes = require('./mesas.routes');
const pedidosRoutes = require('./pedidos.routes');
const detallePedidosRoutes = require('./detalle-pedidos.routes');

const router = Router();

router.use('/roles', rolesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);
router.use('/mesas', mesasRoutes);
router.use('/pedidos', pedidosRoutes);
router.use('/detalle-pedidos', detallePedidosRoutes);

module.exports = router;
