// 1. Importar dependencias
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/database');

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

// 7. Healthcheck con DB (opcional)
app.get('/health', async (req, res) => {
  try {
    await db.testConnection();
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: e.message });
  }
});

// 8. Cargar Rutas Principales
const apiRoutes = require('./api/index.routes');
app.use('/api', apiRoutes);

// 9. Iniciar el servidor (y probar conexión a la BD al arrancar)
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  try {
    await db.testConnection();
    console.log('✅ Conexión a la base de datos exitosa');
  } catch (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
  }
});