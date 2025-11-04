const db = require('../config/database');
const s3Service = require('../services/s3.service');

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
    const imagen_url = req.file ? req.file.location : null;
    
    const { rows } = await db.query(
      'INSERT INTO productos(nombre, descripcion, precio, categoria_id, disponible, imagen_url) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [nombre, descripcion, precio, categoria_id, disponible, imagen_url]
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
    
    // Obtener el producto actual para verificar si tiene imagen
    const { rows: currentProduct } = await db.query('SELECT imagen_url FROM productos WHERE id=$1', [id]);
    if (!currentProduct[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    
    let imagen_url = currentProduct[0].imagen_url;
    
    // Si hay una nueva imagen, eliminar la anterior y actualizar
    if (req.file) {
      if (currentProduct[0].imagen_url) {
        try {
          await s3Service.deleteImage(currentProduct[0].imagen_url);
        } catch (error) {
          console.error('Error eliminando imagen anterior:', error);
        }
      }
      imagen_url = req.file.location;
    }
    
    const { rows } = await db.query(
      'UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, categoria_id=$4, disponible=$5, imagen_url=$6 WHERE id=$7 RETURNING *',
      [nombre, descripcion, precio, categoria_id, disponible, imagen_url, id]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Obtener el producto para eliminar su imagen de S3
    const { rows: product } = await db.query('SELECT imagen_url FROM productos WHERE id=$1', [id]);
    if (!product[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    
    // Eliminar imagen de S3 si existe
    if (product[0].imagen_url) {
      try {
        await s3Service.deleteImage(product[0].imagen_url);
      } catch (error) {
        console.error('Error eliminando imagen de S3:', error);
      }
    }
    
    const { rowCount } = await db.query('DELETE FROM productos WHERE id=$1', [id]);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Función para actualizar solo la imagen de un producto
exports.updateImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }
    
    // Obtener el producto actual
    const { rows: currentProduct } = await db.query('SELECT imagen_url FROM productos WHERE id=$1', [id]);
    if (!currentProduct[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    
    // Eliminar la imagen anterior si existe
    if (currentProduct[0].imagen_url) {
      try {
        await s3Service.deleteImage(currentProduct[0].imagen_url);
      } catch (error) {
        console.error('Error eliminando imagen anterior:', error);
      }
    }
    
    // Actualizar con la nueva imagen
    const imagen_url = req.file.location;
    const { rows } = await db.query(
      'UPDATE productos SET imagen_url=$1 WHERE id=$2 RETURNING *',
      [imagen_url, id]
    );
    
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
