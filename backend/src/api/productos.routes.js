const { Router } = require('express');
const ctrl = require('../controllers/productos.controller');
const s3Service = require('../services/s3.service');

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', s3Service.upload.single('imagen'), ctrl.create);
router.put('/:id', s3Service.upload.single('imagen'), ctrl.update);
router.patch('/:id/imagen', s3Service.upload.single('imagen'), ctrl.updateImage);
router.delete('/:id', ctrl.remove);

module.exports = router;
