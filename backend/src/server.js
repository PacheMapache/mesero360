// 1. Importar dependencias
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// 2. Cargar variables de entorno
// (Esto busca un archivo .env y carga su contenido)
dotenv.config();

// 3. Inicializar la App Express
const app = express();

// 4. Middlewares esenciales
// (Permite que tu app Flutter se conecte a esta API)
app.use(cors()); 
// (Permite que Express entienda JSON enviado en el body de las peticiones)
app.use(express.json()); 

// 5. Definir el Puerto
// (Busca el puerto en .env, o usa 3000 si no lo encuentra)
const PORT = process.env.PORT || 3000;

// 6. Ruta de prueba (para verificar que funciona)
app.get('/', (req, res) => {
  res.json({ message: '¡API de Mesero360 funcionando!' });
});

// 7. TODO: Conectar a la Base de Datos
// (Aquí irá la lógica de src/config/database.js)

// 8. TODO: Cargar Rutas Principales
// (Aquí importaremos el archivo src/api/index.routes.js)

// 9. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});