const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configurar el cliente de S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Configurar multer para subir a S3
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Generar un nombre único para el archivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const fileName = `productos/${uniqueSuffix}${ext}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: function (req, file, cb) {
    // Aceptar solo imágenes
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes.'));
    }
  }
});

// Función para eliminar una imagen de S3
async function deleteImage(imageUrl) {
  try {
    // Extraer la key del URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remover el primer /
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    await s3Client.send(command);
    console.log(`Imagen eliminada de S3: ${key}`);
  } catch (error) {
    console.error('Error eliminando imagen de S3:', error);
    throw error;
  }
}

// Función para obtener la URL pública de S3
function getPublicUrl(key) {
  return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

module.exports = {
  upload,
  deleteImage,
  getPublicUrl,
  s3Client
};
